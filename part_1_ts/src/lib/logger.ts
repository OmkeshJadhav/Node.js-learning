import pino from 'pino'
import { env } from '../config/env'

export const logger = pino({
    level: env.loggerLevel,  // prefer to add level from .env
    transport: env.isProduction ? undefined : {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard'
        }
    }
})