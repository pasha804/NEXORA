import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swords, Trophy, Flame, Shield, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getRankInfo } from "@/lib/rankSystem";
import { RankBadge, RankCard } from "@/components/ui/RankBadge";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

interface PvPStatsProps {
    stats?: any;
    userId?: number;
}

export const PvPStats = ({ stats, userId }: PvPStatsProps) => {
    const { token } = useAuth();
    const [pvpData, setPvpData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId || !token) return;
        setLoading(true);
        fetch(`${API_URL}/pvp/status`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setPvpData(data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [userId, token]);

    const rp = pvpData?.mmr ?? 99999;  // fallback to max if no PvP data yet
    const wins = pvpData?.wins ?? stats?.battle_wins ?? 0;
    const losses = pvpData?.losses ?? stats?.battle_losses ?? 0;
    const streak = pvpData?.current_streak ?? 0;
    const matches = pvpData?.total_matches ?? (wins + losses);
    const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
    const rankInfo = getRankInfo(rp);

    if (!matches && !pvpData) {
        return (
            <div className="glass-card p-6 space-y-4 border-red-500/10 opacity-70">
                <div className="flex justify-between items-center">
                    <h3 className="font-display font-bold text-xl flex items-center gap-2 text-red-500/50">
                        <Swords className="w-5 h-5" />
                        Competitive Stats
                    </h3>
                </div>
                <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-red-500/20 rounded-xl">
                    No competitive history yet. Join a PvP battle to start ranking!
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 space-y-5"
            style={{
                borderColor: rankInfo.glowColor,
                background: `linear-gradient(135deg, ${rankInfo.glowColor.replace(")", ", 0.05)")} 0%, transparent 100%)`,
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl flex items-center gap-2">
                    <Swords className="w-5 h-5 text-red-400" />
                    Competitive Stats
                </h3>
                <RankBadge rp={rp} size="sm" showStars animated />
            </div>

            {/* Rank Card */}
            <RankCard rp={rp} wins={wins} losses={losses} streak={streak} />

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-black/20 text-center border border-white/5">
                    <div className={`text-2xl font-bold ${winRate >= 50 ? "text-green-400" : "text-red-400"}`}>
                        {winRate}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Win Rate</div>
                </div>
                <div className="p-3 rounded-xl bg-black/20 text-center border border-white/5">
                    <div className="text-2xl font-bold text-white">{matches}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Matches</div>
                </div>
                <div className="p-3 rounded-xl bg-black/20 text-center border border-white/5">
                    <div className={`text-2xl font-bold ${streak > 0 ? "text-orange-400" : streak < 0 ? "text-red-400" : "text-white"}`}>
                        {Math.abs(streak)}{streak > 0 ? "🔥" : streak < 0 ? "❄️" : ""}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Streak</div>
                </div>
            </div>

            {/* RP info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-white/5">
                <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {rp.toLocaleString()} RP total
                </span>
                {pvpData?.highest_mmr && pvpData.highest_mmr > rp && (
                    <span className="flex items-center gap-1 text-yellow-400/70">
                        <Trophy className="w-3 h-3" />
                        Peak: {pvpData.highest_mmr.toLocaleString()} RP
                    </span>
                )}
            </div>
        </motion.div>
    );
};
