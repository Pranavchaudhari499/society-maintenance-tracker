import type { ComplaintMedia } from "../types/complaint";

export default function PhotoGallery({ media }: { media: ComplaintMedia[] }) {
    if (media.length === 0) return null;

    return (
        <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Photos</p>
            <div className="grid grid-cols-4 gap-2">
                {media.map((m) => (
                    <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                            src={m.url}
                            alt="Complaint attachment"
                            className="w-full h-20 object-cover rounded-md border border-gray-200 hover:opacity-80 transition"
                        />
                    </a>
                ))}
            </div>
        </div>
    );
}