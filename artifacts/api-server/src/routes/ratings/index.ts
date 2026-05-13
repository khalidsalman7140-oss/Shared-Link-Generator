import { Router, type IRouter, type Request, type Response } from "express";
import { desc, eq, avg, count } from "drizzle-orm";
import { getAuth, clerkClient } from "@clerk/express";
import { db, ratings as ratingsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/ratings", async (_req: Request, res: Response): Promise<void> => {
  const list = await db.select().from(ratingsTable).orderBy(desc(ratingsTable.createdAt)).limit(50);
  const [stats] = await db.select({ avg: avg(ratingsTable.rating), total: count() }).from(ratingsTable);
  res.json({ ratings: list, avg: parseFloat((Number(stats?.avg ?? 0)).toFixed(2)), total: Number(stats?.total ?? 0) });
});

router.post("/ratings", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(req);
  const { rating, comment, service } = req.body as { rating: number; comment?: string; service?: string };
  if (!rating || rating < 1 || rating > 5) { res.status(400).json({ error: "Rating must be 1-5" }); return; }

  let userEmail = "";
  let userName = "";
  if (auth?.userId) {
    try {
      const user = await clerkClient.users.getUser(auth.userId);
      userEmail = user.emailAddresses?.[0]?.emailAddress ?? "";
      userName = [user.firstName, user.lastName].filter(Boolean).join(" ");
    } catch {}
  }

  const [created] = await db.insert(ratingsTable).values({
    userId: auth?.userId ?? null,
    userEmail,
    userName,
    rating,
    comment: comment ?? null,
    service: service ?? null,
  }).returning();
  res.status(201).json(created);
});

export default router;
