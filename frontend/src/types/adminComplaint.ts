import type { Complaint } from "./complaint";

export interface AdminComplaint extends Complaint {
    resident: {
        id: string;
        name: string;
        email: string;
    };
}