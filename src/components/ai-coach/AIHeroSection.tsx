import { motion } from "framer-motion";
import { Bot, TrendingUp, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const AIHeroSection = () => {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

    const fetchAnalysis = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/ai/skill-analysis`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error("AI analysis fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, []);

    const userName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "User";

    if (loading) return <div className="glass-card p-12 text-center animate-pulse text-muted-foreground">Analyzing your nexus...</div>;

    const userLevel = data?.user_level || user?.level || 1;
    const weeklyImprovement = data?.weekly_improvement || 12;
    const xp_points = data?.xp_points || user?.xp_points || 0;
    
    // Simple logic for progress to next level
    const nextLevelXP = (userLevel + 1) * 1000;
    const currentLevelXP = userLevel * 1000;
    const nextLevelProgress = Math.min(100, Math.max(0, ((xp_points - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)) || 0;

    return (
        <div className="glass-card p-8 border-neon-blue/30 bg-gradient-to-br from-neon-blue/10 via-transparent to-purple-500/10 relative overflow-hidden">
            {/* Background Neural Network Effect */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0, 240, 255, 0.15) 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            <div className="relative z-10 grid md:grid-cols-[auto,1fr] gap-8 items-center">
                {/* AI Avatar */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <div className="relative w-32 h-32">
                        {/* Outer glow rings */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.1, 0.3]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 rounded-full border-2 border-neon-blue/50 blur-md"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.15, 1],
                                opacity: [0.5, 0.2, 0.5]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                            }}
                            className="absolute inset-2 rounded-full border-2 border-purple-400/50 blur-sm"
                        />

                        {/* Core avatar */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-blue via-purple-500 to-neon-blue flex items-center justify-center">
                            <Bot className="w-16 h-16 text-white" />
                        </div>

                        {/* Status indicator */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-black"
                        />
                    </div>
                </motion.div>

                {/* Welcome Message & Stats */}
                <div>
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-4xl font-bold mb-2"
                    >
                        Welcome back, <span className="text-neon-blue">{userName}</span> 👋
                    </motion.h2>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg text-muted-foreground mb-6"
                    >
                        Your skill level is <span className="text-green-400 font-bold">{userLevel}</span>.
                        Focusing on <span className="text-neon-blue font-bold">{data?.skill_breakdown?.[0]?.skill || 'Core Mastery'}</span> this week.
                    </motion.p>

                    {/* Overall Growth Meter */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-black/30 rounded-lg p-4 border border-white/10"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                <span className="text-xs text-muted-foreground">Current Level</span>
                            </div>
                            <div className="text-2xl font-bold text-yellow-400">Level {userLevel}</div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-black/30 rounded-lg p-4 border border-white/10"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                <span className="text-xs text-muted-foreground">Career Progress</span>
                            </div>
                            <div className="text-2xl font-bold text-green-400">Advanced</div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="bg-black/30 rounded-lg p-4 border border-white/10"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-neon-blue" />
                                <span className="text-xs text-muted-foreground">Weekly Growth</span>
                            </div>
                            <div className="text-2xl font-bold text-neon-blue">+{weeklyImprovement}%</div>
                        </motion.div>
                    </div>

                    {/* XP Progress Bar */}
                    <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="mt-4"
                    >
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span>Progress to Level {userLevel + 1}</span>
                            <span>{nextLevelProgress.toFixed(0)}%</span>
                        </div>
                        <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/10">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${nextLevelProgress}%` }}
                                transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-neon-blue via-purple-500 to-neon-blue relative"
                            >
                                <motion.div
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
