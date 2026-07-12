export type ComplaintCategory =
    | "ELECTRICAL"
    | "PLUMBING"
    | "CLEANING"
    | "SECURITY"
    | "PARKING"
    | "STRUCTURAL"
    | "OTHER";

export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface ComplaintHistoryEntry {
    id: string;
    complaintId: string;
    oldStatus: ComplaintStatus | null;
    newStatus: ComplaintStatus;
    changedBy: string;
    note: string | null;
    createdAt: string;
}

export interface ComplaintMedia {
    id: string;
    complaintId: string;
    url: string;
    type: string;
    uploadedAt: string;
}

export interface Complaint {
    id: string;
    residentId: string;
    category: ComplaintCategory;
    description: string;
    status: ComplaintStatus;
    priority: Priority;
    createdAt: string;
    updatedAt: string;
    history: ComplaintHistoryEntry[];
    media: ComplaintMedia[];
}

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
    ELECTRICAL: "Electrical",
    PLUMBING: "Plumbing",
    CLEANING: "Cleaning",
    SECURITY: "Security",
    PARKING: "Parking",
    STRUCTURAL: "Structural",
    OTHER: "Other",
};

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
};