import { Response } from "express";

export function sendSuccess(res: Response, data: unknown, status = 200) {
    return res.status(status).json({ success: true, data });
}

export function sendError(
    res: Response,
    status: number,
    code: string,
    message: string
) {
    return res.status(status).json({
        success: false,
        error: { code, message },
    });
}