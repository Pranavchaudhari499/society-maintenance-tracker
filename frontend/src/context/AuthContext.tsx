import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/auth";

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem("token")
    );

    function login(newUser: User, newToken: string) {
        localStorage.setItem("user", JSON.stringify(newUser));
        localStorage.setItem("token", newToken);
        setUser(newUser);
        setToken(newToken);
    }

    function logout() {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}