import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import {
    updateStatusSchema,
    updatePrioritySchema,
    complaintFilterSchema,
} from "../utils/adminComplaintSchemas";
import { sendSuccess, sendError } from "../utils/response";
import { getCurrentOverdueThresholdDays } from "./settingsController";

// Admin: list all complaints with optional filters (category, status, date range).
export async function getAllComplaints(req: Request, res: Response) {
    const parsed = complaintFilterSchema.safeParse(req.query);
    if (!parsed.success) {
        return sendError(
            res,
            400,
            "VALIDATION_ERROR",
            parsed.error.issues.map((i) => i.message).join(", ")
        );
    }

    const { category, status, from, to } = parsed.data;

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(`${from}T00:00:00.000Z`);
        if (to) where.createdAt.lte = new Date(`${to}T23:59:59.999Z`);
    }

    const [complaints, thresholdDays] = await Promise.all([
        prisma.complaint.findMany({
            where,
            include: {
                resident: { select: { id: true, name: true, email: true } },
                history: { orderBy: { createdAt: "asc" } },
                media: true,
            },
            orderBy: { createdAt: "desc" },
        }),
        getCurrentOverdueThresholdDays(),
    ]);

    const now = Date.now();
    const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;

    const withOverdue = complaints.map((c) => {
        const isOverdue =
            (c.status === "OPEN" || c.status === "IN_PROGRESS") &&
            now - new Date(c.createdAt).getTime() > thresholdMs;
        return { ...c, isOverdue };
    });

    // Overdue complaints surface first; within each group, keep the existing createdAt desc order.
    withOverdue.sort((a, b) => {
        if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
        return 0;
    });

    return sendSuccess(res, withOverdue);
}   

// Admin: update complaint status. Blocked once complaint is RESOLVED.
export async function updateComplaintStatus(req: Request, res: Response) {
    const { id } = req.params;
    const adminId = req.user!.userId;

    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(
            res,
            400,
            "VALIDATION_ERROR",
            parsed.error.issues.map((i) => i.message).join(", ")
        );
    }

    const { status: newStatus, note } = parsed.data;

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
        return sendError(res, 404, "NOT_FOUND", "Complaint not found");
    }

    if (complaint.status === "RESOLVED") {
        return sendError(
            res,
            400,
            "COMPLAINT_RESOLVED",
            "This complaint is resolved and closed. No further updates are allowed."
        );
    }

    const oldStatus = complaint.status;

    const updated = await prisma.complaint.update({
        where: { id },
        data: {
            status: newStatus,
            history: {
                create: {
                    oldStatus,
                    newStatus,
                    changedBy: adminId,
                    note: note || null,
                },
            },
        },
        include: {
            resident: { select: { id: true, name: true, email: true } },
            history: { orderBy: { createdAt: "asc" } },
            media: true,
        },
    });

    return sendSuccess(res, updated);
}

// Admin: update complaint priority. Blocked once complaint is RESOLVED.
export async function updateComplaintPriority(req: Request, res: Response) {
    const { id } = req.params;

    const parsed = updatePrioritySchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(
            res,
            400,
            "VALIDATION_ERROR",
            parsed.error.issues.map((i) => i.message).join(", ")
        );
    }

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
        return sendError(res, 404, "NOT_FOUND", "Complaint not found");
    }

    if (complaint.status === "RESOLVED") {
        return sendError(
            res,
            400,
            "COMPLAINT_RESOLVED",
            "This complaint is resolved and closed. No further updates are allowed."
        );
    }

    const updated = await prisma.complaint.update({
        where: { id },
        data: { priority: parsed.data.priority },
        include: {
            resident: { select: { id: true, name: true, email: true } },
            history: { orderBy: { createdAt: "asc" } },
            media: true,
        },
    });

    return sendSuccess(res, updated);
}