import { Router, type IRouter, type Request, type Response } from "express";
import { eq, desc } from "drizzle-orm";
import { getAuth, clerkClient } from "@clerk/express";
import { db, serviceBookings as bookingsTable } from "@workspace/db";
import { notifyAdmin } from "../../utils/notify.js";

const router: IRouter = Router();

router.post("/bookings", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId ?? null;

  const { phone, serviceType, serviceTitle, description, budget, urgency, userName, userEmail } =
    req.body as {
      phone: string;
      serviceType: string;
      serviceTitle: string;
      description: string;
      budget?: string;
      urgency?: string;
      userName?: string;
      userEmail?: string;
    };

  if (!phone || !serviceType || !serviceTitle || !description) {
    res.status(400).json({ error: "بيانات ناقصة" });
    return;
  }

  let resolvedEmail = userEmail ?? "";
  let resolvedName = userName ?? "";

  if (userId && !resolvedEmail) {
    try {
      const user = await clerkClient.users.getUser(userId);
      resolvedEmail = user.emailAddresses?.[0]?.emailAddress ?? "";
      resolvedName = [user.firstName, user.lastName].filter(Boolean).join(" ") || resolvedEmail;
    } catch { /* ignore */ }
  }

  const [booking] = await db.insert(bookingsTable).values({
    userId,
    userEmail: resolvedEmail,
    userName: resolvedName,
    phone,
    serviceType,
    serviceTitle,
    description,
    budget: budget ?? null,
    urgency: urgency ?? "normal",
    status: "pending",
  }).returning();

  // Notify Khaled on phone
  const urgencyLabel = urgency === "critical" ? "🚨 عاجل جداً" : urgency === "urgent" ? "⚡ عاجل" : "📋 عادي";
  await notifyAdmin(
    `طلب خدمة جديد — ${serviceTitle}`,
    `من: ${resolvedName || resolvedEmail || phone}\nالخدمة: ${serviceType} — ${serviceTitle}\nالأولوية: ${urgencyLabel}\nالميزانية: ${budget ?? "غير محددة"}`,
    urgency === "critical" ? 5 : urgency === "urgent" ? 4 : 3,
  );

  res.status(201).json(booking);
});

router.get("/bookings", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const list = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.userId, userId))
    .orderBy(desc(bookingsTable.createdAt))
    .limit(50);

  res.json(list);
});

export default router;
