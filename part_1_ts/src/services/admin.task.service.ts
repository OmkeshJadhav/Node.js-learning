import { AppError } from "../errors/AppError";
import { deleteTaskByAdmin, findAllTasks, updateTaskStatus } from "../repositories/admin.task.repository";
import { AdminTaskListQuery, AdminTaskListResponse } from "../types/admin";
import { Task, TASK_STATUSES, TaskStatus } from "../types/task";
import { validateTaskId } from "../validators/task.validator";


export const getAdminTasks = async (query: AdminTaskListQuery): Promise<AdminTaskListResponse> => {
    const search = query.search?.trim() || undefined
    const status = query.status?.toUpperCase().trim() || undefined


    if (status && !TASK_STATUSES.includes(status as TaskStatus)) {
        throw new AppError(400, 'Status must be one of Open, In Progress or Resolved')
    }

    const tasks = await findAllTasks({ search, status })

    return { tasks }
}


export const updateAdminTaskStatus = async (taskId: string, status: unknown): Promise<Task> => {
    validateTaskId(taskId)

    const normalizedStatus = typeof status === 'string' ? status.trim().toUpperCase() : undefined

    if (!normalizedStatus || !TASK_STATUSES.includes(normalizedStatus as TaskStatus)) {
        throw new AppError(400, `Status must be one of ${TASK_STATUSES.join(', ')}`)
    }

    const task = await updateTaskStatus(taskId, normalizedStatus as TaskStatus)


    if (!task) {
        throw new AppError(404, 'Task Not Found')
    }

    return task;
}


export const deleteTaskWithAdmin = async (taskId: string): Promise<void> => {
    validateTaskId(taskId)

    const deletedTask = await deleteTaskByAdmin(taskId);

    if (!deletedTask) {
        throw new AppError(404, "Task not found.")
    }
}
