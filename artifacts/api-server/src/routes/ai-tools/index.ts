import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { ai } from "@workspace/integrations-gemini-ai";

const router: IRouter = Router();

interface AuthedRequest extends Request { userId: string; }

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  (req as AuthedRequest).userId = userId;
  next();
}

const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20";

/* ══════════════════════════════════════
   POST /api/ai/social  — صانع محتوى السوشيال ميديا
══════════════════════════════════════ */
router.post("/ai/social", requireAuth, async (req: Request, res: Response) => {
  const { platform, topic, tone, goal, hashtags } = req.body as {
    platform: string; topic: string; tone?: string;
    goal?: string; hashtags?: boolean;
  };

  if (!platform || !topic?.trim()) {
    res.status(400).json({ error: "platform و topic مطلوبان" });
    return;
  }

  const platformGuide: Record<string, string> = {
    facebook: "فيسبوك — منشور طويل مدروس مع مقدمة جذابة وقصة وCTA، مناسب لجمهور عربي يمني",
    whatsapp: "واتساب — رسالة قصيرة مباشرة تناسب المجموعات والقنوات، جمل قصيرة، واضحة",
    telegram: "تيليغرام — منشور قناة احترافي مع رمز تعبيري ومحتوى غني وCTA",
    tiktok: "تيك توك — سكريبت فيديو قصير 30-60 ثانية، خطاف افتتاحي قوي، إيقاع سريع",
    twitter: "تويتر/X — تغريدة موجزة تحت 280 حرف، ذكية وقابلة للمشاركة",
    instagram: "إنستغرام — كابشن جذاب مع قصة قصيرة ودعوة للتفاعل",
  };

  const toneGuide: Record<string, string> = {
    formal: "رسمي احترافي",
    friendly: "ودي ومحبب",
    funny: "فكاهي خفيف",
    urgent: "عاجل ومحفز للشراء الفوري",
    motivational: "تحفيزي وملهم",
  };

  const systemPrompt = `أنت خبير تسويق رقمي متخصص في السوق اليمني والعربي.
اكتب محتوى سوشيال ميديا احترافياً ومؤثراً.
المنصة: ${platformGuide[platform] ?? platform}
الأسلوب المطلوب: ${toneGuide[tone ?? "friendly"]}
الهدف: ${goal ?? "زيادة التفاعل والوعي بالعلامة التجارية"}
${hashtags ? "أضف 5-8 هاشتاقات مناسبة في النهاية." : ""}
أعطِ نتيجة جاهزة للنسخ والنشر مباشرة. لا تضف شرحاً أو تعليقاً.`;

  try {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: `اكتب منشور ${platform} عن: ${topic.trim()}` }] }],
      config: { systemInstruction: systemPrompt, temperature: 0.85, maxOutputTokens: 1200 },
    });
    const text = result.text ?? "";
    res.json({ content: text });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "خطأ في توليد المحتوى";
    res.status(500).json({ error: msg });
  }
});

/* ══════════════════════════════════════
   POST /api/ai/code-fix — محلل ومصلح الأكواد
══════════════════════════════════════ */
router.post("/ai/code-fix", requireAuth, async (req: Request, res: Response) => {
  const { code, language, problem } = req.body as {
    code?: string; language?: string; problem: string;
  };

  if (!problem?.trim()) {
    res.status(400).json({ error: "وصف المشكلة مطلوب" });
    return;
  }

  const systemPrompt = `أنت مهندس برمجيات خبير متخصص في تحليل الأكواد وإصلاح الأخطاء.
مهمتك:
1. تحليل الكود/المشكلة المُعطاة بدقة فائقة
2. اكتشاف كل الأخطاء والمشاكل
3. تقديم الكود المصلح الكامل الجاهز للاستخدام
4. شرح سبب كل خطأ بوضوح

أجب بالتنسيق التالي حرفياً:

## 🔍 تحليل المشكلة
[تحليل دقيق للمشكلة والأخطاء المكتشفة]

## ✅ الكود المصلح
\`\`\`${language ?? ""}
[الكود الكامل المصلح هنا]
\`\`\`

## 💡 شرح التصحيحات
[شرح مفصل لكل تصحيح بالترقيم]

## ⚡ نصائح لتحسين الكود
[3-5 نصائح لجودة أفضل]`;

  const userMessage = code
    ? `**المشكلة:** ${problem.trim()}\n\n**اللغة:** ${language ?? "غير محددة"}\n\n**الكود:**\n\`\`\`${language ?? ""}\n${code}\n\`\`\``
    : `**المشكلة التقنية:** ${problem.trim()}`;

  try {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      config: { systemInstruction: systemPrompt, temperature: 0.2, maxOutputTokens: 4000 },
    });
    const text = result.text ?? "";
    res.json({ result: text });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "خطأ في تحليل الكود";
    res.status(500).json({ error: msg });
  }
});

/* ══════════════════════════════════════
   POST /api/ai/bulk-social — حزمة منشورات أسبوعية
══════════════════════════════════════ */
router.post("/ai/bulk-social", requireAuth, async (req: Request, res: Response) => {
  const { businessName, niche, days = 7 } = req.body as {
    businessName: string; niche: string; days?: number;
  };

  if (!businessName?.trim() || !niche?.trim()) {
    res.status(400).json({ error: "اسم العمل والتخصص مطلوبان" });
    return;
  }

  const systemPrompt = `أنت مدير تسويق خبير للسوق اليمني. اكتب خطة محتوى أسبوعية متكاملة.
أجب بـ JSON فقط، بدون markdown أو تعليقات:
{"posts": [{"day": "الأحد", "platform": "facebook", "content": "...", "hashtags": ["..."]}]}`;

  try {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{
        role: "user",
        parts: [{ text: `اكتب ${days} منشورات لـ "${businessName}" في مجال "${niche}" لمنصة فيسبوك بالعربية، مناسبة للسوق اليمني.` }],
      }],
      config: { systemInstruction: systemPrompt, temperature: 0.8, maxOutputTokens: 3000, responseMimeType: "application/json" },
    });
    const raw = result.text ?? "{}";
    try { res.json(JSON.parse(raw)); }
    catch { res.json({ posts: [], raw }); }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "خطأ";
    res.status(500).json({ error: msg });
  }
});

export default router;
