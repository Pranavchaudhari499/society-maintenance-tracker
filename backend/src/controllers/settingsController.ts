import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/response";

const OVERDUE_THRESHOLD_KEY = "overdue_threshold_days";
const DEFAULT_THRESHOLD = Number(process.env.DEFAULT_OVERDUE_THRESHOLD_DAYS) || 7;

const updateThresholdSchema = z.object({
    days: z.number().int().min(1).max(365),
});

// Reads the current threshold from the settings table, falling back to the env default
// if no row exists yet (e.g. fresh DB before first admin edit / before seeding).
export async function getOverdueThreshold(_req: Request, res: Response) {
    const setting = await prisma.setting.findUnique({
        where: { key: OVERDUE_THRESHOLD_KEY },
    });

    const days = setting ? Number(setting.value) : DEFAULT_THRESHOLD;
    return sendSuccess(res, { days });
}

export async function updateOverdueThreshold(req: Request, res: Response) {
    const parsed = updateThresholdSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(
            res,
            400,
            "VALIDATION_ERROR",
            parsed.error.issues.map((i) => i.message).join(", ")
        );
    }

    const { days } = parsed.data;

    const setting = await prisma.setting.upsert({
        where: { key: OVERDUE_THRESHOLD_KEY },
        update: { value: String(days) },
        create: { key: OVERDUE_THRESHOLD_KEY, value: String(days) },
    });

    return sendSuccess(res, { days: Number(setting.value) });
}

// Utility used by the complaint controller to fetch the current threshold as a number.
export async function getCurrentOverdueThresholdDays(): Promise<number> {
    const setting = await prisma.setting.findUnique({
        where: { key: OVERDUE_THRESHOLD_KEY },
    });
    return setting ? Number(setting.value) : DEFAULT_THRESHOLD;
}