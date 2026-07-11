import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/auth";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, token } = useAuth();

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={user.role === "ADMIN" ? "/admin" : "/resident"} replace />;
    }

    return <>{children}</>;
}