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
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <span className="font-semibold text-gray-900 text-sm">🏢 Society Tracker</span>
                    <div className="flex items-center gap-1">
                        {links.map((link) => {
                            const active = location.pathname === link.to;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`text-sm px-3 py-1.5 rounded-md transition ${active
                                            ? "bg-indigo-50 text-indigo-700 font-medium"
                                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{user?.name}</span>
                    <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-700 transition">
                        Log out
                    </button>
                </div>
            </div>
        </nav>
    );
}