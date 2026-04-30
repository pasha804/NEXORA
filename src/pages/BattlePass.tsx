import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy,
    Crown,
    Zap,
    Star,
    Lock,
    Unlock,
    Flame,
    ArrowRight,
    Gift,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const SEASON_INFO = {
    name: "Frontend Mastery Season",
    daysLeft: 24,
    currentTier: 12,
    totalTiers: 50,
    currentXP: 1240,
    nextTierXP: 2500,
    isPremium: true
};

const TIERS = [
    { number: 10, reward: "Animated CSS Badge", type: "badge", premium: false, unlocked: true },
    { number: 11, reward: "Silver Profile Aura", type: "aura", premium: true, unlocked: true },
    { number: 12, reward: "500 Token Bonus", type: "currency", premium: false, unlocked: true },
    { number: 13, reward: "Vite Optimizer Tag", type: "badge", premium: false, unlocked: false },
    { number: 14, reward: "AI Code Reviewer", type: "tool", premium: true, unlocked: false },
    { number: 15, reward: "Legendary React Icon", type: "icon", premium: false, unlocked: false },
    { number: 16, reward: "Custom RGB Aura", type: "aura", premium: true, unlocked: false },
];

export const BattlePass = () => {
    const [activeTier, setActiveTier] = useState(SEASON_INFO.currentTier);

    const progress = (SEASON_INFO.currentXP / SEASON_INFO.nextTierXP) * 100;

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
            {/* Hero Header */}
            <div className="relative h-80 overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-background flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 text-center px-4"
                >
                    <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 py-1 px-4">Season 1 is Live</Badge>
                    <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-4 text-glow">
                        BATTLE <span className="text-primary italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">PASS</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                        Master the forge, unlock exclusive rewards, and dominate the leaderboard.
                    </p>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
                <div className="grid grid-cols-1 lg:col-span-12 gap-6">
                    {/* Status Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                                    <Trophy className="w-12 h-12 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold">{SEASON_INFO.name}</h2>
                                    <div className="flex items-center gap-4 text-muted-foreground mt-2">
                                        <span className="flex items-center gap-1 font-bold text-orange-400">
                                            <Flame className="w-4 h-4" /> {SEASON_INFO.daysLeft} Days Left
                                        </span>
                                        <span>•</span>
                                        <span className="font-medium">Tier {SEASON_INFO.currentTier} of {SEASON_INFO.totalTiers}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 w-full max-w-md">
                                <div className="flex justify-between text-sm font-bold mb-2 uppercase tracking-widest">
                                    <span className="text-primary">XP Progress</span>
                                    <span>{SEASON_INFO.currentXP.toLocaleString()} / {SEASON_INFO.nextTierXP.toLocaleString()} XP</span>
                                </div>
                                <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className="h-full bg-gradient-to-r from-primary to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-3 text-center italic">
                                    Earn XP through PvP, tutorials, and community contributions.
                                </p>
                            </div>

                            <Button className="h-14 px-8 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-black text-lg shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                                <Crown className="w-6 h-6 mr-2" /> UPGRADE PREMIUM
                            </Button>
                        </div>
                    </motion.div>

                    {/* Tiers Grid */}
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold flex items-center gap-3 italic">
                                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                                REWARD TRACK
                            </h3>
                            <div className="flex gap-4">
                                <Badge variant="outline" className="bg-white/5 border-white/10 uppercase py-1 px-4">Free Track</Badge>
                                <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-500 uppercase py-1 px-4 flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> Premium
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {TIERS.map((tier) => (
                                <motion.div
                                    key={tier.number}
                                    whileHover={{ y: -10 }}
                                    onClick={() => setActiveTier(tier.number)}
                                    className={`relative glass-card p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 border-2 ${activeTier === tier.number
                                            ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                                            : "border-white/5 hover:border-white/20"
                                        } ${tier.unlocked ? "opacity-100" : "opacity-60"}`}
                                >
                                    <div className="text-xs font-black text-muted-foreground mb-4 uppercase tracking-tighter">Tier {tier.number}</div>

                                    <div className={`w-16 h-16 rounded-xl mb-4 flex items-center justify-center ${tier.premium ? "bg-yellow-500/20 text-yellow-400" : "bg-primary/20 text-primary"
                                        }`}>
                                        {tier.unlocked ? <Unlock className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                                    </div>

                                    <div className="text-[10px] font-bold leading-tight mb-2 uppercase break-words">{tier.reward}</div>

                                    {tier.premium && (
                                        <Badge variant="secondary" className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[8px] font-black px-1.5 h-4">
                                            PREMIUM
                                        </Badge>
                                    )}

                                    {tier.unlocked && (
                                        <div className="absolute top-2 right-2">
                                            <ShieldCheck className="w-4 h-4 text-green-500" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Reward Preview Section */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTier}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="mt-12 glass-card p-10 bg-gradient-to-r from-card to-primary/5 border-primary/20 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

                            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 relative z-10">
                                <div>
                                    <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 uppercase tracking-widest px-3 py-1">Reward Preview</Badge>
                                    <h4 className="text-4xl font-bold mb-2">
                                        {TIERS.find(t => t.number === activeTier)?.reward}
                                    </h4>
                                    <p className="text-lg text-muted-foreground mb-8">
                                        Unlocked at Tier {activeTier}. This exclusive item will be added to your profile inventory and can be showcased on your public page.
                                    </p>

                                    <div className="flex gap-4">
                                        {TIERS.find(t => t.number === activeTier)?.unlocked ? (
                                            <Button size="lg" className="bg-primary hover:bg-primary/90 font-bold px-10">EQUIP ITEM</Button>
                                        ) : (
                                            <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 font-bold px-10">LOCKED (TIER {activeTier})</Button>
                                        )}
                                        <Button size="lg" variant="ghost" className="text-muted-foreground hover:text-white flex items-center gap-2">
                                            Details <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <div className="w-64 h-64 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center p-8 relative group">
                                        <div className="absolute inset-0 bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-all rounded-full" />
                                        <Gift className="w-32 h-32 text-primary animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
