import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy, Crown, Zap, Star, Lock, Unlock, Flame,
    ArrowRight, Gift, ShieldCheck, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Fallback tier data when no season is active
const FALLBACK_TIERS = [
    { number: 1,  reward: "Nexora Starter Badge",    type: "badge",    premium: false, unlocked: true  },
    { number: 2,  reward: "Bronze Profile Aura",     type: "aura",     premium: false, unlocked: true  },
    { number: 3,  reward: "100 XP Bonus",            type: "currency", premium: false, unlocked: true  },
    { number: 4,  reward: "Skill Tracker Tag",       type: "badge",    premium: false, unlocked: false },
    { number: 5,  reward: "AI Code Reviewer",        type: "tool",     premium: true,  unlocked: false },
    { number: 6,  reward: "Silver React Icon",       type: "icon",     premium: false, unlocked: false },
    { number: 7,  reward: "Custom RGB Aura",         type: "aura",     premium: true,  unlocked: false },
    { number: 8,  reward: "500 XP Bonus",            type: "currency", premium: false, unlocked: false },
    { number: 9,  reward: "Gold Profile Frame",      type: "aura",     premium: true,  unlocked: false },
    { number: 10, reward: "Legendary Dev Badge",     type: "badge",    premium: false, unlocked: false },
];

export const BattlePass = () => {
    const { user, token } = useAuth();
    const [activeTier, setActiveTier] = useState(1);
    const [loading, setLoading] = useState(true);
    const [seasonData, setSeasonData] = useState<any>(null);
    const [progressData, setProgressData] = useState<any>(null);
    const [tiers, setTiers] = useState(FALLBACK_TIERS);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) { setLoading(false); return; }
            try {
                // Fetch current season
                const seasonResp = await fetch(`${API_URL}/battlepass/current_season`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (seasonResp.ok) {
                    const season = await seasonResp.json();
                    setSeasonData(season);

                    // Fetch tiers for this season
                    const tiersResp = await fetch(`${API_URL}/battlepass/tiers/${season.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (tiersResp.ok) {
                        const tiersData = await tiersResp.json();
                        if (tiersData.length > 0) {
                            setTiers(tiersData.map((t: any, i: number) => ({
                                number: t.tier_number,
                                reward: t.reward_data?.name || `Tier ${t.tier_number} Reward`,
                                type: t.reward_data?.type || "badge",
                                premium: t.is_premium,
                                unlocked: false // will be set from progress
                            })));
                        }
                    }
                }

                // Fetch user progress
                if (user?.id) {
                    const progressResp = await fetch(`${API_URL}/battlepass/progress/${user.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (progressResp.ok) {
                        const progress = await progressResp.json();
                        setProgressData(progress);
                        setActiveTier(progress.current_tier || 1);

                        // Mark unlocked tiers
                        setTiers(prev => prev.map(t => ({
                            ...t,
                            unlocked: t.number <= (progress.current_tier || 1)
                        })));
                    }
                }
            } catch (err) {
                console.error("Battle pass fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, user?.id]);

    const handleUnlockTier = async () => {
        if (!token || !user?.id) return;
        try {
            const resp = await fetch(`${API_URL}/battlepass/unlock_tier?user_id=${user.id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                if (data.status === "unlocked") {
                    toast.success(`Tier ${data.new_tier} unlocked!`);
                    setProgressData((prev: any) => ({ ...prev, current_tier: data.new_tier }));
                    setTiers(prev => prev.map(t => ({
                        ...t,
                        unlocked: t.number <= data.new_tier
                    })));
                } else {
                    toast.info(`Need ${data.xp_needed} more XP to unlock next tier`);
                }
            }
        } catch { toast.error("Failed to unlock tier"); }
    };

    const currentTier = progressData?.current_tier || 1;
    const totalXP = progressData?.xp_total || user?.xp || 0;
    const nextTierXP = progressData?.next_tier_xp_required || 500;
    const progress = Math.min(100, (totalXP / nextTierXP) * 100);
    const seasonName = seasonData?.name || "Nexora Season 1";
    const daysLeft = 24; // Would come from season end_date

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
            {/* Hero Header */}
            <div className="relative h-80 overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-background flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.4) 0%, transparent 60%),
                                          radial-gradient(ellipse at 70% 30%, rgba(168,85,247,0.4) 0%, transparent 60%)`
                    }}
                />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 text-center px-4"
                >
                    <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 py-1 px-4">
                        {seasonData ? "Season Active" : "Season Coming Soon"}
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-4">
                        BATTLE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 italic">PASS</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                        Master the forge, unlock exclusive rewards, and dominate the leaderboard.
                    </p>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20 space-y-8">
                {/* Status Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-8 border-white/10 shadow-2xl"
                >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                                <Trophy className="w-12 h-12 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{seasonName}</h2>
                                <div className="flex items-center gap-4 text-muted-foreground mt-2">
                                    <span className="flex items-center gap-1 font-bold text-orange-400">
                                        <Flame className="w-4 h-4" /> {daysLeft} Days Left
                                    </span>
                                    <span>•</span>
                                    <span className="font-medium">Tier {currentTier} of {tiers.length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full max-w-md">
                            <div className="flex justify-between text-sm font-bold mb-2 uppercase tracking-widest">
                                <span className="text-primary">XP Progress</span>
                                <span>{totalXP.toLocaleString()} / {nextTierXP.toLocaleString()} XP</span>
                            </div>
                            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-primary to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-3 text-center italic">
                                Earn XP through PvP battles, tutorials, and community contributions.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={handleUnlockTier}
                                className="h-12 px-6 bg-gradient-to-r from-primary to-purple-600 font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                            >
                                <Zap className="w-4 h-4 mr-2" /> Unlock Next Tier
                            </Button>
                            <Button variant="outline" className="h-12 px-6 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                                <Crown className="w-4 h-4 mr-2" /> Upgrade Premium
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Tiers Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold flex items-center gap-3 italic">
                            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                            REWARD TRACK
                        </h3>
                        <div className="flex gap-3">
                            <Badge variant="outline" className="bg-white/5 border-white/10 uppercase py-1 px-3">Free Track</Badge>
                            <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-500 uppercase py-1 px-3 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Premium
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
                        {tiers.map((tier) => (
                            <motion.div
                                key={tier.number}
                                whileHover={{ y: -6 }}
                                onClick={() => setActiveTier(tier.number)}
                                className={`relative glass-card p-3 flex flex-col items-center text-center cursor-pointer transition-all border-2 ${
                                    activeTier === tier.number
                                        ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                        : "border-white/5 hover:border-white/20"
                                } ${tier.unlocked ? "opacity-100" : "opacity-50"}`}
                            >
                                <div className="text-[10px] font-black text-muted-foreground mb-2 uppercase">T{tier.number}</div>
                                <div className={`w-10 h-10 rounded-lg mb-2 flex items-center justify-center ${
                                    tier.premium ? "bg-yellow-500/20 text-yellow-400" : "bg-primary/20 text-primary"
                                }`}>
                                    {tier.unlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                </div>
                                <div className="text-[9px] font-bold leading-tight uppercase break-words line-clamp-2">{tier.reward}</div>
                                {tier.premium && (
                                    <Badge className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-black text-[7px] font-black px-1 h-3.5">PRO</Badge>
                                )}
                                {tier.unlocked && (
                                    <ShieldCheck className="absolute top-1 right-1 w-3 h-3 text-green-500" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Reward Preview */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTier}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-card p-8 bg-gradient-to-r from-card to-primary/5 border-primary/20 overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 relative z-10">
                            <div>
                                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 uppercase tracking-widest px-3 py-1">
                                    Tier {activeTier} Reward
                                </Badge>
                                <h4 className="text-3xl font-bold mb-3">
                                    {tiers.find(t => t.number === activeTier)?.reward || "Mystery Reward"}
                                </h4>
                                <p className="text-muted-foreground mb-6">
                                    {tiers.find(t => t.number === activeTier)?.unlocked
                                        ? "This reward is unlocked and available in your inventory."
                                        : `Reach Tier ${activeTier} to unlock this exclusive reward.`}
                                </p>
                                <div className="flex gap-3">
                                    {tiers.find(t => t.number === activeTier)?.unlocked ? (
                                        <Button size="lg" className="bg-primary hover:bg-primary/90 font-bold px-8">
                                            EQUIP ITEM
                                        </Button>
                                    ) : (
                                        <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 font-bold px-8">
                                            LOCKED — TIER {activeTier}
                                        </Button>
                                    )}
                                    <Button size="lg" variant="ghost" className="text-muted-foreground hover:text-white gap-2">
                                        Details <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <div className="w-48 h-48 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center relative group">
                                    <div className="absolute inset-0 bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-all rounded-full" />
                                    <Gift className="w-24 h-24 text-primary animate-bounce relative z-10" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BattlePass;
