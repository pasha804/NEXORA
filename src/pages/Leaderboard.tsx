import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Swords, Globe, Loader2, Crown, Zap, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { getRankInfo } from "@/lib/rankSystem";
import { RankBadge } from "@/components/ui/RankBadge";
import { RankAura } from "@/components/profile/RankAura";
import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  mmr: number;
  tier: string;
  matches_played: number;
  wins: number;
  losses: number;
  win_rate: number;
  current_streak: number;
  ranking_score: number;
  level: number;
  prestige: number;
}

interface RankDistribution {
  tier: string;
  count: number;
  percentage: number;
}

const TIER_GRADIENTS: Record<string, string> = {
  Novice: "from-gray-500/20 to-gray-600/10",
  Bronze: "from-orange-500/20 to-orange-600/10",
  Silver: "from-slate-300/20 to-slate-400/10",
  Gold: "from-yellow-500/20 to-yellow-600/10",
  Platinum: "from-cyan-500/20 to-cyan-600/10",
  Diamond: "from-blue-500/20 to-blue-600/10",
  Heroic: "from-red-500/20 to-red-600/10",
  Master: "from-red-600/20 to-red-700/10",
  Grandmaster: "from-amber-400/20 to-amber-500/10",
};

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [distribution, setDistribution] = useState<RankDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("global");

  useEffect(() => {
    fetchLeaderboard();
    fetchDistribution();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/ranking/leaderboard?limit=100`);
      if (!response.ok) throw new Error("Failed to fetch");
      setLeaderboard(await response.json());
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistribution = async () => {
    try {
      const response = await fetch(`${API_URL}/ranking/rank-distribution`);
      if (response.ok) setDistribution(await response.json());
    } catch (err) {
      console.error("Distribution fetch error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/20">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Global Rankings</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Top competitors ranked by RP
              </p>
            </div>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="global" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2">
                <Globe className="w-4 h-4" /> Global
              </TabsTrigger>
              <TabsTrigger value="distribution" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2">
                <Users className="w-4 h-4" /> Distribution
              </TabsTrigger>
            </TabsList>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchLeaderboard}
              className="text-xs text-muted-foreground hover:text-white gap-2"
            >
              <TrendingUp className="w-3 h-3" /> Refresh
            </Button>
          </div>

          <TabsContent value="global" className="space-y-4 mt-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground animate-pulse">Loading rankings...</p>
                </div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-20">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 inline-block mb-4">
                  <Crown className="w-12 h-12 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No ranked players yet</h3>
                <p className="text-sm text-muted-foreground">Compete in the PvP Arena to earn your place on the leaderboard</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, i) => {
                  const isMe = user?.id === entry.user_id;
                  const rankInfo = getRankInfo(entry.mmr);
                  const isTop3 = i < 3;

                  return (
                    <motion.div
                      key={entry.user_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`group flex items-center gap-4 p-4 rounded-xl transition-all border ${
                        isMe
                          ? "border-primary/40 bg-primary/5 shadow-[0_0_12px_rgba(0,240,255,0.1)]"
                          : isTop3
                          ? `bg-gradient-to-r ${TIER_GRADIENTS[rankInfo.tier] || "from-white/5 to-white/0"} border-white/10`
                          : "bg-black/30 border-white/5 hover:border-white/15 hover:bg-white/5"
                      }`}
                    >
                      <div className={`w-10 h-10 flex items-center justify-center font-black text-base rounded-xl shrink-0 ${
                        i === 0 ? "bg-yellow-500/20 text-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.3)]" :
                        i === 1 ? "bg-slate-400/20 text-slate-300" :
                        i === 2 ? "bg-orange-500/20 text-orange-400" :
                        "bg-white/5 text-muted-foreground"
                      }`}>
                        {isTop3 ? <Crown className={`w-5 h-5 ${
                          i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : "text-orange-400"
                        }`} /> : `#${entry.rank}`}
                      </div>

                      <div className="relative">
                        <RankAura tier={rankInfo.tier} size="sm" />
                        <Avatar className="w-10 h-10 border-2 shrink-0 relative"
                          style={isTop3 ? { borderColor: rankInfo.glowColor } : { borderColor: isMe ? "var(--primary)" : "transparent" }}
                        >
                          <AvatarImage src={entry.avatar_url || undefined} />
                          <AvatarFallback className="bg-zinc-800 text-xs font-bold">
                            {(entry.display_name || entry.username)[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold truncate ${isMe ? "text-primary" : "text-white"}`}>
                            {entry.display_name || entry.username}
                          </p>
                          {entry.prestige > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              P{entry.prestige}
                            </span>
                          )}
                          {isMe && <span className="text-[10px] text-primary/60">(You)</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <RankBadge rp={entry.mmr} size="xs" animated={false} />
                          <span className="text-[10px] text-muted-foreground">{entry.win_rate}% WR</span>
                          <span className="text-[10px] text-muted-foreground">{entry.matches_played} matches</span>
                          {entry.current_streak > 2 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-orange-400">
                              <Zap className="w-3 h-3" /> {entry.current_streak} streak
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`text-base font-mono font-bold ${rankInfo.color}`}>
                          {entry.mmr.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-muted-foreground">RP</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="distribution">
            <div className="grid gap-3">
              {distribution.length === 0 && loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                distribution.map((dist) => {
                  const total = distribution.reduce((s, d) => s + d.count, 0);
                  const maxCount = Math.max(...distribution.map(d => d.count), 1);
                  const barWidth = (dist.count / maxCount) * 100;
                  return (
                    <div key={dist.tier} className="flex items-center gap-4 p-4 rounded-xl bg-black/30 border border-white/5">
                      <div className="w-28 shrink-0">
                        <p className="text-sm font-bold text-white">{dist.tier}</p>
                      </div>
                      <div className="flex-1 h-6 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r ${TIER_GRADIENTS[dist.tier] || "from-white/20 to-white/5"}`}
                        />
                      </div>
                      <div className="w-24 text-right shrink-0">
                        <p className="text-sm font-bold text-white">{dist.count}</p>
                        <p className="text-[10px] text-muted-foreground">{dist.percentage}%</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LeaderboardPage;
