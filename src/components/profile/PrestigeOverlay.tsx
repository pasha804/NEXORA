import { motion } from "framer-motion";
import { getRankInfoFromString, prestigeTierName } from "@/lib/rankSystem";

interface PrestigeOverlayProps {
  rank: string;
  prestige: number;
  children?: React.ReactNode;
  className?: string;
}

export const PrestigeOverlay = ({ rank, prestige, children, className = "" }: PrestigeOverlayProps) => {
  const rankInfo = getRankInfoFromString(rank);
  const { glowColor } = rankInfo;

  if (prestige <= 0) return <>{children}</>;

  const prestigeLevel = Math.min(prestige, 5);

  const effects = {
    1: { auraOpacity: 0.08, borderWidth: "1px", label: "Prestige I" },
    2: { auraOpacity: 0.12, borderWidth: "1.5px", label: "Prestige II" },
    3: { auraOpacity: 0.16, borderWidth: "2px", label: "Prestige III" },
    4: { auraOpacity: 0.2, borderWidth: "2.5px", label: "Prestige IV" },
    5: { auraOpacity: 0.25, borderWidth: "3px", label: "Prestige Master" },
  };

  const effect = effects[prestigeLevel as keyof typeof effects];

  return (
    <div className={`relative ${className}`}>
      {/* Prestige aura glow */}
      {prestige >= 1 && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none prestige-aura"
          style={{
            borderWidth: effect.borderWidth,
            borderStyle: "solid",
            borderColor: `${glowColor}`,
            boxShadow: `inset 0 0 30px ${glowColor.replace(")", `, ${effect.auraOpacity * 2})`)},
                        0 0 50px ${glowColor.replace(")", `, ${effect.auraOpacity})`)}`,
          }}
        />
      )}

      {/* Prestige label */}
      {prestige >= 1 && (
        <motion.div
          className="absolute -top-2 right-4 z-20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
          style={{
            background: `linear-gradient(135deg, ${glowColor.replace(")", ", 0.3)")}, transparent)`,
            border: `1px solid ${glowColor}`,
            color: glowColor,
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {effect.label}
        </motion.div>
      )}

      {/* Prestige V - full cinematic overlay */}
      {prestige >= 5 && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            // For Grandmaster, use gold shimmer instead of extra RGB to avoid visual clash
            background: `radial-gradient(ellipse at 30% 20%, ${glowColor.replace(")", ", 0.12)")} 0%, transparent 60%),
                          radial-gradient(ellipse at 70% 80%, ${glowColor.replace(")", ", 0.08)")} 0%, transparent 50%)`,
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      )}

      {children}
    </div>
  );
};

export const PrestigeBadge = ({ prestige }: { prestige: number }) => {
  if (prestige <= 0) return null;

  const names = ["", "Prestige I", "Prestige II", "Prestige III", "Prestige IV", "Prestige Master"];
  const colors = ["", "from-blue-500 to-cyan-500", "from-purple-500 to-pink-500", "from-yellow-500 to-red-500", "from-green-500 to-blue-500", "from-pink-500 via-purple-500 to-indigo-500"];

  return (
    <motion.div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r ${colors[Math.min(prestige, 5)]} text-white`}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      ✦ {names[Math.min(prestige, 5)]}
    </motion.div>
  );
};
