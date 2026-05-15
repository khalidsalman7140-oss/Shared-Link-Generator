import { Router, type IRouter, type Request, type Response } from "express";
import { getUserKey } from "./keys.js";

const router: IRouter = Router();

interface AuthedRequest extends Request {
  userId: string;
}

router.post("/services/image", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const { prompt, style, aspectRatio } = req.body as {
    prompt?: string;
    style?: string;
    aspectRatio?: string;
  };

  if (!prompt?.trim()) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  const apiKey = await getUserKey(userId, "stability");
  if (!apiKey) {
    res.status(402).json({
      error: "no_key",
      message: "أضف مفتاح Stability AI من صفحة المفاتيح لتوليد الصور",
    });
    return;
  }

  const formData = new FormData();
  formData.append("prompt", prompt.trim());
  formData.append("output_format", "webp");
  if (aspectRatio) formData.append("aspect_ratio", aspectRatio);
  if (style) formData.append("style_preset", style);

  try {
    const resp = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "image/*",
        },
        body: formData,
        signal: AbortSignal.timeout(60_000),
      },
    );

    if (!resp.ok) {
      const err = await resp.text();
      req.log.error({ err, status: resp.status }, "Stability AI error");
      res.status(resp.status).json({ error: "Stability AI: " + err.slice(0, 300) });
      return;
    }

    const imgBuffer = Buffer.from(await resp.arrayBuffer());
    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Content-Length", imgBuffer.length);
    res.send(imgBuffer);
  } catch (err) {
    req.log.error({ err }, "Image gen error");
    res.status(500).json({ error: "Image generation failed" });
  }
});

export default router;
