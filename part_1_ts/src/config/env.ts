import dotenv from 'dotenv'

dotenv.config();

export const env = {
    port: Number(process.env.PORT ?? 5001),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
    loggerLevel: process.env.LOGGER_LEVEL ?? 'info'
} as const;