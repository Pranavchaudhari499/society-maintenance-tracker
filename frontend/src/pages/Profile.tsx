import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { User as UserIcon, Mail, ShieldCheck, Calendar, Phone, Home, Building, Edit3, X } from "lucide-react";
import { api } from "../api/client";
import toast from "react-hot-toast";

const NAV_LINKS = [
    { label: "My Complaints", to: "/resident" },
    { label: "Notice Board", to: "/resident/notices" },
    { label: "Profile", to: "/resident/profile" },
];

export default function Profile() {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editFlatNo, setEditFlatNo] = useState("");
    const [editWing, setEditWing] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const res = await api.get("/profile");
            setProfileData(res.data.data);
            setEditName(res.data.data.name || "");
            setEditPhone(res.data.data.phone || "");
            setEditFlatNo(res.data.data.flatNo || "");
            setEditWing(res.data.data.wing || "");
        } catch (err: any) {
            toast.error("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put("/profile", {
                name: editName,
                phone: editPhone,
                flatNo: editFlatNo,
                wing: editWing
            });
            setProfileData(res.data.data);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    }

    const getInitials = (name: string) => {
        if (!name) return "";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
            <Navbar links={NAV_LINKS} />

            <div className="max-w-2xl mx-auto p-8 pt-12">
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-8 shadow-sm relative">
                    
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 pb-8 border-b border-gray-100 relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-200 ring-4 ring-white">
                            {getInitials(profileData?.name || user.name)}
                        </div>
                        <div className="text-center sm:text-left flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{profileData?.name || user.name}</h1>
                            <p className="text-indigo-600 font-medium mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                                <ShieldCheck className="w-4 h-4" />
                                {user.role === "RESIDENT" ? "Society Resident" : "Administrator"}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute top-0 right-0 sm:relative flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-100 transition shadow-sm border border-indigo-100 text-sm"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Account Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 transition hover:bg-gray-50">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-0.5">Full Name</p>
                                        <p className="text-sm font-semibold text-gray-900">{profileData?.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 transition hover:bg-gray-50">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-xs text-gray-500 font-medium mb-0.5">Email Address</p>
                                        <p className="text-sm font-semibold text-gray-900 truncate">{profileData?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 pt-4 border-t border-gray-100">Contact & Residence</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 transition hover:bg-gray-50">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-0.5">Phone Number</p>
                                        <p className="text-sm font-semibold text-gray-900">{profileData?.phone || "Not provided"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 transition hover:bg-gray-50">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                        <Building className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-0.5">Wing</p>
                                        <p className="text-sm font-semibold text-gray-900">{profileData?.wing || "Not provided"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 transition hover:bg-gray-50">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                        <Home className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-0.5">Flat Number</p>
                                        <p className="text-sm font-semibold text-gray-900">{profileData?.flatNo || "Not provided"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 transition hover:bg-gray-50">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-green-600 flex-shrink-0">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-0.5">Account Status</p>
                                        <p className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            Active
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
                            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input 
                                        type="text" 
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        placeholder="e.g. +91 9876543210"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Wing</label>
                                        <input 
                                            type="text" 
                                            value={editWing}
                                            onChange={(e) => setEditWing(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                            placeholder="e.g. A"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Flat No</label>
                                        <input 
                                            type="text" 
                                            value={editFlatNo}
                                            onChange={(e) => setEditFlatNo(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                            placeholder="e.g. 101"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-md disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
