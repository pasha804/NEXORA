import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy, Users, Calendar, ArrowLeft, Zap, Info,
    CheckCircle2, Loader2, ShieldCheck, Medal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { BracketVisualization } from "./BracketVisualization";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

interface TournamentDetails {
    id: number;
    name: string;
    description: string;
    skill_id: string;
    tournament_type: string;
    max_players: number;
    status: string;
    registration_open?: string;
    registration_close?: string;
    start_time?: string;
    participant_count: number;
}

export const TournamentDashboard = ({ tournamentId, onBack }: { tournamentId: number, onBack: () => void }) => {
    const { token, user } = useAuth();
    const [tournament, setTournament] = useState<TournamentDetails | null>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [userRegistered, setUserRegistered] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [tournamentId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/tournaments/${tournamentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTournament(data);
            }

            const matchRes = await fetch(`${API_URL}/tournaments/${tournamentId}/bracket`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (matchRes.ok) {
                setMatches(await matchRes.json());
            }

            // Check if user is registered (using leaderboard as proxy for now)
            const lbRes = await fetch(`${API_URL}/tournaments/${tournamentId}/leaderboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (lbRes.ok) {
                const lb = await lbRes.json();
                if (user) {
                    setUserRegistered(lb.some((p: any) => p.user_id === user.id));
                }
            }

        } catch (error) {
            toast.error("Failed to load tournament details");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (isRegistering) return;
        setIsRegistering(true);
        try {
            const res = await fetch(`${API_URL}/tournaments/${tournamentId}/register`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("🎯 Successfully registered for tournament!");
                setUserRegistered(true);
                fetchDetails();
            } else {
                const err = await res.json();
                toast.error(err.detail || "Registration failed");
            }
        } catch (error) {
            toast.error("Connection error");
        } finally {
            setIsRegistering(false);
        }
    };

    if (loading || !tournament) {
        return (
            <div className="flex items-center justify-center py-40">
                <Loader2 className="w-8 h-8 animate-spin text-neon-gold" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 pb-20"
        >
            {/* Top Bar */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold text-white">{tournament.name}</h2>
                    <p className="text-sm text-neon-gold uppercase tracking-tighter flex items-center gap-2">
                        {tournament.skill_id || "Cross-Platform"} Championship • {tournament.tournament_type.replace("_", " ")}
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Left Sidebar: Info & Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 border-white/5 space-y-6">
                        <div className="aspect-square rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-grid-white/[0.05]" />
                            <Trophy className="w-20 h-20 text-neon-gold/50 group-hover:scale-110 transition-transform duration-500" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Participants</span>
                                <span className="text-white font-bold">{tournament.participant_count} / {tournament.max_players}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Skill Tier</span>
                                <span className="text-white font-bold">Open</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Status</span>
                                <span className={`font-bold uppercase ${tournament.status === "in_progress" ? "text-red-400" : "text-neon-green"
                                    }`}>{tournament.status.replace("_", " ")}</span>
                            </div>
                        </div>

                        {!userRegistered ? (
                            <Button
                                onClick={handleRegister}
                                disabled={isRegistering || tournament.status !== "upcoming" && tournament.status !== "registration_open"}
                                className="w-full h-12 bg-neon-gold text-black font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(255,184,0,0.2)]"
                            >
                                {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : "JOIN TOURNAMENT"}
                            </Button>
                        ) : (
                            <div className="bg-neon-green/10 border border-neon-green/30 rounded-xl p-4 text-center">
                                <CheckCircle2 className="w-6 h-6 text-neon-green mx-auto mb-2" />
                                <p className="text-sm font-bold text-neon-green">REGISTERED</p>
                                <p className="text-[10px] text-gray-500 mt-1 uppercase">Ready for Battle</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Rewards Preview */}
                    <div className="glass-card p-6 border-white/5">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Championship Rewards</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-neon-gold/10 flex items-center justify-center text-neon-gold border border-neon-gold/20">
                                    <Medal className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">2,000 XP</p>
                                    <p className="text-[10px] text-gray-500">Tournament Champion</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 opacity-50">
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-gray-400">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Unique Badge</p>
                                    <p className="text-[10px] text-gray-500">Hall of Legends</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Bracket */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card p-8 border-white/5 min-h-[600px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-neon-blue" /> Competition Bracket
                            </h3>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> Live</div>
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-600" /> Pending</div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto pb-8 custom-scrollbar">
                            {matches.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 italic py-20">
                                    <Users className="w-12 h-12 mb-4" />
                                    <p>Tournament has not started yet.</p>
                                    <p className="text-sm">Bracket will be generated once registration closes.</p>
                                </div>
                            ) : (
                                <BracketVisualization matches={matches} participantsCount={tournament.participant_count} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
