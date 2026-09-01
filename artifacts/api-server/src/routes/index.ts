import Router, { type IRouter } from 'express';
import healthRouter from './health';
import authRouter from './auth';
import platformRouter from './platform';

const router: IRouter = Router();

router.use(healthRouter);
router.use(platformRouter);
router.use('/auth', authRouter);

export default router;
