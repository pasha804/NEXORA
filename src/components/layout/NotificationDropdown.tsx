import { useEffect } from "react";
import { Bell, UserPlus, MessageSquare, Swords, Zap, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationStore } from "@/hooks/useNotificationStore";

export const NotificationDropdown = () => {
    const { notifications, unreadCount, initialized, setNotifications, markAsRead, markAllAsRead } = useNotificationStore();
    const { token } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const fetchNotifications = async () => {
        try {
            const resp = await fetch(`${API_URL}/notifications/`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error("Notifications fetch error:", err);
        }
    };

    useEffect(() => {
        if (token && !initialized) {
            fetchNotifications();
        }
    }, [token, initialized]);

    const handleMarkRead = async (id: number) => {
        markAsRead(id);
        try {
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Mark read error:", err);
        }
    };

    const handleMarkAllRead = async () => {
        markAllAsRead();
        try {
            await fetch(`${API_URL}/notifications/read-all`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Mark all read error:", err);
        }
    };

    const acceptConnection = async (senderId: number) => {
        try {
            const resp = await fetch(`${API_URL}/connections/accept-by-sender/${senderId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) {
                toast.success("Connection accepted!");
                fetchNotifications();
            } else {
                const data = await resp.json();
                toast.error(data.detail || "Failed to accept");
            }
        } catch {
            toast.error("Network error");
        }
    };

    const rejectConnection = async (senderId: number) => {
        try {
            const resp = await fetch(`${API_URL}/connections/reject-by-sender/${senderId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) {
                toast.success("Connection request rejected");
                fetchNotifications();
            } else {
                const data = await resp.json();
                toast.error(data.detail || "Failed to reject");
            }
        } catch {
            toast.error("Network error");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'CONNECTION_REQUEST':
            case 'connection_request': return <UserPlus className="w-4 h-4 text-blue-400" />;
            case 'CONNECTION_ACCEPTED':
            case 'connection_accepted': return <UserCheck className="w-4 h-4 text-green-400" />;
            case 'NEW_FOLLOWER':
            case 'new_follower': return <UserPlus className="w-4 h-4 text-cyan-400" />;
            case 'message':
            case 'NEW_MESSAGE': return <MessageSquare className="w-4 h-4 text-green-400" />;
            case 'pvp_challenge':
            case 'MATCH_FOUND': return <Swords className="w-4 h-4 text-red-400" />;
            case 'endorsement':
            case 'SKILL_VERIFIED': return <Zap className="w-4 h-4 text-yellow-400" />;
            default: return <Bell className="w-4 h-4 text-primary" />;
        }
    };

    const isConnectionRequest = (type: string) =>
        type === 'CONNECTION_REQUEST' || type === 'connection_request';

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
                        <button onClick={handleMarkAllRead} className="text-[10px] text-primary hover:underline">Mark all as read</button>
                    )}
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">
                            No new notifications
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`p-4 border-b border-white/5 flex gap-3 items-start transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
                            >
                                <div className="mt-1 shrink-0">{getIcon(n.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs leading-relaxed ${!n.is_read ? 'text-white font-medium' : 'text-muted-foreground'}`}>
                                        {n.message}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {isConnectionRequest(n.type) && (
                                        <div className="flex gap-2 mt-2">
                                            <Button
                                                size="sm"
                                                className="h-7 px-3 text-[10px] font-bold bg-green-500 hover:bg-green-600 text-white"
                                                onClick={() => acceptConnection(Number(n.related_id))}
                                            >
                                                <UserCheck className="w-3 h-3 mr-1" /> Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 px-3 text-[10px] border-white/10 text-muted-foreground hover:text-white"
                                                onClick={() => rejectConnection(Number(n.related_id))}
                                            >
                                                <X className="w-3 h-3 mr-1" /> Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {!n.is_read && (
                                    <button onClick={() => handleMarkRead(n.id)} className="shrink-0 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_rgba(0,240,255,0.5)] hover:opacity-50 transition-opacity" />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
