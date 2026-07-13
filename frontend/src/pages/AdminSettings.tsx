import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import { Settings, Clock, Save } from "lucide-react";
import toast from "react-hot-toast";

const NAV_LINKS = [
    { label: "Complaints", to: "/admin" },
    { label: "Notices", to: "/admin/notices" },
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
            toast.success("Threshold updated successfully");
        } catch (err: any) {
            const msg = err.response?.data?.error?.message || "Failed to update settings";
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
            <Navbar links={NAV_LINKS} />

            <div className="max-w-3xl mx-auto p-8">
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Settings className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Configure global application parameters</p>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 p-6 sm:p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className="w-24 h-24 text-indigo-600" />
                    </div>
                    
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" />
                            Overdue Threshold
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-xl mb-6">
                            Complaints that remain <span className="font-semibold text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded">Open</span> or <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">In Progress</span> beyond this many days are flagged as overdue and surfaced at the top of the complaints list.
                        </p>

                        {error && (
                            <div className="mb-6 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl px-4 py-3">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex items-center gap-3 text-gray-500">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                                <span className="text-sm font-medium">Loading settings...</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                                <div className="w-full sm:w-auto">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Threshold (Days)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={365}
                                        value={days}
                                        onChange={(e) => setDays(Number(e.target.value))}
                                        className="w-full sm:w-32 px-4 py-2.5 bg-white/50 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}