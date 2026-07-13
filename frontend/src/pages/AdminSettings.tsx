import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api/client";
import Navbar from "../components/Navbar";

const NAV_LINKS = [
    { label: "Complaints", to: "/admin" },
    { label: "Settings", to: "/admin/settings" },
];

export default function AdminSettings() {
    const [days, setDays] = useState<number>(7);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadThreshold();
    }, []);

    async function loadThreshold() {
        setLoading(true);
        try {
            const res = await api.get("/admin/settings/overdue-threshold");
            setDays(res.data.data.days);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || "Failed to load settings");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);
        try {
            await api.patch("/admin/settings/overdue-threshold", { days });
            setSuccess("Threshold updated successfully");
        } catch (err: any) {
            setError(err.response?.data?.error?.message || "Failed to update settings");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar links={NAV_LINKS} />

            <div className="max-w-lg mx-auto p-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Settings</h2>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Overdue Threshold</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Complaints that remain Open or In Progress beyond this many days are flagged as
                        overdue and surfaced at the top of the complaints list.
                    </p>

                    {error && (
                        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
                            {success}
                        </div>
                    )}

                    {loading ? (
                        <p className="text-sm text-gray-400">Loading...</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex items-end gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={365}
                                    value={days}
                                    onChange={(e) => setDays(Number(e.target.value))}
                                    className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}