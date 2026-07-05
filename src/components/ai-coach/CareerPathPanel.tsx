import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, TrendingUp, Clock, DollarSign, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CareerPath {
    title: string;
    compatibilityScore: number;
    requiredSkills: string[];
    timeToMastery: string;
    marketDemand: 'High' | 'Medium' | 'Low';
    avgSalary: string;
    description: string;
}

export const CareerPathPanel = () => {
    const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
    const [userName, setUserName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const fetchCareerPaths = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/ai/career-predict`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setCareerPaths(data.career_paths || []);
                setUserName(data.user_profile || "");
            }
        } catch (err) {
            console.error("AI career prediction fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCareerPaths();
    }, []);

    const getDemandColor = (demand: string) => {
        switch (demand) {
            case 'High': return 'text-green-400';
            case 'Medium': return 'text-yellow-400';
            case 'Low': return 'text-red-400';
            default: return 'text-muted-foreground';
        }
    };

    if (loading) return <div className="glass-card p-12 text-center animate-pulse text-muted-foreground border-green-400/20">Predicting your trajectory...</div>;
    if (careerPaths.length === 0) return null;

    return (
        <div className="glass-card p-6">
            <div className="mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-green-400" />
                    Career Path Intelligence
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    AI-predicted career directions for <span className="text-white font-medium">{userName}</span>
                </p>
            </div>

            <div className="space-y-4">
                {careerPaths.map((path, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 sm:p-5 rounded-lg border ${index === 0
                                ? 'border-green-400/30 bg-gradient-to-br from-green-400/10 to-transparent'
                                : 'border-white/5 bg-black/40'
                            } hover:border-neon-blue/30 transition-all cursor-pointer group`}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4 gap-4">
                            <div>
                                <h4 className="text-lg sm:text-xl font-bold mb-1 group-hover:text-neon-blue transition-colors">
                                    {path.title}
                                </h4>
                                {index === 0 && (
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-400/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                                        ⭐ Prime Alignment
                                    </div>
                                )}
                            </div>

                            {/* Compatibility Score */}
                            <div className="text-center flex-shrink-0">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-neon-blue/20 flex items-center justify-center bg-black/50">
                                    <div className="text-center">
                                        <div className="text-base sm:text-lg font-bold text-neon-blue">
                                            {path.compatibilityScore}%
                                        </div>
                                        <div className="text-[7px] sm:text-[8px] text-muted-foreground uppercase">Fit</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">
                            {path.description}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                            <div className="bg-black/30 rounded-lg p-2 sm:p-3 text-center border border-white/5">
                                <Clock className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
                                <div className="text-[9px] text-muted-foreground mb-1">Timeline</div>
                                <div className="text-[10px] sm:text-xs font-bold">{path.timeToMastery}</div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2 sm:p-3 text-center border border-white/5">
                                <TrendingUp className={`w-3.5 h-3.5 ${getDemandColor(path.marketDemand)} mx-auto mb-1`} />
                                <div className="text-[9px] text-muted-foreground mb-1">Growth</div>
                                <div className={`text-[10px] sm:text-xs font-bold ${getDemandColor(path.marketDemand)}`}>
                                    {path.marketDemand}
                                </div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2 sm:p-3 text-center border border-white/5">
                                <DollarSign className="w-3.5 h-3.5 text-green-400 mx-auto mb-1" />
                                <div className="text-[9px] text-muted-foreground mb-1">Potential</div>
                                <div className="text-[10px] sm:text-xs font-bold text-green-400">{path.avgSalary}</div>
                            </div>
                        </div>

                        {/* Required Skills */}
                        <div className="mb-4">
                            <div className="text-[10px] text-muted-foreground mb-2 uppercase tracking-tight">Essential Progression:</div>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {path.requiredSkills.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-0.5 rounded-full bg-white/5 text-white/70 text-[10px] border border-white/10"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
                        <Button
                            variant={index === 0 ? "hero" : "outline"}
                            className="w-full h-9 text-xs"
                            size="sm"
                        >
                            Analyze Skill Gap
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </motion.div>
                ))}
            </div>

            {/* AI Career Insight */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 rounded-lg bg-black/30 border border-white/5"
            >
                <p className="text-xs text-muted-foreground italic">
                    🤖 <span className="text-green-400 font-bold">AI Strategy:</span> Specializing in Full Stack architectures will currently yield the highest ROI based on your current React mastery.
                </p>
            </motion.div>
        </div>
    );
};
