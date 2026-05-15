import { Router, type IRouter } from "express";
import healthRouter from "./health";
import geminiRouter from "./gemini";
import adminRouter from "./admin";
import ratingsRouter from "./ratings";
import paymentsRouter from "./payments";
import adsRouter from "./ads";
import userRouter from "./user";
import bookingsRouter from "./bookings/index.js";
import sitesRouter from "./sites";
import convertRouter from "./convert.js";
import servicesRouter from "./services/index.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(geminiRouter);
router.use(adminRouter);
router.use(ratingsRouter);
router.use(paymentsRouter);
router.use(adsRouter);
router.use(userRouter);
router.use(bookingsRouter);
router.use(sitesRouter);
router.use(convertRouter);
router.use(servicesRouter);

export default router;
