import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

router.get("/books/search", async (req: Request, res: Response): Promise<void> => {
  const { q, page = "1", languages } = req.query;
  const params = new URLSearchParams();
  if (q) params.set("search", String(q));
  if (languages) params.set("languages", String(languages));
  params.set("page", String(page));

  try {
    const r = await fetch(`https://gutendex.com/books/?${params.toString()}`, {
      headers: { "User-Agent": "YemenChat/1.0" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) { res.status(502).json({ error: "Failed to reach book library" }); return; }
    const data: unknown = await r.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: "فشل البحث في المكتبة" });
  }
});

router.get("/books/:id", async (req: Request, res: Response): Promise<void> => {
  const bookId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!/^\d+$/.test(bookId)) { res.status(400).json({ error: "Invalid book id" }); return; }
  try {
    const r = await fetch(`https://gutendex.com/books/${req.params.id}`, {
      headers: { "User-Agent": "YemenChat/1.0" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) { res.status(404).json({ error: "Book not found" }); return; }
    const data: unknown = await r.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: "فشل جلب الكتاب" });
  }
});

export default router;
