import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend);
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import StatusUpdateModal from "../components/StatusUpdateModal";
import ComplaintTimeline from "../components/ComplaintTimeline";
import PhotoGallery from "../components/PhotoGallery";
import { CATEGORY_LABELS, STATUS_LABELS } from "../types/complaint";
import type { ComplaintCategory, ComplaintStatus, Priority } from "../types/complaint";
import type { AdminComplaint } from "../types/adminComplaint";
import { Filter, X, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Clock, BarChart3, AlertTriangle, Download } from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
    OPEN: "bg-yellow-100 text-yellow-800 border-yellow-200",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
    RESOLVED: "bg-green-100 text-green-800 border-green-200",
};

const PRIORITY_BADGE: Record<Priority, string> = {
    LOW: "bg-gray-100 text-gray-700 border-gray-200",
    MEDIUM: "bg-orange-100 text-orange-800 border-orange-200",
    HIGH: "bg-red-100 text-red-800 border-red-200",
};

const NAV_LINKS = [
    { label: "Complaints", to: "/admin" },
    { label: "Notices", to: "/admin/notices" },
    { label: "Settings", to: "/admin/settings" },
];

export default function AdminDashboard() {
    const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [statusModalFor, setStatusModalFor] = useState<AdminComplaint | null>(null);

    const [dashboardData, setDashboardData] = useState<any>(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);

    const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | "">("");
    const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "">("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    useEffect(() => {
        loadComplaints();
    }, [categoryFilter, statusFilter, fromDate, toDate]);

    async function loadDashboard() {
        setDashboardLoading(true);
        try {
            const res = await api.get("/admin/dashboard");
            setDashboardData(res.data.data);
        } catch (err) {
            console.error("Failed to load dashboard stats", err);
        } finally {
            setDashboardLoading(false);
        }
    }

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

    async function handleDownloadCSV() {
        try {
            const params: Record<string, string> = {};
            if (categoryFilter) params.category = categoryFilter;
            if (statusFilter) params.status = statusFilter;
            if (fromDate) params.from = fromDate;
            if (toDate) params.to = toDate;

            const res = await api.get("/admin/complaints/export", { params, responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'complaints_export.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err) {
            console.error("Failed to download CSV", err);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 pb-12">
            <Navbar links={NAV_LINKS} />

            <div className="max-w-6xl mx-auto p-4 sm:p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Key metrics and status at a glance</p>
                </div>
                
                {dashboardLoading ? (
                    <p className="text-sm text-gray-400 mb-8">Loading overview...</p>
                ) : dashboardData ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 p-6 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <BarChart3 className="w-16 h-16 text-indigo-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Complaints</h3>
                            <p className="text-4xl font-black text-gray-900 tracking-tight">{dashboardData.total}</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 p-6 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-40 transition-opacity">
                                <AlertTriangle className="w-16 h-16 text-red-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-red-800 uppercase tracking-wider mb-2">Overdue</h3>
                            <p className="text-4xl font-black text-red-700 tracking-tight">{dashboardData.overdueCount}</p>
                        </div>
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 p-6 col-span-1 md:col-span-2 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-1 pr-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Status Breakdown</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm group">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm" />
                                            <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">Open</span>
                                        </div>
                                        <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full">{dashboardData.byStatus?.OPEN || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm group">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-400 shadow-sm" />
                                            <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">In Progress</span>
                                        </div>
                                        <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full">{dashboardData.byStatus?.IN_PROGRESS || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm group">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm" />
                                            <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">Resolved</span>
                                        </div>
                                        <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full">{dashboardData.byStatus?.RESOLVED || 0}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-32 h-32 shrink-0 relative">
                                <Doughnut 
                                    data={{
                                        labels: ['Open', 'In Progress', 'Resolved'],
                                        datasets: [{
                                            data: [
                                                dashboardData.byStatus?.OPEN || 0,
                                                dashboardData.byStatus?.IN_PROGRESS || 0,
                                                dashboardData.byStatus?.RESOLVED || 0
                                            ],
                                            backgroundColor: ['#facc15', '#60a5fa', '#4ade80'],
                                            borderWidth: 0,
                                            hoverOffset: 4
                                        }]
                                    }}
                                    options={{ cutout: '75%', plugins: { legend: { display: false }, tooltip: { padding: 12, cornerRadius: 8 } } }}
                                />
                            </div>
                        </div>
                        {/* Category Breakdown */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 p-6 col-span-1 md:col-span-4 shadow-sm hover:shadow-md transition-shadow mt-2">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Category Breakdown</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                    <div key={key} className="bg-white/80 rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col items-center justify-center hover:border-indigo-200 transition-colors">
                                        <span className="text-gray-500 text-xs font-semibold uppercase mb-1 text-center">{label}</span>
                                        <span className="text-2xl font-bold text-indigo-600">{dashboardData.byCategory?.[key] || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">All Complaints</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Manage and update resident requests</p>
                    </div>
                    <button
                        onClick={handleDownloadCSV}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 rounded-xl text-sm font-bold shadow-sm transition-colors border border-indigo-200"
                    >
                        <Download className="w-4 h-4" />
                        Download Report
                    </button>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 p-5 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
                    <div className="flex items-center gap-2 mb-1 w-full sm:w-auto sm:mb-0">
                        <Filter className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-bold text-gray-700">Filters:</span>
                    </div>
                    
                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value as ComplaintCategory | "")}
                            className="w-full px-3 py-2 bg-white/50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                        >
                            <option value="">All Categories</option>
                            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | "")}
                            className="w-full px-3 py-2 bg-white/50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                        >
                            <option value="">All Statuses</option>
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">From Date</label>
                        <input 
                            type="date" 
                            value={fromDate} 
                            onChange={(e) => setFromDate(e.target.value)} 
                            className="w-full px-3 py-2 bg-white/50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200" 
                        />
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">To Date</label>
                        <input 
                            type="date" 
                            value={toDate} 
                            onChange={(e) => setToDate(e.target.value)} 
                            className="w-full px-3 py-2 bg-white/50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200" 
                        />
                    </div>

                    {(categoryFilter || statusFilter || fromDate || toDate) && (
                        <button 
                            onClick={clearFilters} 
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors h-[42px]"
                        >
                            <X className="w-4 h-4" /> Clear
                        </button>
                    )}
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
                ) : complaints.length === 0 ? (
                    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-indigo-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No complaints found</h3>
                        <p className="text-sm text-gray-500 max-w-sm">There are no complaints matching your current filters.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {complaints.map((c) => (
                            <div
                                key={c.id}
                                className={`bg-white/80 backdrop-blur-sm rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${c.isOverdue ? "border-red-300 ring-2 ring-red-100" : "border-gray-200"
                                    }`}
                            >
                                <div className="p-4 sm:p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 sm:gap-6">
                                        <div className="flex-1 cursor-pointer group" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                                            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded-md">
                                                    {CATEGORY_LABELS[c.category]}
                                                </span>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-md border ${STATUS_BADGE[c.status]}`}>
                                                    {STATUS_LABELS[c.status]}
                                                </span>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-md border ${PRIORITY_BADGE[c.priority]}`}>
                                                    {c.priority} Priority
                                                </span>

                                                {c.isOverdue && (
                                                    <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-md bg-red-600 text-white shadow-sm">
                                                        <AlertCircle className="w-3.5 h-3.5" /> Overdue
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-base text-gray-900 font-medium leading-relaxed group-hover:text-indigo-600 transition-colors">{c.description}</p>
                                            <div className="flex items-center gap-3 mt-4 text-sm flex-wrap">
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                                                        {c.resident.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-700 truncate">{c.resident.name}</span>
                                                    <span className="text-gray-400 truncate max-w-[150px] sm:max-w-none">({c.resident.email})</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-400 shrink-0">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(c.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto mt-2 md:mt-0">
                                            <select
                                                value={c.priority}
                                                disabled={c.status === "RESOLVED"}
                                                onChange={(e) => handlePriorityChange(c.id, e.target.value as Priority)}
                                                className="text-sm font-medium px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:bg-gray-50 w-full md:w-[140px]"
                                            >
                                                <option value="LOW">Low Priority</option>
                                                <option value="MEDIUM">Medium Priority</option>
                                                <option value="HIGH">High Priority</option>
                                            </select>

                                            <button
                                                onClick={() => setStatusModalFor(c)}
                                                disabled={c.status === "RESOLVED"}
                                                className="w-full md:w-[140px] text-sm px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:shadow-md disabled:opacity-50 disabled:hover:shadow-none disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                                            >
                                                {c.status === "RESOLVED" ? (
                                                    <><CheckCircle2 className="w-4 h-4" /> Closed</>
                                                ) : "Update Status"}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 flex justify-center md:justify-start" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                                        <button className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer">
                                            {expandedId === c.id ? (
                                                <><ChevronUp className="w-4 h-4" /> Show Less</>
                                            ) : (
                                                <><ChevronDown className="w-4 h-4" /> Show Details</>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {expandedId === c.id && (
                                    <div className="border-t border-gray-100 p-6 bg-gradient-to-b from-gray-50/50 to-transparent">
                                        <div className="mb-6">
                                            <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                                                Attached Media
                                            </p>
                                            <PhotoGallery media={c.media} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">
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