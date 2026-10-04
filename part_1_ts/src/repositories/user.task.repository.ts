import { pool } from "../lib/db";
import { TaskRow } from "../types/task";

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