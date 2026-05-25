import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, Flame, Shield, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getRankInfo } from "@/lib/rankSystem";
import { RankBadge, RankStars, RankCard } from "@/components/ui/RankBadge";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

interface PvPStats {
    mmr: number;
    rank: string;
    wins: number;
    losses: number;
    win_rate: number;
    current_streak: number;
    total_matches: number;
    highest_mmr?: number;
}

export const PvPHero = () => {
    const { token, user } = useAuth();
    const [stats, setStats] = useState<PvPStats | null>(null);

    useEffect(() => {
        if (!token) return;
        fetch(`${API_URL}/pvp/status`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setStats(data); })
            .catch(() => { });
    }, [token]);

    const rp = stats?.mmr ?? 1000;
    const rankInfo = getRankInfo(rp);
    const streak = stats?.current_streak ?? 0;
    const wins = stats?.wins ?? 0;
    const losses = stats?.losses ?? 0;
    const winRate = stats?.win_rate ?? 0;

    return (
        <section className="relative overflow-hidden rounded-3xl p-8 md:p-12 border mb-8"
            style={{
                borderColor: rankInfo.glowColor,
                background: `linear-gradient(135deg, ${rankInfo.glowColor.replace(")", ", 0.08)")} 0%, rgba(0,0,0,0.6) 100%)`,
                boxShadow: `0 0 40px ${rankInfo.glowColor.replace(")", ", 0.15)")}`,
            }}
        >
            {/* Background grid */}
            <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 rounded-t-3xl"
                style={{ background: `linear-gradient(90deg, transparent, ${rankInfo.glowColor}, transparent)` }}
            />

            {/* Ambient glow orbs */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-20"
                style={{ background: rankInfo.glowColor }}
            />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-10"
                style={{ background: rankInfo.glowColor }}
            />

            <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
                {/* Left — Title + Stats */}
                <div className="text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-wider mb-6"
                        style={{ borderColor: rankInfo.glowColor, color: rankInfo.glowColor.replace("rgba", "rgb").replace(/, [\d.]+\)/, ")") }}
                    >
                        <Zap className="w-3 h-3 animate-pulse" />
                        SEASON 4 LIVE
                    </div>

                    <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 text-white leading-tight">
                        PVP <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-white to-neon-purple">ARENA</span>
                    </h1>

                    <p className="text-gray-400 text-lg mb-6 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                        Battle for dominance in <span className="text-white font-medium">real-time skill challenges</span>.
                        Climb from <span className="text-orange-400 font-bold">Bronze</span> to{" "}
                        <span className="text-amber-300 font-bold">Grandmaster</span>.
                    </p>

                    {/* Current rank badge */}
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
                        <RankBadge rp={rp} size="lg" showStars showRP animated />
                    </div>

                    {/* Quick stats */}
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                        <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <div className="text-left">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Win Rate</p>
                                <p className={`text-lg font-bold ${winRate >= 50 ? "text-green-400" : "text-red-400"}`}>
                                    {winRate}%
                                </p>
                            </div>
                        </div>

                        <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-3">
                            <Flame className={`w-5 h-5 ${streak > 0 ? "text-orange-400" : "text-blue-400"}`} />
                            <div className="text-left">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                    {streak > 0 ? "Win Streak" : streak < 0 ? "Loss Streak" : "Streak"}
                                </p>
                                <p className={`text-lg font-bold ${streak > 0 ? "text-orange-400" : streak < 0 ? "text-red-400" : "text-white"}`}>
                                    {Math.abs(streak)} {streak !== 0 ? "🔥" : "—"}
                                </p>
                            </div>
                        </div>

                        <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-3">
                            <Shield className="w-5 h-5 text-blue-400" />
                            <div className="text-left">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Matches</p>
                                <p className="text-lg font-bold text-white">{wins + losses}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Rank Card */}
                <div className="hidden lg:block">
                    <RankCard
                        rp={rp}
                        wins={wins}
                        losses={losses}
                        streak={streak}
                    />

                    {/* RP gain preview */}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                            <p className="text-green-400 font-bold">+30 to +55</p>
                            <p className="text-muted-foreground">Win RP</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                            <p className="text-blue-400 font-bold">+5</p>
                            <p className="text-muted-foreground">Draw RP</p>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                            <p className="text-red-400 font-bold">-20</p>
                            <p className="text-muted-foreground">Loss RP</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
