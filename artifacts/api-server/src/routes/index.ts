import { Router, type IRouter } from "express";
import healthRouter from "./health";
import geminiRouter from "./gemini";
import adminRouter from "./admin";
import ratingsRouter from "./ratings";
import paymentsRouter from "./payments";
import adsRouter from "./ads";

const router: IRouter = Router();

router.use(healthRouter);
router.use(geminiRouter);
router.use(adminRouter);
router.use(ratingsRouter);
router.use(paymentsRouter);
router.use(adsRouter);

export default router;
