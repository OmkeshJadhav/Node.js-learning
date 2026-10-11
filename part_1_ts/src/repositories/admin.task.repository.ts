import { pool } from "../lib/db";
import { AdminTaskListFilters } from "../types/admin";
import { Task, TaskRow } from "../types/task";

export const findAllTasks = async (filters: AdminTaskListFilters): Promise<Task[]> => {
    const conditions: string[] = []

    const values: unknown[] = []

    let paramIndex = 1;

    if(filters.search){
        conditions.push(`title ILIKE $${paramIndex}`)
        // Escape \, % and _ so they are matched literally instead of acting as ILIKE wildcards
        const escapedSearch = filters.search.replace(/[\\%_]/g, "\\$&")
        values.push(`%${escapedSearch}%`)
        paramIndex++
    }
    if(filters.status){
        conditions.push(`status = $${paramIndex}`)
        values.push(filters.status)
        paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    const result = await pool.query<TaskRow>(
        `
        SELECT id, title, status, user_id, created_at, updated_at
        FROM support_tasks
        ${whereClause} 
        ORDER BY created_at DESC
        `,
        values
    )
    return result.rows;
}

export const updateTaskStatus = async (taskId: string, status: string): Promise<Task | null> => {
    const result = await pool.query<TaskRow>(
        `
        UPDATE support_tasks
        SET status = $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING id, title, status, user_id, created_at, updated_at
        `,
        [status, taskId]
    )

    return result.rows[0] ?? null;
}