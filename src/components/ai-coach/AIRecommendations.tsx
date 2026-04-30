import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Swords, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Recommendation {
    id: string;
    type: 'course' | 'collaboration' | 'battle' | 'project';
    title: string;
    description: string;
    matchScore: number;
    tags: string[];
}

export const AIRecommendations = () => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

    const fetchRecommendations = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/ai/recommendations`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setRecommendations(data.recommendations || []);
            }
        } catch (err) {
            console.error("AI recommendations fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'course': return BookOpen;
            case 'collaboration': return Users;
            case 'battle': return Swords;
            case 'project': return Sparkles;
            default: return Sparkles;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'course': return 'neon-blue';
            case 'collaboration': return 'purple-400';
            case 'battle': return 'red-400';
            case 'project': return 'green-400';
            default: return 'white';
        }
    };

    const getTypeLabel = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    if (loading) return <div className="glass-card p-12 text-center animate-pulse text-muted-foreground">Scouting best growth opportunities...</div>;
    if (recommendations.length === 0) return null;

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        AI Recommendations
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Personalized pathways based on your skill evolution
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchRecommendations} className="hidden sm:inline-flex">
                    Refresh
                </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                {recommendations.map((rec, index) => {
                    const Icon = getIcon(rec.type);
                    const color = getColor(rec.type);

                    return (
                        <motion.div
                            key={rec.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`group p-4 sm:p-5 rounded-lg border border-white/5 bg-black/40 hover:border-white/10 transition-all cursor-pointer`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-neon-blue/30 transition-colors`}>
                                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}`} />
                                </div>
                                <div className="text-right">
                                    <div className={`text-[10px] text-${color} font-bold mb-1 uppercase tracking-wider`}>
                                        {getTypeLabel(rec.type)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-10 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className={`h-full bg-gradient-to-r from-neon-blue to-purple-500`}
                                                style={{ width: `${rec.matchScore}%` }}
                                            />
                                        </div>
                                        <span className={`text-[10px] font-bold text-white/70`}>
                                            {rec.matchScore}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <h4 className="font-bold text-sm sm:text-base mb-1.5 group-hover:text-neon-blue transition-colors">
                                {rec.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                                {rec.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {rec.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-muted-foreground"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Action Button */}
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-8 text-xs bg-transparent hover:bg-white/5"
                            >
                                {rec.type === 'course' && 'Start Lesson'}
                                {rec.type === 'collaboration' && 'Connect'}
                                {rec.type === 'battle' && 'Duel Now'}
                                {rec.type === 'project' && 'Blueprint'}
                                <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                        </motion.div>
                    );
                })}
            </div>

            {/* AI Insight */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 p-4 rounded-lg bg-black/30 border border-white/5"
            >
                <p className="text-xs text-muted-foreground italic">
                    🤖 <span className="text-purple-400 font-bold">AI Insight:</span> These targets are optimized to maximize your XP velocity for this week.
                </p>
            </motion.div>
        </div>
    );
};
