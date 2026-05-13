import { Router, type IRouter, type Request, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import { getAuth, clerkClient } from "@clerk/express";
import { db, paymentRequests as paymentRequestsTable } from "@workspace/db";

const router: IRouter = Router();

function requireAuthMiddleware(req: Request, res: Response): string | null {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return null; }
  return auth.userId;
}

router.post("/payments/request", async (req: Request, res: Response): Promise<void> => {
  const userId = requireAuthMiddleware(req, res);
  if (!userId) return;
  const { planRequested, receiptImage, transferNumber, amount, transferService, notes } = req.body as {
    planRequested: string; receiptImage?: string; transferNumber?: string;
    amount?: string; transferService?: string; notes?: string;
  };
  if (!planRequested) { res.status(400).json({ error: "Plan is required" }); return; }

  let userEmail = "";
  let userName = "";
  try {
    const user = await clerkClient.users.getUser(userId);
    userEmail = user.emailAddresses?.[0]?.emailAddress ?? "";
    userName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  } catch {}

  const [created] = await db.insert(paymentRequestsTable).values({
    userId, userEmail, userName, planRequested,
    receiptImage: receiptImage ?? null,
    transferNumber: transferNumber ?? null,
    amount: amount ?? null,
    transferService: transferService ?? null,
    notes: notes ?? null,
  }).returning();
  res.status(201).json(created);
});

router.get("/payments/my-requests", async (req: Request, res: Response): Promise<void> => {
  const userId = requireAuthMiddleware(req, res);
  if (!userId) return;
  const list = await db.select().from(paymentRequestsTable).where(eq(paymentRequestsTable.userId, userId)).orderBy(desc(paymentRequestsTable.createdAt));
  res.json(list);
});

export default router;
