import { motion } from "framer-motion";
import { getRankInfoFromString, prestigeTierName, type RankTier } from "@/lib/rankSystem";
import { AnimatedRankStars } from "./RankBadgeAnimated";
import { Crown, Shield, Gem, Zap, Star } from "lucide-react";

interface RankEmblemLargeProps {
  rank: string;
  rp?: number;
  className?: string;
}

const TIER_EMBLEM: Record<RankTier, { gradient: string; icon: typeof Shield; label?: string }> = {
  Novice: { gradient: "from-gray-600 to-gray-800", icon: Shield },
  Bronze: { gradient: "from-amber-700 via-orange-600 to-amber-900", icon: Shield },
  Silver: { gradient: "from-slate-400 via-slate-200 to-slate-500", icon: Gem },
  Gold: { gradient: "from-yellow-600 via-amber-400 to-yellow-700", icon: Crown },
  Platinum: { gradient: "from-cyan-500 via-blue-400 to-purple-600", icon: Gem },
  Diamond: { gradient: "from-blue-500 via-indigo-400 to-pink-500", icon: Gem },
  Heroic: { gradient: "from-red-600 via-purple-600 to-red-800", icon: Zap },
  Master: { gradient: "from-indigo-600 via-blue-500 to-amber-500", icon: Crown },
  Grandmaster: { gradient: "from-amber-400 via-yellow-300 to-amber-600", icon: Crown },
};

export const RankEmblemLarge = ({ rank, rp, className = "" }: RankEmblemLargeProps) => {
  const info = getRankInfoFromString(rank);
  const { tier, full, stars, theme, isGrandmaster, glowColor } = info;
  const emblem = TIER_EMBLEM[tier];
  const Icon = emblem.icon;
  const displayRp = rp ?? info.rp;

  return (
    <motion.div
      className={`relative flex flex-col items-center ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      {/* Lightning / energy behind emblem for high tiers */}
      {["Heroic", "Master", "Grandmaster"].includes(tier) && (
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            background: `radial-gradient(circle, ${glowColor.replace(")", ", 0.4)")} 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />
      )}

      {/* Main emblem shield */}
      <motion.div
        className={`relative w-36 h-44 md:w-44 md:h-52 flex items-center justify-center ${
          isGrandmaster ? "gm-emblem-frame" : ""
        }`}
        whileHover={{ scale: 1.05 }}
        animate={
          isGrandmaster
            ? {
                filter: [
                  "drop-shadow(0 0 20px rgba(251,191,36,0.6))",
                  "drop-shadow(0 0 40px rgba(239,68,68,0.5))",
                  "drop-shadow(0 0 20px rgba(59,130,246,0.5))",
                  "drop-shadow(0 0 20px rgba(251,191,36,0.6))",
                ],
              }
            : undefined
        }
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${emblem.gradient} opacity-90`}
          style={{
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            boxShadow: `0 0 30px ${glowColor}`,
          }}
        />
        <div
          className="absolute inset-[3px] rounded-xl bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center"
          style={{
            clipPath: "polygon(50% 2%, 98% 26%, 98% 74%, 50% 98%, 2% 74%, 2% 26%)",
          }}
        >
          <Icon
            className={`w-10 h-10 md:w-12 md:h-12 ${
              isGrandmaster ? "text-amber-300" : "text-white/90"
            }`}
            style={{ filter: `drop-shadow(0 0 8px ${theme.primary})` }}
          />
          {isGrandmaster && (
            <motion.div
              className="absolute -top-4"
              animate={{ y: [0, -4, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Crown className="w-8 h-8 text-amber-400 fill-amber-400/30" />
            </motion.div>
          )}
        </div>

        {/* Wing accents for Gold+ */}
        {["Gold", "Platinum", "Diamond", "Heroic", "Master", "Grandmaster"].includes(tier) && (
          <>
            <div
              className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-16 opacity-60"
              style={{
                background: `linear-gradient(90deg, transparent, ${theme.primary})`,
                clipPath: "polygon(100% 50%, 0 0, 0 100%)",
              }}
            />
            <div
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-16 opacity-60"
              style={{
                background: `linear-gradient(270deg, transparent, ${theme.primary})`,
                clipPath: "polygon(0 50%, 100% 0, 100% 100%)",
              }}
            />
          </>
        )}
      </motion.div>

      {/* Rank name */}
      <motion.h3
        className={`mt-3 font-display font-black text-sm md:text-base uppercase tracking-widest text-center ${
          isGrandmaster ? "text-gradient-animated" : info.color
        }`}
        animate={isGrandmaster ? { opacity: [0.8, 1, 0.8] } : undefined}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isGrandmaster ? "Grandmaster Elite" : full}
      </motion.h3>

      {/* Stars */}
      <div className="mt-1">
        {isGrandmaster ? (
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.span
                key={i}
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              >
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </motion.span>
            ))}
          </div>
        ) : (
          <AnimatedRankStars stars={stars} color={info.color} tier={tier} />
        )}
      </div>

      {/* RP */}
      <p className="mt-2 text-xs font-mono text-white/50">
        <span className="text-amber-400 font-bold">{displayRp.toLocaleString()}</span> RP
      </p>
    </motion.div>
  );
};

export const PrestigeEmblem = ({ prestige }: { prestige: number }) => {
  if (prestige <= 0) return null;
  const name = prestigeTierName(prestige).replace("Prestige ", "");

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-amber-500 flex items-center justify-center shadow-lg">
        <Shield className="w-5 h-5 text-white" />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">{name}</span>
    </div>
  );
};
