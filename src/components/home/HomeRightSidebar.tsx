import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Trophy,
    Target,
    Flame,
    UserPlus,
    ArrowRight,
    Zap,
    Code2,
    Users,
    Swords,
    DollarSign,
    GraduationCap,
    Clock,
    UserCircle2
} from "lucide-react";
import { motion } from "framer-motion";

import { useEffect, useState } from "react";

export const HomeRightSidebar = () => {
    const [recommendedUsers, setRecommendedUsers] = useState<any[]>([]);
    const [liveActivity, setLiveActivity] = useState<any[]>([]);
    const [userStats, setUserStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const headers = { "Authorization": `Bearer ${token}` };

                // Fetch Home Feed (Recommended users, trending)
                const feedPromise = fetch(`${API_URL}/social/home-feed`, { headers });
                
                // Fetch Dashboard (User stats, streaks, XP)
                const dashPromise = fetch(`${API_URL}/dashboard`, { headers });

                // Fetch Global Activity
                const activityPromise = fetch(`${API_URL}/social/activity/global`, { headers });

                const [feedResp, dashResp, activityResp] = await Promise.all([
                    feedPromise, dashPromise, activityPromise
                ]);

                if (feedResp.ok) {
                    const data = await feedResp.json();
                    setRecommendedUsers(data.recommended_users || []);
                }

                if (dashResp.ok) {
                    const data = await dashResp.json();
                    setUserStats(data.user);
                    // Add competitive stats if available
                    if (data.competitive_stats) {
                        setUserStats((prev: any) => ({ ...prev, ...data.competitive_stats }));
                    }
                }

                if (activityResp.ok) {
                    const data = await activityResp.json();
                    setLiveActivity(data.map((act: any) => {
                        let icon = Code2;
                        let color = "text-blue-500";
                        let text = "";

                        switch(act.type) {
                            case "battle_won":
                                icon = Trophy;
                                color = "text-yellow-500";
                                text = `${act.username} won a PvP battle`;
                                break;
                            case "achievement_unlocked":
                                icon = Zap;
                                color = "text-orange-500";
                                text = `${act.username} unlocked: ${act.achievement_name}`;
                                break;
                            case "post_created":
                                icon = MessageCircle;
                                color = "text-purple-500";
                                text = `${act.username} posted a skill update`;
                                break;
                            default:
                                text = act.text || "Someone did something cool";
                        }

                        return {
                            id: act.id || Math.random(),
                            text,
                            time: act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
                            icon,
                            color
                        };
                    }));
                }
            } catch (err) {
                console.error("Discovery fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [API_URL]);

    const handleConnect = async (userId: number) => {
        try {
            const token = localStorage.getItem("access_token");
            const resp = await fetch(`${API_URL}/connections/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ receiver_id: userId })
            });
            if (resp.ok) {
                // Toast success handled by calling component or simple alert
                alert("Connection request sent!");
            }
        } catch (err) {
            console.error("Connect error:", err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Motivation Panel (Static for now) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-5 bg-gradient-to-br from-card/50 to-orange-500/5 border-orange-500/20"
            >
                <h4 className="font-bold flex items-center gap-2 mb-4 text-orange-500">
                    <Flame className="w-5 h-5 fill-orange-500" />
                    Daily Streak
                </h4>
                <div className="flex items-end justify-between mb-2">
                    <span className="text-3xl font-display font-bold">{userStats?.current_streak || 0}</span>
                    <span className="text-sm text-muted-foreground mb-1">Days</span>
                </div>
                <div className="flex gap-1 mb-4 h-2">
                    {[1, 1, 1, 1, 1, 0, 0].map((d, i) => (
                        <div key={i} className={`flex-1 rounded-full ${i < (userStats?.current_streak % 7 || 0) ? "bg-orange-500" : "bg-muted"}`} />
                    ))}
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40">
                        <Target className="w-5 h-5 text-blue-500" />
                        <div className="flex-1">
                            <div className="text-sm font-medium">Daily XP Goal</div>
                            <div className="text-xs text-muted-foreground">{userStats?.xp || 0} / 5000 XP</div>
                            <Progress value={((userStats?.xp || 0) / 5000) * 100} className="h-1 mt-2" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* PvP Activity Widget (Static placeholder for now, link to PvP) */}
            <div className="glass-card p-5 border-red-500/20 bg-gradient-to-br from-card/50 to-red-500/5">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold flex items-center gap-2 text-red-400">
                        <Swords className="w-5 h-5" />
                        PvP Arena
                    </h4>
                    <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-500 animate-pulse">Running</Badge>
                </div>

                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold mb-4 shadow-[0_0_15px_rgba(220,38,38,0.4)] group">
                    <Zap className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                    Quick Match
                </Button>

                <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Interactive PvP</h5>
                    <p className="text-[10px] text-muted-foreground">Join the arena to gain XP and rank up.</p>
                </div>
            </div>

            {/* AI Discovery - Real recommendations */}
            <div className="glass-card p-5 border-primary/20 bg-gradient-to-br from-card/50 to-primary/5">
                <h4 className="font-bold flex items-center gap-2">
                    <UserCircle2 className="w-5 h-5 text-primary" />
                    Talent Hub
                </h4>
                {isLoading ? (
                    <div className="py-4 text-center text-muted-foreground text-sm">Loading...</div>
                ) : recommendedUsers.length > 0 ? (
                    <div className="space-y-3">
                        {recommendedUsers.slice(0, 5).map((user) => (
                            <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                                        {(user.display_name || user.username || "U").charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold truncate">{user.display_name || user.username}</div>
                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        Level {user.level || 1} <Zap className="w-2 h-2 fill-primary text-primary" /> {user.xp_points || 0}
                                    </div>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-primary hover:bg-primary/20 rounded-full"
                                    onClick={() => handleConnect(user.id)}
                                >
                                    <UserPlus className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-4 text-center text-muted-foreground text-sm">No recommendations yet</div>
                )}
            </div>

            {/* Creator Economy Widget */}
            <div className="glass-card p-5 border-yellow-500/20 bg-gradient-to-br from-card/50 to-yellow-500/5">
                <h4 className="font-bold flex items-center gap-2 mb-4 text-yellow-500">
                    <DollarSign className="w-5 h-5" />
                    Marketplace
                </h4>
                <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-yellow-500/30 transition-all cursor-pointer group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <h5 className="text-sm font-bold group-hover:text-yellow-400 transition-colors">Rust Systems Pack</h5>
                                <p className="text-[10px] text-muted-foreground">Premium Course • 24 Modules</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">$49.99</Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" /> 12h content
                            </span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 h-8 text-xs font-bold">
                        Browse Mentorships
                    </Button>
                </div>
            </div>

            {/* Live Activity */}
            <div className="glass-card p-5">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live Activity
                </h4>
                <div className="space-y-4 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-muted/50" />

                    {liveActivity.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground pl-6">Waiting for activity...</p>
                    ) : (
                        liveActivity.map((item, i) => (
                            <div key={i} className="flex gap-3 relative z-10">
                                <div className={`w-4 h-4 rounded-full bg-background border-2 border-muted flex items-center justify-center shrink-0 mt-0.5`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs leading-snug">
                                        <span className={`font-bold ${item.color}`}>{item.text.split(" ")[0]} </span>
                                        {item.text.split(" ").slice(1).join(" ")}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="glass-card p-4 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-500/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                        <Code2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-purple-100">Weekly Hackathon</h4>
                        <p className="text-xs text-purple-300/70">Build an AI Agent • 2d left</p>
                    </div>
                </div>
                <Button size="sm" variant="secondary" className="w-full mt-3 h-7 text-xs">
                    Join Event
                </Button>
            </div>
        </div>
    );
};
