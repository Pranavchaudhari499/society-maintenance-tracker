import type { ComplaintHistoryEntry } from "../types/complaint";
import { STATUS_LABELS } from "../types/complaint";

const STATUS_COLORS: Record<string, string> = {
    OPEN: "bg-yellow-400",
    IN_PROGRESS: "bg-blue-500",
    RESOLVED: "bg-green-500",
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ComplaintTimeline({
    history,
}: {
    history: ComplaintHistoryEntry[];
}) {
    return (
        <ol className="relative border-l border-gray-200 ml-2">
            {history.map((entry, idx) => (
                <li key={entry.id} className="mb-6 ml-4 last:mb-0">
                    <span
                        className={`absolute w-3 h-3 rounded-full -left-[7px] border-2 border-white ${STATUS_COLORS[entry.newStatus] || "bg-gray-400"
                            }`}
                    />
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                            {STATUS_LABELS[entry.newStatus]}
                        </p>
                        {idx === history.length - 1 && (
                            <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                Latest
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400">{formatDate(entry.createdAt)}</p>
                    {entry.note && (
                        <p className="text-sm text-gray-600 mt-1">{entry.note}</p>
                    )}
                </li>
            ))}
        </ol>
    );
}