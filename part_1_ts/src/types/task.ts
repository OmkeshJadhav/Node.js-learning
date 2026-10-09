export type Task = {
    id: string,
    title: string,
    status: string,
    user_id: string,
    created_at: string,
    updated_at: string
}

export type TaskRow = Task;

export const TASK_STATUSES = ["OPEN", "IN PROGRESS", "RESOLVED"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number]
