import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Trophy, Loader2, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getRankInfo } from "@/lib/rankSystem";
import { RankBadge } from "@/components/ui/RankBadge";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

interface LeaderboardEntry {
    rank: number;
    user_id: number;
    username: string;
    display_name: string;
    avatar_url?: string | null;
    mmr: number;
    tier: string;
    wins: number;
    losses: number;
    win_rate: number;
    matches_played: number;
    current_streak: number;
    level: number;
}

const POSITION_STYLES = [
    { bg: "from-yellow-500/20 to-yellow-600/10", border: "border-yellow-500/40", crown: "text-yellow-400", label: "#1" },
    { bg: "from-slate-400/20 to-slate-500/10",   border: "border-slate-400/40",  crown: "text-slate-300",  label: "#2" },
    { bg: "from-orange-500/20 to-orange-600/10", border: "border-orange-500/40", crown: "text-orange-400", label: "#3" },
];

export const LeaderboardWidget = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchLeaderboard(); }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/pvp/leaderboard?limit=10`);
            if (!response.ok) throw new Error("Failed to fetch leaderboard");
            setLeaderboard(await response.json());
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-0 border-neon-gold/20 relative overflow-hidden flex flex-col h-full bg-black/20">
            {/* Header */}
            <div className="p-5 pb-3 border-b border-white/5 relative z-10 bg-gradient-to-b from-yellow-500/5 to-transparent">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Crown className="w-24 h-24 text-yellow-400" />
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Global Rankings
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">RP-Based · Season 4</p>
            </div>

            <div className="flex-1 overflow-auto p-3 space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No ranked players yet. Be the first!
                    </div>
                ) : (
                    leaderboard.map((p, i) => {
                        const isMe = user?.id === p.user_id;
                        const rankInfo = getRankInfo(p.mmr);
                        const posStyle = POSITION_STYLES[i] ?? null;

                        return (
                            <motion.div
                                key={p.user_id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className={`group flex items-center gap-3 p-3 rounded-xl transition-all border ${
                                    isMe
                                        ? "border-primary/40 bg-primary/5 shadow-[0_0_12px_rgba(0,240,255,0.1)]"
                                        : posStyle
                                        ? `bg-gradient-to-r ${posStyle.bg} ${posStyle.border}`
                                        : "bg-black/30 border-white/5 hover:border-white/15 hover:bg-white/5"
                                }`}
                            >
                                {/* Position */}
                                <div className={`w-8 h-8 flex items-center justify-center font-black text-sm rounded-lg shrink-0 ${
                                    i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                                    i === 1 ? "bg-slate-400/20 text-slate-300" :
                                    i === 2 ? "bg-orange-500/20 text-orange-400" :
                                    "bg-white/5 text-muted-foreground"
                                }`}>
                                    {i < 3 ? <Crown className="w-4 h-4" /> : `#${p.rank}`}
                                </div>

                                {/* Avatar */}
                                <Avatar className={`w-9 h-9 border-2 shrink-0 ${
                                    isMe ? "border-primary" : "border-transparent group-hover:border-white/20"
                                }`}
                                    style={i < 3 ? { borderColor: rankInfo.glowColor } : undefined}
                                >
                                    <AvatarImage src={p.avatar_url || undefined} />
                                    <AvatarFallback className="bg-zinc-800 text-xs font-bold">
                                        {(p.display_name || p.username)[0]}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate ${isMe ? "text-primary" : "text-white"}`}>
                                        {p.display_name || p.username}
                                        {isMe && <span className="text-[10px] text-primary/60 ml-1">(You)</span>}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <RankBadge rp={p.mmr} size="xs" animated={false} />
                                        <span className="text-[10px] text-muted-foreground">
                                            {p.win_rate}% WR
                                        </span>
                                    </div>
                                </div>

                                {/* RP */}
                                <div className="text-right shrink-0">
                                    <div className={`text-sm font-mono font-bold ${rankInfo.color}`}>
                                        {p.mmr.toLocaleString()}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">RP</span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            <div className="p-3 border-t border-white/5 bg-white/[0.02]">
                <Button
                    variant="ghost"
                    onClick={fetchLeaderboard}
                    className="w-full text-xs text-muted-foreground hover:text-white hover:bg-white/5 gap-2"
                >
                    <TrendingUp className="w-3 h-3" />
                    Refresh Rankings
                </Button>
            </div>
        </div>
    );
};
