import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Flame, Lightbulb } from "lucide-react";

interface TrendingSkill {
    skill: string;
    growth: string;
    demand: 'Very High' | 'High' | 'Medium';
}

interface SalaryTrend {
    role: string;
    salary: string;
    color: string;
}

interface MarketForecast {
    six_months: string;
    twelve_months: string;
    emerging_tech: string[];
}

export const IndustryTrends = () => {
    const [trendingSkills, setTrendingSkills] = useState<TrendingSkill[]>([]);
    const [salaryTrends, setSalaryTrends] = useState<SalaryTrend[]>([]);
    const [forecast, setForecast] = useState<MarketForecast | null>(null);
    const [personalInsight, setPersonalInsight] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

    const fetchTrends = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/ai/industry-trends`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setTrendingSkills(data.trending_skills || []);
                setSalaryTrends(data.salary_benchmarks || []);
                setForecast(data.market_forecast || null);
                setPersonalInsight(data.personal_insight || "");
            }
        } catch (err) {
            console.error("AI industry trends fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrends();
    }, []);

    const getDemandColor = (demand: string) => {
        switch (demand) {
            case 'Very High': return 'text-green-400';
            case 'High': return 'text-yellow-400';
            case 'Medium': return 'text-orange-400';
            default: return 'text-muted-foreground';
        }
    };

    const getDemandIcon = (demand: string) => {
        switch (demand) {
            case 'Very High': return '🔥🔥🔥';
            case 'High': return '🔥🔥';
            case 'Medium': return '🔥';
            default: return '';
        }
    };

    if (loading) return <div className="glass-card p-12 text-center animate-pulse text-muted-foreground border-neon-blue/20">Analyzing global market trends...</div>;

    return (
        <div className="glass-card p-6">
            <div className="mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                    Market Logic
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Real-time global workforce intelligence and emerging sectors
                </p>
            </div>

            {/* Trending Skills */}
            <div className="mb-8">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-red-400" />
                    Momentum Skills
                </h4>
                <div className="space-y-3">
                    {trendingSkills.map((skill, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-black/40 border border-white/5 hover:border-neon-blue/30 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-red-400/10 to-transparent flex items-center justify-center border border-red-400/20 group-hover:border-red-400/40">
                                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                                </div>
                                <div>
                                    <h5 className="font-bold text-sm sm:text-base">{skill.skill}</h5>
                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                                        <span className={getDemandColor(skill.demand)}>
                                            {skill.demand} Demand {getDemandIcon(skill.demand)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-base sm:text-lg font-bold text-green-400">
                                    {skill.growth}
                                </div>
                                <div className="text-[10px] text-muted-foreground">Velocity</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Salary Trends */}
            <div className="mb-8">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    Global Compensation Indices
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {salaryTrends.map((trend, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.05 }}
                            className="p-4 rounded-lg border border-white/5 bg-black/40 hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h5 className="font-bold text-xs mb-1 text-muted-foreground">{trend.role}</h5>
                                    <div className="text-base sm:text-lg font-bold text-white">
                                        {trend.salary}
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <DollarSign className="w-5 h-5 text-green-400" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Market Forecast */}
            {forecast && (
                <div className="mb-6">
                    <h4 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        AI Market Forecast
                    </h4>
                    <div className="space-y-3">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 sm:p-4 rounded-lg bg-black/40 border border-neon-blue/20"
                        >
                            <h5 className="font-bold text-xs text-neon-blue mb-1 tracking-tight uppercase">Short Term (6M)</h5>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {forecast.six_months}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 sm:p-4 rounded-lg bg-black/40 border border-purple-400/20"
                        >
                            <h5 className="font-bold text-xs text-purple-400 mb-1 tracking-tight uppercase">Strategic (12M)</h5>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {forecast.twelve_months}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 sm:p-4 rounded-lg bg-black/40 border border-green-400/20"
                        >
                            <h5 className="font-bold text-xs text-green-400 mb-2 tracking-tight uppercase">Emerging Vectors</h5>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {forecast.emerging_tech.map((tech, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 text-[10px] sm:text-xs font-medium border border-green-400/20"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Personalized Insight */}
            {personalInsight && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="p-4 rounded-lg bg-gradient-to-r from-yellow-400/10 to-transparent border border-yellow-400/20"
                >
                    <p className="text-xs sm:text-sm text-muted-foreground italic leading-snug">
                        🤖 <span className="text-yellow-400 font-bold uppercase tracking-wider mr-1">Nexus Strategy:</span> {personalInsight}
                    </p>
                </motion.div>
            )}
        </div>
    );
};
