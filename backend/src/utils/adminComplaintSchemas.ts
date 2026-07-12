import { z } from "zod";

export const updateStatusSchema = z.object({
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
    note: z.string().trim().max(500).optional(),
});

export const updatePrioritySchema = z.object({
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export const complaintFilterSchema = z.object({
    category: z
        .enum(["ELECTRICAL", "PLUMBING", "CLEANING", "SECURITY", "PARKING", "STRUCTURAL", "OTHER"])
        .optional(),
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "from must be YYYY-MM-DD").optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "to must be YYYY-MM-DD").optional(),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type UpdatePriorityInput = z.infer<typeof updatePrioritySchema>;