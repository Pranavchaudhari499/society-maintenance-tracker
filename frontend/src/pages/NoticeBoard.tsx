import { useEffect, useState } from "react";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import type { Notice } from "../types/notice";
import { Pin, Bell } from "lucide-react";

const NAV_LINKS = [
    { label: "My Complaints", to: "/resident" },
    { label: "Notice Board", to: "/resident/notices" },
    { label: "Profile", to: "/resident/profile" },
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

        const handleRefresh = () => loadNotices();
        window.addEventListener('REFRESH_DATA', handleRefresh);
        
        return () => window.removeEventListener('REFRESH_DATA', handleRefresh);
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
            <Navbar links={NAV_LINKS} />

            <div className="max-w-4xl mx-auto p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Notice Board</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Stay updated with the latest announcements</p>
                </div>

                {error && (
                    <div className="mb-6 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl px-4 py-3">
                        {error}
                    </div>
                )}

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
                        <p className="text-sm text-gray-500 max-w-sm">The admin hasn't posted any announcements. Check back later.</p>
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
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <p className="text-xs font-medium text-gray-400">
                                        Posted by <span className="text-gray-600">{n.poster.name}</span>
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {formatDate(n.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}