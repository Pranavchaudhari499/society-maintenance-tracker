export type Role = "RESIDENT" | "ADMIN";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface ApiError {
    code: string;
    message: string;
}