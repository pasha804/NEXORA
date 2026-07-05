import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, TrendingUp, Target, Loader2 } from "lucide-react";
import { AIHeroSection } from "@/components/ai-coach/AIHeroSection";
import { SkillRadarChart } from "@/components/ai-coach/SkillRadarChart";
import { LearningRoadmap } from "@/components/ai-coach/LearningRoadmap";
import { DailyMissions } from "@/components/ai-coach/DailyMissions";
import { AIRecommendations } from "@/components/ai-coach/AIRecommendations";
import { CareerPathPanel } from "@/components/ai-coach/CareerPathPanel";
import { AIChatInterface } from "@/components/ai-coach/AIChatInterface";
import { PerformanceAnalytics } from "@/components/ai-coach/PerformanceAnalytics";
import { IndustryTrends } from "@/components/ai-coach/IndustryTrends";
import { GoalsTracker } from "@/components/ai-coach/GoalsTracker";
import { SmartAlerts } from "@/components/ai-coach/SmartAlerts";

const AICoach = () => {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const res = await fetch(`${API_URL}/ai/performance-analytics`, {
                    headers: token ? { "Authorization": `Bearer ${token}` } : {}
                });
                if (res.ok) {
                    const data = await res.json();
                    setAnalytics(data);
                }
            } catch (err) {
                console.error("Failed to fetch AI analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-neon-blue" />
                    <p className="text-muted-foreground font-display">Synchronizing with AI core...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pt-8 pb-16 px-4 relative overflow-hidden">
            {/* Neural Network Background Effect */}
            <div className="fixed inset-0 opacity-5 pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-blue to-purple-500 flex items-center justify-center">
                            <Bot className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display text-3xl md:text-4xl font-bold">
                                AI Skill Coach
                            </h1>
                            <p className="text-muted-foreground">
                                Your personalized AI mentor for career growth and skill mastery
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <AIHeroSection />
                </motion.div>

                {/* Smart Alerts Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-8"
                >
                    <SmartAlerts />
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                    {/* Left Column - Skill Analysis & Roadmap */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Skill Analysis */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <SkillRadarChart />
                        </motion.div>

                        {/* Learning Roadmap */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <LearningRoadmap />
                        </motion.div>

                        {/* AI Recommendations */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <AIRecommendations />
                        </motion.div>

                        {/* Performance Analytics */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 }}
                        >
                            <PerformanceAnalytics />
                        </motion.div>
                    </div>

                    {/* Right Column - Daily Missions & Career Path */}
                    <div className="space-y-8">
                        {/* Daily Missions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <DailyMissions />
                        </motion.div>

                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                            className="glass-card p-6 border-green-400/20"
                        >
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                                This Week's Progress
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-black/30">
                                    <span className="text-sm text-muted-foreground">Lessons Completed</span>
                                    <span className="text-lg font-bold text-neon-blue">
                                        {analytics?.weekly_stats?.lessons_completed || 0} / {analytics?.weekly_stats?.lessons_target || 10}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-black/30">
                                    <span className="text-sm text-muted-foreground">PvP Battles Won</span>
                                    <span className="text-lg font-bold text-green-400">
                                        {analytics?.weekly_stats?.battles_won || 0} / {analytics?.weekly_stats?.battles_target || 7}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-black/30">
                                    <span className="text-sm text-muted-foreground">Study Streak</span>
                                    <span className="text-lg font-bold text-purple-400">{analytics?.weekly_stats?.streak || 0} days 🔥</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-black/30">
                                    <span className="text-sm text-muted-foreground">XP Earned</span>
                                    <span className="text-lg font-bold text-yellow-400">+{analytics?.weekly_stats?.xp_earned || 0} XP</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Focus Tip */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-6 border-purple-400/20 bg-gradient-to-br from-purple-500/10 to-transparent"
                        >
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-400" />
                                AI Focus Tip
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                {analytics?.focus_tip?.tip || "Analyze your daily patterns to optimize your skill acquisition velocity."}
                            </p>
                            <div className="p-3 rounded-lg bg-black/30 border border-purple-400/20">
                                <p className="text-xs text-purple-400 font-bold">
                                    💡 Recommended: {analytics?.focus_tip?.recommendation || "Schedule deep work sessions."}
                                </p>
                            </div>
                        </motion.div>

                        {/* Goals Tracker */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                        >
                            <GoalsTracker />
                        </motion.div>
                    </div>
                </div>

                {/* Industry Trends Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38 }}
                    className="mb-8"
                >
                    <IndustryTrends />
                </motion.div>

                {/* Career Path Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <CareerPathPanel />
                </motion.div>

                {/* AI Chat Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Bot className="w-6 h-6 text-neon-blue" />
                            Chat with Your AI Coach
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Ask anything about career, code, or skill development
                        </p>
                    </div>
                    <AIChatInterface />
                </motion.div>

                {/* Bottom Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 grid md:grid-cols-4 gap-4"
                >
                    {[
                        { label: "Total Coaching Hours", value: `${analytics?.coaching_stats?.total_hours || 0}h`, color: "neon-blue", trend: "+12%" },
                        { label: "Skills Improved", value: analytics?.coaching_stats?.skills_improved || 0, color: "green-400", trend: "+3 this month" },
                        { label: "AI Recommendations Used", value: analytics?.coaching_stats?.recommendations_used || 0, color: "purple-400", trend: "92% success" },
                        { label: "Career Readiness", value: analytics?.coaching_stats?.career_readiness || "0%", color: "yellow-400", trend: "+15% growth" }
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-4 text-center hover:border-neon-blue/30 transition-all">
                            <div className={`text-2xl font-bold text-${stat.color} mb-1`}>
                                {stat.value}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                                {stat.label}
                            </div>
                            <div className="text-xs text-green-400">
                                {stat.trend}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default AICoach;

