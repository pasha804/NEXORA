import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Settings, LogOut, Plus, Coins, Gem } from "lucide-react";
import { getRankInfoFromString, xpProgressInLevel } from "@/lib/rankSystem";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RankAura } from "./RankAura";

export const SidebarProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const rankInfo = getRankInfoFromString(user.rank || "Novice");
  const tierName = rankInfo.tier.toLowerCase();
  const ringClass = `avatar-ring-${tierName}`;
  const xpBarClass = `xp-bar-${tierName}`;
  const { percent: xpPercent } = xpProgressInLevel(user.xp || 0);
  const level = user.level || 1;

  // Display currency (demo values for grandmaster-tier feel)
  const goldCoins = user.xp ? Math.min(999999, user.xp * 10) : 12500;
  const repScore = (user as { reputation_score?: number }).reputation_score;
  const gems = repScore ? Math.min(250450, repScore * 25) : Math.min(250450, (user.xp || 0) * 2.5);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="space-y-3">
      {/* User mini-card — matches pic 1 bottom sidebar */}
      <div
        onClick={() => navigate(`/profile/${user.username}`)}
        className="group relative overflow-hidden rounded-2xl p-3 flex flex-col gap-3 transition-all cursor-pointer bg-background/60 hover:bg-background/80 border border-white/10 hover:border-primary/30 shadow-lg"
      >
        {/* Ambient rank glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity"
          style={{
            background: `radial-gradient(circle at 50% 100%, ${rankInfo.glowColor}, transparent 70%)`,
          }}
        />
        {tierName === "grandmaster" && (
          <div className="absolute inset-0 cosmic-drift opacity-15 pointer-events-none" />
        )}

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative shrink-0">
            <RankAura rank={user.rank || "Novice"} size="sm" intensity={rankInfo.isGrandmaster ? "high" : "low"} />
            <Avatar className={`w-11 h-11 ring-2 transition-transform duration-300 group-hover:scale-105 ${ringClass}`}>
              <AvatarImage src={user.avatar_url || ""} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-display font-bold text-sm truncate text-white group-hover:text-primary transition-colors">
              {user.display_name}
            </h4>
            <div
              className={`text-[10px] font-bold uppercase tracking-wider truncate ${
                rankInfo.isGrandmaster ? "text-gradient-animated" : ""
              }`}
              style={{ color: !rankInfo.isGrandmaster ? rankInfo.theme.primary : undefined }}
            >
              {user.rank || "Novice"}
            </div>
          </div>

          <div className="flex flex-col gap-0.5 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); navigate("/settings"); }}
              className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-all"
              aria-label="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleSignOut(); }}
              className="p-1 rounded-md hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Level progress */}
        <div className="relative z-10 space-y-1">
          <div className="flex justify-between text-[10px] text-white/50 font-medium">
            <span>Level {level}</span>
            <span className={rankInfo.isGrandmaster ? "text-amber-300" : "text-primary"}>
              {Math.round(xpPercent)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              className={`h-full rounded-full ${xpBarClass}`}
              style={{
                background: rankInfo.isGrandmaster
                  ? undefined
                  : rankInfo.theme.primary,
              }}
            />
          </div>
        </div>

        {/* Currency row */}
        <div className="relative z-10 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Coins className="w-3.5 h-3.5" />
            <span>{goldCoins.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-purple-400 font-bold">
            <Gem className="w-3.5 h-3.5" />
            <span>{gems.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Create Post — gradient CTA from pic 1 */}
      <Button
        onClick={() => navigate("/dashboard")}
        className="w-full rounded-xl font-bold text-white border-0 h-10 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-500 hover:via-violet-500 hover:to-blue-500 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02]"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Post
      </Button>
    </div>
  );
};
