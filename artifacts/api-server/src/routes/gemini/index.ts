import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, and } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import {
  db,
  conversations as conversationsTable,
  messages as messagesTable,
  userPlans as userPlansTable,
  userUsage as userUsageTable,
  FREE_DAILY_LIMIT,
} from "@workspace/db";
import { ai } from "@workspace/integrations-gemini-ai";
import {
  CreateGeminiConversationBody,
  GetGeminiConversationParams,
  DeleteGeminiConversationParams,
  ListGeminiMessagesParams,
  SendGeminiMessageParams,
  SendGeminiMessageBody,
  GenerateGeminiImageBody,
} from "@workspace/api-zod";
import { generateImage } from "@workspace/integrations-gemini-ai/image";

const router: IRouter = Router();

interface AuthedRequest extends Request {
  userId: string;
}

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized — please sign in" });
    return;
  }
  (req as AuthedRequest).userId = userId;
  next();
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getUserPlan(userId: string) {
  const [row] = await db.select().from(userPlansTable).where(eq(userPlansTable.userId, userId));
  if (!row) return { plan: "free" as const, validUntil: null };
  if (row.validUntil && new Date(row.validUntil) < new Date()) {
    await db.update(userPlansTable).set({ plan: "free", validUntil: null, updatedAt: new Date() }).where(eq(userPlansTable.userId, userId));
    return { plan: "free" as const, validUntil: null };
  }
  return { plan: row.plan as "free" | "weekly" | "monthly" | "annual" | "enterprise", validUntil: row.validUntil };
}

async function checkAndIncrementUsage(userId: string, plan: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  if (plan !== "free") return { allowed: true, used: 0, limit: Infinity };
  const today = todayStr();
  const [usage] = await db.select().from(userUsageTable).where(and(eq(userUsageTable.userId, userId), eq(userUsageTable.date, today)));
  const used = usage?.messageCount ?? 0;
  if (used >= FREE_DAILY_LIMIT) return { allowed: false, used, limit: FREE_DAILY_LIMIT };
  if (usage) {
    await db.update(userUsageTable).set({ messageCount: used + 1 }).where(and(eq(userUsageTable.userId, userId), eq(userUsageTable.date, today)));
  } else {
    await db.insert(userUsageTable).values({ userId, date: today, messageCount: 1 });
  }
  return { allowed: true, used: used + 1, limit: FREE_DAILY_LIMIT };
}

async function getUsageInfo(userId: string, plan: string): Promise<{ used: number; limit: number }> {
  if (plan !== "free") return { used: 0, limit: Infinity };
  const today = todayStr();
  const [usage] = await db.select().from(userUsageTable).where(and(eq(userUsageTable.userId, userId), eq(userUsageTable.date, today)));
  return { used: usage?.messageCount ?? 0, limit: FREE_DAILY_LIMIT };
}

const SYSTEM_PROMPT = `أنت وكيل ذكي خارق القدرات يمثل خالد سلمان، مبدع يمني رائد في الذكاء الاصطناعي والبرمجة والتصميم.

## هويتك الكاملة:
أنت ليس مجرد مساعد — أنت شريك تقني متكامل قادر على تنفيذ مشاريع كاملة من الصفر.

## قدراتك الخارقة:

### 1. بناء مواقع ويب كاملة (قين ستوديو)
- أنشئ مواقع HTML/CSS/JavaScript احترافية كاملة في كتلة كود html كاملة
- الموقع يُعرض كمعاينة حية مباشرة في المحادثة
- أنواع المواقع: صفحات هبوط، مواقع شركات، متاجر إلكترونية، محافظ أعمال، مواقع تعليمية
- استخدم تصاميم عصرية: تدرجات لونية، انيميشن CSS، تجاوب كامل مع الأجهزة
- أضف: Tailwind CDN, Font Awesome, Google Fonts للمظهر الاحترافي

### 2. توليد الصور بالذكاء الاصطناعي
- لأي طلب صورة: أضف في ردك: [GENERATE_IMAGE: detailed English prompt, professional, high quality]
- أنواع: شعارات، هويات بصرية، منتجات، إعلانات، فنون إبداعية، صور تسويقية

### 3. تحليل الصور المرسلة
- حلل أي صورة وقدم: وصف دقيق، اقتراحات تحسين، خدمات مناسبة، تقدير سعر

### 4. خدمات اليمن المالية (شراكات استراتيجية)
أنت مُلمّ بالخدمات المالية اليمنية التالية وتقدم استشارات ومساعدة في:
- **الكريمي للصرافة والتحويل**: أكبر شبكة صرافة في اليمن، تحويلات داخلية وخارجية، كاش باور
- **بنك الراجحي اليمن**: خدمات مصرفية إسلامية، حسابات، قروض، بطاقات ائتمانية
- **شركة النجم للصرافة**: تحويلات مالية، خدمات الصرف، الدفع الإلكتروني
- **تجار الصرافة والتجارة**: استشارات عملة، أسعار صرف، تسهيل التجارة
- يمكنك مساعدة الشركات في: أتمتة المعاملات، بناء أنظمة المحاسبة، تقارير مالية، حلول fintech

### 5. خدمات المؤسسات والشركات (Enterprise)
لأصحاب الاشتراك المؤسسي، أنت قادر على:
- تنفيذ أي طلب تقني بالكامل: برمجة، تصميم، تحليل
- بناء أنظمة إدارة متكاملة (ERP, CRM, HR systems)
- تطوير APIs وتكامل الأنظمة
- تحليل البيانات وإنشاء التقارير والمخططات
- إنشاء خطط أعمال ودراسات جدوى كاملة
- تصميم هويات بصرية متكاملة للشركات
- إنشاء محتوى تسويقي وإعلانات احترافية

### 6. الذكاء الاصطناعي والأمن السيبراني (للطلاب والمحترفين)
مساعدة شاملة في:
- **الذكاء الاصطناعي**: Machine Learning, Deep Learning, Neural Networks, NLP, Computer Vision
- **الأمن السيبراني**: اختبار الاختراق، تحليل الثغرات، OWASP, CTF challenges, Forensics
- **المنصات والأدوات**: TensorFlow, PyTorch, Scikit-learn, Wireshark, Metasploit, Burp Suite
- تقديم: كود كامل، شرح مفصل، مسارات تعلم، موارد مجانية
- المنصات التعليمية: Coursera, edX, HuggingFace, Kaggle, TryHackMe, HackTheBox

### 7. التكامل مع المنصات العملاقة
أنت خبير في كيفية الاستخدام والتكامل مع:
- **AI**: OpenAI, Gemini, Anthropic Claude, Llama, Mistral, Stable Diffusion
- **Cloud**: AWS, Google Cloud, Azure, Vercel, Netlify, Railway
- **Dev**: GitHub, GitLab, Docker, Kubernetes, CI/CD
- **Data**: Pandas, NumPy, Matplotlib, SQL, MongoDB, PostgreSQL
- **Design**: Figma, Canva, Adobe, Midjourney, DALL-E

### 8. الخدمات الأكاديمية المتكاملة
- مشاريع تخرج كاملة (بحوث، نماذج، كود، تحليل بيانات)
- أوراق بحثية وعروض علمية
- خطط دراسية ومناهج تعليمية

## معلومات التواصل:
- واتساب: +967783701365 و +967779435445
- تيليغرام: @kshskshg
- البريد: khalidsalman7140@gmail.com

## تعليمات المواقع:
عند طلب موقع، اعرض كوداً HTML كاملاً داخل كتلة كود html مع CSS وJS مدمج، تصميم احترافي عصري.

## تعليمات الصور:
[GENERATE_IMAGE: وصف انجليزي مفصل وعالي الجودة]

## أسلوبك:
- احترافي، حماسي، موجه نحو الحلول الفعلية
- أجب باللغة التي يستخدمها العميل
- قدم نتائج ملموسة ومباشرة — لا وعوداً فارغة
- للمؤسسات: قدم عروضاً تفصيلية بأسعار واضحة
- © 2025 خالد سلمان — جميع الحقوق محفوظة`;

router.get("/gemini/conversations", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const conversations = await db.select().from(conversationsTable).where(eq(conversationsTable.userId, userId)).orderBy(conversationsTable.createdAt);
  res.json(conversations);
});

router.post("/gemini/conversations", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const parsed = CreateGeminiConversationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [conversation] = await db.insert(conversationsTable).values({ title: parsed.data.title, userId }).returning();
  res.status(201).json(conversation);
});

router.get("/gemini/conversations/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = GetGeminiConversationParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [conversation] = await db.select().from(conversationsTable).where(and(eq(conversationsTable.id, params.data.id), eq(conversationsTable.userId, userId)));
  if (!conversation) { res.status(404).json({ error: "Conversation not found" }); return; }
  const messages = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, params.data.id)).orderBy(messagesTable.createdAt);
  res.json({ ...conversation, messages });
});

router.delete("/gemini/conversations/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = DeleteGeminiConversationParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [deleted] = await db.delete(conversationsTable).where(and(eq(conversationsTable.id, params.data.id), eq(conversationsTable.userId, userId))).returning();
  if (!deleted) { res.status(404).json({ error: "Conversation not found" }); return; }
  res.sendStatus(204);
});

router.get("/gemini/conversations/:id/messages", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = ListGeminiMessagesParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [conversation] = await db.select().from(conversationsTable).where(and(eq(conversationsTable.id, params.data.id), eq(conversationsTable.userId, userId)));
  if (!conversation) { res.status(404).json({ error: "Conversation not found" }); return; }
  const messages = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, params.data.id)).orderBy(messagesTable.createdAt);
  res.json(messages);
});

router.get("/gemini/usage", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const { plan } = await getUserPlan(userId);
  const { used, limit } = await getUsageInfo(userId, plan);
  res.json({ plan, used, limit: limit === Infinity ? null : limit });
});

router.post("/gemini/conversations/:id/messages", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = SendGeminiMessageParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const bodyParsed = SendGeminiMessageBody.safeParse(req.body);
  if (!bodyParsed.success) { res.status(400).json({ error: bodyParsed.error.message }); return; }

  const { plan } = await getUserPlan(userId);
  const usageCheck = await checkAndIncrementUsage(userId, plan);
  if (!usageCheck.allowed) {
    res.status(429).json({
      error: "LIMIT_REACHED",
      used: usageCheck.used,
      limit: usageCheck.limit,
      plan,
    });
    return;
  }

  const conversationId = params.data.id;
  const userContent = bodyParsed.data.content;
  const [conversation] = await db.select().from(conversationsTable).where(and(eq(conversationsTable.id, conversationId), eq(conversationsTable.userId, userId)));
  if (!conversation) { res.status(404).json({ error: "Conversation not found" }); return; }

  await db.insert(messagesTable).values({ conversationId, role: "user", content: userContent });
  const history = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, conversationId)).orderBy(messagesTable.createdAt);

  const geminiContents = history.map((m) => {
    const role = m.role === "assistant" ? "model" : "user";
    const imageMatch = m.content.match(/\[IMAGE:([^:]+):([^\]]+)\]/);
    if (imageMatch && m.role === "user") {
      const textPart = m.content.replace(/\[IMAGE:[^\]]+\]/, "").trim();
      const mimeType = imageMatch[1]; const b64Data = imageMatch[2];
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      if (textPart) parts.push({ text: textPart });
      parts.push({ inlineData: { mimeType, data: b64Data } });
      return { role, parts };
    }
    return { role, parts: [{ text: m.content }] };
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { used, limit } = await getUsageInfo(userId, plan);
  res.write(`data: ${JSON.stringify({ usage: { used, limit: limit === Infinity ? null : limit, plan } })}\n\n`);

  let fullResponse = "";
  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: geminiContents,
      config: { maxOutputTokens: 16384, systemInstruction: SYSTEM_PROMPT },
    });
    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) { fullResponse += text; res.write(`data: ${JSON.stringify({ content: text })}\n\n`); }
    }
    await db.insert(messagesTable).values({ conversationId, role: "assistant", content: fullResponse });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (err) {
    req.log.error({ err }, "Gemini stream error");
    res.write(`data: ${JSON.stringify({ error: "حدث خطأ في الاتصال بالذكاء الاصطناعي" })}\n\n`);
  }
  res.end();
});

router.post("/gemini/generate-image", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const parsed = GenerateGeminiImageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const { b64_json, mimeType } = await generateImage(parsed.data.prompt);
    res.json({ b64_json, mimeType });
  } catch (err) {
    req.log.error({ err }, "Image generation error");
    res.status(500).json({ error: "فشل توليد الصورة. يرجى المحاولة مرة أخرى." });
  }
});

export default router;
