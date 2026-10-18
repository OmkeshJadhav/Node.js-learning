import { pool } from "../lib/db"
import { DBUserAvatarRow } from "../types/user"


// Needed so we can delete the old image from Cloudinary after replacing it
export const updateUserAvatar = async (
    userId: string,
    avatarUrl: string,
    avatarPublicId: string
): Promise<DBUserAvatarRow | null> => {
    const result = await pool.query<DBUserAvatarRow>(
        `
        UPDATE users
        SET avatar_url = $2,
            avatar_public_id = $3,
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, avatar_url, avatar_public_id
        `,
        [userId, avatarUrl, avatarPublicId]
    )

    return result.rows[0] ?? null
}


export const findUserAvatar = async (userId: string): Promise<DBUserAvatarRow | null> => {
    const result = await pool.query<DBUserAvatarRow>(
        `
        SELECT id, avatar_url, avatar_public_id
        FROM users
        WHERE id = $1
        `,
        [userId]
    )

    return result.rows[0] ?? null
}