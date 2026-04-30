import { useState, useEffect } from "react";
import { Bell, Check, Trash2, UserPlus, MessageSquare, Swords, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { token } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

    const fetchNotifications = async () => {
        try {
            const resp = await fetch(`${API_URL}/notifications`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: any) => !n.is_read).length);
            }
        } catch (err) {
            console.error("Notifications fetch error:", err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotifications();
            // Optional: poll every 60s as backup to WebSockets
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [token]);

    const markRead = async (id: number) => {
        try {
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (err) {
            console.error("Mark read error:", err);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch(`${API_URL}/notifications/read-all`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (err) {
            console.error("Mark all read error:", err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'connection_request': return <UserPlus className="w-4 h-4 text-blue-400" />;
            case 'message': return <MessageSquare className="w-4 h-4 text-green-400" />;
            case 'pvp_challenge': return <Swords className="w-4 h-4 text-red-400" />;
            case 'endorsement': return <Zap className="w-4 h-4 text-yellow-400" />;
            default: return <Bell className="w-4 h-4 text-primary" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-white">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black shadow-[0_0_8px_rgba(0,240,255,0.6)] animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-zinc-950 border-white/10 backdrop-blur-xl p-0 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] text-primary hover:underline">Mark all as read</button>
                    )}
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">
                            No new notifications
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                className={`p-4 border-b border-white/5 flex gap-3 items-start cursor-pointer hover:bg-white/5 focus:bg-white/5 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
                                onClick={() => markRead(n.id)}
                            >
                                <div className="mt-1">{getIcon(n.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs leading-relaxed ${!n.is_read ? 'text-white font-medium' : 'text-muted-foreground'}`}>
                                        {n.message}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1 shadow-[0_0_5px_rgba(0,240,255,0.5)]" />}
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
