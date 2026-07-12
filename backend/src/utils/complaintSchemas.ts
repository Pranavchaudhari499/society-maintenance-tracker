import { z } from "zod";

export const ComplaintCategory = z.enum([
    "ELECTRICAL",
    "PLUMBING",
    "CLEANING",
    "SECURITY",
    "PARKING",
    "STRUCTURAL",
    "OTHER",
]);

export const createComplaintSchema = z.object({
    category: ComplaintCategory,
    description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters")
        .max(2000, "Description cannot exceed 2000 characters"),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;