import { redis } from "./redis";
import type { Avatar } from "../types/avatar";

const AVATARS_CACHE_KEY = (userId: string) => `avatar:${userId}`;

const AVATARS_CACHE_TTL_SECONDS = 60;

export const getAvatarsFromCache = async (userId: string): Promise<Avatar | null> => {
    const cacheData = await redis.get(AVATARS_CACHE_KEY(userId))

    if (!cacheData) {
        return null
    }

    return JSON.parse(cacheData) as Avatar;
}


export const setAvatarCache = async (userId: string, avatar: Avatar): Promise<void> => {
    await redis.set(
        AVATARS_CACHE_KEY(userId),
        JSON.stringify(avatar),
        "EX",
        AVATARS_CACHE_TTL_SECONDS
    )

}

export const clearAvatarCache = async (userId: string): Promise<void> => {
    await redis.del(AVATARS_CACHE_KEY(userId))
}
