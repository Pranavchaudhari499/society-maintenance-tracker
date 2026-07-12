import { useEffect, useState } from "react";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import StatusUpdateModal from "../components/StatusUpdateModal";
import ComplaintTimeline from "../components/ComplaintTimeline";
import { CATEGORY_LABELS, STATUS_LABELS } from "../types/complaint";
import type { ComplaintCategory, ComplaintStatus, Priority } from "../types/complaint";
import type { AdminComplaint } from "../types/adminComplaint";

const STATUS_BADGE: Record<string, string> = {
    OPEN: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    RESOLVED: "bg-green-100 text-green-800",
};

const PRIORITY_BADGE: Record<Priority, string> = {
    LOW: "bg-gray-100 text-gray-600",
    MEDIUM: "bg-orange-100 text-orange-700",
    HIGH: "bg-red-100 text-red-700",
};

const NAV_LINKS = [{ label: "Complaints", to: "/admin" }];

export default function AdminDashboard() {
    const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [statusModalFor, setStatusModalFor] = useState<AdminComplaint | null>(null);

    const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | "">("");
    const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "">("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        loadComplaints();
    }, [categoryFilter, statusFilter, fromDate, toDate]);

    async function loadComplaints() {
        setLoading(true);
        setError("");
        try {
            const params: Record<string, string> = {};
            if (categoryFilter) params.category = categoryFilter;
            if (statusFilter) params.status = statusFilter;
            if (fromDate) params.from = fromDate;
            if (toDate) params.to = toDate;

            const res = await api.get("/admin/complaints", { params });
            setComplaints(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || "Failed to load complaints");
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusSubmit(status: ComplaintStatus, note: string) {
        if (!statusModalFor) return;
        await api.patch(`/admin/complaints/${statusModalFor.id}/status`, { status, note });
        await loadComplaints();
    }

    async function handlePriorityChange(complaintId: string, priority: Priority) {
        try {
            await api.patch(`/admin/complaints/${complaintId}/priority`, { priority });
            await loadComplaints();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || "Failed to update priority");
        }
    }

    function clearFilters() {
        setCategoryFilter("");
        setStatusFilter("");
        setFromDate("");
        setToDate("");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar links={NAV_LINKS} />

            <div className="max-w-5xl mx-auto p-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">All Complaints</h2>

                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value as ComplaintCategory | "")}
                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="">All</option>
                            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | "")}
                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="">All</option>
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm" />
                    </div>

                    {(categoryFilter || statusFilter || fromDate || toDate) && (
                        <button onClick={clearFilters} className="text-sm text-indigo-600 hover:underline pb-1.5">
                            Clear filters
                        </button>
                    )}
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
                        <p className="text-sm text-gray-500">No complaints match these filters.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {complaints.map((c) => (
                            <div key={c.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="p-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                                    {CATEGORY_LABELS[c.category]}
                                                </span>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[c.status]}`}>
                                                    {STATUS_LABELS[c.status]}
                                                </span>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_BADGE[c.priority]}`}>
                                                    {c.priority}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-800">{c.description}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                By {c.resident.name} ({c.resident.email}) &middot; {new Date(c.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2 items-end shrink-0">
                                            <select
                                                value={c.priority}
                                                disabled={c.status === "RESOLVED"}
                                                onChange={(e) => handlePriorityChange(c.id, e.target.value as Priority)}
                                                className="text-xs px-2 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="LOW">Low</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HIGH">High</option>
                                            </select>

                                            <button
                                                onClick={() => setStatusModalFor(c)}
                                                disabled={c.status === "RESOLVED"}
                                                className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                            >
                                                {c.status === "RESOLVED" ? "Closed" : "Update Status"}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {expandedId === c.id && (
                                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                                        <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Status Timeline</p>
                                        <ComplaintTimeline history={c.history} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {statusModalFor && (
                <StatusUpdateModal
                    currentStatus={statusModalFor.status}
                    onClose={() => setStatusModalFor(null)}
                    onSubmit={handleStatusSubmit}
                />
            )}
        </div>
    );
}