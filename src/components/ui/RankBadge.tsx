import { motion } from "framer-motion";
import { getRankInfo, getRankInfoFromString } from "@/lib/rankSystem";

interface RankBadgeProps {
  /** Pass either raw RP number or rank string like "Diamond III" */
  rp?: number;
  rank?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showStars?: boolean;
  showRP?: boolean;
  animated?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: { badge: "px-1.5 py-0.5 text-[10px]", icon: "text-xs", star: "text-[8px]" },
  sm: { badge: "px-2 py-1 text-xs",          icon: "text-sm", star: "text-[10px]" },
  md: { badge: "px-3 py-1.5 text-sm",        icon: "text-base", star: "text-xs" },
  lg: { badge: "px-4 py-2 text-base",        icon: "text-xl", star: "text-sm" },
  xl: { badge: "px-5 py-2.5 text-lg",        icon: "text-2xl", star: "text-base" },
};

export const RankBadge = ({
  rp,
  rank,
  size = "sm",
  showStars = false,
  showRP = false,
  animated = true,
  className = "",
}: RankBadgeProps) => {
  const info = rp !== undefined ? getRankInfo(rp) : getRankInfoFromString(rank || "Novice");
  const sz = SIZE_MAP[size];

  const Wrapper = animated ? motion.div : "div";
  const wrapperProps = animated
    ? { whileHover: { scale: 1.05 }, transition: { duration: 0.15 } }
    : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold select-none ${sz.badge} ${className}`}
      style={{
        borderColor: info.glowColor,
        background: `${info.glowColor.replace(")", ", 0.12)").replace("rgba", "rgba")}`,
        boxShadow: animated ? `0 0 8px ${info.glowColor}` : undefined,
      }}
    >
      <span className={sz.icon}>{info.icon}</span>
      <span className={info.color}>{info.full}</span>

      {showStars && !info.isGrandmaster && (
        <span className={`flex gap-0.5 ${sz.star}`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={i < info.stars ? info.color : "text-white/20"}
            >
              ★
            </span>
          ))}
        </span>
      )}

      {showRP && (
        <span className="text-white/50 font-mono text-[10px]">{info.rp} RP</span>
      )}
    </Wrapper>
  );
};

/** Animated stars row — used in profile cards and PvP hero */
export const RankStars = ({
  stars,
  color,
  size = "sm",
}: {
  stars: number;
  color: string;
  size?: "xs" | "sm" | "md";
}) => {
  const starSize = size === "xs" ? "text-[10px]" : size === "sm" ? "text-sm" : "text-base";
  return (
    <div className={`flex gap-0.5 ${starSize}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.06, duration: 0.2 }}
          className={i < stars ? color : "text-white/15"}
        >
          ★
        </motion.span>
      ))}
    </div>
  );
};

/** Full rank card — used in HomeLeftSidebar and Profile */
export const RankCard = ({
  rp,
  wins = 0,
  losses = 0,
  streak = 0,
  compact = false,
}: {
  rp: number;
  wins?: number;
  losses?: number;
  streak?: number;
  compact?: boolean;
}) => {
  const info = getRankInfo(rp);
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
  const divProgress = info.isGrandmaster
    ? 100
    : Math.min(100, (info.rpInDivision / 50) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-4 space-y-3"
      style={{
        borderColor: info.glowColor,
        background: `linear-gradient(135deg, ${info.glowColor.replace(")", ", 0.08)")} 0%, transparent 100%)`,
        boxShadow: `0 0 20px ${info.glowColor.replace(")", ", 0.15)")}`,
      }}
    >
      {/* Rank header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{info.icon}</span>
          <div>
            <p className={`font-black text-lg leading-tight ${info.color}`}>{info.full}</p>
            <p className="text-xs text-muted-foreground">{info.rp} RP</p>
          </div>
        </div>
        {!info.isGrandmaster && (
          <RankStars stars={info.stars} color={info.color} size="sm" />
        )}
      </div>

      {/* RP progress bar */}
      {!info.isGrandmaster && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Division Progress</span>
            <span className={info.color}>{info.rpInDivision} / 50 RP</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${divProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${info.glowColor}, ${info.glowColor.replace("0.", "0.4")})` }}
            />
          </div>
        </div>
      )}

      {/* Stats row */}
      {!compact && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-green-400 font-bold text-sm">{wins}</p>
            <p className="text-[10px] text-muted-foreground">Wins</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-red-400 font-bold text-sm">{losses}</p>
            <p className="text-[10px] text-muted-foreground">Losses</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <p className={`font-bold text-sm ${winRate >= 50 ? "text-green-400" : "text-muted-foreground"}`}>
              {winRate}%
            </p>
            <p className="text-[10px] text-muted-foreground">Win Rate</p>
          </div>
        </div>
      )}

      {/* Streak */}
      {streak !== 0 && (
        <div className={`flex items-center gap-1.5 text-xs font-bold ${streak > 0 ? "text-orange-400" : "text-red-400"}`}>
          <span>{streak > 0 ? "🔥" : "❄️"}</span>
          <span>{Math.abs(streak)} {streak > 0 ? "Win" : "Loss"} Streak</span>
          {streak >= 3 && streak > 0 && (
            <span className="text-[10px] bg-orange-500/20 border border-orange-500/30 px-1.5 py-0.5 rounded-full">
              +{Math.min(25, streak * 5)} RP Bonus
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
