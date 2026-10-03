import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";
import { AppError } from "../errors/AppError";

// Network-level codes thrown by pg when the database can't be reached
// (AggregateError from pg-pool also carries the code at the top level)
const DB_CONNECTION_ERROR_CODES = new Set([
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EHOSTUNREACH',
    '57P01', // admin_shutdown
    '57P03', // cannot_connect_now
]);

const isDbConnectionError = (err: Error): boolean => {
    const code = (err as { code?: unknown }).code;
    return typeof code === 'string' && DB_CONNECTION_ERROR_CODES.has(code);
};

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {

    if(err instanceof AppError){
        res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
        return
    }

    if(isDbConnectionError(err)){
        logger.error({err}, 'Database connection error');
        res.status(503).json({
            success: false,
            message: 'Service temporarily unavailable. Please try again later.'
        });
        return
    }

    logger.error({err}, 'Unhandled Error');

    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
}