import { env } from "../config/env";
import { TokenPayload } from "../types/user";
import jwt, {SignOptions} from "jsonwebtoken"

export const signAccessToken = (payload: TokenPayload): string => {
    const options: SignOptions = {
        expiresIn: env.jwtAccessExpiresIn as SignOptions['expiresIn']
    }
    
    return jwt.sign(payload, env.jwtAccessSecret, options)
}