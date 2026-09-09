import { pool } from "../lib/db";
import { DBUserRow, DBUserRowWithPassword, user } from "../types/user";

export const findUserByEmail = async (email: string): Promise<user | null> => {
    const result = await pool.query<DBUserRow>(
        "SELECT id, email, role, created_at FROM users WHERE email = $1",
        [email]
    )

    return result.rows[0] ?? null
}

export const createUser = async (email: string, password_hash: string): Promise<user> => {
    const result = await pool.query<DBUserRowWithPassword>(
        `INSERT INTO users (email, password_hash)
            VALUES($1, $2)
            RETURNING id, email, password_hash, role, created_at
        `,
        [email, password_hash]
    )

    return result.rows[0];
}