import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/response";

// Get all notifications for the logged-in user
export async function getNotifications(req: Request, res: Response) {
    const userId = req.user!.userId;

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50, // Limit to 50 most recent notifications
        });

        return sendSuccess(res, notifications);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        return sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch notifications");
    }
}

// Mark a specific notification as read
export async function markAsRead(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user!.userId;

    try {
        const notification = await prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            return sendError(res, 404, "NOT_FOUND", "Notification not found");
        }

        if (notification.userId !== userId) {
            return sendError(res, 403, "FORBIDDEN", "Not authorized");
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        return sendSuccess(res, updated);
    } catch (err) {
        console.error("Error marking notification as read:", err);
        return sendError(res, 500, "INTERNAL_ERROR", "Failed to update notification");
    }
}

// Mark all notifications as read for the logged-in user
export async function markAllAsRead(req: Request, res: Response) {
    const userId = req.user!.userId;

    try {
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });

        return sendSuccess(res, { success: true });
    } catch (err) {
        console.error("Error marking all notifications as read:", err);
        return sendError(res, 500, "INTERNAL_ERROR", "Failed to update notifications");
    }
}
