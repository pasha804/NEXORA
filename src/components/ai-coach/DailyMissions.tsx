import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Mission {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    completed: boolean;
}

export const DailyMissions = () => {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const fetchMissions = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/ai/daily-missions`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setMissions(data.missions || []);
            }
        } catch (err) {
            console.error("AI missions fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    const completedCount = missions.filter(m => m.completed).length;
    const totalXP = missions.reduce((sum, m) => sum + (m.completed ? m.xpReward : 0), 0);
    const possibleXP = missions.reduce((sum, m) => sum + m.xpReward, 0);

    const toggleMission = (id: string) => {
        setMissions(prev => prev.map(m =>
            m.id === id ? { ...m, completed: !m.completed } : m
        ));
    };

    if (loading) return <div className="glass-card p-12 text-center animate-pulse text-muted-foreground border-yellow-400/20">Loading daily missions...</div>;
    if (missions.length === 0) return null;

    return (
        <div className="glass-card p-6 border-yellow-400/20 bg-gradient-to-br from-yellow-400/5 to-transparent">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <Flame className="w-6 h-6 text-yellow-400" />
                        Today's AI Missions
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Complete daily tasks to level up faster
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">{totalXP} XP</div>
                    <div className="text-xs text-muted-foreground">/ {possibleXP} potential</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-muted-foreground">Daily Objective</span>
                    <span className="text-yellow-400 font-bold">
                        {completedCount} / {missions.length} Mastery
                    </span>
                </div>
                <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/10">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedCount / Math.max(1, missions.length)) * 100}%` }}
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 relative"
                    >
                        <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Mission List */}
            <div className="space-y-3">
                {missions.map((mission, index) => (
                    <motion.div
                        key={mission.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border transition-all ${mission.completed
                                ? 'bg-green-400/5 border-green-400/30'
                                : 'bg-black/20 border-white/10 hover:border-yellow-400/30'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <button
                                onClick={() => toggleMission(mission.id)}
                                className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
                            >
                                {mission.completed ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                ) : (
                                    <Circle className="w-6 h-6 text-muted-foreground hover:text-yellow-400" />
                                )}
                            </button>

                            <div className="flex-1">
                                <h4 className={`font-bold text-sm sm:text-base ${mission.completed ? 'text-muted-foreground line-through opacity-60' : ''
                                    }`}>
                                    {mission.title}
                                </h4>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                    {mission.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    <span className="text-xs sm:text-sm text-yellow-400 font-bold">
                                        +{mission.xpReward} XP
                                    </span>
                                </div>
                            </div>

                            {!mission.completed && (
                                <Button size="sm" variant="outline" className="flex-shrink-0 h-8 text-[10px] sm:text-xs">
                                    Start
                                </Button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* AI Coaching Note */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 rounded-lg bg-black/30 border border-white/5"
            >
                <p className="text-xs text-muted-foreground italic">
                    🤖 <span className="text-neon-blue font-bold">AI Coach:</span>{" "}
                    {completedCount === 0 && "Kickstart your day with these targeted skill boosters."}
                    {completedCount > 0 && completedCount < missions.length && "Keep pushing! You're optimizing your learning path efficiently."}
                    {completedCount === missions.length && "Maximum efficiency achieved! Today's objectives are complete."}
                </p>
            </motion.div>
        </div>
    );
};
