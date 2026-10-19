import { AppError } from "../errors/AppError"
import { clearAvatarCache, getAvatarsFromCache, setAvatarCache } from "../lib/avatarsCache"
import { logger } from "../lib/logger"
import { clearUserAvatar, findUserAvatar, updateUserAvatar } from "../repositories/file.upload.repository"
import { Avatar } from "../types/avatar"
import { deleteImage, uploadImage } from "./cloudinary.service"

export const uploadUserAvatar = async (userId: string, buffer: Buffer) => {
    const existingUser = await findUserAvatar(userId)

    if (!existingUser) {
        throw new AppError(404, "User not found")
    }

    // 1. Upload the new image first
    const { secure_url, public_id } = await uploadImage(buffer)

    // 2. Save it in the DB - if this fails, remove the new image so it isn't orphaned in Cloudinary
    let updatedUser
    try {
        updatedUser = await updateUserAvatar(userId, secure_url, public_id)
    } catch (error) {
        await deleteImage(public_id).catch((err) =>
            logger.error({ err }, "Failed to clean up new avatar after DB error")
        )
        throw error
    }

    // Invalidate the cache
    await clearAvatarCache(userId)

    // 3. Only now delete the old image - failure here shouldn't fail the request
    if (existingUser.avatar_public_id) {
        await deleteImage(existingUser.avatar_public_id).catch((err) =>
            logger.error({ err }, "Failed to delete old avatar from Cloudinary")
        )
    }

    return {
        imageUrl: updatedUser!.avatar_url,
        publicId: updatedUser!.avatar_public_id,
    }
}

export const getUserAvatar = async (userId: string) => {
    // 1. Try the cache first - skips the DB on a hit
    const cachedAvatar = await getAvatarsFromCache(userId);

    if(cachedAvatar){
        return cachedAvatar
    }
    
    // 2. Cache miss - read from the DB
    const existingUser = await findUserAvatar(userId)

    if (!existingUser) {
        throw new AppError(404, "User not found")
    }

    // No avatar is a normal state (new user / deleted avatar), so return null instead of an error
    if (!existingUser.avatar_url) {
        return null
    }

    const avatar: Avatar = {
        imageUrl: existingUser.avatar_url,
        publicId: existingUser.avatar_public_id,
    }

    await setAvatarCache(userId, avatar)

    return {
        imageUrl: existingUser.avatar_url,
        publicId: existingUser.avatar_public_id,
    }
}

export const removeUserAvatar = async (userId: string): Promise<void> => {
    const existingUser = await findUserAvatar(userId)

    if (!existingUser) {
        throw new AppError(404, "User not found")
    }

    if (!existingUser.avatar_public_id) {
        throw new AppError(404, "No avatar to delete")
    }

    // 1. Clear the DB first - so the user never points to an image that no longer exists
    await clearUserAvatar(userId)

    // Invalidate the cache
    await clearAvatarCache(userId)


    // 2. Then delete from Cloudinary - failure here only leaves an unused image, so just log it
    await deleteImage(existingUser.avatar_public_id).catch((err) =>
        logger.error({ err }, "Failed to delete avatar from Cloudinary")
    )
}
