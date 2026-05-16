import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, gt } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, otpCodes as otpCodesTable, auditLogs as auditLogsTable } from "@workspace/db";
import { notifyUser } from "../utils/notify.js";

const router: IRouter = Router();

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

router.post("/otp/send", async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId ?? null;
    const { email, purpose = "verify" } = req.body as { email?: string; purpose?: string };

    if (!email) { res.status(400).json({ error: "البريد الإلكتروني مطلوب" }); return; }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(otpCodesTable).values({ email, userId, code, purpose, expiresAt });

    await db.insert(auditLogsTable).values({
      userId: userId ?? undefined,
      userEmail: email,
      action: "otp_sent",
      details: `رمز التحقق أُرسل — الغرض: ${purpose} — الرمز: ${code}`,
      ipAddress: req.ip ?? undefined,
    });

    if (userId) {
      await notifyUser(
        userId,
        `🔐 يمن شات — رمز التحقق`,
        `رمز التحقق الخاص بك: ${code}\nصالح لمدة 10 دقائق فقط.\nلا تشاركه مع أحد.\n— منصة يمن شات`,
      );
    }

    res.json({
      ok: true,
      message: "تم إرسال رمز التحقق بنجاح",
      expiresAt,
      devCode: process.env["NODE_ENV"] !== "production" ? code : undefined,
    });
  } catch {
    res.status(500).json({ error: "فشل إرسال الرمز" });
  }
});

router.post("/otp/verify", async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId ?? null;
    const { email, code } = req.body as { email?: string; code?: string };

    if (!email || !code) { res.status(400).json({ error: "البيانات ناقصة" }); return; }

    const [otp] = await db
      .select()
      .from(otpCodesTable)
      .where(
        and(
          eq(otpCodesTable.email, email),
          eq(otpCodesTable.code, code.trim()),
          gt(otpCodesTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!otp || otp.usedAt) {
      await db.insert(auditLogsTable).values({
        userId: userId ?? undefined,
        userEmail: email,
        action: "otp_failed",
        details: `محاولة رمز خاطئة أو منتهية — الرمز المُدخل: ${code}`,
        ipAddress: req.ip ?? undefined,
      });
      res.status(400).json({ error: "الرمز خاطئ أو منتهي الصلاحية" });
      return;
    }

    await db.update(otpCodesTable).set({ usedAt: new Date() }).where(eq(otpCodesTable.id, otp.id));

    await db.insert(auditLogsTable).values({
      userId: userId ?? undefined,
      userEmail: email,
      action: "otp_verified",
      details: `تم التحقق بنجاح — الغرض: ${otp.purpose}`,
      ipAddress: req.ip ?? undefined,
    });

    res.json({ ok: true, message: "تم التحقق بنجاح", purpose: otp.purpose });
  } catch {
    res.status(500).json({ error: "فشل التحقق" });
  }
});

export default router;
