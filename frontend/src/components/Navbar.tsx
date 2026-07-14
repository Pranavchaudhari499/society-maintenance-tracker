import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Building2, Bell, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { api } from "../api/client";

interface NavLink {
    label: string;
    to: string;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function Navbar({ links }: { links: NavLink[] }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        if (!user) return;
        
        api.get('/notifications').then(res => {
            setNotifications(res.data.data);
        }).catch(err => console.error("Failed to fetch notifications", err));

        const handleNewNotification = (e: any) => {
            setNotifications(prev => [e.detail, ...prev]);
        };
        window.addEventListener('NEW_NOTIFICATION', handleNewNotification);

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener('NEW_NOTIFICATION', handleNewNotification);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [user]);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };
    
    const markAllAsRead = async () => {
        try {
            await api.patch(`/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    return (
        <div className="sticky top-4 sm:top-6 z-50 flex justify-center px-2 sm:px-4 mb-6 sm:mb-10 pointer-events-none">
            <nav className="pointer-events-auto bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(79,70,229,0.08)] rounded-full px-2 py-1.5 sm:py-2 flex items-center justify-between w-full max-w-5xl transition-all duration-300">
                {/* Logo Section */}
                <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 pr-3 sm:pr-6 border-r border-gray-200/60 shrink-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-[0_4px_12px_rgba(79,70,229,0.4)]">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 text-sm tracking-wide uppercase hidden md:block">
                        Society Tracker
                    </span>
                </div>

                {/* Navigation Links */}
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-6 flex-1 overflow-x-auto no-scrollbar">
                    {links.map((link) => {
                        const active = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`relative px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${active
                                        ? "text-indigo-700 bg-white shadow-[0_4px_16px_rgba(79,70,229,0.12)] ring-1 ring-indigo-50/50 transform -translate-y-0.5"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                {/* User Profile & Logout */}
                <div className="flex items-center gap-3 pr-2 pl-4 border-l border-gray-200/60">
                    
                    {/* Notification Bell */}
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-300"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>

                        {/* Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-4 w-80 bg-white/90 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden z-50">
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllAsRead} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-6 text-center text-gray-500 text-sm">
                                            No notifications yet.
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div 
                                                key={notif.id} 
                                                onClick={() => {
                                                    if (!notif.isRead) markAsRead(notif.id);
                                                }}
                                                className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-indigo-50/30 hover:bg-indigo-50/60' : 'hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    {!notif.isRead && <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></span>}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                                                <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 bg-white/50 rounded-full py-1.5 px-2 sm:px-4 border border-white/80 shadow-sm">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-xs ring-2 ring-white shadow-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-700 hidden md:block">{user?.name?.split(' ')[0]}</span>
                    </div>
                    
                    <button 
                        onClick={logout} 
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-300 group shadow-sm bg-white/50 border border-transparent hover:border-red-100"
                        title="Log out"
                    >
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </nav>
        </div>
    );
}