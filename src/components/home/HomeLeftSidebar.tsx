import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Zap, Swords, Bot, Video, Users, TrendingUp,
    Code, Plus, Award, Target, Trophy, Flame, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useGamification } from "@/context/GamificationContext";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, Gift } from "lucide-react";
import { useSkillProgression, useTrendingSkills } from "@/hooks/useSkillIntelligence";
import { getRankInfo, xpForNextLevel, xpProgressInLevel } from "@/lib/rankSystem";
import { RankBadge, RankStars } from "@/components/ui/RankBadge";

interface UserProfile {
    id: number;
    display_name: string;
    username: string;
    avatar_url?: string;
    rank?: string;
    reputation_score?: number;
    xp_points?: number;
    level?: number;
    followers_count?: number;
    battle_wins?: number;
    streak_days?: number;
    skills?: { name: string; level: string | number; xp: number; }[];
}

export const HomeLeftSidebar = ({ user }: { user: UserProfile }) => {
    const { xp, level, streak } = useGamification();
    const navigate = useNavigate();

    const { data: skillProgress } = useSkillProgression(user?.id);
    const { data: trendingSkills } = useTrendingSkills();

    // Use rank string from auth context — ranking_score is now in User interface too
    const rankStr = user?.rank || "Novice";
    const rankInfo = getRankInfoFromString(rankStr);
    const xpProgressData = xpProgressInLevel(user?.xp ?? xp);
    const currentLevel = user?.level ?? level;

    const skillLevelMap: Record<string, number> = {
        "Beginner": 1, "Intermediate": 2, "Advanced": 3, "Expert": 4, "Legend": 5
    };

    // Map real user skills to UI format
    const getSkillColor = (lvl: number | string) => {
        const numLevel = typeof lvl === "string" ? (skillLevelMap[lvl] || 1) : lvl;
        if (numLevel >= 4) return "from-purple-500 to-pink-500";
        if (numLevel === 3) return "from-cyan-500 to-blue-500";
        return "from-yellow-500 to-orange-500";
    };

    const userSkills =
        (skillProgress &&
            skillProgress.slice(0, 3).map((s) => {
                const numLevel = s.skill_level || 1;
                return {
                    name: s.skill_name,
                    level: Math.min(100, numLevel * 20),
                    displayLevel: numLevel,
                    color: getSkillColor(numLevel),
                };
            })) ||
        user?.skills?.slice(0, 3).map((s) => {
            const numLevel = typeof s.level === "string" ? (skillLevelMap[s.level] || 1) : s.level;
            return {
                name: s.name,
                level: numLevel * 20,
                displayLevel: s.level,
                color: getSkillColor(s.level)
            };
        }) ||
        [];

    return (
        <div className="space-y-6">
            {/* User Mini Profile Card */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6 relative overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/profile/${user?.username}`)}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="relative mb-4 group/avatar">
                        <div className="absolute inset-0 rounded-full bg-primary/40 blur-xl opacity-50 group-hover/avatar:opacity-100 transition-opacity animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.6)]" />

                        <Avatar className="w-24 h-24 border-2 border-primary shadow-lg shadow-primary/20 relative z-10">
                            <AvatarImage src={user?.avatar_url} />
                            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-purple-600">
                                {user?.display_name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1.5 shadow-lg z-20">
                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-black border-2 border-yellow-600 shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                                {user?.level || level}
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full z-20" />
                    </div>

                    <h3 className="font-bold text-lg truncate w-full">{user?.display_name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">@{user?.username}</p>

                    <div className="flex flex-col items-center gap-2 mb-4">
                        <RankBadge rp={rp} size="sm" showStars animated />
                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary/80 uppercase tracking-wider">
                            <Zap className="w-3 h-3 fill-current" />
                            Reputation: {user?.reputation_score?.toLocaleString() || "500"}
                        </div>
                    </div>

                    <div className="w-full space-y-2 mb-4">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="flex items-center gap-1">
                                Level {currentLevel}
                                <Badge variant="secondary" className="h-4 px-1.5 py-0 text-[8px] bg-primary/20 text-primary border-0">
                                    {(user?.streak_days || streak) >= 7 ? `${Math.min(2.0, 1.0 + (Math.floor((user?.streak_days || streak) / 7) * 0.1)).toFixed(1)}x XP` : "1.0x"}
                                </Badge>
                            </span>
                            <span className="text-primary">{xpProgressData.current.toLocaleString()} / {xpProgressData.needed.toLocaleString()} XP</span>
                        </div>
                        <Progress value={xpProgressData.percent} className="h-2 bg-muted" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full">
                        <div className="bg-background/40 p-2 rounded-lg text-center border border-white/5 hover:border-primary/30 transition-colors cursor-pointer">
                            <Trophy className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                            <div className="text-sm font-bold">{user?.battle_wins || 0}</div>
                            <div className="text-[9px] text-muted-foreground uppercase">Wins</div>
                        </div>
                        <div className="bg-background/40 p-2 rounded-lg text-center border border-white/5 hover:border-primary/30 transition-colors cursor-pointer">
                            <Users className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                            <div className="text-sm font-bold">{(user?.followers_count || 0).toLocaleString()}</div>
                            <div className="text-[9px] text-muted-foreground uppercase">Network</div>
                        </div>
                        <div className="bg-background/40 p-2 rounded-lg text-center border border-white/5 hover:border-orange-500/30 transition-colors cursor-pointer ring-1 ring-orange-500/20">
                            <Flame className="w-4 h-4 mx-auto mb-1 text-orange-500 animate-pulse" />
                            <div className="text-sm font-bold">{user?.streak_days || streak}</div>
                            <div className="text-[9px] text-muted-foreground uppercase">Day Streak</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Daily Quests Widget */}
            <div className="glass-card p-5 border-primary/10">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        Daily Quests
                    </h4>
                    <span className="text-[10px] text-primary font-bold">2/4 Done</span>
                </div>
                <div className="space-y-3">
                    {[
                        { title: "Win 1 PvP Match", done: true, xp: 200 },
                        { title: "Post 1 Tutorial", done: true, xp: 150 },
                        { title: "Comment on 3 Posts", done: false, xp: 50 },
                        { title: "Join Discuss Group", done: false, xp: 100 },
                    ].map((quest, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-2">
                                {quest.done ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Circle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                )}
                                <span className={`text-xs ${quest.done ? "text-muted-foreground line-through" : ""}`}>{quest.title}</span>
                            </div>
                            <span className="text-[10px] font-bold text-primary">+{quest.xp}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Battle Pass Entry Point */}
            <div className="glass-card p-1 relative overflow-hidden group cursor-pointer" onClick={() => navigate('/battle-pass')}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-50" />
                <div className="p-4 relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/20 text-primary">
                            <Gift className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-black uppercase tracking-tighter">Mastery Battle Pass</h4>
                            <p className="text-[9px] text-muted-foreground">Tier 12 • 24 Days Left</p>
                        </div>
                    </div>
                    <Progress value={45} className="h-1 bg-white/5 mb-3" />
                    <Button variant="ghost" className="w-full h-7 text-[10px] font-bold border border-primary/20 hover:bg-primary/20 transition-all">
                        VIEW PROGRESS <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                </div>
            </div>

            {/* Top Skills Widget */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Top Skills
                    </h4>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => navigate('/forge')}>
                        View All
                    </Button>
                </div>
                <div className="space-y-4">
                    {userSkills.map((skill, i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{skill.name}</span>
                                <span className="text-xs text-primary font-bold">Lvl {skill.displayLevel}</span>
                            </div>
                            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                                    style={{ width: `${skill.level}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-4 space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3 px-2">Quick Actions</h4>
                <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-all group">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Plus className="w-4 h-4" />
                    </div>
                    Create Post
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-orange-500/10 hover:text-orange-500 transition-all group">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center mr-3 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <Swords className="w-4 h-4" />
                    </div>
                    Start PvP Battle
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-purple-500/10 hover:text-purple-500 transition-all group">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        <Bot className="w-4 h-4" />
                    </div>
                    Ask AI Companion
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-pink-500/10 hover:text-pink-500 transition-all group">
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center mr-3 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                        <Video className="w-4 h-4" />
                    </div>
                    Create Reel
                </Button>
            </div>

            {/* Trending Skills */}
            <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <h4 className="font-bold">Trending Skills</h4>
                </div>
                <div className="space-y-4">
                    {(trendingSkills || []).slice(0, 3).map((skill, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                            <div>
                                <div className="font-medium group-hover:text-primary transition-colors">
                                    {skill.skill_name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Engagement {skill.engagement_volume.toLocaleString()}
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-0">
                                +{(skill.growth_rate * 100).toFixed(1)}%
                            </Badge>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
