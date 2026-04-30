import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Clock, Loader2, Swords } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

interface LiveMatch {
    id: string;
    battle_type: string;
    skill_id: string;
    player1: { username: string; avatar_url?: string | null };
    player2: { username: string; avatar_url?: string | null };
    elapsed_time: string;
    spectator_count: number;
}

const BATTLE_TYPE_LABELS: Record<string, string> = {
    code_challenge: "Code Challenge",
    knowledge_quiz: "Knowledge Quiz",
    problem_solving: "Problem Solving",
    timed_challenge: "Timed Challenge",
};

export const LiveMatchesSlider = () => {
    const [matches, setMatches] = useState<LiveMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLiveMatches();
        // Refresh every 30 seconds
        const interval = setInterval(fetchLiveMatches, 30_000);
        return () => clearInterval(interval);
    }, []);

    const fetchLiveMatches = async () => {
        try {
            const res = await fetch(`${API_URL}/pvp/matches/live`);
            if (res.ok) {
                const data = await res.json();
                setMatches(data);
            }
        } catch {
            // silently ignore
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="mb-12 flex items-center justify-center py-8 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading live matches...
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div className="mb-12">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
                    </span>
                    Live Matches <span className="text-sm font-normal text-muted-foreground ml-2">(0 active)</span>
                </h2>
                <div className="glass-card p-8 border-white/5 text-center text-gray-500">
                    <Swords className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No live matches right now.</p>
                    <p className="text-sm mt-1">Start a battle to be the first!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Live Matches <span className="text-sm font-normal text-muted-foreground ml-2">({matches.length} active)</span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {matches.map((match, i) => (
                    <motion.div
                        key={match.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ delay: i * 0.08 }}
                        className="glass-card p-0 border-white/5 hover:border-neon-blue/40 group cursor-pointer relative overflow-hidden flex flex-col"
                    >
                        {/* Match Banner */}
                        <div className="h-16 bg-gradient-to-br from-black to-zinc-900 relative">
                            <div className="absolute inset-0 bg-grid-white/[0.05]" />
                            <div className="absolute top-2 right-2 text-[10px] font-mono font-bold text-red-400 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full border border-red-500/20">
                                <Clock className="w-3 h-3" /> {match.elapsed_time}
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </div>

                        <div className="p-4 relative">
                            {/* VS badge */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-white/10 text-[10px] font-black italic px-2 py-1 rounded-lg text-muted-foreground shadow-xl z-10">VS</div>

                            <div className="flex justify-between items-start mb-4 mt-2">
                                <div className="text-center w-1/2 pr-2 border-r border-white/5">
                                    <Avatar className="w-12 h-12 border-2 border-neon-blue/50 mx-auto mb-2 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                                        <AvatarImage src={match.player1.avatar_url || undefined} />
                                        <AvatarFallback className="bg-zinc-900 text-neon-blue">{(match.player1.username || "P")[0]}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-xs font-bold text-white truncate">{match.player1.username}</p>
                                </div>
                                <div className="text-center w-1/2 pl-2">
                                    <Avatar className="w-12 h-12 border-2 border-neon-pink/50 mx-auto mb-2 shadow-[0_0_10px_rgba(255,46,209,0.2)]">
                                        <AvatarImage src={match.player2.avatar_url || undefined} />
                                        <AvatarFallback className="bg-zinc-900 text-neon-pink">{(match.player2.username || "P")[0]}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-xs font-bold text-white truncate">{match.player2.username}</p>
                                </div>
                            </div>

                            <div className="text-center mt-auto">
                                <div className="inline-block px-3 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-300 mb-3 border border-white/5">
                                    {BATTLE_TYPE_LABELS[match.battle_type] || match.skill_id}
                                </div>
                                <Button size="sm" className="w-full h-8 text-xs font-bold bg-white/5 hover:bg-white/10 hover:text-neon-blue border border-white/5 transition-all group/btn">
                                    <Eye className="w-3 h-3 mr-2 group-hover/btn:text-neon-blue" />
                                    Spectate ({match.spectator_count})
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
