import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { AuthResponse, Role } from "../types/auth";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<Role>("RESIDENT");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post<{ success: boolean; data: AuthResponse }>(
                "/auth/register",
                { name, email, password, role }
            );
            const { user, token } = res.data.data;
            login(user, token);
            navigate(user.role === "ADMIN" ? "/admin" : "/resident");
        } catch (err: any) {
            setError(
                err.response?.data?.error?.message || "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create account</h1>
                <p className="text-sm text-gray-500 mb-6">Register to get started</p>

                {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Jane Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="At least 6 characters"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as Role)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="RESIDENT">Resident</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-gray-500 text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}