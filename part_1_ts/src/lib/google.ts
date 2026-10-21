import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";
import { GoogleUserProfile } from "../types/googleAuth";
import { AppError } from "../errors/AppError";

const googleOauthClient = new OAuth2Client(
    env.googleClientId,
    env.googleClientSecret,
    env.googleCallbackUrl
)

export const googleAuthUrl = () => {
    return googleOauthClient.generateAuthUrl({
        scope: ["openid", "email", "profile"],  // Information required
        access_type: "online",  // Needed for re-fresh token
        prompt: "select_account"  // enforce user to select email account
    })
}

export const getGoogleUserFromAuthCode = async (code: string): Promise<GoogleUserProfile> => {
    if (!code) {
        throw new AppError(400, "Google auth code is required.")
    }

    const { tokens } = await googleOauthClient.getToken(code)

    if(!tokens.id_token){
        throw new AppError(401, "Google login failed, id_token is missing!")
    }

    const userInfo = await googleOauthClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.googleClientId
    })

    const payload = userInfo.getPayload()

    if(!payload?.sub || !payload.email){
        throw new AppError(400, "Google login failed: Invalid user profile")
    }

    return {
        googleId: payload.sub,
        email: payload.email.toLowerCase().trim()
    };
}