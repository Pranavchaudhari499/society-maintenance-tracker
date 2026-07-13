import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import type { Notice } from "../types/notice";
import { Pin, Bell, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const NAV_LINKS = [
    { label: "Complaints", to: "/admin" },
    { label: "Notices", to: "/admin/notices" },
    { label: "Settings", to: "/admin/settings" },
];

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function AdminNotices() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [isImportant, setIsImportant] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadNotices();
    }, []);

    async function loadNotices() {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/notices");
            setNotices(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || "Failed to load notices");
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setEditingId(null);
        setTitle("");
        setBody("");
        setIsImportant(false);
    }

    function startEdit(n: Notice) {
        setEditingId(n.id);
        setTitle(n.title);
        setBody(n.body);
        setIsImportant(n.isImportant);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            if (editingId) {
                await api.patch(`/notices/${editingId}`, { title, body, isImportant });
                toast.success("Notice updated!");
            } else {
                await api.post("/notices", { title, body, isImportant });
                toast.success("Notice posted!");
            }
            resetForm();
            await loadNotices();
        } catch (err: any) {
            const msg = err.response?.data?.error?.message || "Failed to save notice";
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this notice? This cannot be undone.")) return;
        try {
            await api.delete(`/notices/${id}`);
            toast.success("Notice deleted!");
            await loadNotices();
        } catch (err: any) {
            const msg = err.response?.data?.error?.message || "Failed to delete notice";
            setError(msg);
            toast.error(msg);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
            <Navbar links={NAV_LINKS} />

            <div className="max-w-4xl mx-auto p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Notices</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Post announcements and updates for all residents</p>
                </div>

                {error && (
                    <div className="mb-6 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl px-4 py-3">
                        {error}
                    </div>
                )}

                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 p-6 sm:p-8 mb-8 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-indigo-500" />
                        {editingId ? "Edit Notice" : "Post New Notice"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                            className="w-full px-4 py-2.5 bg-white/50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                        />
                        <textarea
                            required
                            rows={3}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Notice details..."
                            className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 resize-none"
                        />
                        <label className="flex items-center gap-3 text-sm text-gray-700 font-medium cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isImportant}
                                onChange={(e) => setIsImportant(e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            Mark as important (pins to top, triggers email to residents)
                        </label>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50 transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                {saving ? "Saving..." : editingId ? "Update Notice" : "Post Notice"}
                            </button>
                            {editingId && (
                                <button type="button" onClick={resetForm} className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : notices.length === 0 ? (
                    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-indigo-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No notices yet</h3>
                        <p className="text-sm text-gray-500 max-w-sm">You haven't posted any announcements yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notices.map((n) => (
                            <div
                                key={n.id}
                                className={`rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ${n.isImportant 
                                    ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200" 
                                    : "bg-white/80 backdrop-blur-sm border border-gray-200"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {n.isImportant && (
                                                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500 text-white shadow-sm">
                                                    <Pin className="w-3 h-3" /> Pinned
                                                </span>
                                            )}
                                            <h3 className={`text-lg font-bold ${n.isImportant ? 'text-amber-900' : 'text-gray-900'}`}>{n.title}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{n.body}</p>
                                        <p className="text-xs font-medium text-gray-400 mt-4 pt-4 border-t border-gray-100">
                                            Posted by <span className="text-gray-600">{n.poster.name}</span> &middot; {formatDate(n.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <button onClick={() => startEdit(n)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors duration-200">
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(n.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors duration-200">
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}