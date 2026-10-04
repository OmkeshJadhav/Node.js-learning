import { Router } from 'express'
import { healthRouter } from './health.route';
import { authRouter } from './auth.routes';
import { userTaskRouter } from './user.task.routes';

export const apiRouter = Router()

apiRouter.use(healthRouter);
apiRouter.use("/auth", authRouter)
apiRouter.use("/tasks", userTaskRouter)
