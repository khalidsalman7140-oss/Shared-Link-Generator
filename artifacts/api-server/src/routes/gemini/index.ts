import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, and } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
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

const SYSTEM_PROMPT = `أنت وكيل ذكي يمثل خالد سلمان، مبدع يمني متخصص في الذكاء الاصطناعي والبرمجة والتصميم.
مهمتك: التواصل مع العملاء، عرض الخدمات، وتقديم استشارات احترافية.

الخدمات المتاحة:
1. قسم التصميم والإبداع: تصميم هوية بصرية كاملة، صور احترافية بالذكاء الاصطناعي، تصميم ديكور داخلي وخارجي، شهادات تقدير وتصاميم فنية.
2. قسم المحتوى الرقمي: إنشاء فيديوهات كاملة بالذكاء الاصطناعي، تأليف وتصميم كتب إلكترونية، عروض تقديمية احترافية.
3. قسم الخدمات الأكاديمية: مشاريع تخرج جاهزة ومتكاملة، عروض جامعية رقمية.
4. قسم البرمجة والبيانات: برمجة أنظمة وتطبيقات خاصة، تحليل ومعالجة بيانات.

معلومات التواصل مع خالد سلمان:
- واتساب: +967783701365 و +967779435445
- تيليغرام: @kshskshg
- البريد الإلكتروني: khalidsalman7140@gmail.com
- الموقع: khalid-salman.codewords.run/about

أسلوب التواصل:
- كن احترافياً وودوداً
- أجب دائماً باللغة التي يستخدمها العميل (عربي، إنجليزي، فرنسي، تركي، إسباني، أو أي لغة أخرى)
- إذا سأل العميل عن خدمة معينة، قدم تفاصيل واضحة واسأله عن متطلباته
- إذا أرسل العميل صورة، حللها واقترح خدمات مناسبة (مثل تحسين الشعار أو اقتراح ديكور)
- عند الاتفاق على خدمة، أخبر العميل بكيفية التواصل المباشر مع خالد
- قدم تقديرات أولية للأسعار والوقت عند الطلب
- الحقوق محفوظة لخالد سلمان © 2025`;

router.get("/gemini/conversations", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const conversations = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.userId, userId))
    .orderBy(conversationsTable.createdAt);
  res.json(conversations);
});

router.post("/gemini/conversations", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const parsed = CreateGeminiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [conversation] = await db
    .insert(conversationsTable)
    .values({ title: parsed.data.title, userId })
    .returning();
  res.status(201).json(conversation);
});

router.get("/gemini/conversations/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = GetGeminiConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(and(eq(conversationsTable.id, params.data.id), eq(conversationsTable.userId, userId)));
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(messagesTable.createdAt);
  res.json({ ...conversation, messages });
});

router.delete("/gemini/conversations/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = DeleteGeminiConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(conversationsTable)
    .where(and(eq(conversationsTable.id, params.data.id), eq(conversationsTable.userId, userId)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/gemini/conversations/:id/messages", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = ListGeminiMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(and(eq(conversationsTable.id, params.data.id), eq(conversationsTable.userId, userId)));
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(messagesTable.createdAt);
  res.json(messages);
});

router.post("/gemini/conversations/:id/messages", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const params = SendGeminiMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const bodyParsed = SendGeminiMessageBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const conversationId = params.data.id;
  const userContent = bodyParsed.data.content;

  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(and(eq(conversationsTable.id, conversationId), eq(conversationsTable.userId, userId)));
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  await db.insert(messagesTable).values({
    conversationId,
    role: "user",
    content: userContent,
  });

  const history = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))
    .orderBy(messagesTable.createdAt);

  const geminiContents = history.map((m) => {
    const role = m.role === "assistant" ? "model" : "user";
    const imageMatch = m.content.match(/\[IMAGE:([^:]+):([^\]]+)\]/);
    if (imageMatch && m.role === "user") {
      const textPart = m.content.replace(/\[IMAGE:[^\]]+\]/, "").trim();
      const mimeType = imageMatch[1];
      const b64Data = imageMatch[2];
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

  let fullResponse = "";

  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: geminiContents,
      config: {
        maxOutputTokens: 8192,
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    await db.insert(messagesTable).values({
      conversationId,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (err) {
    req.log.error({ err }, "Gemini stream error");
    res.write(`data: ${JSON.stringify({ error: "حدث خطأ في الاتصال بالذكاء الاصطناعي" })}\n\n`);
  }

  res.end();
});

router.post("/gemini/generate-image", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const parsed = GenerateGeminiImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { b64_json, mimeType } = await generateImage(parsed.data.prompt);
  res.json({ b64_json, mimeType });
});

export default router;
