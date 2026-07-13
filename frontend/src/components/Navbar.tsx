import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface NavLink {
    label: string;
    to: string;
}

export default function Navbar({ links }: { links: NavLink[] }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <span className="font-semibold text-gray-900 text-sm">🏢 Society Tracker</span>
                    <div className="flex items-center gap-1">
                        {links.map((link) => {
                            const active = location.pathname === link.to;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`text-sm px-3 py-1.5 rounded-md transition-all duration-200 ${active
                                            ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                    </div>
                    <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600 transition-colors duration-200 font-medium px-2 py-1 rounded-md hover:bg-red-50">
                        Log out
                    </button>
                </div>
            </div>
        </nav>
    );
}