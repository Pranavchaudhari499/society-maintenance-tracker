import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import type { Notice } from "../types/notice";

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
            } else {
                await api.post("/notices", { title, body, isImportant });
            }
            resetForm();
            await loadNotices();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || "Failed to save notice");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this notice? This cannot be undone.")) return;
        try {
            await api.delete(`/notices/${id}`);
            await loadNotices();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || "Failed to delete notice");
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar links={NAV_LINKS} />

            <div className="max-w-3xl mx-auto p-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Notices</h2>

                {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        {editingId ? "Edit Notice" : "Post New Notice"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <textarea
                            required
                            rows={3}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Notice details..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={isImportant}
                                onChange={(e) => setIsImportant(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            Mark as important (pins to top, triggers email to residents)
                        </label>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                            >
                                {saving ? "Saving..." : editingId ? "Update Notice" : "Post Notice"}
                            </button>
                            {editingId && (
                                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {loading ? (
                    <p className="text-sm text-gray-400">Loading...</p>
                ) : notices.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <p className="text-sm text-gray-500">No notices posted yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notices.map((n) => (
                            <div
                                key={n.id}
                                className={`bg-white rounded-lg border p-4 ${n.isImportant ? "border-amber-300 ring-1 ring-amber-100" : "border-gray-200"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {n.isImportant && (
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                                    📌 Pinned
                                                </span>
                                            )}
                                            <h3 className="text-sm font-semibold text-gray-900">{n.title}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{n.body}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Posted by {n.poster.name} &middot; {formatDate(n.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => startEdit(n)} className="text-xs text-indigo-600 hover:underline">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(n.id)} className="text-xs text-red-600 hover:underline">
                                            Delete
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