import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import {
    updateStatusSchema,
    updatePrioritySchema,
    complaintFilterSchema,
} from "../utils/adminComplaintSchemas";
import { sendSuccess, sendError } from "../utils/response";
import { getCurrentOverdueThresholdDays } from "./settingsController";
import { sendEmail } from "../utils/sendEmail";
import { statusChangeTemplate } from "../utils/emailTemplates";
import { notifyUser } from "./streamController";

// Admin: list all complaints with optional filters (category, status, date range).
// Overdue complaints (unresolved + past the configurable threshold) are computed
// dynamically per request and sorted to the top, rather than stored as a flag,
// so the result is never stale even if the threshold changes.
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

    // Fire-and-forget: email failure must never block the status update itself.
    sendEmail({
        to: updated.resident.email,
        subject: `Complaint Update: ${updated.status.replace("_", " ")}`,
        html: statusChangeTemplate({
            residentName: updated.resident.name,
            category: updated.category,
            description: updated.description,
            newStatus: updated.status,
            note,
        }),
    }).catch((err) => console.error("[email] status change notification error:", err));

    // Notify the user in real-time
    notifyUser(updated.residentId, "STATUS_UPDATE", {
        id: updated.id,
        status: updated.status,
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

// Admin: Export complaints to CSV based on filters
export async function exportComplaints(req: Request, res: Response) {
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

    const complaints = await prisma.complaint.findMany({
        where,
        include: {
            resident: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const headers = ["ID", "Category", "Priority", "Status", "Description", "Resident Name", "Resident Email", "Created At"];
    const rows = complaints.map(c => {
        // Escape quotes and wrap in quotes for safe CSV parsing
        const description = `"${c.description.replace(/"/g, '""')}"`;
        const name = `"${c.resident.name.replace(/"/g, '""')}"`;
        return [
            c.id,
            c.category,
            c.priority,
            c.status,
            description,
            name,
            c.resident.email,
            new Date(c.createdAt).toISOString()
        ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="complaints_export.csv"');
    return res.status(200).send(csvContent);
}