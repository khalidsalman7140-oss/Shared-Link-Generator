import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import keysRouter from "./keys.js";
import booksRouter from "./books.js";
import ttsRouter from "./tts.js";
import translateRouter from "./translate.js";
import imageRouter from "./image.js";
import claudeRouter from "./claude.js";
import runwayRouter from "./runway.js";

const router: IRouter = Router();

interface AuthedRequest extends Request {
  userId: string;
}

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized — please sign in" });
    return;
  }
  (req as AuthedRequest).userId = userId;
  next();
}

router.use(requireAuth);

router.use(keysRouter);
router.use(booksRouter);
router.use(ttsRouter);
router.use(translateRouter);
router.use(imageRouter);
router.use(claudeRouter);
router.use(runwayRouter);

export default router;
