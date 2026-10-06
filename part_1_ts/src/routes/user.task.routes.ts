import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware';
import { createUserTask, deleteUserTask, getUserTaskById, getUserTasks, updateUserTask } from '../services/user.task.service';

export const userTaskRouter = Router();

userTaskRouter.use(authenticate)  // This middleware is applied to all user task routes

userTaskRouter.post('/', async (req, res, next) => {
    try {
        const task = await createUserTask(req.user!.userId, req.body.title);

        res.status(201).json({
            success: true,
            data: { task },
        });
    } catch (error) {
        next(error);
    }
});

userTaskRouter.get('/', async (req, res, next) => {
    try {
        const tasks = await getUserTasks(req.user!.userId);

        res.status(200).json({
            success: true,
            data: {tasks}
        })
    } catch (error) {
        next(error)
    }
})

userTaskRouter.get('/:taskId', async(req, res, next) => {
    try {
        const task = await getUserTaskById(req.user!.userId, req.params.taskId)

        res.status(200).json({
            success: true,
            data: { task }
        })
    } catch (error) {
        next(error)
    }
})

userTaskRouter.patch('/:taskId', async(req, res, next) => {
    try {
        const task = await updateUserTask(
            req.params.taskId,
            req.user!.userId,
            req.body.title,
            req.body.status
        )

        res.status(200).json({
            success: true,
            data: { task }
        })
    } catch (error) {
        next(error)
    }
})

userTaskRouter.delete('/:taskId', async (req, res, next): Promise<void> => {
    try {
        await deleteUserTask(req.params.taskId, req.user!.userId)

        res.status(200).json({
            success: true,
            message: `Task ${req.params.taskId} is deleted successfully.`
        })
    } catch (error) {
        next(error)
    }
})