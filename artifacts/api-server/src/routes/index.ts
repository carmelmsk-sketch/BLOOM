// @ts-nocheck
import Router, { type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import platformRouter from "./platform.js";
import ideasRouter from "./ideas.js";
import adCampaignsRouter from "./ad-campaigns.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(platformRouter);
router.use(ideasRouter);
router.use(adCampaignsRouter);
router.use("/auth", authRouter);

export default router;
