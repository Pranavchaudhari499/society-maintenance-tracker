import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { CATEGORY_LABELS } from "../types/complaint";
import type { ComplaintCategory } from "../types/complaint";

const MAX_PHOTOS = 5;
const MAX_SIZE_MB = 5;

export default function RaiseComplaint() {
    const [category, setCategory] = useState<ComplaintCategory>("ELECTRICAL");
    const [description, setDescription] = useState("");
    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        setError("");

        if (photos.length + files.length > MAX_PHOTOS) {
            setError(`You can attach up to ${MAX_PHOTOS} photos`);
            return;
        }

        const tooLarge = files.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
        if (tooLarge) {
            setError(`${tooLarge.name} exceeds the ${MAX_SIZE_MB}MB limit`);
            return;
        }

        const newPhotos = [...photos, ...files];
        setPhotos(newPhotos);
        setPreviews(newPhotos.map((f) => URL.createObjectURL(f)));

        e.target.value = "";
    }

    function removePhoto(index: number) {
        const newPhotos = photos.filter((_, i) => i !== index);
        setPhotos(newPhotos);
        setPreviews(newPhotos.map((f) => URL.createObjectURL(f)));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("category", category);
            formData.append("description", description);
            photos.forEach((file) => formData.append("photos", file));

            await api.post("/complaints", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            navigate("/resident");
        } catch (err: any) {
            setError(err.response?.data?.error?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-lg mx-auto">
                <button onClick={() => navigate("/resident")} className="text-sm text-gray-500 hover:text-gray-700 mb-4">
                    ← Back
                </button>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h1 className="text-xl font-semibold text-gray-900 mb-1">Raise a Complaint</h1>
                    <p className="text-sm text-gray-500 mb-6">Describe the issue and we'll route it to the admin.</p>

                    {error && (
                        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                required
                                minLength={10}
                                rows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Describe the issue in detail (at least 10 characters)..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Photos (optional, up to {MAX_PHOTOS})
                            </label>

                            {previews.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    {previews.map((src, i) => (
                                        <div key={i} className="relative group">
                                            <img src={src} alt={`preview-${i}`} className="w-full h-20 object-cover rounded-md border border-gray-200" />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(i)}
                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {photos.length < MAX_PHOTOS && (
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                        >
                            {loading ? "Submitting..." : "Submit Complaint"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}