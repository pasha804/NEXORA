import { useState, useEffect } from "react";
import { Trophy, Zap, Flame } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

interface PvPStats {
    mmr: number;
    rank: string;
    wins: number;
    losses: number;
    win_rate: number;
    current_streak: number;
    total_matches: number;
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

    const rank = stats?.rank || user?.rank || "Novice";
    const mmr = stats?.mmr || 1000;
    const streak = stats?.current_streak ?? 0;
    const streakLabel = streak > 0 ? `${streak} Win Streak` : streak < 0 ? `${Math.abs(streak)} Loss Streak` : "No Streak";

    return (
        <section className="relative overflow-hidden rounded-3xl p-8 md:p-12 border border-neon-blue/30 bg-black/40 mb-8 group">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80')] opacity-20 mix-blend-overlay bg-cover bg-center" />
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent shadow-[0_0_20px_rgba(0,240,255,0.5)]" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-neon-purple/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-neon-blue/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
                <div className="text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-xs font-bold tracking-wider mb-6 shadow-glow">
                        <Zap className="w-3 h-3 animate-pulse" />
                        SEASON 4 LIVE
                    </div>

                    <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
                        PVP <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-white to-neon-purple text-glow">ARENA</span>
                    </h1>

                    <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                        Battle for dominance in <span className="text-white font-medium">real-time skill challenges</span>.
                        Code, design, and compete to become a <span className="text-neon-gold font-bold">Nexora Legend</span>.
                    </p>

                    {/* Live User Stats */}
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4 hover:border-neon-purple/50 transition-colors group/stat cursor-default shadow-lg">
                            <div className="h-12 w-12 rounded-full bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple group-hover/stat:scale-110 transition-transform">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Current Rank</p>
                                <p className="text-xl font-bold text-white group-hover/stat:text-neon-purple transition-colors">{rank}</p>
                            </div>
                        </div>

                        <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4 hover:border-neon-green/50 transition-colors group/stat cursor-default shadow-lg">
                            <div className="h-12 w-12 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center text-neon-green group-hover/stat:scale-110 transition-transform">
                                <Flame className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                    {streak > 0 ? "Win Streak" : streak < 0 ? "Loss Streak" : "Streak"}
                                </p>
                                <p className={`text-xl font-bold group-hover/stat:text-neon-green transition-colors ${streak > 0 ? "text-neon-green" : streak < 0 ? "text-red-400" : "text-white"}`}>
                                    {Math.abs(streak)} {streak !== 0 ? "Games" : "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MMR Card */}
                <div className="relative hidden lg:block">
                    <div className="aspect-video rounded-2xl bg-gradient-to-br from-black to-zinc-900 border border-white/10 flex items-center justify-center backdrop-blur-sm relative overflow-hidden group/card shadow-2xl">
                        <div className="absolute inset-0 border border-neon-blue/20 rounded-2xl opacity-50" />
                        <div className="absolute inset-4 border border-neon-purple/20 rounded-xl opacity-30" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-neon-blue/20 blur-[50px] group-hover/card:bg-neon-blue/30 transition-colors" />

                        <div className="text-center relative z-10">
                            <h3 className="text-2xl font-display font-bold text-gray-300 mb-2 uppercase tracking-widest">Skill Rating</h3>
                            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_0_25px_rgba(0,240,255,0.3)]">
                                {mmr.toLocaleString()}
                            </div>
                            {stats && (
                                <div className="mt-2 text-xs text-gray-400 font-mono">
                                    {stats.wins}W · {stats.losses}L · {stats.win_rate}% WR
                                </div>
                            )}
                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-neon-blue/10 rounded border border-neon-blue/30 text-neon-blue text-xs font-mono">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue"></span>
                                </span>
                                {rank.toUpperCase()} TIER
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
