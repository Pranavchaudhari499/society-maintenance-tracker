import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { CATEGORY_LABELS } from "../types/complaint";
import type { ComplaintCategory } from "../types/complaint";
import toast from 'react-hot-toast';
import { ArrowLeft, UploadCloud, X } from "lucide-react";

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
            toast.success("Complaint raised successfully!");
            navigate("/resident");
        } catch (err: any) {
            const msg = err.response?.data?.error?.message || "Something went wrong. Please try again.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 py-12 px-4 sm:px-6">
            <div className="max-w-xl mx-auto">
                <button onClick={() => navigate("/resident")} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-6 group">
                    <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 sm:p-10">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Raise a Complaint</h1>
                        <p className="text-sm text-gray-500 font-medium">Describe the issue and we'll route it to the admin.</p>
                    </div>

                    {error && (
                        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                                className="w-full px-4 py-2.5 bg-white/50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                            >
                                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <textarea
                                required
                                minLength={10}
                                rows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 resize-none"
                                placeholder="Describe the issue in detail (at least 10 characters)..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Photos <span className="text-gray-400 font-medium">(optional, up to {MAX_PHOTOS})</span>
                            </label>

                            {previews.length > 0 && (
                                <div className="grid grid-cols-4 gap-3 mb-4">
                                    {previews.map((src, i) => (
                                        <div key={i} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200 aspect-square">
                                            <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(i)}
                                                    className="bg-red-500 text-white rounded-full p-1.5 transform hover:scale-110 transition-transform"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {photos.length < MAX_PHOTOS && (
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="w-full flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 rounded-xl bg-white/50 hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
                                        <UploadCloud className="w-8 h-8 text-indigo-400 mb-2" />
                                        <span className="text-sm font-medium text-gray-600">Click or drag photos to upload</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50 transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            {loading ? "Submitting..." : "Submit Complaint"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}