import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db, userApiKeys } from "@workspace/db";
import { encryptKey, decryptKey } from "../../lib/crypto.js";
import type { ServiceName } from "@workspace/db";

const router: IRouter = Router();

interface AuthedRequest extends Request {
  userId: string;
}

router.get("/services/keys", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const rows = await db
    .select({ service: userApiKeys.service, updatedAt: userApiKeys.updatedAt })
    .from(userApiKeys)
    .where(eq(userApiKeys.userId, userId));

  const result: Record<string, { configured: boolean; updatedAt: string }> = {};
  for (const row of rows) {
    result[row.service] = {
      configured: true,
      updatedAt: row.updatedAt.toISOString(),
    };
  }
  res.json(result);
});

router.put("/services/keys/:service", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const service = req.params.service as ServiceName;
  const { key } = req.body as { key?: string };

  if (!key?.trim()) {
    res.status(400).json({ error: "key is required" });
    return;
  }

  const encryptedKey = encryptKey(key.trim());
  const now = new Date();

  const [existing] = await db
    .select({ id: userApiKeys.id })
    .from(userApiKeys)
    .where(and(eq(userApiKeys.userId, userId), eq(userApiKeys.service, service)));

  if (existing) {
    await db
      .update(userApiKeys)
      .set({ encryptedKey, updatedAt: now })
      .where(eq(userApiKeys.id, existing.id));
  } else {
    await db.insert(userApiKeys).values({ userId, service, encryptedKey });
  }

  res.json({ ok: true });
});

router.delete("/services/keys/:service", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const service = req.params.service as ServiceName;

  await db
    .delete(userApiKeys)
    .where(
      and(eq(userApiKeys.userId, userId), eq(userApiKeys.service, service)),
    );
  res.json({ ok: true });
});

export async function getUserKey(userId: string, service: ServiceName): Promise<string | null> {
  const [row] = await db
    .select({ encryptedKey: userApiKeys.encryptedKey })
    .from(userApiKeys)
    .where(
      and(eq(userApiKeys.userId, userId), eq(userApiKeys.service, service)),
    );
  if (!row) return null;
  return decryptKey(row.encryptedKey);
}

export default router;
