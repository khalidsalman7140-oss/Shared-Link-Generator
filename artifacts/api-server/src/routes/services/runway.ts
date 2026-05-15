import { Router, type IRouter, type Request, type Response } from "express";
import { getUserKey } from "./keys.js";

const router: IRouter = Router();

interface AuthedRequest extends Request {
  userId: string;
}

router.post("/services/video-gen", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const { provider, imageBase64, imageMime, prompt, duration } = req.body as {
    provider?: "runway" | "luma";
    imageBase64?: string;
    imageMime?: string;
    prompt?: string;
    duration?: number;
  };

  if (!prompt?.trim()) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  const service = provider ?? "runway";
  const apiKey = await getUserKey(userId, service === "luma" ? "luma" : "runway");
  if (!apiKey) {
    res.status(402).json({
      error: "no_key",
      message: `أضف مفتاح ${service === "luma" ? "Luma Dream Machine" : "Runway Gen-3"} من صفحة المفاتيح`,
    });
    return;
  }

  try {
    if (service === "runway") {
      const body: Record<string, unknown> = {
        promptText: prompt.trim(),
        model: "gen3a_turbo",
        duration: duration ?? 5,
        ratio: "1280:720",
      };
      if (imageBase64 && imageMime) {
        body.promptImage = `data:${imageMime};base64,${imageBase64}`;
      }

      const resp = await fetch("https://api.runwayml.com/v1/image_to_video", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Runway-Version": "2024-11-06",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });

      if (!resp.ok) {
        const err = await resp.text();
        res.status(resp.status).json({ error: "Runway: " + err.slice(0, 300) });
        return;
      }

      const data = await resp.json() as { id?: string; status?: string };
      res.json({ taskId: data.id, status: data.status, provider: "runway" });
    } else {
      const body: Record<string, unknown> = {
        prompt: { text: prompt.trim() },
        aspect_ratio: "16:9",
        loop: false,
        duration: duration ?? 5,
      };
      if (imageBase64 && imageMime) {
        body.keyframes = {
          frame0: { type: "image", url: `data:${imageMime};base64,${imageBase64}` },
        };
      }

      const resp = await fetch("https://api.lumalabs.ai/dream-machine/v1/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });

      if (!resp.ok) {
        const err = await resp.text();
        res.status(resp.status).json({ error: "Luma: " + err.slice(0, 300) });
        return;
      }

      const data = await resp.json() as { id?: string; state?: string };
      res.json({ taskId: data.id, status: data.state, provider: "luma" });
    }
  } catch (err) {
    req.log.error({ err }, "Video gen error");
    res.status(500).json({ error: "Video generation request failed" });
  }
});

router.get("/services/video-gen/:taskId", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const { taskId } = req.params;
  const provider = (req.query.provider as string) ?? "runway";

  const apiKey = await getUserKey(userId, provider === "luma" ? "luma" : "runway");
  if (!apiKey) {
    res.status(402).json({ error: "no_key" });
    return;
  }

  try {
    if (provider === "runway") {
      const resp = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}`, "X-Runway-Version": "2024-11-06" },
        signal: AbortSignal.timeout(10_000),
      });
      const data = await resp.json() as { status?: string; output?: string[] };
      res.json({ status: data.status, videoUrl: data.output?.[0] ?? null, provider: "runway" });
    } else {
      const resp = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      });
      const data = await resp.json() as { state?: string; assets?: { video?: string } };
      res.json({ status: data.state, videoUrl: data.assets?.video ?? null, provider: "luma" });
    }
  } catch (err) {
    req.log.error({ err }, "Video status error");
    res.status(500).json({ error: "Failed to get video status" });
  }
});

export default router;
