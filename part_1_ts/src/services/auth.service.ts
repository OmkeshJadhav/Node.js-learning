import { min_password_length, salt_round } from "../constants/auth.constants"
import { AppError } from "../errors/AppError"
import { getGoogleUserFromAuthCode, googleAuthUrl } from "../lib/google"
import { signAccessToken } from "../lib/jwt"
import { createGoogleUser, createUser, findUserByEmail, findUserByEmailWithPassword, findUserByGoogleId, linkGoogleIdUser } from "../repositories/user.repository"
import bcrypt from "bcrypt"
import { user } from "../types/user"

export const registerUser = async (email: string, password: string): Promise<void> => {
    if (!email || !password) {
        throw new AppError(400, "Email and password are required!")
    }

    // Best practice: Create constant folder and maintain constant values like password length inside it 
    if (password.length < min_password_length) {
        throw new AppError(400, "Password must be at least 6 characters.")
    }

    const normalizeEmail = email.toLowerCase().trim()

    // Find the user if it's already present in the DB - If present then do not allow to register with same email
    const existingUser = await findUserByEmail(normalizeEmail)

    if (existingUser) {
        throw new AppError(409, "Email already exists.")
    }

    const password_hash = await bcrypt.hash(password, salt_round)

    await createUser(normalizeEmail, password_hash)
}

export const loginUser = async (email: string, password: string): Promise<{ accessToken: string }> => {
    if (!email || !password) {
        throw new AppError(400, "Email and password are required!")
    }

    const normalizeEmail = email.toLowerCase().trim();

    // Find the user with email & password
    const user = await findUserByEmailWithPassword(normalizeEmail)

    if (!user?.password_hash) {
        throw new AppError(401, "Invalid email or password.")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
        throw new AppError(401, "Invalid email or password.")
    }

    const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
    })

    return { accessToken }
}

export const startGoogleLogin = (): string => {
    return googleAuthUrl()
}

const createAccessTokenForUser = (user: user): string => {
    return signAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
    })
}

export const loginWithGoogle = async (code: string): Promise<{ accessToken: string }> => {
    const googleProfile = await getGoogleUserFromAuthCode(code)

    let user = await findUserByGoogleId(googleProfile.googleId)

    if (!user) {
        user = await findUserByEmail(googleProfile.email)

        if (user) {
            // Link the google account with the existing user

            user = await linkGoogleIdUser(user.id, googleProfile.googleId)
        } else {
            // First time login - Create the user in postgres
            user = await createGoogleUser(googleProfile.email, googleProfile.googleId)
        }
    }

    const accessToken = createAccessTokenForUser(user)

    return { accessToken }
}