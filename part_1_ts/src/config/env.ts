import dotenv from 'dotenv'

dotenv.config();

const checkRequiredEnvVariables = (key: string):string => {
    const value = process.env[key]

    if(!value){
        throw new Error(`Missing env variable for ${key}`)
    }

    return value
}

export const env = {
    port: Number(process.env.PORT ?? 5001),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
    loggerLevel: process.env.LOGGER_LEVEL ?? 'info',
    databaseUrl: checkRequiredEnvVariables('DATABASE_URL'),
    jwtAccessSecret: checkRequiredEnvVariables('JWT_SECRET'),
    jwtAccessExpiresIn: checkRequiredEnvVariables('JWT_ACCESS_EXPIRES_IN')
} as const;