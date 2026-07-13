import { z } from "zod";

export const createNoticeSchema = z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
    body: z.string().trim().min(5, "Body must be at least 5 characters").max(3000),
    isImportant: z.boolean().default(false),
});

export const updateNoticeSchema = z.object({
    title: z.string().trim().min(3).max(150).optional(),
    body: z.string().trim().min(5).max(3000).optional(),
    isImportant: z.boolean().optional(),
});

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;
export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;