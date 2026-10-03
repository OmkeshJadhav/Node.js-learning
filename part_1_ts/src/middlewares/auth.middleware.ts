import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { verifyAccessToken } from "../lib/jwt";

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization

    if(!authHeader?.startsWith("Bearer ")){
        next(new AppError(401, "Access Token is required"))
        return;
    }

    const token = authHeader.split(" ")[1]

    req.user = verifyAccessToken(token)  // need to append user type to Request object + Create verifyAccessToken in jwt.ts

    next()

}