import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, AlertCircle, TrendingUp, Zap, Target, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Alert {
    id: string;
    type: 'info' | 'warning' | 'success' | 'tip';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionText?: string;
}

export const SmartAlerts = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAlerts, setShowAlerts] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const fetchAlerts = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/ai/alerts`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setAlerts(data.alerts || []);
            }
        } catch (err) {
            console.error("AI alerts fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const unreadCount = alerts.filter(a => !a.read).length;

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'success': return TrendingUp;
            case 'warning': return AlertCircle;
            case 'tip': return Zap;
            case 'info': return Info;
            default: return Bell;
        }
    };

    const getAlertStyles = (type: string) => {
        switch (type) {
            case 'success': return "border-green-400/20 bg-green-400/5 text-green-400";
            case 'warning': return "border-yellow-400/20 bg-yellow-400/5 text-yellow-400";
            case 'tip': return "border-purple-400/20 bg-purple-400/5 text-purple-400";
            case 'info': return "border-neon-blue/20 bg-neon-blue/5 text-neon-blue";
            default: return "border-white/10 bg-white/5 text-white";
        }
    };

    const markAsRead = async (id: string) => {
        // Optimistic UI update
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
        try {
            const token = localStorage.getItem("access_token");
            await fetch(`${API_URL}/ai/alerts/${id}/read`, {
                method: "POST",
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
        } catch (err) {
            console.error("Failed to mark alert as read:", err);
        }
    };

    const dismissAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const formatTimestamp = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    if (loading) return <div className="glass-card p-12 text-center animate-pulse text-muted-foreground border-yellow-400/20">Syncing AI signals...</div>;

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="w-6 h-6 text-yellow-400" />
                        AI Pulse
                        {unreadCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded bg-red-500/80 text-white text-[10px] font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Dynamic neural updates tuned to your progression
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-medium text-muted-foreground hover:text-white"
                    onClick={() => setShowAlerts(!showAlerts)}
                >
                    {showAlerts ? 'Collapse' : 'Expand'}
                </Button>
            </div>

            <AnimatePresence>
                {showAlerts && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        {alerts.length === 0 ? (
                            <div className="text-center py-10 rounded-lg bg-black/40 border border-white/5">
                                <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-medium text-muted-foreground">Silence in the Nexus</p>
                                <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-widest">Awaiting new data stream</p>
                            </div>
                        ) : (
                            alerts.map((alert, i) => {
                                const Icon = getAlertIcon(alert.type);
                                const styles = getAlertStyles(alert.type);

                                return (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`p-4 rounded-lg border transition-all relative group ${styles} ${alert.read ? 'opacity-40 grayscale-[0.5] hover:opacity-80 hover:grayscale-0' : 'bg-opacity-10 shadow-lg shadow-black/20'}`}
                                    >
                                        {!alert.read && (
                                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                        )}

                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded bg-black/40 border border-white/5 flex-shrink-0">
                                                <Icon className="w-4 h-4" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h5 className="font-bold text-sm leading-tight">{alert.title}</h5>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            dismissAlert(alert.id);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded flex-shrink-0"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <p className="text-xs opacity-90 leading-relaxed mb-3">
                                                    {alert.message}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] uppercase font-medium opacity-60">
                                                        {formatTimestamp(alert.timestamp)}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        {!alert.read && (
                                                            <button
                                                                onClick={() => markAsRead(alert.id)}
                                                                className="text-[10px] uppercase font-bold hover:underline"
                                                            >
                                                                Acknowledge
                                                            </button>
                                                        )}
                                                        {alert.actionText && (
                                                            <button className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-[10px] uppercase font-bold hover:bg-white/20 transition-colors">
                                                                {alert.actionText}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Insight Placeholder */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between group cursor-pointer hover:border-white/10"
            >
                <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-muted-foreground group-hover:text-neon-blue transition-colors" />
                    <div>
                        <h5 className="font-bold text-xs">Neural Optimization</h5>
                        <p className="text-[10px] text-muted-foreground">Signal filtering active</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold">Tune</Button>
            </motion.div>
        </div>
    );
};
