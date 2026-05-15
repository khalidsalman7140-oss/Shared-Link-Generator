import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

router.get("/services/books", async (req: Request, res: Response): Promise<void> => {
  const q = (req.query.q as string)?.trim();
  const source = (req.query.source as string) ?? "both";

  if (!q) {
    res.status(400).json({ error: "q is required" });
    return;
  }

  const results: Array<{
    id: string;
    title: string;
    authors: string[];
    description: string;
    thumbnail: string | null;
    year: string | null;
    source: string;
    link: string;
  }> = [];

  const errors: string[] = [];

  if (source === "google" || source === "both") {
    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&printType=books`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const data = await resp.json() as {
        items?: Array<{
          id: string;
          volumeInfo: {
            title?: string;
            authors?: string[];
            description?: string;
            imageLinks?: { thumbnail?: string };
            publishedDate?: string;
            infoLink?: string;
          };
        }>;
      };
      for (const item of data.items ?? []) {
        const v = item.volumeInfo;
        results.push({
          id: `google_${item.id}`,
          title: v.title ?? "بدون عنوان",
          authors: v.authors ?? [],
          description: v.description?.slice(0, 400) ?? "",
          thumbnail: v.imageLinks?.thumbnail?.replace("http:", "https:") ?? null,
          year: v.publishedDate?.slice(0, 4) ?? null,
          source: "Google Books",
          link: v.infoLink ?? `https://books.google.com/books?id=${item.id}`,
        });
      }
    } catch (err) {
      errors.push("Google Books: " + String(err));
    }
  }

  if (source === "openlibrary" || source === "both") {
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8&fields=key,title,author_name,first_sentence,cover_i,first_publish_year,ia`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const data = await resp.json() as {
        docs?: Array<{
          key: string;
          title?: string;
          author_name?: string[];
          first_sentence?: { value?: string } | string;
          cover_i?: number;
          first_publish_year?: number;
        }>;
      };
      for (const doc of data.docs ?? []) {
        const coverUrl = doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : null;
        const desc =
          typeof doc.first_sentence === "object"
            ? doc.first_sentence?.value ?? ""
            : doc.first_sentence ?? "";
        results.push({
          id: `ol_${doc.key}`,
          title: doc.title ?? "بدون عنوان",
          authors: doc.author_name ?? [],
          description: desc.slice(0, 400),
          thumbnail: coverUrl,
          year: doc.first_publish_year?.toString() ?? null,
          source: "Open Library",
          link: `https://openlibrary.org${doc.key}`,
        });
      }
    } catch (err) {
      errors.push("Open Library: " + String(err));
    }
  }

  res.json({ results, total: results.length, errors: errors.length ? errors : undefined });
});

export default router;
