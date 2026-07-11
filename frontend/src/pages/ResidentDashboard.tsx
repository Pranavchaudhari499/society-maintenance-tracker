import { useAuth } from "../context/AuthContext";

export default function ResidentDashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Welcome, {user?.name}</h1>
                        <p className="text-sm text-gray-500">Resident Dashboard</p>
                    </div>
                    <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">
                        Log out
                    </button>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm text-gray-500">
                        Complaint list and raise-complaint form coming in Phase 2.
                    </p>
                </div>
            </div>
        </div>
    );
}