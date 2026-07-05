import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getRankInfoFromString, getTierVisualConfig } from "@/lib/rankSystem";

interface RankAuraProps {
  rank: string;
  size?: "sm" | "md" | "lg" | "xl";
  intensity?: "low" | "medium" | "high";
  className?: string;
}

export const RankAura = ({ rank, size = "md", intensity = "medium", className = "" }: RankAuraProps) => {
  const rankInfo = getRankInfoFromString(rank);
  const { tier, glowColor, theme } = rankInfo;
  const visualConfig = getTierVisualConfig(tier);
  const shouldReduceMotion = useReducedMotion();

  const sizeMap = {
    sm: { outer: "w-20 h-20", middle: "w-16 h-16", inner: "w-12 h-12" },
    md: { outer: "w-32 h-32", middle: "w-28 h-28", inner: "w-24 h-24" },
    lg: { outer: "w-40 h-40", middle: "w-36 h-36", inner: "w-32 h-32" },
    xl: { outer: "w-52 h-52", middle: "w-48 h-48", inner: "w-44 h-44" },
  };

  const sz = sizeMap[size];
  const layers = visualConfig.auraLayers;

  if (layers === 0) return null;

  const opacity = intensity === "low" ? 0.15 : intensity === "high" ? 0.4 : 0.25;

  // Static fallback for reduced-motion
  if (shouldReduceMotion) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}>
        <div
          className={`absolute rounded-full ${sz.outer}`}
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            opacity: opacity * 0.8,
          }}
        />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}>
      {/* Outer Layer */}
      {layers >= 1 && (
        <motion.div
          className={`absolute rounded-full ${sz.outer}`}
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            boxShadow: tier === "Grandmaster" ? `0 0 40px ${theme.primary}` : "none",
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [opacity, opacity * 1.5, opacity] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Middle Layer */}
      {layers >= 2 && (
        <motion.div
          className={`absolute rounded-full ${sz.middle}`}
          style={{
            background: `radial-gradient(circle, ${theme.secondary.replace("rgb", "rgba").replace(")", ", 0.2)")} 0%, transparent 60%)`,
            border: `1px solid ${theme.primary.replace("rgb", "rgba").replace(")", ", 0.1)")}`,
          }}
          animate={{ rotate: [0, 360], scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Heroic/Master/GM Special Rings */}
      {["Heroic", "Master", "Grandmaster"].includes(tier) && layers >= 3 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className={`absolute rounded-full border border-white/5`}
              style={{ width: `${80 + i * 20}%`, height: `${80 + i * 20}%` }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </div>
      )}

      {/* Grandmaster RGB Outer Ring */}
      {tier === "Grandmaster" && layers >= 5 && (
        <motion.div
          className={`absolute rounded-full ${sz.outer}`}
          style={{ border: "2px solid transparent" }}
          animate={{
            boxShadow: [
              `0 0 20px rgba(255,0,0,0.4), 0 0 40px rgba(255,100,0,0.2)`,
              `0 0 20px rgba(0,255,0,0.4), 0 0 40px rgba(0,200,255,0.2)`,
              `0 0 20px rgba(0,100,255,0.4), 0 0 40px rgba(200,0,255,0.2)`,
              `0 0 20px rgba(255,0,0,0.4), 0 0 40px rgba(255,100,0,0.2)`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Core Glow */}
      <div
        className={`absolute rounded-full ${sz.inner} blur-xl`}
        style={{
          background: `radial-gradient(circle, ${theme.primary} 0%, transparent 70%)`,
          opacity: opacity * 1.5,
        }}
      />
    </div>
  );
};

interface ParticleData {
  left: number;
  top: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  colorIdx: number;
}

export const RankParticles = ({ rank, count: _count }: { rank: string; count?: number }) => {
  const rankInfo = getRankInfoFromString(rank);
  const { tier, theme } = rankInfo;
  const visualConfig = getTierVisualConfig(tier);
  const shouldReduceMotion = useReducedMotion();

  // Cap at config max, never exceed 24 for performance
  const numParticles = Math.min(visualConfig.particleCount, 24);

  // Stable particle positions — memoized so they don't re-randomize on re-render
  const particles = useMemo<ParticleData[]>(() => {
    if (numParticles === 0) return [];
    return Array.from({ length: numParticles }, (_, i) => ({
      left: (i * 37 + 11) % 100,
      top: (i * 53 + 7) % 100,
      duration: 2 + ((i * 17) % 30) / 10,
      delay: (i * 23) % 50 / 10,
      driftX: ((i * 13) % 60) - 30,
      driftY: 40 + (i * 7) % 80,
      colorIdx: i % 3,
    }));
  }, [numParticles]);

  if (numParticles === 0 || shouldReduceMotion) return null;

  const colors =
    tier === "Grandmaster"
      ? ["#fbbf24", "#ef4444", "#3b82f6"]
      : [theme.primary, theme.accent, theme.secondary];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: tier === "Grandmaster" ? "2px" : "1.5px",
            height: tier === "Grandmaster" ? "2px" : "1.5px",
            backgroundColor: colors[p.colorIdx],
            boxShadow: `0 0 6px ${colors[p.colorIdx]}`,
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: [0, -p.driftY],
            x: [0, p.driftX],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
