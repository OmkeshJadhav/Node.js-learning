import { Router } from "express";
import { loginUser, loginWithGoogle, registerUser, startGoogleLogin } from "../services/auth.service";
import { authenticate } from "../middlewares/auth.middleware";
import { tryCatch } from "bullmq";

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

authRouter.get("/google", (_req, res) => {
    const googleAuthUrl = startGoogleLogin();

    res.redirect(googleAuthUrl)
})

authRouter.get("/google/callback", async (req, res, next) => {
    try {
        const code = req.query.code as string | undefined;

        const { accessToken } = await loginWithGoogle(code ?? "")

        res.status(200).json({
            success: true,
            data: { accessToken}
        })

    } catch (error) {
        next(error)
    }
})