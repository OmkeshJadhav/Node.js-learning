import { Request, Response, NextFunction, Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { getAdminTasks } from "../services/admin.task.service";
import { AppError } from "../errors/AppError";

export const adminTaskRouter = Router();

adminTaskRouter.use(authenticate, requireAdmin)

adminTaskRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { search, status } = req.query

        // req.query values can be arrays/objects (e.g. ?status=OPEN&status=RESOLVED), so allow only plain strings
        if ((search !== undefined && typeof search !== "string") ||
            (status !== undefined && typeof status !== "string")) {
            throw new AppError(400, "search and status must be single string values")
        }

        const data = await getAdminTasks({ search, status })

        res.status(200).json({
            success: true,
            data
        })


    } catch (error) {
        next(error)
    }
})