import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Target, Code, Trophy, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoadmapTask {
    title: string;
    completed: boolean;
    type: 'learning' | 'project' | 'pvp' | 'practice';
}

interface RoadmapWeek {
    week: number;
    title: string;
    tasks: RoadmapTask[];
    status: 'completed' | 'current' | 'upcoming';
}

export const LearningRoadmap = () => {
    const [roadmap, setRoadmap] = useState<RoadmapWeek[]>([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const fetchRoadmap = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/ai/roadmap`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setRoadmap(data.weeks || []);
            }
        } catch (err) {
            console.error("AI roadmap fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoadmap();
    }, []);

    const getTaskIcon = (type: string) => {
        switch (type) {
            case 'learning': return BookOpen;
            case 'project': return Code;
            case 'pvp': return Trophy;
            case 'practice': return Target;
            default: return Circle;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-400 border-green-400';
            case 'current': return 'text-neon-blue border-neon-blue';
            case 'upcoming': return 'text-muted-foreground border-white/20';
            default: return 'text-muted-foreground';
        }
    };

    if (loading) return <div className="glass-card p-12 text-center animate-pulse text-muted-foreground border-dashed">Generating your skill path...</div>;

    if (roadmap.length === 0) return null;

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Target className="w-6 h-6 text-purple-400" />
                    AI Learning Roadmap
                </h3>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                    Customize Plan
                </Button>
            </div>

            {/* Timeline */}
            <div className="relative space-y-8">
                {/* Vertical Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-neon-blue to-white/20" />

                {roadmap.map((week, weekIndex) => (
                    <motion.div
                        key={weekIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: weekIndex * 0.1 }}
                        className="relative"
                    >
                        {/* Week Marker */}
                        <div className="flex items-start gap-6">
                            <div className={`relative z-10 w-12 h-12 rounded-full border-4 ${getStatusColor(week.status)} bg-black flex items-center justify-center flex-shrink-0`}>
                                <span className="font-bold text-sm">W{week.week}</span>
                            </div>

                            {/* Week Content */}
                            <div className="flex-1 pb-8">
                                <div className={`rounded-lg border ${week.status === 'completed' ? 'border-green-400/30 bg-green-400/5' :
                                        week.status === 'current' ? 'border-neon-blue/30 bg-neon-blue/5' :
                                            'border-white/10 bg-black/20'
                                    } p-4 sm:p-6 transition-all hover:border-opacity-50`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg sm:text-xl font-bold">{week.title}</h4>
                                        {week.status === 'completed' && (
                                            <div className="px-3 py-1 rounded-full bg-green-400/20 text-green-400 text-[10px] font-bold">
                                                Completed ✓
                                            </div>
                                        )}
                                        {week.status === 'current' && (
                                            <div className="px-3 py-1 rounded-full bg-neon-blue/20 text-neon-blue text-[10px] font-bold animate-pulse">
                                                Active
                                            </div>
                                        )}
                                    </div>

                                    {/* Tasks */}
                                    <div className="space-y-2">
                                        {week.tasks.map((task, taskIndex) => {
                                            const TaskIcon = getTaskIcon(task.type);
                                            return (
                                                <motion.div
                                                    key={taskIndex}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: (weekIndex * 0.1) + (taskIndex * 0.05) }}
                                                    className={`flex items-center gap-3 p-2.5 rounded-lg ${task.completed ? 'bg-black/30' : 'bg-black/20'
                                                        } border border-white/5 hover:border-white/10 transition-colors`}
                                                >
                                                    {task.completed ? (
                                                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                                    ) : (
                                                        <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                    )}
                                                    <TaskIcon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                                    <span className={`flex-1 text-xs sm:text-sm ${task.completed ? 'text-muted-foreground line-through' : ''
                                                        }`}>
                                                        {task.title}
                                                    </span>
                                                    {!task.completed && week.status === 'current' && (
                                                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2">
                                                            Start
                                                        </Button>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4">
                                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                                            <span>Milestone Progress</span>
                                            <span>
                                                {week.tasks.filter(t => t.completed).length} / {week.tasks.length}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${(week.tasks.filter(t => t.completed).length / Math.max(1, week.tasks.length)) * 100}%`
                                                }}
                                                transition={{ duration: 0.8, delay: weekIndex * 0.1 }}
                                                className={`h-full ${week.status === 'completed' ? 'bg-green-400' :
                                                        week.status === 'current' ? 'bg-neon-blue' :
                                                            'bg-white/20'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* AI Generated Note */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10"
            >
                <p className="text-xs text-muted-foreground">
                    🤖 <span className="text-purple-400 font-bold">AI Forecast:</span> Predictive analysis suggests roadmap completion in <span className="text-white">January 2026</span> based on current velocity.
                </p>
            </motion.div>
        </div>
    );
};
