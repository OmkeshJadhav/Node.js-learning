import { Router } from "express";
import { loginUser, registerUser } from "../services/auth.service";
import { authenticate } from "../middlewares/auth.middleware";

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

authRouter.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const { accessToken } = await loginUser(email, password)

        res.status(200).json({
            success: true,
            message: "Login successful!",
            data: { accessToken }
        })

    } catch (error) {
        next(error)
    }
})

authRouter.get("/me", authenticate, async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                user: req.user
            }
        })
    } catch (error) {
        next(error)
    }
})