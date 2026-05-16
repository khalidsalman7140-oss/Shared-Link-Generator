import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized — please sign in" });
    return;
  }
  next();
}

router.post("/docs/generate", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const {
    title,
    content,
    lang = "ar",
  } = req.body as { title?: string; content?: string; lang?: string };

  if (!title?.trim()) {
    res.status(400).json({ error: "title required" });
    return;
  }

  const isRTL = lang === "ar";
  const align = isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT;
  const lines = (content ?? "").split("\n").filter(Boolean);

  const children: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 40,
          color: "1a56db",
          font: "Arial",
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      alignment: align,
      spacing: { after: 300 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "1a56db", space: 4 },
      },
    }),
    ...lines.map(
      (line) =>
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 24,
              font: "Arial",
            }),
          ],
          alignment: align,
          spacing: { after: 120 },
        }),
    ),
  ];

  try {
    const doc = new Document({
      sections: [{ children }],
    });

    const buffer = await Packer.toBuffer(doc);
    const base64 = buffer.toString("base64");
    const safeTitle = title.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, "").trim().slice(0, 50);
    res.json({ base64, filename: `${safeTitle}.docx` });
  } catch (err) {
    req.log.error({ err }, "Doc generation error");
    res.status(500).json({ error: "فشل إنشاء المستند" });
  }
});

export default router;
