import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Trophy, Target } from "lucide-react";

interface AnalyticsData {
    xp_growth: { date: string; xp: number }[];
    battle_stats: {
        total_matches: number;
        wins: number;
        losses: number;
        win_rate: number;
        current_streak: number;
    };
    skill_progression: {
        skill: string;
        week1: number;
        week2: number;
        week3: number;
        week4: number;
    }[];
    weekly_improvement: number;
}

export const PerformanceAnalytics = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/ai/performance-analytics`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const analytics = await res.json();
                setData(analytics);
            }
        } catch (err) {
            console.error("AI performance analytics fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) return <div className="glass-card p-12 text-center animate-pulse text-muted-foreground border-neon-blue/20">Synthesizing performance neural data...</div>;
    if (!data) return null;

    const maxXP = Math.max(...data.xp_growth.map(d => d.xp));

    return (
        <div className="glass-card p-6">
            <div className="mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                    Neural Analytics
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Longitudinal tracking of your cognitive growth and competitive efficiency
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-3 sm:p-4 rounded-lg bg-black/40 border border-neon-blue/20 hover:border-neon-blue/40 transition-colors"
                >
                    <Zap className="w-5 h-5 sm:w-8 sm:h-8 text-neon-blue mb-2" />
                    <div className="text-lg sm:text-2xl font-bold text-neon-blue">
                        {data.xp_growth[data.xp_growth.length - 1].xp}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total XP</div>
                    <div className="text-[10px] text-green-400 mt-1 font-bold">↑ {data.weekly_improvement}%</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="p-3 sm:p-4 rounded-lg bg-black/40 border border-green-400/20 hover:border-green-400/40 transition-colors"
                >
                    <Trophy className="w-5 h-5 sm:w-8 sm:h-8 text-green-400 mb-2" />
                    <div className="text-lg sm:text-2xl font-bold text-green-400">
                        {data.battle_stats.wins}/{data.battle_stats.total_matches}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">W/L Record</div>
                    <div className="text-[10px] text-green-400 mt-1 font-bold">{data.battle_stats.win_rate}% Efficiency</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-3 sm:p-4 rounded-lg bg-black/40 border border-purple-400/20 hover:border-purple-400/40 transition-colors"
                >
                    <Target className="w-5 h-5 sm:w-8 sm:h-8 text-purple-400 mb-2" />
                    <div className="text-lg sm:text-2xl font-bold text-purple-400">
                        {data.battle_stats.current_streak}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Streak Index</div>
                    <div className="text-[10px] text-purple-400 mt-1 font-bold">🔥 Momentum High</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 }}
                    className="p-3 sm:p-4 rounded-lg bg-black/40 border border-yellow-400/20 hover:border-yellow-400/40 transition-colors"
                >
                    <TrendingUp className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-400 mb-2" />
                    <div className="text-lg sm:text-2xl font-bold text-yellow-400">
                        Top 5%
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Growth Tier</div>
                    <div className="text-[10px] text-yellow-400 mt-1 font-bold">Elite Trajectory</div>
                </motion.div>
            </div>

            {/* XP Growth Chart */}
            <div className="mb-8">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                    <Zap className="w-4 h-4 text-neon-blue" />
                    Accumulation Velocity
                </h4>
                <div className="space-y-4">
                    {data.xp_growth.map((point, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-14 text-[10px] text-muted-foreground uppercase font-bold">
                                {point.date.split('-').slice(1).join('/')}
                            </div>
                            <div className="flex-1">
                                <div className="h-4 bg-black/50 rounded-full overflow-hidden relative border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(point.xp / maxXP) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.3 + i * 0.05 }}
                                        className="h-full bg-gradient-to-r from-neon-blue via-purple-500 to-transparent rounded-full shadow-[0_0_10px_rgba(0,163,255,0.3)]"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-end px-3">
                                        <span className="text-[9px] font-bold text-white/50 group-hover:text-white transition-colors">
                                            {point.xp} XP
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Skill Progression */}
            <div>
                <h4 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                    <Target className="w-4 h-4 text-purple-400" />
                    Multi-Dimensional Progression
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.skill_progression.map((skill, i) => {
                        const improvement = skill.week4 - skill.week1;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="p-4 rounded-lg bg-black/40 border border-white/5 group hover:border-white/10 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h5 className="font-bold text-sm tracking-tight">{skill.skill}</h5>
                                    <div className="text-[10px] font-bold py-0.5 px-2 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">
                                        +{improvement}%
                                    </div>
                                </div>
                                <div className="flex items-end justify-between h-16 gap-2 px-1">
                                    {[
                                        { week: "W1", value: skill.week1 },
                                        { week: "W2", value: skill.week2 },
                                        { week: "W3", value: skill.week3 },
                                        { week: "W4", value: skill.week4 }
                                    ].map((w, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full bg-black/60 rounded-sm relative h-12 overflow-hidden">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${w.value}%` }}
                                                    transition={{ duration: 0.8, delay: 0.4 + i * 0.1 + idx * 0.1 }}
                                                    className="absolute bottom-0 w-full bg-gradient-to-t from-neon-blue/40 to-neon-blue group-hover:from-purple-500/40 group-hover:to-purple-500 transition-colors"
                                                />
                                            </div>
                                            <div className="text-[8px] text-muted-foreground font-bold">{w.week}</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* AI Insight */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-400/5 to-transparent border border-green-400/10"
            >
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                    🤖 <span className="text-green-400 font-bold uppercase tracking-wider mr-1">Nexus Insight:</span> Your algorithmic reasoning capacity is hitting peak efficiency. We recommend escalating to Tier-3 challenges.
                </p>
            </motion.div>
        </div>
    );
};
