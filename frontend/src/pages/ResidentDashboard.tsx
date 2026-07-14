import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import ComplaintTimeline from "../components/ComplaintTimeline";
import Navbar from "../components/Navbar";
import PhotoGallery from "../components/PhotoGallery";
import { Plus, Inbox, ChevronDown, ChevronUp, FileText, Activity, CheckCircle } from "lucide-react";
import { CATEGORY_LABELS, STATUS_LABELS } from "../types/complaint";
import type { Complaint } from "../types/complaint";

const STATUS_BADGE: Record<string, string> = {
    OPEN: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    RESOLVED: "bg-green-100 text-green-800",
};

const NAV_LINKS = [
    { label: "My Complaints", to: "/resident" },
    { label: "Notice Board", to: "/resident/notices" },
    { label: "Profile", to: "/resident/profile" },
];

export default function ResidentDashboard() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        loadComplaints();

        const handleRefresh = () => loadComplaints();
        window.addEventListener('REFRESH_DATA', handleRefresh);
        
        return () => window.removeEventListener('REFRESH_DATA', handleRefresh);
    }, []);

    async function loadComplaints() {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/complaints/mine");
            setComplaints(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || "Failed to load complaints");
        } finally {
            setLoading(false);
        }
    }

    const totalComplaints = complaints.length;
    const activeComplaints = complaints.filter(c => c.status === "OPEN" || c.status === "IN_PROGRESS").length;
    const resolvedComplaints = complaints.filter(c => c.status === "RESOLVED").length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 pb-12">
            <Navbar links={NAV_LINKS} />

            <div className="max-w-4xl mx-auto p-4 sm:p-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-white/50 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Filed</p>
                            <h3 className="text-2xl font-bold text-gray-900">{loading ? "-" : totalComplaints}</h3>
                        </div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-white/50 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Currently Active</p>
                            <h3 className="text-2xl font-bold text-gray-900">{loading ? "-" : activeComplaints}</h3>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-white/50 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Resolved</p>
                            <h3 className="text-2xl font-bold text-gray-900">{loading ? "-" : resolvedComplaints}</h3>
                        </div>
                    </div>
                </div>

                {/* Quick Action Banner */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 sm:p-8 mb-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">Need Maintenance?</h3>
                        <p className="text-indigo-100 max-w-md text-sm sm:text-base">Raise a new complaint and our team will get it sorted out as quickly as possible.</p>
                    </div>
                    <button
                        onClick={() => navigate("/resident/raise")}
                        className="shrink-0 flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-50 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-5 h-5" />
                        Raise a New Complaint
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">My Complaints</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Track and manage your maintenance requests</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                            <Inbox className="w-8 h-8 text-indigo-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No complaints yet</h3>
                        <p className="text-sm text-gray-500 max-w-sm mb-6">You haven't raised any maintenance requests. When you do, they will appear here.</p>
                        <button
                            onClick={() => navigate("/resident/raise")}
                            className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
                        >
                            Raise your first complaint &rarr;
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {complaints.map((c) => (
                            <div key={c.id} className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                                <button
                                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                                    className="w-full text-left p-5 hover:bg-gray-50/50 transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 pr-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${STATUS_BADGE[c.status]}`}>
                                                    {STATUS_LABELS[c.status]}
                                                </span>
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    {CATEGORY_LABELS[c.category]}
                                                </span>
                                            </div>
                                            <p className="text-gray-900 font-medium leading-relaxed">{c.description}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                                                {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            {expandedId === c.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                        </div>
                                    </div>
                                </button>

                                {expandedId === c.id && (
                                    <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                                        <PhotoGallery media={c.media} />
                                        <div className="mt-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <p className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">
                                                Status Timeline
                                            </p>
                                            <ComplaintTimeline history={c.history} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}