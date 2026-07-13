import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/response";

export async function getProfile(req: Request, res: Response) {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            flatNo: true,
            wing: true,
            createdAt: true
        }
    });

    if (!user) {
        return sendError(res, 404, "NOT_FOUND", "User not found");
    }

    return sendSuccess(res, user);
}

export async function updateProfile(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { name, phone, flatNo, wing } = req.body;

    if (!name || name.trim() === "") {
        return sendError(res, 400, "VALIDATION_ERROR", "Name is required");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            name: name.trim(),
            phone: phone?.trim() || null,
            flatNo: flatNo?.trim() || null,
            wing: wing?.trim() || null,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            flatNo: true,
            wing: true,
            createdAt: true
        }
    });

    return sendSuccess(res, updatedUser);
}
