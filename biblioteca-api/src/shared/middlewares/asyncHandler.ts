import { Request, Response, NextFunction, RequestHandler } from "express";

/**
/**
 * Wraps an async controller so rejected promises are forwarded to next()
 * and handled by errorHandler while preserving the handler's request types.
 */
export const asyncHandler =
    <P = Record<string, string>, ResBody = unknown, ReqBody = unknown>(
        fn: (
            req: Request<P, ResBody, ReqBody>,
            res: Response<ResBody>,
            next: NextFunction
        ) => Promise<unknown>
    ): RequestHandler<P, ResBody, ReqBody> =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
