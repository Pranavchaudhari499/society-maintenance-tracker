import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthPayload {
    userId: string;
    role: "RESIDENT" | "ADMIN";
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return sendError(res, 401, "NO_TOKEN", "Authentication token missing");
    }

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
        req.user = decoded;
        next();
    } catch (err) {
        return sendError(res, 401, "INVALID_TOKEN", "Invalid or expired token");
    }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.user?.role !== "ADMIN") {
        return sendError(res, 403, "FORBIDDEN", "Admin access required");
    }
    next();
}