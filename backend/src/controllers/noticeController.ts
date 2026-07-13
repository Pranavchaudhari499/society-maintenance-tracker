import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { createNoticeSchema, updateNoticeSchema } from "../utils/noticeSchemas";
import { sendSuccess, sendError } from "../utils/response";
import { sendEmail } from "../utils/sendEmail";
import { importantNoticeTemplate } from "../utils/emailTemplates";
import { broadcast } from "./streamController";

// Any authenticated user (resident or admin) can view the notice board.
// Important notices are pinned to the top; within each group, newest first.
export async function getNotices(_req: Request, res: Response) {
    const notices = await prisma.notice.findMany({
        include: {
            poster: { select: { id: true, name: true } },
        },
        orderBy: [{ isImportant: "desc" }, { createdAt: "desc" }],
    });

    return sendSuccess(res, notices);
}

// Admin only: create a notice.
export async function createNotice(req: Request, res: Response) {
    const parsed = createNoticeSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(
            res,
            400,
            "VALIDATION_ERROR",
            parsed.error.issues.map((i) => i.message).join(", ")
        );
    }

    const { title, body, isImportant } = parsed.data;
    const adminId = req.user!.userId;

    const notice = await prisma.notice.create({
        data: { title, body, isImportant, postedBy: adminId },
        include: { poster: { select: { id: true, name: true } } },
    });

    if (isImportant) {
        // Fire-and-forget: email all residents
        prisma.user
            .findMany({
                where: { role: "RESIDENT" },
                select: { name: true, email: true },
            })
            .then((residents) => {
                for (const resident of residents) {
                    sendEmail({
                        to: resident.email,
                        subject: `Important Notice: ${title}`,
                        html: importantNoticeTemplate({
                            residentName: resident.name,
                            title,
                            body,
                        }),
                    }).catch((err) =>
                        console.error(`[email] notice email error for ${resident.email}:`, err)
                    );
                }
            })
            .catch((err) =>
                console.error("[email] failed to fetch residents for notice notification", err)
            );
    }

    broadcast("NEW_NOTICE", {
        id: notice.id,
        title: notice.title,
        isImportant: notice.isImportant
    });

    return sendSuccess(res, notice, 201);
}

// Admin only: edit a notice.
export async function updateNotice(req: Request, res: Response) {
    const { id } = req.params;

    const parsed = updateNoticeSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(
            res,
            400,
            "VALIDATION_ERROR",
            parsed.error.issues.map((i) => i.message).join(", ")
        );
    }

    const existing = await prisma.notice.findUnique({ where: { id } });
    if (!existing) {
        return sendError(res, 404, "NOT_FOUND", "Notice not found");
    }

    const notice = await prisma.notice.update({
        where: { id },
        data: parsed.data,
        include: { poster: { select: { id: true, name: true } } },
    });

    return sendSuccess(res, notice);
}

// Admin only: delete a notice.
export async function deleteNotice(req: Request, res: Response) {
    const { id } = req.params;

    const existing = await prisma.notice.findUnique({ where: { id } });
    if (!existing) {
        return sendError(res, 404, "NOT_FOUND", "Notice not found");
    }

    await prisma.notice.delete({ where: { id } });

    return sendSuccess(res, { id });
}