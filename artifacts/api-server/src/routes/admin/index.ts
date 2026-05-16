import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, desc, and, sql } from "drizzle-orm";
import { getAuth, clerkClient } from "@clerk/express";
import {
  db,
  conversations as conversationsTable,
  messages as messagesTable,
  userPlans as userPlansTable,
  userUsage as userUsageTable,
  ratings as ratingsTable,
  blockedUsers as blockedUsersTable,
  paymentRequests as paymentRequestsTable,
  announcements as announcementsTable,
  emailFingerprints as emailFingerprintsTable,
  ads as adsTable,
  serviceBookings as bookingsTable,
  auditLogs as auditLogsTable,
  otpCodes as otpCodesTable,
} from "@workspace/db";
import { notifyAdmin, notifyUser } from "../../utils/notify.js";
import { sendPushToAll } from "../push.js";
import { createRequire } from "module";
import path from "path";
import fs from "fs";
const _require = createRequire(import.meta.url);
const archiver = _require("archiver") as typeof import("archiver");
import { ai } from "@workspace/integrations-gemini-ai";

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] ?? "khalidsalman7140@gmail.com";

const router: IRouter = Router();

interface AdminRequest extends Request {
  adminUserId: string;
}

async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress ?? "";
    if (email !== ADMIN_EMAIL) { res.status(403).json({ error: "Forbidden — Admin only" }); return; }
    (req as AdminRequest).adminUserId = userId;
    next();
  } catch {
    res.status(403).json({ error: "Forbidden" });
  }
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

const ADMIN_KEY = process.env["ADMIN_KEY"] ?? "الفاتح";

// ── مسار عام للإعلانات النشطة (بدون تسجيل دخول) ────────────────
router.get("/announcements", async (_req: Request, res: Response): Promise<void> => {
  try {
    const list = await db
      .select()
      .from(announcementsTable)
      .where(eq(announcementsTable.isActive, true))
      .orderBy(desc(announcementsTable.createdAt))
      .limit(5);
    res.json(list);
  } catch {
    res.json([]);
  }
});

router.post("/admin/ensure-plan", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AdminRequest).adminUserId;
  const existing = await db.select().from(userPlansTable).where(eq(userPlansTable.userId, userId));
  if (existing.length) {
    await db.update(userPlansTable).set({ plan: "enterprise", validUntil: null, updatedAt: new Date() }).where(eq(userPlansTable.userId, userId));
  } else {
    await db.insert(userPlansTable).values({ userId, plan: "enterprise", validUntil: null });
  }
  res.json({ ok: true });
});

router.post("/admin/verify-key", requireAdmin, (req: Request, res: Response): void => {
  const { key } = req.body as { key?: string };
  if (!key || key.trim() !== ADMIN_KEY) {
    res.status(401).json({ error: "كلمة السر غير صحيحة" });
    return;
  }
  res.json({ ok: true });
});

router.get("/admin/stats", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const today = todayStr();
  const [
    totalConversations,
    totalMessages,
    messagesToday,
    planCounts,
    totalRatings,
    avgRating,
    pendingPayments,
    totalBlocked,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(conversationsTable),
    db.select({ count: sql<number>`count(*)` }).from(messagesTable),
    db.select({ total: sql<number>`sum(message_count)` }).from(userUsageTable).where(eq(userUsageTable.date, today)),
    db.select({ plan: userPlansTable.plan, count: sql<number>`count(*)` }).from(userPlansTable).groupBy(userPlansTable.plan),
    db.select({ count: sql<number>`count(*)` }).from(ratingsTable),
    db.select({ avg: sql<number>`avg(rating)` }).from(ratingsTable),
    db.select({ count: sql<number>`count(*)` }).from(paymentRequestsTable).where(eq(paymentRequestsTable.status, "pending")),
    db.select({ count: sql<number>`count(*)` }).from(blockedUsersTable),
  ]);

  const usersWithPlans = await db.selectDistinct({ userId: userPlansTable.userId }).from(userPlansTable);
  const usersInConversations = await db.selectDistinct({ userId: conversationsTable.userId }).from(conversationsTable);
  const uniqueUsers = new Set([
    ...usersWithPlans.map(u => u.userId),
    ...usersInConversations.map(u => u.userId).filter(Boolean),
  ]);

  const newUsersToday = await db
    .select({ count: sql<number>`count(*)` })
    .from(emailFingerprintsTable)
    .where(sql`date(used_trial_at) = ${today}`);

  res.json({
    totalUsers: uniqueUsers.size,
    newUsersToday: Number(newUsersToday[0]?.count ?? 0),
    totalConversations: Number(totalConversations[0]?.count ?? 0),
    totalMessages: Number(totalMessages[0]?.count ?? 0),
    messagesToday: Number(messagesToday[0]?.total ?? 0),
    planDistribution: planCounts.reduce((acc, r) => ({ ...acc, [r.plan]: Number(r.count) }), {}),
    totalRatings: Number(totalRatings[0]?.count ?? 0),
    avgRating: parseFloat((Number(avgRating[0]?.avg ?? 0)).toFixed(2)),
    pendingPayments: Number(pendingPayments[0]?.count ?? 0),
    totalBlocked: Number(totalBlocked[0]?.count ?? 0),
  });
});

router.get("/admin/users", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const today = todayStr();
  const plans = await db.select().from(userPlansTable).orderBy(desc(userPlansTable.updatedAt));
  const usageToday = await db.select().from(userUsageTable).where(eq(userUsageTable.date, today));
  const usageMap = new Map(usageToday.map(u => [u.userId, u.messageCount]));

  const enriched = await Promise.all(plans.map(async (p) => {
    try {
      const user = await clerkClient.users.getUser(p.userId);
      return {
        userId: p.userId,
        email: user.emailAddresses?.[0]?.emailAddress ?? "",
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "—",
        imageUrl: user.imageUrl ?? "",
        plan: p.plan,
        validUntil: p.validUntil,
        usageToday: usageMap.get(p.userId) ?? 0,
        createdAt: p.createdAt,
      };
    } catch {
      return {
        userId: p.userId, email: "—", name: "—", imageUrl: "",
        plan: p.plan, validUntil: p.validUntil,
        usageToday: usageMap.get(p.userId) ?? 0, createdAt: p.createdAt,
      };
    }
  }));
  res.json(enriched);
});

router.patch("/admin/users/:userId/plan", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const userId = req.params["userId"] as string;
  const { plan, validUntil } = req.body as { plan: string; validUntil?: string };
  const existing = await db.select().from(userPlansTable).where(eq(userPlansTable.userId, userId));
  if (existing.length) {
    await db.update(userPlansTable).set({ plan, validUntil: validUntil ? new Date(validUntil) : null, updatedAt: new Date() }).where(eq(userPlansTable.userId, userId));
  } else {
    await db.insert(userPlansTable).values({ userId, plan, validUntil: validUntil ? new Date(validUntil) : null });
  }
  res.json({ success: true });
});

router.post("/admin/users/:userId/block", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const userId = req.params["userId"] as string;
  const { reason } = req.body as { reason?: string };
  let email = "";
  try { const u = await clerkClient.users.getUser(userId); email = u.emailAddresses?.[0]?.emailAddress ?? ""; } catch {}
  const existing = await db.select().from(blockedUsersTable).where(eq(blockedUsersTable.userId, userId));
  if (existing.length) {
    await db.delete(blockedUsersTable).where(eq(blockedUsersTable.userId, userId));
    res.json({ blocked: false });
  } else {
    await db.insert(blockedUsersTable).values({ userId, userEmail: email, reason: reason ?? "Blocked by admin" });
    res.json({ blocked: true });
  }
});

router.get("/admin/users/:userId/conversations", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const userId = req.params["userId"] as string;
  const convs = await db.select().from(conversationsTable).where(eq(conversationsTable.userId, userId)).orderBy(desc(conversationsTable.createdAt)).limit(20);
  const result = await Promise.all(convs.map(async (c) => {
    const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, c.id)).orderBy(messagesTable.createdAt);
    return { ...c, messageCount: msgs.length, lastMessage: msgs[msgs.length - 1]?.content?.slice(0, 150) ?? "" };
  }));
  res.json(result);
});

router.get("/admin/ratings", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const list = await db.select().from(ratingsTable).orderBy(desc(ratingsTable.createdAt)).limit(100);
  res.json(list);
});

router.delete("/admin/ratings/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  await db.delete(ratingsTable).where(eq(ratingsTable.id, parseInt(req.params["id"] as string)));
  res.json({ success: true });
});

router.get("/admin/payments", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const list = await db.select().from(paymentRequestsTable).orderBy(desc(paymentRequestsTable.createdAt)).limit(200);
  res.json(list);
});

router.patch("/admin/payments/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const paymentId = parseInt(req.params["id"] as string);
  const { status, reviewNotes } = req.body as { status: string; reviewNotes?: string };
  const [payment] = await db.select().from(paymentRequestsTable).where(eq(paymentRequestsTable.id, paymentId));
  if (!payment) { res.status(404).json({ error: "Not found" }); return; }
  await db.update(paymentRequestsTable).set({ status, reviewNotes: reviewNotes ?? null, reviewedAt: new Date() }).where(eq(paymentRequestsTable.id, paymentId));
  if (status === "approved" && payment.userId) {
    const planDays: Record<string, number> = { weekly: 7, monthly: 30, annual: 365, enterprise: 3650 };
    const planNames: Record<string, string> = { weekly: "أسبوعي", monthly: "شهري", annual: "سنوي", enterprise: "مؤسسي" };
    const days = planDays[payment.planRequested] ?? 30;
    const validUntil = new Date(Date.now() + days * 86400000);
    const existing = await db.select().from(userPlansTable).where(eq(userPlansTable.userId, payment.userId));
    if (existing.length) {
      await db.update(userPlansTable).set({ plan: payment.planRequested, validUntil, updatedAt: new Date() }).where(eq(userPlansTable.userId, payment.userId));
    } else {
      await db.insert(userPlansTable).values({ userId: payment.userId, plan: payment.planRequested, validUntil });
    }
    // Notify user on phone
    const planLabel = planNames[payment.planRequested] ?? payment.planRequested;
    await notifyUser(payment.userId,
      `✅ تم تفعيل اشتراكك في يمن شات`,
      `تهانينا! تم تفعيل خطتك ${planLabel} بنجاح. يمكنك الآن الاستفادة من جميع الميزات المتقدمة.`,
    );
    await notifyAdmin(
      `اشتراك جديد مُفعَّل — ${planLabel}`,
      `المستخدم: ${payment.userEmail ?? payment.userId}\nالخطة: ${planLabel}\nصالح حتى: ${validUntil.toLocaleDateString("ar-YE")}`,
    );
  }
  res.json({ success: true });
});

router.get("/admin/announcements", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const list = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt));
  res.json(list);
});

router.post("/admin/announcements", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { title, content } = req.body as { title: string; content: string };
  const [a] = await db.insert(announcementsTable).values({ title, content }).returning();
  // إرسال Push notification لكل المشتركين
  sendPushToAll(title, content, "/chat").catch(() => {});
  res.status(201).json(a);
});

router.patch("/admin/announcements/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { isActive } = req.body as { isActive: boolean };
  await db.update(announcementsTable).set({ isActive }).where(eq(announcementsTable.id, parseInt(req.params["id"] as string)));
  res.json({ success: true });
});

router.delete("/admin/announcements/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  await db.delete(announcementsTable).where(eq(announcementsTable.id, parseInt(req.params["id"] as string)));
  res.json({ success: true });
});

router.post("/admin/announcements/:id/push", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  const [a] = await db.select().from(announcementsTable).where(eq(announcementsTable.id, id));
  if (!a) { res.status(404).json({ error: "لم يُعثر على الإعلان" }); return; }
  await sendPushToAll(a.title, a.content, "/chat");
  res.json({ success: true, sent: true });
});

router.post("/admin/notify-access", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const now = new Date().toLocaleString("ar-YE", { timeZone: "Asia/Aden", hour12: true });
  await notifyAdmin(
    "🔐 تم فتح لوحة التحكم",
    `دخل المالك خالد سلمان إلى لوحة الإدارة\nالوقت: ${now}`,
    2,
  );
  res.json({ ok: true });
});

router.get("/admin/bookings", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const list = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt)).limit(200);
  res.json(list);
});

router.patch("/admin/bookings/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  const { status, adminNotes } = req.body as { status?: string; adminNotes?: string };
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) { res.status(404).json({ error: "Not found" }); return; }
  await db.update(bookingsTable).set({
    ...(status ? { status } : {}),
    ...(adminNotes !== undefined ? { adminNotes } : {}),
    updatedAt: new Date(),
  }).where(eq(bookingsTable.id, id));
  if (status && booking.userId) {
    const statusLabel: Record<string, string> = {
      reviewing: "قيد المراجعة",
      "in-progress": "قيد التنفيذ",
      completed: "مكتمل ✅",
      cancelled: "ملغي",
    };
    if (statusLabel[status]) {
      await notifyUser(booking.userId,
        `تحديث طلبك #${id} — ${statusLabel[status]}`,
        `طلب الخدمة: ${booking.serviceTitle}\nالحالة الجديدة: ${statusLabel[status]}${adminNotes ? `\nملاحظة: ${adminNotes}` : ""}`,
      );
    }
  }
  res.json({ success: true });
});

router.get("/admin/users/:userId/detail", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const userId = req.params["userId"] as string;
  try {
    const [convs, payments, bookings, plan, usage] = await Promise.all([
      db.select().from(conversationsTable).where(eq(conversationsTable.userId, userId)).orderBy(desc(conversationsTable.createdAt)).limit(30),
      db.select().from(paymentRequestsTable).where(eq(paymentRequestsTable.userId, userId)).orderBy(desc(paymentRequestsTable.createdAt)),
      db.select().from(bookingsTable).where(eq(bookingsTable.userId, userId)).orderBy(desc(bookingsTable.createdAt)),
      db.select().from(userPlansTable).where(eq(userPlansTable.userId, userId)),
      db.select().from(userUsageTable).where(eq(userUsageTable.userId, userId)).orderBy(desc(userUsageTable.date)).limit(7),
    ]);
    const totalMessages = await db.select({ c: sql<number>`count(*)` }).from(messagesTable)
      .where(sql`conversation_id IN (SELECT id FROM conversations WHERE user_id = ${userId})`);
    res.json({
      conversations: convs, payments, bookings,
      plan: plan[0] ?? null,
      recentUsage: usage,
      totalMessages: Number(totalMessages[0]?.c ?? 0),
    });
  } catch {
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/admin/live-events", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const [pending, recentPayments, recentConvs] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(paymentRequestsTable).where(eq(paymentRequestsTable.status, "pending")),
    db.select().from(paymentRequestsTable).where(eq(paymentRequestsTable.status, "pending")).orderBy(desc(paymentRequestsTable.createdAt)).limit(5),
    db.select().from(conversationsTable).orderBy(desc(conversationsTable.createdAt)).limit(3),
  ]);
  res.json({
    pendingCount: Number(pending[0]?.count ?? 0),
    recentPayments,
    recentConvs,
    ts: Date.now(),
  });
});

router.get("/admin/recent-activity", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const recentConvs = await db.select().from(conversationsTable).orderBy(desc(conversationsTable.createdAt)).limit(10);
  const recentPayments = await db.select().from(paymentRequestsTable).where(eq(paymentRequestsTable.status, "pending")).orderBy(desc(paymentRequestsTable.createdAt)).limit(5);
  const recentRatings = await db.select().from(ratingsTable).orderBy(desc(ratingsTable.createdAt)).limit(5);
  res.json({ recentConvs, recentPayments, recentRatings });
});

router.get("/admin/ads-list", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const list = await db.select().from(adsTable).orderBy(desc(adsTable.createdAt)).limit(200);
  res.json(list);
});

router.get("/admin/audit-logs", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const list = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(500);
  res.json(list);
});

router.get("/admin/fraud", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const list = await db.select().from(emailFingerprintsTable).orderBy(desc(emailFingerprintsTable.lastSeenAt)).limit(500);
  res.json(list);
});

router.post("/admin/fraud/:id/unblock", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  await db.update(emailFingerprintsTable).set({ isBlocked: false }).where(eq(emailFingerprintsTable.id, id));
  res.json({ success: true });
});

router.delete("/admin/fraud/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  await db.delete(emailFingerprintsTable).where(eq(emailFingerprintsTable.id, id));
  res.json({ success: true });
});

/* ══════════════════════════════════════════════════════
   غرفة التحكم الخلفية — Control Room
══════════════════════════════════════════════════════ */

router.get("/admin/control-room/overview", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalMsgs, totalConvs, totalOtps, totalAudit, recentAudit] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(messagesTable),
      db.select({ count: sql<number>`count(*)` }).from(conversationsTable),
      db.select({ count: sql<number>`count(*)` }).from(otpCodesTable),
      db.select({ count: sql<number>`count(*)` }).from(auditLogsTable),
      db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(5),
    ]);
    res.json({
      totalMessages: Number(totalMsgs[0]?.count ?? 0),
      totalConversations: Number(totalConvs[0]?.count ?? 0),
      totalOtpsSent: Number(totalOtps[0]?.count ?? 0),
      totalAuditEvents: Number(totalAudit[0]?.count ?? 0),
      recentAudit,
      ts: Date.now(),
    });
  } catch { res.status(500).json({ error: "Failed" }); }
});

router.get("/admin/control-room/messages", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(parseInt(String(req.query["limit"] ?? "200")), 500);
    const offset = parseInt(String(req.query["offset"] ?? "0"));
    const rows = await db
      .select({
        msgId: messagesTable.id,
        role: messagesTable.role,
        content: messagesTable.content,
        msgCreatedAt: messagesTable.createdAt,
        convId: conversationsTable.id,
        convTitle: conversationsTable.title,
        userId: conversationsTable.userId,
      })
      .from(messagesTable)
      .innerJoin(conversationsTable, eq(messagesTable.conversationId, conversationsTable.id))
      .orderBy(desc(messagesTable.createdAt))
      .limit(limit)
      .offset(offset);

    const userIds = [...new Set(rows.map(r => r.userId).filter(Boolean))] as string[];
    const emailMap: Record<string, string> = {};
    for (const uid of userIds.slice(0, 50)) {
      try {
        const u = await clerkClient.users.getUser(uid);
        emailMap[uid] = u.emailAddresses?.[0]?.emailAddress ?? "—";
      } catch { emailMap[uid] = "—"; }
    }

    const enriched = rows.map(r => ({
      ...r,
      userEmail: r.userId ? (emailMap[r.userId] ?? "—") : "—",
      contentPreview: r.content.slice(0, 300),
    }));
    res.json(enriched);
  } catch { res.status(500).json({ error: "Failed" }); }
});

router.get("/admin/control-room/otps", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const list = await db.select().from(otpCodesTable).orderBy(desc(otpCodesTable.createdAt)).limit(500);
    res.json(list);
  } catch { res.status(500).json({ error: "Failed" }); }
});

router.get("/admin/control-room/activity", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(parseInt(String(req.query["limit"] ?? "300")), 500);
    const list = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(limit);
    res.json(list);
  } catch { res.status(500).json({ error: "Failed" }); }
});

router.get("/admin/control-room/user-messages/:userId", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params["userId"] as string;
    const convs = await db.select().from(conversationsTable).where(eq(conversationsTable.userId, userId)).orderBy(desc(conversationsTable.createdAt)).limit(50);
    const result = await Promise.all(convs.map(async (c) => {
      const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, c.id)).orderBy(messagesTable.createdAt);
      return { ...c, messages: msgs };
    }));
    res.json(result);
  } catch { res.status(500).json({ error: "Failed" }); }
});

/* ══════════════════════════════════════════════════════════
   WORKSPACE = the project root on the Replit container
══════════════════════════════════════════════════════════ */
const WORKSPACE = path.resolve("/home/runner/workspace");
const BACKUP_EXCLUDE = ["node_modules", ".git", "dist", ".local", "coverage", ".cache", "__pycache__"];

interface FileNode {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  children?: FileNode[];
}

function buildTree(dir: string, rel: string = "", depth: number = 0): FileNode[] {
  if (depth > 5) return [];
  let entries: fs.Dirent[];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return []; }

  const nodes: FileNode[] = [];
  for (const e of entries) {
    if (BACKUP_EXCLUDE.includes(e.name) || e.name.startsWith(".env")) continue;
    const full = path.join(dir, e.name);
    const relPath = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      nodes.push({ name: e.name, path: relPath, type: "dir", children: buildTree(full, relPath, depth + 1) });
    } else {
      const size = (() => { try { return fs.statSync(full).size; } catch { return 0; } })();
      nodes.push({ name: e.name, path: relPath, type: "file", size });
    }
  }
  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

/* ── 📦 Backup: Export ZIP ───────────────────────────────── */
router.get("/admin/backup/export", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="yemenchat-backup-${date}.zip"`);

  const arc = archiver("zip", { zlib: { level: 6 } });
  arc.pipe(res);

  const filterFn = (entry: { name: string }) => {
    const parts = entry.name.split("/");
    if (parts.some(p => BACKUP_EXCLUDE.includes(p))) return false;
    return entry;
  };

  for (const dir of ["artifacts", "lib", "scripts"]) {
    const dp = path.join(WORKSPACE, dir);
    if (fs.existsSync(dp)) arc.directory(dp, dir, filterFn as Parameters<typeof arc.directory>[2]);
  }
  for (const f of ["package.json", "pnpm-workspace.yaml", "tsconfig.json", "tsconfig.base.json", "replit.md", "drizzle.config.ts"]) {
    const fp = path.join(WORKSPACE, f);
    if (fs.existsSync(fp)) arc.file(fp, { name: f });
  }

  await arc.finalize();
});

/* ── 🗂 Code Explorer: File Tree ─────────────────────────── */
router.get("/admin/code-explorer/tree", requireAdmin, (_req: Request, res: Response): void => {
  const roots = ["artifacts", "lib", "scripts"];
  const tree: FileNode[] = [];
  for (const r of roots) {
    const dp = path.join(WORKSPACE, r);
    if (fs.existsSync(dp)) {
      tree.push({ name: r, path: r, type: "dir", children: buildTree(dp, r) });
    }
  }
  res.json(tree);
});

/* ── 📄 Code Explorer: File Content ─────────────────────── */
router.get("/admin/code-explorer/file", requireAdmin, (req: Request, res: Response): void => {
  const filePath = (req.query["path"] as string | undefined) ?? "";
  if (!filePath) { res.status(400).json({ error: "Missing path" }); return; }

  const full = path.resolve(WORKSPACE, filePath);
  if (!full.startsWith(WORKSPACE)) { res.status(403).json({ error: "Access denied" }); return; }
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) { res.status(404).json({ error: "Not found" }); return; }

  const stat = fs.statSync(full);
  if (stat.size > 150 * 1024) {
    res.json({ content: `[ الملف كبير جداً: ${Math.round(stat.size / 1024)} KB — يمكنك تصديره عبر النسخة الاحتياطية ]`, truncated: true, size: stat.size });
    return;
  }
  try {
    const content = fs.readFileSync(full, "utf-8");
    res.json({ content, size: stat.size });
  } catch {
    res.json({ content: "[ ملف ثنائي — لا يمكن عرضه كنص ]", binary: true, size: stat.size });
  }
});

/* ── 🤖 Code Analyzer: AI Analysis ──────────────────────── */
router.post("/admin/code-explorer/analyze", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { question, filePaths } = req.body as { question: string; filePaths: string[] };
  if (!question) { res.status(400).json({ error: "Missing question" }); return; }

  const files = (filePaths ?? []).slice(0, 6).map((fp: string) => {
    const full = path.resolve(WORKSPACE, fp);
    if (!full.startsWith(WORKSPACE)) return null;
    try {
      const content = fs.readFileSync(full, "utf-8").slice(0, 8000);
      return `\n\n### FILE: ${fp}\n\`\`\`\n${content}\n\`\`\``;
    } catch { return null; }
  }).filter(Boolean).join("");

  const prompt = `أنت مساعد تقني متخصص في تحليل الكود البرمجي لمنصة يمن شات (YemenChat).\nسؤال المالك: ${question}${files}\n\nقدّم تحليلاً دقيقاً وتوصيات عملية بالعربية.`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    res.json({ analysis: result.text ?? "لم يتمكن المحرك من التحليل." });
  } catch {
    res.status(500).json({ error: "فشل التحليل — تحقق من مفتاح Gemini" });
  }
});

/* ── 📊 Data Export: All data as CSV ZIP ────────────────── */
router.get("/admin/data-export", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="yemenchat-data-${date}.zip"`);

  const arc = archiver("zip", { zlib: { level: 6 } });
  arc.pipe(res);

  const toCsv = (rows: Record<string, unknown>[]): string => {
    if (!rows.length) return "no data";
    const headers = Object.keys(rows[0]!);
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    return [headers.join(","), ...rows.map(r => headers.map(h => escape(r[h])).join(","))].join("\n");
  };

  try {
    const [users, convs, msgs, otps, audit, payments] = await Promise.all([
      db.select().from(userPlansTable).orderBy(desc(userPlansTable.createdAt)).limit(5000),
      db.select().from(conversationsTable).orderBy(desc(conversationsTable.createdAt)).limit(5000),
      db.select({ id: messagesTable.id, role: messagesTable.role, content: sql<string>`LEFT(${messagesTable.content},200)`, createdAt: messagesTable.createdAt, conversationId: messagesTable.conversationId }).from(messagesTable).orderBy(desc(messagesTable.createdAt)).limit(5000),
      db.select().from(otpCodesTable).orderBy(desc(otpCodesTable.createdAt)).limit(5000),
      db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(5000),
      db.select().from(paymentRequestsTable).orderBy(desc(paymentRequestsTable.createdAt)).limit(5000),
    ]);

    arc.append(toCsv(users as Record<string,unknown>[]), { name: "users-plans.csv" });
    arc.append(toCsv(convs as Record<string,unknown>[]), { name: "conversations.csv" });
    arc.append(toCsv(msgs as Record<string,unknown>[]), { name: "messages.csv" });
    arc.append(toCsv(otps as Record<string,unknown>[]), { name: "otp-codes.csv" });
    arc.append(toCsv(audit as Record<string,unknown>[]), { name: "audit-log.csv" });
    arc.append(toCsv(payments as Record<string,unknown>[]), { name: "payments.csv" });
    arc.append(JSON.stringify({ exportedAt: new Date().toISOString(), platform: "YemenChat", version: "1.0" }, null, 2), { name: "meta.json" });
  } catch (e) {
    arc.append(`Export error: ${String(e)}`, { name: "error.txt" });
  }

  await arc.finalize();
});

export default router;
