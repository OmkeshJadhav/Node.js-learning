import { AppError } from "../errors/AppError";
import { findAllTasks } from "../repositories/admin.task.repository";
import { AdminTaskListQuery, AdminTaskListResponse } from "../types/admin";
import { TASK_STATUSES, TaskStatus } from "../types/task";


export const getAdminTasks = async (query: AdminTaskListQuery): Promise<AdminTaskListResponse> => {
    const search = query.search?.trim() || undefined
    const status = query.status?.toUpperCase().trim() || undefined


    if (status && !TASK_STATUSES.includes(status as TaskStatus)) {
        throw new AppError(400, 'Status must be one of Open, In Progress or Resolved')
    }

    const tasks = await findAllTasks({ search, status })

    return { tasks }
}


