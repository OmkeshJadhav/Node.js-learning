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

// Option A - COALESCE: fields not sent are passed as null, and COALESCE($n, column) keeps the current value
export const updateTaskByPatch = async (taskId: string, userId: string, title?: string, status?: string): Promise<Task | null> => {
    const result = await pool.query<TaskRow>(
        `
        UPDATE support_tasks
        SET title = COALESCE($1, title),
            status = COALESCE($2, status),
            updated_at = NOW()
        WHERE id = $3 AND user_id = $4
        RETURNING id, title, status, user_id, created_at, updated_at
        `,
        [title ?? null, status ?? null, taskId, userId]
    )

    return result.rows[0] ?? null
}

// Option B - Dynamic SET clause: only the fields that were sent are added to the SET clause
// Column names are hardcoded here (never taken from req.body keys) - so no SQL injection through column names
//
// export const updateTaskByPatch = async (taskId: string, userId: string, title?: string, status?: string): Promise<Task | null> => {
//     const fields: string[] = []
//     const values: unknown[] = []
//
//     if (title !== undefined) {
//         values.push(title)
//         fields.push(`title = $${values.length}`)
//     }
//
//     if (status !== undefined) {
//         values.push(status)
//         fields.push(`status = $${values.length}`)
//     }
//
//     values.push(taskId, userId)
//
//     const result = await pool.query<TaskRow>(
//         `
//         UPDATE support_tasks
//         SET ${fields.join(', ')}, updated_at = NOW()
//         WHERE id = $${values.length - 1} AND user_id = $${values.length}
//         RETURNING id, title, status, user_id, created_at, updated_at
//         `,
//         values
//     )
//
//     return result.rows[0] ?? null
// }
