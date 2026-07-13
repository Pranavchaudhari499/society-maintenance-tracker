import type { Complaint } from "./complaint";

export interface AdminComplaint extends Complaint {
    isOverdue: boolean;
    resident: {
        id: string;
        name: string;
        email: string;
    };
}