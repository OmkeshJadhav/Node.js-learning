import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    logger.error({err}, 'Unhandled Error');

    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
}