import { useState } from "react";
import type { FormEvent } from "react";
import type { ComplaintStatus } from "../types/complaint";
import { STATUS_LABELS } from "../types/complaint";

interface StatusUpdateModalProps {
    currentStatus: ComplaintStatus;
    onClose: () => void;
    onSubmit: (status: ComplaintStatus, note: string) => Promise<void>;
}

const NEXT_STATUS_OPTIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
    OPEN: ["OPEN", "IN_PROGRESS", "RESOLVED"],
    IN_PROGRESS: ["IN_PROGRESS", "RESOLVED"],
    RESOLVED: [],
};

export default function StatusUpdateModal({
    currentStatus,
    onClose,
    onSubmit,
}: StatusUpdateModalProps) {
    const options = NEXT_STATUS_OPTIONS[currentStatus];
    const [status, setStatus] = useState<ComplaintStatus>(options[0] || currentStatus);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await onSubmit(status, note);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || "Failed to update status");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>

                {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {options.map((s) => (
                                <option key={s} value={s}>
                                    {STATUS_LABELS[s]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                        <textarea
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. Assigned to plumber, expected by Friday"
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                        >
                            {loading ? "Updating..." : "Update"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}