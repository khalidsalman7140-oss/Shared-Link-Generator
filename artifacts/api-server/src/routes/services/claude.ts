import { Router, type IRouter, type Request, type Response } from "express";
import { getUserKey } from "./keys.js";
import { ai } from "@workspace/integrations-gemini-ai";

const router: IRouter = Router();

interface AuthedRequest extends Request {
  userId: string;
}

router.post("/services/summarize", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const { text, lang, mode } = req.body as {
    text?: string;
    lang?: string;
    mode?: "summary" | "bullets" | "insights";
  };

  if (!text?.trim()) {
    res.status(400).json({ error: "text is required" });
    return;
  }
  if (text.length > 100_000) {
    res.status(400).json({ error: "text must be under 100,000 characters" });
    return;
  }

  const outputLang = lang ?? "ar";
  const modeLabel =
    mode === "bullets"
      ? "نقاط رئيسية"
      : mode === "insights"
        ? "رؤى وتحليلات"
        : "ملخص شامل";

  const systemPrompt = `أنت خبير في تلخيص النصوص وتحليلها. أنتج ${modeLabel} للنص التالي باللغة ${outputLang === "ar" ? "العربية" : outputLang === "en" ? "الإنجليزية" : outputLang}. كن دقيقاً ومركزاً على النقاط الأهم.`;

  const claudeKey = await getUserKey(userId, "claude");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (claudeKey) {
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": claudeKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
          "anthropic-beta": "messages-2023-12-15",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4096,
          system: systemPrompt,
          stream: true,
          messages: [{ role: "user", content: text.trim() }],
        }),
        signal: AbortSignal.timeout(60_000),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.text();
        res.write(`data: ${JSON.stringify({ error: "Claude error: " + err.slice(0, 200) })}\n\n`);
        res.end();
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data) as {
              type?: string;
              delta?: { type?: string; text?: string };
            };
            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              res.write(`data: ${JSON.stringify({ content: parsed.delta.text })}\n\n`);
            }
          } catch {}
        }
      }

      res.write(`data: ${JSON.stringify({ done: true, model: "claude-3-5-sonnet" })}\n\n`);
    } catch (err) {
      req.log.error({ err }, "Claude error, fallback to Gemini");
    }
  }

  if (!claudeKey) {
    try {
      const stream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: text.trim() }] }],
        config: { maxOutputTokens: 4096, systemInstruction: systemPrompt },
      });
      for await (const chunk of stream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ content: chunk.text })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ done: true, model: "gemini-2.5-flash" })}\n\n`);
    } catch (err) {
      req.log.error({ err }, "Gemini summarize error");
      res.write(`data: ${JSON.stringify({ error: "فشل التلخيص" })}\n\n`);
    }
  }

  res.end();
});

export default router;
