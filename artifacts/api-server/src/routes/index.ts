// @ts-nocheck
import Router, { type IRouter } from "express";
import healthRouter from "./health.ts";
import authRouter from "./auth.ts";
import platformRouter from "./platform.ts";
import ideasRouter from "./ideas.ts";
import adCampaignsRouter from "./ad-campaigns.ts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(platformRouter);
router.use(ideasRouter);
router.use(adCampaignsRouter);
router.use("/auth", authRouter);

export default router;
