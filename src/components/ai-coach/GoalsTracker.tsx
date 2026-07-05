import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Trophy, Star, Plus, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Goal {
    id: number;
    title: string;
    category: 'skill' | 'career' | 'project' | 'learning';
    progress: number;
    target: number;
    completed: boolean;
    reward: string;
}

interface Achievement {
    id: number;
    title: string;
    description: string;
    icon: string;
    unlockedDate?: string;
    rarity: string;
    unlocked: boolean;
}

interface DailyMission {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    completed: boolean;
}

export const GoalsTracker = () => {
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [missions, setMissions] = useState<DailyMission[]>([]);
    const [newGoalTitle, setNewGoalTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/ai/goals-tracker`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setGoals(data.goals);
                setAchievements(data.achievements);
                setMissions(data.daily_missions);
            }
        } catch (err) {
            console.error("Failed to fetch goals tracker data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async () => {
        if (!newGoalTitle.trim()) return;
        setCreating(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/ai/goals`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    title: newGoalTitle,
                    category: "skill",
                    target: 100,
                    reward: "+100 XP"
                })
            });

            if (res.ok) {
                const newGoal = await res.json();
                setGoals([newGoal, ...goals]);
                setNewGoalTitle("");
                setShowAddGoal(false);
            }
        } catch (err) {
            console.error("Failed to create goal:", err);
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getRarityColor = (rarity: string) => {
        const r = rarity.toLowerCase();
        switch (r) {
            case 'common': return 'text-gray-400 border-gray-400/30 bg-gray-400/5';
            case 'rare': return 'text-blue-400 border-blue-400/30 bg-blue-400/5';
            case 'epic': return 'text-purple-400 border-purple-400/30 bg-purple-400/5';
            case 'legendary': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5';
            default: return 'text-white border-white/10 bg-white/5';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'skill': return 'neon-blue';
            case 'career': return 'green-400';
            case 'project': return 'purple-400';
            case 'learning': return 'yellow-400';
            default: return 'white';
        }
    };

    const activeGoals = goals.filter(g => !g.completed);
    const completedGoals = goals.filter(g => g.completed);
    const unlockedAchievements = achievements.filter(a => a.unlocked);

    if (loading) {
        return (
            <div className="glass-card p-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
                <p className="text-sm font-medium">Synchronizing goals with neural core...</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="w-6 h-6 text-purple-400" />
                        Goals & Achievements
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track your progress and celebrate milestones
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddGoal(!showAddGoal)}
                    className="border-neon-blue/30"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Goal
                </Button>
            </div>

            {/* Add Goal Form */}
            <AnimatePresence>
                {showAddGoal && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 rounded-lg bg-neon-blue/10 border border-neon-blue/20"
                    >
                        <Input
                            placeholder="Enter your goal (e.g., Master TypeScript Generics)"
                            value={newGoalTitle}
                            onChange={(e) => setNewGoalTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateGoal()}
                            className="mb-3 bg-black/50 border-white/10"
                        />
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                variant="hero" 
                                onClick={handleCreateGoal}
                                disabled={creating || !newGoalTitle.trim()}
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Create Goal
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowAddGoal(false)}>
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Daily Missions Section */}
            {missions.length > 0 && (
                <div className="mb-8">
                    <h4 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                        <Star className="w-4 h-4 text-yellow-400" />
                        Daily Missions
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {missions.map((mission) => (
                            <div key={mission.id} className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between group hover:border-neon-blue/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${mission.completed ? 'bg-green-500/20 text-green-500' : 'bg-neon-blue/10 text-neon-blue'}`}>
                                        {mission.completed ? <CheckCircle2 className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">{mission.title}</div>
                                        <div className="text-[10px] text-muted-foreground">{mission.description}</div>
                                    </div>
                                </div>
                                <div className="text-xs font-bold text-yellow-400">+{mission.xpReward} XP</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Goals */}
            <div className="mb-8">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Circle className="w-5 h-5 text-neon-blue" />
                    Active Goals ({activeGoals.length})
                </h4>
                {activeGoals.length > 0 ? (
                    <div className="space-y-3">
                        {activeGoals.map((goal, i) => {
                            const progressPercent = (goal.progress / goal.target) * 100;
                            const color = getCategoryColor(goal.category);

                            return (
                                <motion.div
                                    key={goal.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`p-4 rounded-lg border border-${color}/20 bg-gradient-to-br from-${color}/5 to-transparent`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h5 className="font-bold mb-1">{goal.title}</h5>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs px-2 py-1 rounded-full bg-black/30 text-muted-foreground capitalize">
                                                    {goal.category}
                                                </span>
                                                <span className={`text-xs text-${color} font-bold`}>
                                                    Reward: {goal.reward}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-bold text-${color}`}>
                                                {Math.round(goal.progress)}/{goal.target}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Progress</div>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercent}%` }}
                                                transition={{ duration: 0.8 }}
                                                className={`h-full bg-${color} rounded-full`}
                                            />
                                        </div>
                                        <div className={`text-xs text-${color} mt-1 text-right font-bold`}>
                                            {Math.round(progressPercent)}%
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-8 text-center rounded-lg border border-dashed border-white/10 text-muted-foreground text-sm">
                        No active goals. Time to set a new challenge!
                    </div>
                )}
            </div>

            {/* Recent Achievements */}
            <div className="mb-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Recent Achievements ({unlockedAchievements.length})
                </h4>
                {unlockedAchievements.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-3">
                        {unlockedAchievements.map((achievement, i) => (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className={`p-4 rounded-lg border ${getRarityColor(achievement.rarity)} hover:scale-105 transition-transform cursor-pointer`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="text-4xl">{achievement.icon || "🏆"}</div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-sm mb-1">{achievement.title}</h5>
                                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                            {achievement.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] capitalize ${getRarityColor(achievement.rarity)} px-1.5 py-0.5 rounded-full border border-current/20`}>
                                                {achievement.rarity}
                                            </span>
                                            {achievement.unlockedDate && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(achievement.unlockedDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center rounded-lg border border-dashed border-white/10 text-muted-foreground text-sm">
                        No achievements unlocked yet. Keep pushing!
                    </div>
                )}
            </div>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
                <div>
                    <h4 className="font-bold mb-4 flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed Missions
                    </h4>
                    <div className="space-y-2">
                        {completedGoals.map((goal, i) => (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="p-3 rounded-lg bg-green-400/10 border border-green-400/20 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <Star className="w-5 h-5 text-green-400" />
                                    <span className="font-bold text-sm">{goal.title}</span>
                                </div>
                                <div className="text-xs text-green-400 font-bold">
                                    ✓ {goal.reward}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Progress Summary */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 rounded-lg bg-purple-400/10 border border-purple-400/30"
            >
                <div className="flex gap-3">
                    <span className="text-xl">🤖</span>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                         <span className="text-purple-400 font-bold uppercase tracking-wider">Nexus Insight:</span> 
                         {activeGoals.length > 0 
                            ? `You have ${activeGoals.length} active neural objectives. Focus on "${activeGoals[0].title}" to maximize your XP velocity this week.`
                            : "All primary objectives cleared. We suggest setting a new Skill goal to maintain neuro-plasticity and rank progression."
                         }
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
