import { Router, type IRouter, type Request, type Response } from "express";
import { exec } from "child_process";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

const router: IRouter = Router();

router.post(
  "/convert-video",
  (req, res, next) => {
    let body = Buffer.alloc(0);
    req.on("data", (chunk: Buffer) => {
      body = Buffer.concat([body, chunk]);
      if (body.length > 300 * 1024 * 1024) {
        res.status(413).json({ error: "File too large (max 300 MB)" });
      }
    });
    req.on("end", () => {
      (req as Request & { rawBody: Buffer }).rawBody = body;
      next();
    });
  },
  async (req: Request, res: Response): Promise<void> => {
    const body = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!body || body.length < 100) {
      res.status(400).json({ error: "No video data received" });
      return;
    }

    const id = randomBytes(8).toString("hex");
    const inFile = join("/tmp", `${id}.webm`);
    const outFile = join("/tmp", `${id}.mp4`);

    try {
      await writeFile(inFile, body);

      await new Promise<void>((resolve, reject) => {
        exec(
          `ffmpeg -y -i "${inFile}" -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "${outFile}"`,
          { timeout: 300_000 },
          (err) => (err ? reject(err) : resolve()),
        );
      });

      const mp4 = await readFile(outFile);

      res.setHeader("Content-Type", "video/mp4");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename*=UTF-8\'\'%D9%8A%D9%85%D9%86-%D8%B4%D8%A7%D8%AA-%D8%AA%D8%B1%D9%88%D9%8A%D8%AC%D9%8A.mp4',
      );
      res.send(mp4);
    } catch (err) {
      req.log.error({ err }, "FFmpeg conversion failed");
      res.status(500).json({ error: "Video conversion failed" });
    } finally {
      await unlink(inFile).catch(() => {});
      await unlink(outFile).catch(() => {});
    }
  },
);

export default router;
