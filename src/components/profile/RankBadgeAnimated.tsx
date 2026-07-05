import { motion } from "framer-motion";
import { getRankInfo, getRankInfoFromString } from "@/lib/rankSystem";

interface RankBadgeAnimatedProps {
  rp?: number;
  rank?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showPrestige?: boolean;
  showGlow?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { badge: "px-2 py-1 text-[11px]", icon: "text-sm", stars: "text-[9px]" },
  md: { badge: "px-3 py-1.5 text-sm", icon: "text-base", stars: "text-[11px]" },
  lg: { badge: "px-4 py-2 text-base", icon: "text-xl", stars: "text-xs" },
  xl: { badge: "px-5 py-2.5 text-lg", icon: "text-2xl", stars: "text-sm" },
};

export const RankBadgeAnimated = ({
  rp,
  rank,
  size = "md",
  showPrestige = false,
  showGlow = true,
  className = "",
}: RankBadgeAnimatedProps) => {
  const info = rp !== undefined ? getRankInfo(rp) : getRankInfoFromString(rank || "Novice");
  const { tier, glowColor, icon, full, color, stars, isGrandmaster } = info;
  const sz = SIZE_MAP[size];

  const isAnimated = ["Gold", "Platinum", "Diamond", "Heroic", "Master", "Grandmaster"].includes(tier);

  const Wrapper = isAnimated ? motion.div : "div";

  return (
    <Wrapper
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold select-none relative overflow-hidden ${sz.badge} ${isGrandmaster ? "rgb-border" : ""} ${className}`}
      style={{
        borderColor: glowColor,
        background: isGrandmaster
          ? "linear-gradient(135deg, rgba(255,0,0,0.15), rgba(0,255,0,0.15), rgba(0,150,255,0.15))"
          : `${glowColor.replace(")", ", 0.12)")}`,
        boxShadow: showGlow ? (isGrandmaster ? undefined : `0 0 12px ${glowColor}`) : undefined,
      }}
      {...(isAnimated ? {
        whileHover: { scale: 1.08 },
        animate: isGrandmaster ? { boxShadow: ["0 0 12px rgba(255,0,0,0.5)", "0 0 12px rgba(0,255,0,0.5)", "0 0 12px rgba(0,0,255,0.5)", "0 0 12px rgba(255,0,0,0.5)"] } : undefined,
        transition: isGrandmaster ? { duration: 3, repeat: Infinity } : { duration: 0.15 },
      } : {})}
    >
      {isGrandmaster && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle at 50% 50%, ${glowColor.replace(")", ", 0.2)")}, transparent 70%)` }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <span className={`${sz.icon} relative z-10`}>{icon}</span>
      <span className={`relative z-10 ${color}`}>{full}</span>
      {!isGrandmaster && (
        <span className={`flex gap-0.5 ${sz.stars} relative z-10`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.span
              key={i}
              className={i < stars ? color : "text-white/20"}
              initial={isAnimated ? { scale: 0.5, opacity: 0 } : undefined}
              animate={isAnimated ? { scale: 1, opacity: 1 } : undefined}
              transition={{ delay: i * 0.05, duration: 0.2 }}
            >
              ★
            </motion.span>
          ))}
        </span>
      )}
      {isGrandmaster && (
        <motion.span
          className="relative z-10"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          👑
        </motion.span>
      )}
    </Wrapper>
  );
};

export const AnimatedRankStars = ({ stars, color, tier }: { stars: number; color: string; tier: string }) => {
  const isAnimated = ["Gold", "Platinum", "Diamond", "Heroic", "Master", "Grandmaster"].includes(tier);

  return (
    <div className="flex gap-0.5 text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          className={i < stars ? color : "text-white/15"}
          initial={isAnimated ? { y: -5, opacity: 0 } : undefined}
          animate={isAnimated ? {
            y: 0,
            opacity: 1,
            scale: i < stars ? [1, 1.2, 1] : 1,
          } : undefined}
          transition={{
            delay: i * 0.08,
            duration: 0.3,
            scale: { duration: 0.5, repeat: Infinity, repeatDelay: 2 + i * 0.5 },
          }}
        >
          ★
        </motion.span>
      ))}
    </div>
  );
};
