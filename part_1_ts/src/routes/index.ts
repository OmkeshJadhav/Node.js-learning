import { Router } from 'express'
import { healthRouter } from './health.route';
import { authRouter } from './auth.routes';

export const apiRouter = Router()

apiRouter.use(healthRouter);
apiRouter.use("/auth", authRouter)