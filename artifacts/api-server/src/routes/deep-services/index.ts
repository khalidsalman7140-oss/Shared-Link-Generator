import { Router, type IRouter, type Request, type Response } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { getAuth, clerkClient } from "@clerk/express";
import { db, deepServiceRequests } from "@workspace/db";

const router: IRouter = Router();
const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] ?? "khalidsalman7140@gmail.com";

interface AuthedRequest extends Request { userId: string; }

function requireAuth(req: Request, res: Response, next: () => void): void {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  (req as AuthedRequest).userId = auth.userId;
  next();
}

async function requireAdmin(req: Request, res: Response, next: () => void): Promise<void> {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const user = await clerkClient.users.getUser(auth.userId);
    const email = user.emailAddresses?.[0]?.emailAddress ?? "";
    if (email !== ADMIN_EMAIL) { res.status(403).json({ error: "Forbidden" }); return; }
    next();
  } catch { res.status(403).json({ error: "Forbidden" }); }
}

/* ── user: submit deep service request ── */
router.post("/deep-services", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const { category, title, description, budget, deadline } = req.body as {
    category?: string; title?: string; description?: string;
    budget?: string; deadline?: string;
  };
  if (!category?.trim() || !title?.trim() || !description?.trim()) {
    res.status(400).json({ error: "category, title, and description are required" });
    return;
  }

  let userEmail = "";
  let userName = "";
  try {
    const u = await clerkClient.users.getUser(userId);
    userEmail = u.emailAddresses?.[0]?.emailAddress ?? "";
    userName = [u.firstName, u.lastName].filter(Boolean).join(" ");
  } catch {}

  const [req_] = await db.insert(deepServiceRequests).values({
    userId, userEmail, userName,
    category: category.trim(),
    title: title.trim(),
    description: description.trim(),
    budget: budget?.trim() ?? null,
    deadline: deadline?.trim() ?? null,
    status: "pending",
  }).returning();

  res.status(201).json(req_);
});

/* ── user: get their requests ── */
router.get("/deep-services/my", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const reqs = await db.select()
    .from(deepServiceRequests)
    .where(eq(deepServiceRequests.userId, userId))
    .orderBy(desc(deepServiceRequests.createdAt));
  res.json(reqs);
});

/* ── admin: get all requests ── */
router.get("/admin/deep-services", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const reqs = await db.select()
    .from(deepServiceRequests)
    .orderBy(desc(deepServiceRequests.createdAt))
    .limit(200);
  res.json(reqs);
});

/* ── admin: update status / notes ── */
router.patch("/admin/deep-services/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params["id"] as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "invalid id" }); return; }
  const { status, adminNotes, priority } = req.body as {
    status?: string; adminNotes?: string; priority?: string;
  };
  const [updated] = await db.update(deepServiceRequests)
    .set({
      ...(status ? { status } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
      ...(priority ? { priority } : {}),
      updatedAt: new Date(),
    })
    .where(eq(deepServiceRequests.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "not found" }); return; }
  res.json(updated);
});

/* ── admin: stats ── */
router.get("/admin/deep-services/stats", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const [row] = await db.select({
    total: sql<number>`count(*)`,
    pending: sql<number>`count(*) filter (where status = 'pending')`,
    inProgress: sql<number>`count(*) filter (where status = 'in-progress')`,
    done: sql<number>`count(*) filter (where status = 'done')`,
  }).from(deepServiceRequests);
  res.json(row ?? { total: 0, pending: 0, inProgress: 0, done: 0 });
});

export default router;
