import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, and, desc, gte, or, isNull, sql } from "drizzle-orm";
import { getAuth, clerkClient } from "@clerk/express";
import { db, ads as adsTable } from "@workspace/db";

const router: IRouter = Router();
const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] ?? "khalidsalman7140@gmail.com";

async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const user = await clerkClient.users.getUser(auth.userId);
    const email = user.emailAddresses?.[0]?.emailAddress ?? "";
    if (email !== ADMIN_EMAIL) { res.status(403).json({ error: "Forbidden" }); return; }
    next();
  } catch { res.status(403).json({ error: "Forbidden" }); }
}

router.get("/ads", async (req: Request, res: Response): Promise<void> => {
  const now = new Date();
  const active = await db
    .select()
    .from(adsTable)
    .where(and(eq(adsTable.isActive, true), or(isNull(adsTable.expiresAt), gte(adsTable.expiresAt, now))))
    .orderBy(desc(adsTable.createdAt));
  res.json(active);
});

router.post("/admin/ads", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { title, description, imageUrl, linkUrl, sponsor, position, expiresAt } = req.body as {
    title: string; description?: string; imageUrl?: string; linkUrl?: string;
    sponsor?: string; position?: string; expiresAt?: string;
  };
  if (!title) { res.status(400).json({ error: "title required" }); return; }
  const [ad] = await db.insert(adsTable).values({
    title,
    description: description ?? null,
    imageUrl: imageUrl ?? null,
    linkUrl: linkUrl ?? null,
    sponsor: sponsor ?? "مركز الأسطورة",
    position: position ?? "banner",
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning();
  res.status(201).json(ad);
});

router.patch("/admin/ads/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params["id"] as string, 10);
  const { isActive, title, description, imageUrl, linkUrl, sponsor } = req.body as {
    isActive?: boolean; title?: string; description?: string;
    imageUrl?: string; linkUrl?: string; sponsor?: string;
  };
  const updates: Record<string, unknown> = {};
  if (isActive !== undefined) updates["isActive"] = isActive;
  if (title) updates["title"] = title;
  if (description !== undefined) updates["description"] = description;
  if (imageUrl !== undefined) updates["imageUrl"] = imageUrl;
  if (linkUrl !== undefined) updates["linkUrl"] = linkUrl;
  if (sponsor) updates["sponsor"] = sponsor;
  const [ad] = await db.update(adsTable).set(updates).where(eq(adsTable.id, id)).returning();
  if (!ad) { res.status(404).json({ error: "Ad not found" }); return; }
  res.json(ad);
});

router.delete("/admin/ads/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params["id"] as string, 10);
  await db.delete(adsTable).where(eq(adsTable.id, id));
  res.sendStatus(204);
});

router.post("/ads/:id/click", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params["id"] as string, 10);
  await db.update(adsTable)
    .set({ clickCount: sql`${adsTable.clickCount} + 1` })
    .where(eq(adsTable.id, id));
  res.sendStatus(204);
});

export default router;
