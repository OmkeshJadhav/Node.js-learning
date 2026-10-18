export type user = {
    id: string,
    email: string,
    role: string,
    created_at: Date
}

export type DBUserRow = {
    id: string,
    email: string,
    role: string,
    created_at: Date
}

export type DBUserRowWithPassword = DBUserRow & {
    password_hash: string | null;
} 

export type TokenPayload = {
    userId: string,
    email: string,
    role: string
}

export type DBUserAvatarRow = {
    id: string,
    avatar_url: string | null,
    avatar_public_id: string | null
}