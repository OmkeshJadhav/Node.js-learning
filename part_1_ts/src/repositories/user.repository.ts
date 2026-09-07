import { pool } from "../lib/db";
import { DBUserRow, user } from "../types/user";

export const findUserByEmail = async (email: string): Promise<user | null> => {
    const result = await pool.query<DBUserRow>(
        "SELECT id, email, role, created_at FROM users WHERE email = $1",
        [email]
    )

    return result.rows[0] ?? null

}