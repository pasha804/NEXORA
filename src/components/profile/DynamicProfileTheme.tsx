import { ReactNode, useMemo } from "react";
import { getRankInfoFromString, getTierVisualConfig } from "@/lib/rankSystem";
import { motion, useReducedMotion } from "framer-motion";

interface DynamicProfileThemeProps {
  rank: string;
  children: ReactNode;
  className?: string;
}

export const DynamicProfileTheme = ({ rank, children, className = "" }: DynamicProfileThemeProps) => {
  const rankInfo = getRankInfoFromString(rank ?? "Novice");
  const { tier, glowColor, theme: rankTheme } = rankInfo;
  const visualConfig = getTierVisualConfig(tier);
  const shouldReduceMotion = useReducedMotion();
  const isGrandmaster = tier === "Grandmaster";

  const theme = useMemo(() => {
    switch (tier) {
      case "Novice":
        return {
          cardBg: "bg-gray-900/60 backdrop-blur-md",
          borderGlow: `0 0 0px ${glowColor}`,
          gradient: `linear-gradient(135deg, rgba(31, 41, 55, 0.4), rgba(17, 24, 39, 0.4))`,
          border: "1px solid rgba(75, 85, 99, 0.3)",
        };
      case "Bronze":
        return {
          cardBg: "bg-gradient-to-br from-orange-950/40 to-black/60 backdrop-blur-lg",
          borderGlow: `0 0 15px rgba(217, 119, 6, 0.2)`,
          gradient: `linear-gradient(135deg, rgba(124, 45, 18, 0.3), rgba(0, 0, 0, 0.5))`,
          border: "1px solid rgba(217, 119, 6, 0.2)",
        };
      case "Silver":
        return {
          cardBg: "bg-gradient-to-br from-slate-900/50 to-black/70 backdrop-blur-xl",
          borderGlow: `0 0 20px rgba(148, 163, 184, 0.2)`,
          gradient: `linear-gradient(135deg, rgba(71, 85, 105, 0.3), rgba(15, 23, 42, 0.5))`,
          border: "1px solid rgba(148, 163, 184, 0.3)",
        };
      case "Gold":
        return {
          cardBg: "bg-gradient-to-br from-yellow-950/40 via-black/60 to-amber-950/40 backdrop-blur-2xl",
          borderGlow: `0 0 30px rgba(234, 179, 8, 0.3)`,
          gradient: `linear-gradient(135deg, rgba(133, 77, 14, 0.4), rgba(0, 0, 0, 0.6), rgba(120, 53, 15, 0.4))`,
          border: "1px solid rgba(234, 179, 8, 0.4)",
        };
      case "Platinum":
        return {
          cardBg: "bg-gradient-to-br from-cyan-950/40 via-purple-950/30 to-black/70 backdrop-blur-3xl",
          borderGlow: `0 0 40px rgba(34, 211, 238, 0.3)`,
          gradient: `linear-gradient(135deg, rgba(8, 145, 178, 0.4), rgba(88, 28, 135, 0.3), rgba(0, 0, 0, 0.6))`,
          border: "1px solid rgba(34, 211, 238, 0.4)",
        };
      case "Diamond":
        return {
          cardBg: "bg-gradient-to-br from-blue-950/40 via-pink-950/20 to-black/80 backdrop-blur-[40px]",
          borderGlow: `0 0 50px rgba(96, 165, 250, 0.4)`,
          gradient: `linear-gradient(135deg, rgba(30, 58, 138, 0.5), rgba(131, 24, 67, 0.3), rgba(0, 0, 0, 0.7))`,
          border: "1px solid rgba(96, 165, 250, 0.5)",
        };
      case "Heroic":
        return {
          cardBg: "bg-gradient-to-br from-red-950/50 via-purple-950/30 to-black/90 backdrop-blur-[50px]",
          borderGlow: `0 0 60px rgba(168, 85, 247, 0.5)`,
          gradient: `linear-gradient(135deg, rgba(153, 27, 27, 0.6), rgba(88, 28, 135, 0.4), rgba(0, 0, 0, 0.8))`,
          border: "1px solid rgba(168, 85, 247, 0.6)",
        };
      case "Master":
        return {
          cardBg: "bg-gradient-to-br from-red-950/60 via-black/80 to-red-950/30 backdrop-blur-[60px]",
          borderGlow: `0 0 70px rgba(220, 38, 38, 0.6)`,
          gradient: `linear-gradient(135deg, rgba(153, 27, 27, 0.7), rgba(133, 77, 14, 0.3), rgba(0, 0, 0, 0.9))`,
          border: "1px solid rgba(220, 38, 38, 0.7)",
        };
      case "Grandmaster":
        return {
          cardBg: "bg-black/90 backdrop-blur-[100px]",
          borderGlow: `0 0 100px rgba(251, 191, 36, 0.4)`,
          gradient: `linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(20, 20, 20, 0.9))`,
          border: "none",
        };
      default:
        return {
          cardBg: "bg-background/60 backdrop-blur-md",
          borderGlow: "none",
          gradient: "none",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        };
    }
  }, [tier, glowColor]);

  return (
    <div
      className={`relative overflow-hidden ${className} ${theme.cardBg}`}
      style={{
        boxShadow: theme.borderGlow,
        background: theme.gradient,
        border: theme.border,
      }}
    >
      {/* Shimmer border overlay for Gold+ */}
      {visualConfig.shimmerBorder && !shouldReduceMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 shimmer-border" />
      )}

      {/* Dynamic Animated background for High Ranks */}
      {["Platinum", "Diamond", "Heroic", "Master", "Grandmaster"].includes(tier) && !shouldReduceMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <motion.div
            className="absolute -inset-[100%]"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, transparent, ${rankTheme.primary}, transparent 40%)`,
            }}
          />
        </div>
      )}

      {/* Grandmaster Cosmic Drift */}
      {isGrandmaster && (
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div
            className="absolute inset-0 cosmic-drift"
            style={{
              backgroundImage: `radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.3), transparent),
                                radial-gradient(2px 2px at 60px 80px, rgba(255,255,255,0.2), transparent),
                                radial-gradient(1px 1px at 120px 40px, rgba(255,255,255,0.4), transparent),
                                radial-gradient(1px 1px at 160px 90px, rgba(255,255,255,0.2), transparent)`,
              backgroundSize: "200px 200px",
            }}
          />
          {!shouldReduceMotion && (
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "radial-gradient(circle at 20% 30%, rgba(251, 191, 36, 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 70%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 20% 30%, rgba(251, 191, 36, 0.15) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          )}
        </div>
      )}

      {/* Edge Shine Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent opacity-20" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export const RankAvatarRing = ({
  rank,
  size = "w-32 h-32",
  children,
}: {
  rank: string;
  size?: string;
  children: ReactNode;
}) => {
  const rankInfo = getRankInfoFromString(rank ?? "Novice");
  const { tier, glowColor } = rankInfo;
  const visualConfig = getTierVisualConfig(tier);
  const shouldReduceMotion = useReducedMotion();

  const ringClass = `avatar-ring-${tier.toLowerCase()}`;

  return (
    <div className={`relative ${size} rounded-full`}>
      {/* Animated glow for Heroic / Master */}
      {["Heroic", "Master"].includes(tier) && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 25px ${glowColor}` }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Grandmaster RGB ring */}
      {tier === "Grandmaster" && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 15px rgba(255,0,0,0.5), 0 0 30px rgba(0,255,0,0.3), 0 0 45px rgba(0,150,255,0.3)" }}
          animate={{
            boxShadow: [
              "0 0 15px rgba(255,0,0,0.5), 0 0 30px rgba(0,255,0,0.3), 0 0 45px rgba(0,150,255,0.3)",
              "0 0 15px rgba(0,255,0,0.5), 0 0 30px rgba(0,0,255,0.3), 0 0 45px rgba(255,0,0,0.3)",
              "0 0 15px rgba(0,0,255,0.5), 0 0 30px rgba(255,0,0,0.3), 0 0 45px rgba(0,255,0,0.3)",
              "0 0 15px rgba(255,0,0,0.5), 0 0 30px rgba(0,255,0,0.3), 0 0 45px rgba(0,150,255,0.3)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Gold pulse ring */}
      {tier === "Gold" && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 20px ${glowColor}` }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Silver subtle pulse */}
      {tier === "Silver" && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 14px ${glowColor}` }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      )}

      {/* Static fallback ring glow for reduced motion */}
      {shouldReduceMotion && visualConfig.auraLayers > 0 && (
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 18px ${glowColor}` }}
        />
      )}

      <div className={`relative z-10 ${ringClass} rounded-full`}>{children}</div>
    </div>
  );
};
