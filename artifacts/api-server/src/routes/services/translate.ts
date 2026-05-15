import { Router, type IRouter, type Request, type Response } from "express";
import { getUserKey } from "./keys.js";

const router: IRouter = Router();

interface AuthedRequest extends Request {
  userId: string;
}

const LANG_PAIRS = [
  { code: "AR", label: "العربية" },
  { code: "EN", label: "الإنجليزية" },
  { code: "FR", label: "الفرنسية" },
  { code: "DE", label: "الألمانية" },
  { code: "ES", label: "الإسبانية" },
  { code: "IT", label: "الإيطالية" },
  { code: "JA", label: "اليابانية" },
  { code: "ZH", label: "الصينية" },
  { code: "RU", label: "الروسية" },
  { code: "PT", label: "البرتغالية" },
  { code: "TR", label: "التركية" },
];

router.get("/services/translate/languages", (_req, res) => {
  res.json({ languages: LANG_PAIRS });
});

router.post("/services/translate", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const { text, sourceLang, targetLang } = req.body as {
    text?: string;
    sourceLang?: string;
    targetLang?: string;
  };

  if (!text?.trim()) {
    res.status(400).json({ error: "text is required" });
    return;
  }
  if (!targetLang) {
    res.status(400).json({ error: "targetLang is required" });
    return;
  }
  if (text.length > 10_000) {
    res.status(400).json({ error: "text must be under 10,000 characters" });
    return;
  }

  const apiKey = await getUserKey(userId, "deepl");
  if (!apiKey) {
    res.status(402).json({
      error: "no_key",
      message: "أضف مفتاح DeepL من صفحة المفاتيح للترجمة الاحترافية",
    });
    return;
  }

  const isFree = apiKey.endsWith(":fx");
  const baseUrl = isFree
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  try {
    const body = new URLSearchParams({
      text: text.trim(),
      target_lang: targetLang.toUpperCase(),
    });
    if (sourceLang) body.append("source_lang", sourceLang.toUpperCase());

    const resp = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      signal: AbortSignal.timeout(15_000),
    });

    if (!resp.ok) {
      const err = await resp.text();
      res.status(resp.status).json({ error: "DeepL error: " + err.slice(0, 200) });
      return;
    }

    const data = await resp.json() as {
      translations?: Array<{ detected_source_language: string; text: string }>;
    };
    const translation = data.translations?.[0];
    res.json({
      translatedText: translation?.text ?? "",
      detectedSourceLang: translation?.detected_source_language ?? sourceLang ?? "unknown",
    });
  } catch (err) {
    req.log.error({ err }, "DeepL error");
    res.status(500).json({ error: "Translation request failed" });
  }
});

export default router;
