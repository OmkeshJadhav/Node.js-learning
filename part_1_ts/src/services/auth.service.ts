import { min_password_length, salt_round } from "../constants/auth.constants"
import { AppError } from "../errors/AppError"
import { createUser, findUserByEmail } from "../repositories/user.repository"
import bcrypt from "bcrypt"

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

    await createUser(email, password_hash)
}

export const loginUser = async (email: string, password: string) => {
    if (!email || !password) {
        throw new AppError(400, "Email and password are required!")
    }

    const normalizeEmail = email.toLowerCase().trim();

    // Find the user if it's already present in the DB - If present then do not allow to register with same email
    const existingUser = await findUserByEmail(normalizeEmail)

    if(!existingUser){
        throw new AppError(404, "Email or password are incorrect")
    }

    return "Hello"
}