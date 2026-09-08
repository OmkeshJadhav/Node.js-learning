import { Router } from "express";
import { registerUser } from "../services/auth.service";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
    try {
        const { email, password } = req.body
        
        // Do not write servive logic here - Service logic is in service file
        await registerUser(email, password)

        res.status(201).json({
            success: true,
            message: "Registration successful. Please logion to continue."
        })
    } catch (error) {
        next(error)
    }
})