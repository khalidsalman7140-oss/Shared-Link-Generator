import { Router, type IRouter, type Request, type Response } from "express";
import { eq, sql as _sql } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import webPush from "web-push";
import { db, pushSubscriptions as pushSubsTable } from "@workspace/db";

const router: IRouter = Router();

const VAPID_PUBLIC = process.env["VAPID_PUBLIC_KEY"] ?? "";
const VAPID_PRIVATE = process.env["VAPID_PRIVATE_KEY"] ?? "";
const VAPID_EMAIL = process.env["VAPID_EMAIL"] ?? "mailto:admin@example.com";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

// ── مفتاح VAPID العام للعميل ──────────────────────────────────
router.get("/push/vapid-key", (_req: Request, res: Response): void => {
  res.json({ publicKey: VAPID_PUBLIC });
});

// ── تسجيل اشتراك Push ─────────────────────────────────────────
router.post("/push/subscribe", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId ?? null;
  const { endpoint, keys } = req.body as {
    endpoint?: string;
    keys?: { p256dh: string; auth: string };
  };
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.status(400).json({ error: "Invalid subscription" });
    return;
  }
  try {
    await db.insert(pushSubsTable).values({ userId, endpoint, keys })
      .onConflictDoUpdate({ target: pushSubsTable.endpoint, set: { userId, keys } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to store subscription" });
  }
});

// ── إلغاء الاشتراك ────────────────────────────────────────────
router.post("/push/unsubscribe", async (req: Request, res: Response): Promise<void> => {
  const { endpoint } = req.body as { endpoint?: string };
  if (!endpoint) { res.status(400).json({ error: "endpoint required" }); return; }
  await db.delete(pushSubsTable).where(eq(pushSubsTable.endpoint, endpoint));
  res.json({ success: true });
});

// ── دالة مساعدة لإرسال Push لكل المشتركين ────────────────────
export async function sendPushToAll(title: string, body: string, url = "/"): Promise<void> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;
  const subs = await db.select().from(pushSubsTable);
  const payload = JSON.stringify({ title, body, icon: "/logo.svg", badge: "/logo.svg", url });
  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys as { p256dh: string; auth: string } },
          payload
        );
      } catch (err: unknown) {
        if ((err as { statusCode?: number }).statusCode === 410) {
          await db.delete(pushSubsTable).where(eq(pushSubsTable.endpoint, sub.endpoint));
        }
      }
    })
  );
}

export default router;
