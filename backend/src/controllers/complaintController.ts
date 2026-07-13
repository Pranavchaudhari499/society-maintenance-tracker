import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { createComplaintSchema } from "../utils/complaintSchemas";
import { sendSuccess, sendError } from "../utils/response";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload";

// Resident creates a new complaint. Auto-creates the first history entry (null -> OPEN).
export async function createComplaint(req: Request, res: Response) {
    const parsed = createComplaintSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(
            res,
            400,
            "VALIDATION_ERROR",
            parsed.error.issues.map((i) => i.message).join(", ")
        );
    }

    const { category, description } = parsed.data;
    const residentId = req.user!.userId;
    const files = (req.files as Express.Multer.File[]) || [];

    let uploadedUrls: string[] = [];
    if (files.length > 0) {
        try {
            uploadedUrls = await Promise.all(
                files.map((file) => uploadBufferToCloudinary(file.buffer))
            );
        } catch (err) {
            return sendError(
                res,
                502,
                "UPLOAD_FAILED",
                "Failed to upload one or more photos. Please try again."
            );
        }
    }

    const complaint = await prisma.complaint.create({
        data: {
            residentId,
            category,
            description,
            status: "OPEN",
            history: {
                create: {
                    oldStatus: null,
                    newStatus: "OPEN",
                    changedBy: residentId,
                    note: "Complaint raised",
                },
            },
            media: {
                create: uploadedUrls.map((url) => ({ url, type: "image" })),
            },
        },
        include: {
            history: { orderBy: { createdAt: "asc" } },
            media: true,
        },
    });

    return sendSuccess(res, complaint, 201);
}

// Resident views their own complaints with full history.
export async function getMyComplaints(req: Request, res: Response) {
    const residentId = req.user!.userId;

    const complaints = await prisma.complaint.findMany({
        where: { residentId },
        include: {
            history: { orderBy: { createdAt: "asc" } },
            media: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, complaints);
}

// Resident views a single complaint of their own (detail view).
export async function getMyComplaintById(req: Request, res: Response) {
    const residentId = req.user!.userId;
    const { id } = req.params;

    const complaint = await prisma.complaint.findFirst({
        where: { id, residentId },
        include: {
            history: { orderBy: { createdAt: "asc" } },
            media: true,
        },
    });

    if (!complaint) {
        return sendError(res, 404, "NOT_FOUND", "Complaint not found");
    }

    return sendSuccess(res, complaint);
}