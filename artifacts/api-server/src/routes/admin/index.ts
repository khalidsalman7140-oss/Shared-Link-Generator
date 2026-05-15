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
} from "@workspace/db";
import { notifyAdmin, notifyUser } from "../../utils/notify.js";

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

export default router;
