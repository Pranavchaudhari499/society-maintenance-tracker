import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SSEListener() {
    const { token } = useAuth();

    useEffect(() => {
        if (!token) return;

        const eventSource = new EventSource(`${API_BASE_URL}/stream?token=${token}`);

        eventSource.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data);
                
                if (parsed.type === "NOTIFICATION") {
                    toast.success(parsed.data.message, {
                        duration: 5000,
                        icon: '🔔',
                    });
                    window.dispatchEvent(new CustomEvent('NEW_NOTIFICATION', { detail: parsed.data }));
                    window.dispatchEvent(new CustomEvent('REFRESH_DATA'));
                } else if (parsed.type === "STATUS_UPDATE") {
                    toast.success(`Complaint status updated to ${parsed.data.status.replace("_", " ")}`, {
                        duration: 5000,
                        icon: '🔔',
                    });
                    window.dispatchEvent(new CustomEvent('REFRESH_DATA'));
                } else if (parsed.type === "NEW_NOTICE") {
                    toast.success(`New Notice: ${parsed.data.title}`, {
                        duration: 5000,
                        icon: '📌',
                    });
                    window.dispatchEvent(new CustomEvent('REFRESH_DATA'));
                }
            } catch (err) {
                console.error("Failed to parse SSE event", err);
            }
        };

        eventSource.onerror = () => {
            console.error("SSE Connection Error. Attempting to reconnect...");
        };

        return () => {
            eventSource.close();
        };
    }, [token]);

    return null;
}
