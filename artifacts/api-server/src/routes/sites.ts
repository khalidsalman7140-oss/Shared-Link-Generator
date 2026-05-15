import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, publishedSites, userPlans } from "@workspace/db";

const router: IRouter = Router();

router.get("/s/:slug", async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params as { slug: string };
  try {
    const [site] = await db.select().from(publishedSites).where(eq(publishedSites.slug, slug));
    if (!site) {
      res.status(404).send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>غير موجود</title><style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;color:#374151;text-align:center}</style></head><body><div><h2>🔍 الموقع غير موجود</h2><p>قد يكون الرابط غير صحيح أو تم حذف الموقع.</p></div></body></html>`);
      return;
    }
    res.removeHeader("X-Frame-Options");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(site.htmlContent);
  } catch {
    res.status(500).send("<h1>Server Error</h1>");
  }
});

router.post("/sites/publish", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { html, title } = req.body as { html?: string; title?: string };
  if (!html?.trim() || html.length < 50) {
    res.status(400).json({ error: "html is required" });
    return;
  }
  const [planRow] = await db.select().from(userPlans).where(eq(userPlans.userId, auth.userId));
  const plan = planRow?.plan ?? "free";
  const isExpired = plan !== "free" && planRow?.validUntil != null && new Date(planRow.validUntil) < new Date();
  if (plan === "free" || isExpired) {
    res.status(402).json({ error: "premium_required", message: "نشر المواقع يتطلب خطة مدفوعة. اشترك من $2.99/أسبوع." });
    return;
  }
  const slug = Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);
  await db.insert(publishedSites).values({
    slug,
    userId: auth.userId,
    title: (title ?? "موقعي").slice(0, 100),
    htmlContent: html,
  });
  res.json({ slug, url: `/api/s/${slug}` });
});

export default router;
