import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { env } from "../../config/env";

/**
/** Handles requests that do not match any route. */
export const notFound = (req: Request, res: Response): void => {
    res.status(404).json({
        status: "error",
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

/**
/** Centralized error middleware. Register it after all routes. */
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message =
        err instanceof AppError || env.nodeEnv !== "production"
            ? err.message
            : "Internal server error";

    if (statusCode >= 500) {
        console.error(err);
    }

    res.status(statusCode).json({
        status: "error",
        message,
        ...(env.nodeEnv !== "production" && statusCode >= 500 ? { stack: err.stack } : {}),
    });
};
