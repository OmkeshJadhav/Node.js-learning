import { pool } from "../lib/db";
import { DBUserRow, DBUserRowWithPassword, user } from "../types/user";

export const findUserByEmail = async (email: string): Promise<user | null> => {
    const result = await pool.query<DBUserRow>(
        `
        SELECT id, email, role, created_at 
        FROM users 
        WHERE email = $1
        `,
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

export const findUserByEmailWithPassword = async(email: string): Promise<DBUserRowWithPassword | null> => {
    const result = await pool.query<DBUserRowWithPassword>(
        `
        SELECT id, email, role, password_hash, created_at
        FROM users 
        WHERE email = $1
        `,
        [email]
    )

    return result.rows[0] ?? null;
}

export const findUserByGoogleId = async(googleId: string): Promise< user | null> => {
    const result = await pool.query<DBUserRow>(
        `
        SELECT id, email, role, created_at
        FROM users
        WHERE google_id = $1
        `,
        [googleId]
    )

    return result.rows[0] ?? null;
}

export const linkGoogleIdUser = async (userId: string, googleId: string): Promise<user> => {
    const result = await pool.query<DBUserRow>(
        `
        UPDATE users
        SET google_id = $1, 
            updated_at = NOW()
        WHERE id = $2
        RETURNING id, email, role, created_at     
        `,
        [googleId, userId]
    );

    return result.rows[0] ?? null;
}

export const createGoogleUser = async (email: string, googleId: string): Promise<user> => {
    const result = await pool.query<DBUserRow>(
        `
        INSERT INTO users(email, google_id)
        VALUES ($1, $2)
        RETURNING id, email, role, created_at
        `,
        [email, googleId]
    )

    return result.rows[0]

}