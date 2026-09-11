import Router, { type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import platformRouter from "./platform";
import ideasRouter from "./ideas";

const router: IRouter = Router();

router.use(healthRouter);
router.use(platformRouter);
router.use(ideasRouter);
router.use("/auth", authRouter);

export default router;