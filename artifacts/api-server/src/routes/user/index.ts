import { Router, type IRouter, type Request, type Response } from "express";
import { eq, sql } from "drizzle-orm";
import { createHash } from "crypto";
import { getAuth, clerkClient } from "@clerk/express";
import { db, emailFingerprints as emailFingerprintsTable, auditLogs as auditLogsTable } from "@workspace/db";

const router: IRouter = Router();

function hashEmail(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

router.post("/auth/log-activity", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId ?? null;
  const { action, details } = req.body as { action?: string; details?: string };

  let userEmail = "";
  if (userId) {
    try {
      const user = await clerkClient.users.getUser(userId);
      userEmail = user.emailAddresses?.[0]?.emailAddress ?? "";
    } catch {}
  }

  try {
    await db.insert(auditLogsTable).values({
      userId: userId ?? null,
      userEmail: userEmail || null,
      action: action ?? "login",
      details: details ?? null,
      ipAddress: (req.headers["x-forwarded-for"] as string | undefined) ?? req.ip ?? null,
    });
  } catch {}

  res.json({ ok: true });
});

router.post("/user/track-email", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  let email = "";
  try {
    const user = await clerkClient.users.getUser(userId);
    email = user.emailAddresses?.[0]?.emailAddress ?? "";
  } catch {
    res.status(400).json({ error: "Could not retrieve user email" });
    return;
  }

  if (!email) { res.json({ ok: true }); return; }

  const emailHash = hashEmail(email);

  const [existing] = await db
    .select()
    .from(emailFingerprintsTable)
    .where(eq(emailFingerprintsTable.emailHash, emailHash));

  if (existing) {
    if (existing.isBlocked) {
      res.status(403).json({ error: "blocked", message: "هذا البريد الإلكتروني محظور من استخدام الخدمة." });
      return;
    }
    await db.update(emailFingerprintsTable)
      .set({ userId, lastSeenAt: new Date() })
      .where(eq(emailFingerprintsTable.emailHash, emailHash));
  } else {
    await db.insert(emailFingerprintsTable).values({
      emailHash,
      userId,
      deleteCount: 0,
      isBlocked: false,
    });
  }

  res.json({ ok: true, emailHash });
});

router.post("/user/report-delete", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  let email = "";
  try {
    const user = await clerkClient.users.getUser(userId);
    email = user.emailAddresses?.[0]?.emailAddress ?? "";
  } catch {}

  if (email) {
    const emailHash = hashEmail(email);
    const [existing] = await db
      .select()
      .from(emailFingerprintsTable)
      .where(eq(emailFingerprintsTable.emailHash, emailHash));

    if (existing) {
      const newCount = existing.deleteCount + 1;
      await db.update(emailFingerprintsTable)
        .set({
          deleteCount: newCount,
          isBlocked: newCount >= 3,
          lastSeenAt: new Date(),
        })
        .where(eq(emailFingerprintsTable.emailHash, emailHash));
    }
  }

  res.json({ ok: true });
});

export default router;
