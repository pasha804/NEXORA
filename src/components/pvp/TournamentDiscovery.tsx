import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Calendar, Users, Zap, ArrowRight, Loader2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

interface Tournament {
    id: number;
    name: string;
    description: string;
    skill_id: string;
    tournament_type: string;
    max_players: number;
    status: "upcoming" | "registration_open" | "in_progress" | "completed" | "cancelled";
    registration_open?: string;
    registration_close?: string;
    start_time?: string;
    participant_count: number;
}

export const TournamentDiscovery = ({ onSelectTournament }: { onSelectTournament: (id: number) => void }) => {
    const { token } = useAuth();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/tournaments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTournaments(data);
            }
        } catch (error) {
            toast.error("Failed to load tournaments");
        } finally {
            setLoading(false);
        }
    };

    const filteredTournaments = tournaments.filter(t => {
        if (filter === "all") return true;
        if (filter === "live") return t.status === "in_progress";
        if (filter === "upcoming") return t.status === "upcoming" || t.status === "registration_open";
        if (filter === "completed") return t.status === "completed";
        return true;
    });

    return (
        <div className="space-y-8">
            {/* Header / Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-neon-gold" /> Tournament Arena
                    </h2>
                    <p className="text-sm text-gray-400">Join elite competitions and win legendary rewards.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-neon-blue/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-black/60 border border-white/10 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-neon-blue relative z-10"
                        >
                            <option value="all">All Events</option>
                            <option value="live">Live Now</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="completed">Finished</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
                </div>
            ) : filteredTournaments.length === 0 ? (
                <div className="glass-card p-20 text-center border-white/5 mx-auto max-w-2xl">
                    <Trophy className="w-16 h-16 mx-auto mb-6 opacity-10 text-white" />
                    <h3 className="text-xl font-bold text-white mb-2">No Tournaments Found</h3>
                    <p className="text-gray-400 mb-8">Check back later or change your filter settings.</p>
                    <Button variant="outline" onClick={() => setFilter("all")}>Clear Filters</Button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTournaments.map((t, idx) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="glass-card p-0 border-white/5 overflow-hidden group hover:border-neon-gold/50 transition-all flex flex-col"
                        >
                            {/* Banner Image / Skill Indicator */}
                            <div className="h-24 bg-gradient-to-br from-zinc-900 to-black relative">
                                <div className="absolute inset-0 bg-grid-white/[0.05]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 rounded-full bg-neon-gold/20 border border-neon-gold/30 text-neon-gold text-[10px] font-bold uppercase tracking-widest">
                                        {t.skill_id || "Championship"}
                                    </span>
                                </div>
                                <div className="absolute bottom-3 right-4 flex items-center gap-1 text-[10px] text-gray-400">
                                    <Users className="w-3 h-3" /> {t.participant_count}/{t.max_players}
                                </div>
                            </div>

                            <div className="p-6 space-y-4 flex-1 flex flex-col">
                                <div>
                                    <h4 className="text-lg font-bold text-white group-hover:text-neon-gold transition-colors">{t.name}</h4>
                                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                                        {t.description || "Compete for dominance in this high-stakes tournament."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Start Time</p>
                                        <div className="flex items-center gap-2 text-xs text-white">
                                            <Calendar className="w-3.5 h-3.5 text-neon-blue" />
                                            {t.start_time ? new Date(t.start_time).toLocaleDateString() : "TBA"}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Status</p>
                                        <div className={`flex items-center gap-2 text-xs font-bold uppercase ${t.status === "in_progress" ? "text-red-400" :
                                            t.status === "registration_open" ? "text-neon-green" :
                                                t.status === "completed" ? "text-gray-400" : "text-neon-blue"
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${t.status === "in_progress" ? "bg-red-500 animate-pulse" :
                                                t.status === "registration_open" ? "bg-neon-green" : "bg-gray-500"
                                                }`} />
                                            {t.status.replace("_", " ")}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 mt-auto">
                                    <Button
                                        onClick={() => onSelectTournament(t.id)}
                                        className={`w-full group/btn ${t.status === "completed" ? "bg-white/5 hover:bg-white/10" : "bg-white/10 hover:bg-neon-gold hover:text-black"
                                            } border-white/10 transition-all font-bold text-xs h-10`}
                                    >
                                        {t.status === "completed" ? "View Results" : "Enter Arena"}
                                        <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
