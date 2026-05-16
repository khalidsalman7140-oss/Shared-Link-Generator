import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq } from "drizzle-orm";
import { getAuth, clerkClient } from "@clerk/express";
import { db, paymentRequests as payReqTable, appSettings as appSettingsTable } from "@workspace/db";
import { sendPushToAll } from "./push.js";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized — please sign in" }); return; }
  next();
}

// ── رقم حساب الكريمي وإعدادات الدفع (عام) ────────────────────
router.get("/payments/config", async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select().from(appSettingsTable)
      .where(eq(appSettingsTable.key, "kuraimi_account")).limit(1);
    const account = rows[0]?.value ?? process.env["KURAIMI_ACCOUNT_NUMBER"] ?? "";
    res.json({ kuraimiAccount: account });
  } catch {
    res.json({ kuraimiAccount: process.env["KURAIMI_ACCOUNT_NUMBER"] ?? "" });
  }
});

// ── تحديث رقم حساب الكريمي (للمدير فقط) ─────────────────────
router.post("/payments/config/kuraimi-account", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { account } = req.body as { account?: string };
  if (!account?.trim()) { res.status(400).json({ error: "account required" }); return; }
  try {
    const existing = await db.select({ id: appSettingsTable.id })
      .from(appSettingsTable).where(eq(appSettingsTable.key, "kuraimi_account")).limit(1);
    if (existing.length > 0) {
      await db.update(appSettingsTable)
        .set({ value: account.trim(), updatedAt: new Date() })
        .where(eq(appSettingsTable.key, "kuraimi_account"));
    } else {
      await db.insert(appSettingsTable).values({ key: "kuraimi_account", value: account.trim() });
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update account number" });
  }
});

// ── إرسال طلب الاشتراك بالكريمي ──────────────────────────────
router.post("/payments/request", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth!.userId!;

  const { planRequested, receiptImage, transferNumber, amount, transferService, notes } = req.body as {
    planRequested?: string;
    receiptImage?: string;
    transferNumber?: string;
    amount?: string;
    transferService?: string;
    notes?: string;
  };

  if (!planRequested?.trim()) {
    res.status(400).json({ error: "اختر الخطة المطلوبة" }); return;
  }
  if (!transferNumber?.trim()) {
    res.status(400).json({ error: "رقم السند/العملية إجباري" }); return;
  }
  if (!receiptImage) {
    res.status(400).json({ error: "صورة إشعار التحويل إجبارية" }); return;
  }

  // ── حماية من الاحتيال: منع تكرار رقم السند ──────────────────
  const dup = await db.select({ id: payReqTable.id })
    .from(payReqTable)
    .where(eq(payReqTable.transferNumber, transferNumber.trim()))
    .limit(1);

  if (dup.length > 0) {
    res.status(409).json({
      error: "رقم السند هذا مستخدم مسبقاً — تم اكتشاف محاولة احتيال وتم تسجيلها.",
    });
    return;
  }

  let userEmail = "";
  let userName = "";
  try {
    const user = await clerkClient.users.getUser(userId);
    userEmail = user.emailAddresses?.[0]?.emailAddress ?? "";
    userName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  } catch { /* ignore */ }

  await db.insert(payReqTable).values({
    userId,
    userEmail,
    userName,
    planRequested: planRequested.trim(),
    receiptImage,
    transferNumber: transferNumber.trim(),
    amount: amount?.trim() ?? null,
    transferService: transferService?.trim() ?? null,
    notes: notes?.trim() ?? null,
    status: "pending",
  });

  // ── إشعار فوري للمدير خالد ───────────────────────────────────
  try {
    const planLabel: Record<string, string> = {
      weekly: "أسبوعي", monthly: "شهري", annual: "سنوي", enterprise: "مؤسسي",
    };
    await sendPushToAll(
      "💰 طلب دفع جديد — موافقة فورية مطلوبة",
      `${userName || userEmail || "مستخدم"} | خطة ${planLabel[planRequested.trim()] ?? planRequested.trim()} | سند: ${transferNumber.trim()}`,
      "/admin"
    );
  } catch { /* push failure is non-critical */ }

  res.json({ success: true });
});

export default router;
