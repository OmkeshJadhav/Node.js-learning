import { AppError } from "../errors/AppError"
import { findUserByEmail } from "../repositories/user.repository"

export const registerUser = async (email: string, password: string): Promise<void> => {
    if (!email || !password) {
        throw new AppError(400, "Email and password are required!")
    }

    // Best practice: Create constant folder and maintain constant values like password length inside it 
    if (password.length < 6) {
        throw new AppError(400, "Password must be at least 6 characters.")
    }

    const normalizeEmail = email.toLowerCase().trim()

    // Find the user if it's already present in the DB - If present then do not allow to register with same email

    const existingUser = await findUserByEmail(normalizeEmail)

    if (existingUser) {
        throw new AppError(409, "Email already exists.")
    }
}