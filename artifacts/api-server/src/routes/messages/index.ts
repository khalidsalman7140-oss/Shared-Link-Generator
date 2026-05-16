import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, desc, or, sql } from "drizzle-orm";
import { getAuth, clerkClient } from "@clerk/express";
import {
  db,
  adminMessages as adminMessagesTable,
  conversations as conversationsTable,
  messages as messagesTable,
} from "@workspace/db";

const router: IRouter = Router();
const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] ?? "khalidsalman7140@gmail.com";

interface AuthedRequest extends Request { userId: string; }

function requireAuth(req: Request, res: Response, next: () => void): void {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  (req as AuthedRequest).userId = auth.userId;
  next();
}

async function requireAdmin(req: Request, res: Response, next: () => void): Promise<void> {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const user = await clerkClient.users.getUser(auth.userId);
    const email = user.emailAddresses?.[0]?.emailAddress ?? "";
    if (email !== ADMIN_EMAIL) { res.status(403).json({ error: "Forbidden" }); return; }
    (req as AuthedRequest).userId = auth.userId;
    next();
  } catch { res.status(403).json({ error: "Forbidden" }); }
}

/* ── user sends message to admin ── */
router.post("/messages", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const { content } = req.body as { content?: string };
  if (!content?.trim()) { res.status(400).json({ error: "content required" }); return; }

  let userEmail = "";
  let userName = "";
  try {
    const u = await clerkClient.users.getUser(userId);
    userEmail = u.emailAddresses?.[0]?.emailAddress ?? "";
    userName = [u.firstName, u.lastName].filter(Boolean).join(" ");
  } catch {}

  const [msg] = await db.insert(adminMessagesTable).values({
    userId, userEmail, userName,
    content: content.trim(),
    direction: "user_to_admin",
    isRead: false,
  }).returning();

  res.json(msg);
});

/* ── user gets their message thread with admin ── */
router.get("/messages", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const msgs = await db.select()
    .from(adminMessagesTable)
    .where(eq(adminMessagesTable.userId, userId))
    .orderBy(adminMessagesTable.createdAt);
  res.json(msgs);
});

/* ── mark messages as read (user reads admin reply) ── */
router.post("/messages/mark-read", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  await db.update(adminMessagesTable)
    .set({ isRead: true })
    .where(and(
      eq(adminMessagesTable.userId, userId),
      eq(adminMessagesTable.direction, "admin_to_user"),
      eq(adminMessagesTable.isRead, false),
    ));
  res.json({ ok: true });
});

/* ── user archive — categorized works from conversation messages ── */
router.get("/messages/archive", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;

  const convs = await db.select()
    .from(conversationsTable)
    .where(eq(conversationsTable.userId, userId))
    .orderBy(desc(conversationsTable.createdAt))
    .limit(100);

  if (!convs.length) { res.json({ works: [], total: 0 }); return; }

  const convIds = convs.map(c => c.id);
  const allMsgs = await db.select()
    .from(messagesTable)
    .where(sql`conversation_id = ANY(${convIds})`)
    .orderBy(desc(messagesTable.createdAt));

  const convMap = new Map(convs.map(c => [c.id, c]));
  const works: {
    id: string; type: string; label: string; emoji: string;
    title: string; date: string; convId: number;
  }[] = [];

  for (const msg of allMsgs) {
    if (msg.role !== "assistant") continue;
    const c = msg.content;
    const conv = convMap.get(msg.conversationId);
    if (!conv) continue;
    const date = msg.createdAt instanceof Date ? msg.createdAt.toISOString() : String(msg.createdAt);
    const convTitle = conv.title || "محادثة";

    if (/<\!DOCTYPE html/i.test(c) || /<html/i.test(c) || c.includes("[GEN_WEBSITE_LOADING]")) {
      works.push({ id: `w-${msg.id}`, type: "website", emoji: "🌐", label: "موقع ويب", title: convTitle, date, convId: conv.id });
    } else if (/<svg/i.test(c) || /شعار|logo/i.test(c.slice(0, 200))) {
      works.push({ id: `l-${msg.id}`, type: "logo", emoji: "🎨", label: "شعار/تصميم", title: convTitle, date, convId: conv.id });
    } else if (/\.docx|word|وثيق|تقرير|ملزم/i.test(c.slice(0, 300))) {
      works.push({ id: `d-${msg.id}`, type: "document", emoji: "📄", label: "وثيقة/تقرير", title: convTitle, date, convId: conv.id });
    } else if (c.includes("[IMAGE:") || /صور|رسم|image/i.test(c.slice(0, 200))) {
      works.push({ id: `i-${msg.id}`, type: "image", emoji: "🖼️", label: "صورة/رسم", title: convTitle, date, convId: conv.id });
    } else if (/```python|```js|```javascript|```typescript|```html|```css|كود|برمجة/i.test(c.slice(0, 300))) {
      works.push({ id: `c-${msg.id}`, type: "code", emoji: "💻", label: "كود برمجي", title: convTitle, date, convId: conv.id });
    }
  }

  const seen = new Set<string>();
  const unique = works.filter(w => {
    const key = `${w.type}-${w.convId}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });

  const stats = {
    websites: unique.filter(w => w.type === "website").length,
    logos: unique.filter(w => w.type === "logo").length,
    documents: unique.filter(w => w.type === "document").length,
    images: unique.filter(w => w.type === "image").length,
    code: unique.filter(w => w.type === "code").length,
  };

  res.json({ works: unique.slice(0, 50), total: unique.length, stats, totalConvs: convs.length });
});

/* ══ ADMIN ROUTES ══ */

/* admin: get all user messages grouped by user */
router.get("/admin/user-messages", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const msgs = await db.select()
    .from(adminMessagesTable)
    .orderBy(desc(adminMessagesTable.createdAt))
    .limit(500);

  const grouped = new Map<string, {
    userId: string; userEmail: string; userName: string;
    unread: number; lastMsg: string; lastDate: string; msgCount: number;
  }>();

  for (const m of msgs) {
    if (!grouped.has(m.userId)) {
      grouped.set(m.userId, {
        userId: m.userId, userEmail: m.userEmail ?? "", userName: m.userName ?? "",
        unread: 0, lastMsg: m.content.slice(0, 80), lastDate: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
        msgCount: 0,
      });
    }
    const g = grouped.get(m.userId)!;
    g.msgCount++;
    if (m.direction === "user_to_admin" && !m.isRead) g.unread++;
  }

  res.json(Array.from(grouped.values()));
});

/* admin: get full thread with a user */
router.get("/admin/user-messages/:userId", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const userId = req.params["userId"] as string;
  const msgs = await db.select()
    .from(adminMessagesTable)
    .where(eq(adminMessagesTable.userId, userId))
    .orderBy(adminMessagesTable.createdAt);

  await db.update(adminMessagesTable)
    .set({ isRead: true })
    .where(and(eq(adminMessagesTable.userId, userId), eq(adminMessagesTable.direction, "user_to_admin")));

  res.json(msgs);
});

/* admin: reply to user */
router.post("/admin/user-messages/:userId/reply", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const userId = req.params["userId"] as string;
  const { content } = req.body as { content?: string };
  if (!content?.trim()) { res.status(400).json({ error: "content required" }); return; }

  let userEmail = "";
  let userName = "";
  try {
    const u = await clerkClient.users.getUser(userId);
    userEmail = u.emailAddresses?.[0]?.emailAddress ?? "";
    userName = [u.firstName, u.lastName].filter(Boolean).join(" ");
  } catch {}

  const [msg] = await db.insert(adminMessagesTable).values({
    userId, userEmail, userName,
    content: content.trim(),
    direction: "admin_to_user",
    isRead: false,
  }).returning();

  res.json(msg);
});

/* admin: unread count */
router.get("/admin/user-messages-count", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const [row] = await db.select({ count: sql<number>`count(*)` })
    .from(adminMessagesTable)
    .where(and(eq(adminMessagesTable.direction, "user_to_admin"), eq(adminMessagesTable.isRead, false)));
  res.json({ unread: Number(row?.count ?? 0) });
});

export default router;
