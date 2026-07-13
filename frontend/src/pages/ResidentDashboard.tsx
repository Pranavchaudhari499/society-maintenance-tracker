import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import ComplaintTimeline from "../components/ComplaintTimeline";
import Navbar from "../components/Navbar";
import PhotoGallery from "../components/PhotoGallery";
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
];

export default function ResidentDashboard() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        loadComplaints();
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar links={NAV_LINKS} />

            <div className="max-w-3xl mx-auto p-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">My Complaints</h2>
                    <button
                        onClick={() => navigate("/resident/raise")}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
                    >
                        + Raise Complaint
                    </button>
                </div>

                {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-sm text-gray-400">Loading...</p>
                ) : complaints.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <p className="text-sm text-gray-500">You haven't raised any complaints yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {complaints.map((c) => (
                            <div key={c.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                                    className="w-full text-left p-4 hover:bg-gray-50 transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                                    {CATEGORY_LABELS[c.category]}
                                                </span>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[c.status]}`}>
                                                    {STATUS_LABELS[c.status]}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-800">{c.description}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </button>

                                {expandedId === c.id && (
                                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                                        <PhotoGallery media={c.media} />
                                        <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                                            Status Timeline
                                        </p>
                                        <ComplaintTimeline history={c.history} />
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