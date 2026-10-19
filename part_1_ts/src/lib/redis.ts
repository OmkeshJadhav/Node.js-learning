import Redis from 'ioredis'
import {env} from '../config/env'

export const redis = new Redis(env.redisUrl)

// BullMQ will need it's own connection object request option

const redisUrl = new URL(env.redisUrl)

export const bullmqConnection = {
    host: redisUrl.hostname,
    port: Number(redisUrl.port),
    maxRetriesPerRequest: null
}