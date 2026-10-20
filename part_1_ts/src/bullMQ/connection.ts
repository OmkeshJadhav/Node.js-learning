import {env} from '../config/env'

const redisUrl = new URL(env.redisUrl)

export const bullmqConnection = {
    host: redisUrl.hostname,
    port: Number(redisUrl.port) || 6379,  // URL without a port gives "" -> fall back to the default Redis port
    maxRetriesPerRequest: null,
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined
}

export const DELETE_CLOUDINARY_IMAGE_QUEUE = 'delete_cloudinary_image'
