import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { CATEGORY_LABELS } from "../types/complaint";
import type { ComplaintCategory } from "../types/complaint";

export default function RaiseComplaint() {
    const [category, setCategory] = useState<ComplaintCategory>("ELECTRICAL");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/complaints", { category, description });
            navigate("/resident");
        } catch (err: any) {
            setError(
                err.response?.data?.error?.message || "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-lg mx-auto">
                <button
                    onClick={() => navigate("/resident")}
                    className="text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    ← Back
                </button>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h1 className="text-xl font-semibold text-gray-900 mb-1">Raise a Complaint</h1>
                    <p className="text-sm text-gray-500 mb-6">
                        Describe the issue and we'll route it to the admin.
                    </p>

                    {error && (
                        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                required
                                minLength={10}
                                rows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Describe the issue in detail (at least 10 characters)..."
                            />
                        </div>

                        <p className="text-xs text-gray-400">
                            Photo upload will be available in a future update.
                        </p>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                        >
                            {loading ? "Submitting..." : "Submit Complaint"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}