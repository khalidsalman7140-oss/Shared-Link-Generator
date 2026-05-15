import { Router, type IRouter, type Request, type Response } from "express";
import { getUserKey } from "./keys.js";

const router: IRouter = Router();

interface AuthedRequest extends Request {
  userId: string;
}

const ARABIC_VOICES = [
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam — إنجليزي (يعمل للعربية)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah — أنثى طبيعية" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam — ذكر احترافي" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte — أنثى مميزة" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel — ذكر محايد" },
];

router.get("/services/tts/voices", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const apiKey = await getUserKey(userId, "elevenlabs");
  if (!apiKey) {
    res.json({ voices: ARABIC_VOICES, warning: "استخدم مفتاحك الخاص للحصول على مزيد من الأصوات" });
    return;
  }
  try {
    const resp = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": apiKey },
      signal: AbortSignal.timeout(8000),
    });
    const data = await resp.json() as { voices?: Array<{ voice_id: string; name: string }> };
    const voices = (data.voices ?? []).map((v) => ({ id: v.voice_id, name: v.name }));
    res.json({ voices });
  } catch {
    res.json({ voices: ARABIC_VOICES });
  }
});

router.post("/services/tts", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const { text, voiceId, stability, similarity_boost } = req.body as {
    text?: string;
    voiceId?: string;
    stability?: number;
    similarity_boost?: number;
  };

  if (!text?.trim()) {
    res.status(400).json({ error: "text is required" });
    return;
  }
  if (text.length > 5000) {
    res.status(400).json({ error: "text must be under 5000 characters" });
    return;
  }

  const apiKey = await getUserKey(userId, "elevenlabs");
  if (!apiKey) {
    res.status(402).json({
      error: "no_key",
      message: "أضف مفتاح ElevenLabs من صفحة المفاتيح للاستمتاع بتوليد الصوت",
    });
    return;
  }

  const voice = voiceId ?? "pNInz6obpgDQGcFmaJgB";
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice}`;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: stability ?? 0.5,
          similarity_boost: similarity_boost ?? 0.75,
        },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!resp.ok) {
      const err = await resp.text();
      req.log.error({ err }, "ElevenLabs error");
      res.status(resp.status).json({ error: "ElevenLabs API error: " + err.slice(0, 200) });
      return;
    }

    const audioBuffer = Buffer.from(await resp.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length);
    res.send(audioBuffer);
  } catch (err) {
    req.log.error({ err }, "TTS error");
    res.status(500).json({ error: "TTS request failed" });
  }
});

export default router;
