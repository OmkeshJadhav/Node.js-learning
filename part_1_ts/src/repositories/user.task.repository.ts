import { pool } from "../lib/db";
import { Task, TaskRow } from "../types/task";

export const createTask = async(userId: string, title: string): Promise<TaskRow> => {
    const result = await pool.query<TaskRow>(
        `
        INSERT INTO support_tasks (title, user_id)
        VALUES ($1, $2)
        RETURNING id, title, status, user_id, created_at, updated_at
        `,
        [title, userId]
    )

    return result.rows[0];
}

export const fetchTasksByUserId = async(userId: string): Promise<Task[]> => {
    const result = await pool.query<TaskRow>(
        `
        SELECT id, title, status, user_id, created_at, updated_at
        FROM support_tasks
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
    )
    return result.rows
}

export const fetchTaskByTaskId = async(taskId: string, userId: string): Promise<Task | null> => {
    const result = await pool.query<TaskRow>(
        `
        SELECT id, title, status, user_id, created_at, updated_at
        FROM support_tasks
        WHERE  id = $1  AND user_id = $2
        `,
        [taskId, userId]
    )

    return result.rows[0] ?? null
}