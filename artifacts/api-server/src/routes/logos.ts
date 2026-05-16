import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { ai } from "@workspace/integrations-gemini-ai";
import { logoSvgCache } from "../lib/cache.js";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized — please sign in" });
    return;
  }
  next();
}

router.post("/logos/generate", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const {
    businessName,
    businessType = "شركة",
    primaryColor = "#1a56db",
    style = "modern",
  } = req.body as {
    businessName?: string;
    businessType?: string;
    primaryColor?: string;
    style?: string;
  };

  if (!businessName?.trim()) {
    res.status(400).json({ error: "businessName required" });
    return;
  }

  const cacheKey = `${businessName}:${businessType}:${primaryColor}:${style}`;
  const cached = logoSvgCache.get(cacheKey);
  if (cached) {
    res.json({ svg: cached, cached: true });
    return;
  }

  const prompt = `Create a professional SVG logo for a business called "${businessName}" (${businessType}).
Style: ${style}. Primary color: ${primaryColor}.

STRICT OUTPUT RULES:
- Output ONLY the raw SVG code — no markdown, no explanation, no code fences
- Must start exactly with: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
- Must end exactly with: </svg>
- Use ONLY inline SVG: rect, circle, ellipse, path, polygon, text, g elements
- NO external resources, no <image>, no xlink:href to external URLs
- Include the business name "${businessName}" as a <text> element, positioned clearly
- Use primaryColor ${primaryColor} as the dominant color
- Modern, clean, geometric design
- Font: use font-family="Arial, sans-serif" for text

Output the SVG code now:`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 2048 },
    });

    let svg = result.text?.trim() ?? "";
    svg = svg.replace(/^```(?:svg|xml)?\n?/im, "").replace(/\n?```$/im, "").trim();
    const m = svg.match(/<svg[\s\S]*?<\/svg>/i);
    if (m) svg = m[0];

    if (!svg.toLowerCase().startsWith("<svg")) {
      res.status(500).json({ error: "لم يتمكن الذكاء الاصطناعي من توليد شعار صالح" });
      return;
    }

    logoSvgCache.set(cacheKey, svg);
    res.json({ svg, cached: false });
  } catch (err) {
    req.log.error({ err }, "Logo generation error");
    res.status(500).json({ error: "فشل توليد الشعار" });
  }
});

export default router;
