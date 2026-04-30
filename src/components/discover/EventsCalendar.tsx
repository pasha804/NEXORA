import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Users, Zap, Calendar, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface EventsCalendarProps {
    searchQuery: string;
    filters: any;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

export const EventsCalendar = ({ searchQuery, filters }: EventsCalendarProps) => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("access_token");
                const resp = await fetch(`${API_URL}/pvp/tournaments`, {
                    headers: token ? { "Authorization": `Bearer ${token}` } : {}
                });
                if (resp.ok) {
                    const data = await resp.json();
                    const tournaments = data.tournaments || data || [];
                    // Filter if searchQuery
                    const filtered = searchQuery.trim()
                        ? tournaments.filter((t: any) =>
                            t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.description?.toLowerCase().includes(searchQuery.toLowerCase()))
                        : tournaments;
                    setEvents(filtered);
                }
            } catch (err) {
                console.error("Fetch events error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [searchQuery]);

    const handleRegister = async (e: React.MouseEvent, tournamentId: string) => {
        e.stopPropagation();
        const token = localStorage.getItem("access_token");
        if (!token) return toast.error("Please login to register");
        try {
            const resp = await fetch(`${API_URL}/pvp/tournaments/${tournamentId}/join`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) toast.success("Registered for tournament!");
            else {
                const data = await resp.json();
                toast.error(data.detail || "Registration failed");
            }
        } catch { toast.error("Network error"); }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return { day: "?", month: "TBD" };
        const d = new Date(dateStr);
        return {
            day: d.getDate(),
            month: d.toLocaleString("en", { month: "short" }).toUpperCase()
        };
    };

    const gradients = [
        "from-purple-600 to-pink-600",
        "from-blue-600 to-cyan-600",
        "from-orange-600 to-red-600",
        "from-green-600 to-emerald-600",
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-display text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-pink-400" />
                        Events & Tournaments
                    </h2>
                    <p className="text-sm text-muted-foreground">Compete and win XP rewards</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/pvp")}>
                    <Zap className="w-4 h-4 mr-1" /> Go to PvP
                </Button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="glass-card p-4 flex gap-4 animate-pulse">
                            <div className="w-16 h-16 rounded-lg bg-muted/50 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted/50 rounded w-2/3" />
                                <div className="h-3 bg-muted/50 rounded w-full" />
                                <div className="h-3 bg-muted/50 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : events.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-16 text-center"
                >
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium">No upcoming tournaments</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Check back soon for new events!</p>
                    <Button className="mt-4 gap-2" variant="outline" onClick={() => navigate("/pvp")}>
                        <Zap className="w-4 h-4" />
                        Play PvP Now
                    </Button>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {events.map((event, i) => {
                        const { day, month } = formatDate(event.start_time || event.created_at);
                        const gradient = gradients[i % gradients.length];
                        return (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ x: 4 }}
                                className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-pink-500/40 transition-all"
                            >
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex flex-col items-center justify-center text-white shadow-lg shrink-0`}>
                                    <span className="text-2xl font-bold leading-none">{day}</span>
                                    <span className="text-[10px] uppercase tracking-wider">{month}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold mb-1 truncate">{event.name}</h3>
                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                                        {event.description || "Compete against the best"}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs flex-wrap">
                                        <Badge variant="outline" className="text-[10px]">
                                            {event.status || "Upcoming"}
                                        </Badge>
                                        {event.prize_pool && (
                                            <span className="text-yellow-400 font-medium">💰 {event.prize_pool}</span>
                                        )}
                                        {event.max_participants && (
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {event.current_participants || 0}/{event.max_participants}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    className="shrink-0"
                                    onClick={(e) => handleRegister(e, event.id)}
                                >
                                    Register
                                </Button>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
