import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { desc, eq } from "drizzle-orm";
import { getAuth, clerkClient } from "@clerk/express";
import { ai } from "@workspace/integrations-gemini-ai";
import { db, userArtifacts, publishedSites } from "@workspace/db";
import { sendPushToAll } from "../push.js";

const router: IRouter = Router();
const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20";

interface AuthedRequest extends Request { userId: string; }

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  (req as AuthedRequest).userId = userId;
  next();
}

/* ══════════════════════════════════════════════════════
   POST /api/ai/agent  — الوكيل الذكي التنفيذي المستقل
══════════════════════════════════════════════════════ */
router.post("/ai/agent", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const { request } = req.body as { request?: string };

  if (!request?.trim()) {
    res.status(400).json({ error: "request مطلوب" });
    return;
  }

  let userEmail = "";
  let userName = "";
  try {
    const u = await clerkClient.users.getUser(userId);
    userEmail = u.emailAddresses?.[0]?.emailAddress ?? "";
    userName = [u.firstName, u.lastName].filter(Boolean).join(" ");
  } catch {}

  const systemPrompt = `أنت وكيل ذكاء اصطناعي تنفيذي مستقل لمنصة يمن شات. تنفذ الطلبات فوراً وبالكامل.

قواعدك:
- إذا طلب موقع ويب أو صفحة هبوط → أنتج كود HTML كاملاً في ملف واحد (CSS وJS مضمّنان) احترافياً وجميلاً
- إذا طلب حالة واتساب أو منشور → اكتب النص الكامل الجاهز للنشر
- إذا طلب كوداً برمجياً → اكتب الكود كاملاً ومعلقاً
- إذا طلب تحليلاً → قدم التحليل الشامل
- إذا طلب محتوى/مقال/خطبة/تقرير → اكتبه كاملاً بجودة احترافية
- إذا طلب تصميم سيرة ذاتية → اكتب HTML لسيرة ذاتية جميلة
- أي طلب آخر → نفذه بالكامل

يجب أن يكون الرد JSON فقط بالشكل التالي:
{
  "type": "website|code|social|content|analysis|cv|other",
  "title": "عنوان قصير للعمل (15 كلمة كحد أقصى)",
  "content": "المحتوى الكامل المُنتج (HTML للمواقع، نص للمحتوى، كود للبرمجة)",
  "platform": "whatsapp|facebook|instagram|twitter|telegram|null"
}

مهم جداً: ابدأ الرد بـ { مباشرة ولا تضف أي نص قبل أو بعد JSON.`;

  interface AgentOutput { type: string; title: string; content: string; platform?: string | null; }
  let parsed: AgentOutput | null = null;

  try {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      config: { responseMimeType: "application/json" },
      contents: [{
        role: "user",
        parts: [{ text: systemPrompt + "\n\nطلب المستخدم:\n" + request.trim() }],
      }],
    });

    const raw = result.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("لم يُنتَج JSON صالح");
    parsed = JSON.parse(jsonMatch[0]) as AgentOutput;
  } catch (e) {
    res.status(500).json({ error: "فشل الوكيل الذكي في معالجة الطلب", detail: String(e) });
    return;
  }

  const out = parsed!;

  let siteSlug: string | null = null;
  let siteUrl: string | null = null;

  if (out.type === "website" || out.type === "cv") {
    try {
      const slug = Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
      await db.insert(publishedSites).values({
        slug,
        userId,
        title: out.title.slice(0, 100),
        htmlContent: out.content,
      });
      siteSlug = slug;
      siteUrl = `/api/s/${slug}`;
    } catch {}
  }

  const [artifact] = await db.insert(userArtifacts).values({
    userId,
    userEmail,
    userName,
    type: out.type,
    title: out.title,
    content: out.content,
    siteSlug,
    platform: out.platform ?? null,
    request: request.trim().slice(0, 1000),
  }).returning();

  sendPushToAll(
    `✅ ${out.title}`,
    `طلبك "${request.trim().slice(0, 60)}" جاهز الآن في مساحة عملك!`,
    "/deep-services"
  ).catch(() => {});

  res.json({
    id: artifact!.id,
    type: out.type,
    title: out.title,
    content: out.content,
    siteUrl,
    siteSlug,
    platform: out.platform ?? null,
    createdAt: artifact!.createdAt,
  });
});

/* ══════════════════════════════════════════════════════
   GET /api/ai/workspace  — مساحة عمل المستخدم
══════════════════════════════════════════════════════ */
router.get("/ai/workspace", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const items = await db.select()
    .from(userArtifacts)
    .where(eq(userArtifacts.userId, userId))
    .orderBy(desc(userArtifacts.createdAt))
    .limit(50);
  res.json(items);
});

/* DELETE /api/ai/workspace/:id */
router.delete("/ai/workspace/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const id = parseInt(req.params["id"] as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "id غير صالح" }); return; }
  await db.delete(userArtifacts)
    .where(eq(userArtifacts.id, id));
  res.json({ success: true });
});

/* ══════════════════════════════════════════════════════
   GET /api/admin/workspace  — كل أعمال المستخدمين (أدمن)
══════════════════════════════════════════════════════ */
const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] ?? "khalidsalman7140@gmail.com";
async function requireAdmin(req: Request, res: Response, next: () => void): Promise<void> {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const u = await clerkClient.users.getUser(auth.userId);
    const email = u.emailAddresses?.[0]?.emailAddress ?? "";
    if (email !== ADMIN_EMAIL) { res.status(403).json({ error: "Forbidden" }); return; }
    next();
  } catch { res.status(403).json({ error: "Forbidden" }); }
}

router.get("/admin/workspace", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const items = await db.select()
    .from(userArtifacts)
    .orderBy(desc(userArtifacts.createdAt))
    .limit(200);
  res.json(items);
});

export default router;
