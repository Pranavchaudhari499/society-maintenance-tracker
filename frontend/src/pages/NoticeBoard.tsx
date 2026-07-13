import { useEffect, useState } from "react";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import type { Notice } from "../types/notice";

const NAV_LINKS = [
    { label: "My Complaints", to: "/resident" },
    { label: "Notice Board", to: "/resident/notices" },
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

export default function NoticeBoard() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar links={NAV_LINKS} />

            <div className="max-w-3xl mx-auto p-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notice Board</h2>

                {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-sm text-gray-400">Loading...</p>
                ) : notices.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <p className="text-sm text-gray-500">No notices yet.</p>
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
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {n.isImportant && (
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                                    📌 Pinned
                                                </span>
                                            )}
                                            <h3 className="text-sm font-semibold text-gray-900">{n.title}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{n.body}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    Posted by {n.poster.name} &middot; {formatDate(n.createdAt)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}