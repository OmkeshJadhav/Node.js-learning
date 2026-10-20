import Redis from 'ioredis'
import {env} from '../config/env'

export const redis = new Redis(env.redisUrl)

// BullMQ's connection options live in src/bullMQ/connection.ts