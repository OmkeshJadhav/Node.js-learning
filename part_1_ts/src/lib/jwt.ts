import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { TokenPayload } from "../types/user";
import jwt, {SignOptions} from "jsonwebtoken"

export const signAccessToken = (payload: TokenPayload): string => {
    const options: SignOptions = {
        expiresIn: env.jwtAccessExpiresIn as SignOptions['expiresIn']
    }
    
    return jwt.sign(payload, env.jwtAccessSecret, options)
}

export const verifyAccessToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, env.jwtAccessSecret) as TokenPayload
    } catch (error) {
        throw new AppError(401, "Invalid or expired access token.")
    }
}