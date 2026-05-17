import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { getAuth, clerkClient } from "@clerk/express";
import { db, marketplaceProfiles, escrowTransactions } from "@workspace/db";

const router: IRouter = Router();

interface AuthedReq extends Request { userId: string; userEmail: string; userName: string; }

async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const r = req as AuthedReq;
  r.userId = auth.userId;
  try {
    const u = await clerkClient.users.getUser(auth.userId);
    r.userEmail = u.emailAddresses?.[0]?.emailAddress ?? "";
    r.userName  = [u.firstName, u.lastName].filter(Boolean).join(" ");
  } catch {
    r.userEmail = ""; r.userName = "";
  }
  next();
}

/* ════════════ PROFILES ════════════ */

/* GET /api/marketplace/profiles — all public profiles */
router.get("/marketplace/profiles", async (_req: Request, res: Response): Promise<void> => {
  const profiles = await db.select()
    .from(marketplaceProfiles)
    .where(eq(marketplaceProfiles.isPublic, true))
    .orderBy(desc(marketplaceProfiles.createdAt))
    .limit(100);
  res.json(profiles);
});

/* GET /api/marketplace/profile/me — my own profile */
router.get("/marketplace/profile/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthedReq;
  const [profile] = await db.select()
    .from(marketplaceProfiles)
    .where(eq(marketplaceProfiles.userId, userId))
    .limit(1);
  res.json(profile ?? null);
});

/* POST /api/marketplace/profile — create or update profile */
router.post("/marketplace/profile", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId, userEmail, userName } = req as AuthedReq;
  const { businessName, category, tagline, description, skills, whatsapp, telegram, location, portfolio, isPublic } =
    req.body as {
      businessName: string; category: string; tagline?: string; description: string;
      skills?: string; whatsapp?: string; telegram?: string; location?: string;
      portfolio?: string; isPublic?: boolean;
    };

  if (!businessName?.trim() || !category?.trim() || !description?.trim()) {
    res.status(400).json({ error: "اسم العمل والتصنيف والوصف مطلوبة" });
    return;
  }

  const existing = await db.select({ id: marketplaceProfiles.id })
    .from(marketplaceProfiles).where(eq(marketplaceProfiles.userId, userId)).limit(1);

  if (existing.length > 0) {
    const [updated] = await db.update(marketplaceProfiles).set({
      userEmail, userName, businessName: businessName.trim(), category: category.trim(),
      tagline: tagline?.trim() ?? null, description: description.trim(),
      skills: skills?.trim() ?? null, whatsapp: whatsapp?.trim() ?? null,
      telegram: telegram?.trim() ?? null, location: location?.trim() ?? null,
      portfolio: portfolio?.trim() ?? null, isPublic: isPublic ?? true,
      updatedAt: new Date(),
    }).where(eq(marketplaceProfiles.userId, userId)).returning();
    res.json(updated);
  } else {
    const [created] = await db.insert(marketplaceProfiles).values({
      userId, userEmail, userName, businessName: businessName.trim(), category: category.trim(),
      tagline: tagline?.trim() ?? null, description: description.trim(),
      skills: skills?.trim() ?? null, whatsapp: whatsapp?.trim() ?? null,
      telegram: telegram?.trim() ?? null, location: location?.trim() ?? null,
      portfolio: portfolio?.trim() ?? null, isPublic: isPublic ?? true,
    }).returning();
    res.json(created);
  }
});

/* DELETE /api/marketplace/profile/me */
router.delete("/marketplace/profile/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthedReq;
  await db.delete(marketplaceProfiles).where(eq(marketplaceProfiles.userId, userId));
  res.json({ success: true });
});

/* ════════════ ESCROW ════════════ */

/* GET /api/marketplace/escrow — user's escrow transactions */
router.get("/marketplace/escrow", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthedReq;
  const txs = await db.select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.initiatorId, userId))
    .orderBy(desc(escrowTransactions.createdAt))
    .limit(50);
  res.json(txs);
});

/* POST /api/marketplace/escrow — create escrow */
router.post("/marketplace/escrow", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId, userEmail } = req as AuthedReq;
  const { counterpartyName, counterpartyContact, amount, currency, description } =
    req.body as { counterpartyName: string; counterpartyContact: string; amount: string; currency?: string; description: string; };

  if (!counterpartyName?.trim() || !counterpartyContact?.trim() || !amount?.trim() || !description?.trim()) {
    res.status(400).json({ error: "جميع الحقول مطلوبة" });
    return;
  }

  const [tx] = await db.insert(escrowTransactions).values({
    initiatorId: userId, initiatorEmail: userEmail,
    counterpartyName: counterpartyName.trim(),
    counterpartyContact: counterpartyContact.trim(),
    amount: amount.trim(), currency: currency ?? "YER",
    description: description.trim(), status: "pending",
  }).returning();
  res.json(tx);
});

/* PATCH /api/marketplace/escrow/:id — update status (cancel/release) */
router.patch("/marketplace/escrow/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthedReq;
  const id = parseInt(req.params["id"] as string, 10);
  const { status, adminNotes } = req.body as { status: string; adminNotes?: string };

  const allowed = ["pending","active","released","disputed","cancelled"];
  if (!allowed.includes(status)) { res.status(400).json({ error: "حالة غير صالحة" }); return; }

  const [tx] = await db.update(escrowTransactions).set({
    status, adminNotes: adminNotes ?? null, updatedAt: new Date(),
  }).where(eq(escrowTransactions.id, id)).returning();

  if (!tx || tx.initiatorId !== userId) { res.status(404).json({ error: "غير موجود" }); return; }
  res.json(tx);
});

/* GET /api/admin/marketplace — all profiles + escrow (admin) */
router.get("/admin/marketplace", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const u = await clerkClient.users.getUser(auth.userId);
    const email = u.emailAddresses?.[0]?.emailAddress ?? "";
    if (email !== (process.env["ADMIN_EMAIL"] ?? "khalidsalman7140@gmail.com")) {
      res.status(403).json({ error: "Forbidden" }); return;
    }
  } catch { res.status(403).json({ error: "Forbidden" }); return; }

  const [profiles, escrow] = await Promise.all([
    db.select().from(marketplaceProfiles).orderBy(desc(marketplaceProfiles.createdAt)).limit(500),
    db.select().from(escrowTransactions).orderBy(desc(escrowTransactions.createdAt)).limit(500),
  ]);
  res.json({ profiles, escrow });
});

/* Increment view count */
router.post("/marketplace/profiles/:id/view", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params["id"] as string, 10);
  if (!isNaN(id)) {
    await db.update(marketplaceProfiles)
      .set({ viewCount: sql`${marketplaceProfiles.viewCount} + 1` })
      .where(eq(marketplaceProfiles.id, id))
      .catch(() => {});
  }
  res.json({ ok: true });
});

export default router;
