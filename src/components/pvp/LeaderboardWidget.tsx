import { useEffect, useState } from "react";
import { Crown, Trophy, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

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

export const LeaderboardWidget = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/pvp/leaderboard?limit=10`);
            if (!response.ok) throw new Error("Failed to fetch leaderboard");
            const data = await response.json();
            setLeaderboard(data);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-0 border-neon-gold/30 relative overflow-hidden flex flex-col h-full bg-black/20">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-white/5 relative z-10 bg-gradient-to-b from-neon-gold/5 to-transparent">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Crown className="w-24 h-24 text-neon-gold" /></div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-neon-gold" /> Global Rankings
                </h2>
                <p className="text-xs text-muted-foreground mt-1">MMR-Based · Season 4</p>
            </div>

            <div className="flex-1 overflow-auto scrollbar-thin scroll-container p-4 space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading rankings...
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No ranked players yet. Be the first!
                    </div>
                ) : (
                    leaderboard.map((p, i) => {
                        const isMe = user?.id === p.user_id;
                        return (
                            <div
                                key={p.user_id}
                                className={`group flex items-center gap-3 p-3 rounded-xl transition-all border ${isMe
                                    ? "bg-neon-blue/10 border-neon-blue/40 shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                                    : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/10"
                                    }`}
                            >
                                <div className={`w-8 h-8 flex items-center justify-center font-black text-sm rounded-lg ${i === 0 ? "bg-gradient-to-br from-yellow-300 to-yellow-600 text-black shadow-lg shadow-yellow-500/20" :
                                        i === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-black shadow-lg shadow-slate-500/20" :
                                            i === 2 ? "bg-gradient-to-br from-orange-300 to-orange-600 text-black shadow-lg shadow-orange-500/20" :
                                                "text-muted-foreground bg-white/5"
                                    }`}>
                                    {i < 3 ? <Crown className="w-4 h-4" /> : `#${p.rank}`}
                                </div>

                                <Avatar className={`w-10 h-10 border-2 ${isMe ? "border-neon-blue" : "border-transparent group-hover:border-white/20"}`}>
                                    <AvatarImage src={p.avatar_url || undefined} />
                                    <AvatarFallback className="bg-zinc-800 text-xs font-bold">{(p.display_name || p.username)[0]}</AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate ${isMe ? "text-neon-blue" : "text-white"}`}>
                                        {p.display_name || p.username} {isMe && <span className="text-[10px] text-neon-blue/70 ml-1">(You)</span>}
                                    </p>
                                    <p className="text-[10px] text-gray-400">{p.tier} · {p.win_rate}% WR</p>
                                </div>

                                <div className="text-right">
                                    <div className="text-sm font-mono font-bold text-white group-hover:text-neon-gold transition-colors">
                                        {p.mmr.toLocaleString()}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">MMR</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-4 border-t border-white/5 bg-white/5 mt-auto">
                <Button variant="ghost" onClick={fetchLeaderboard} className="w-full text-xs text-muted-foreground hover:text-white hover:bg-white/5">
                    Refresh Rankings
                </Button>
            </div>
        </div>
    );
};
