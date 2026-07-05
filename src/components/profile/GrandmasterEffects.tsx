import { motion } from "framer-motion";
import { getRankInfoFromString } from "@/lib/rankSystem";

interface GrandmasterEffectsProps {
  rank: string;
  type: "banner" | "avatar" | "card" | "title" | "full";
  className?: string;
}

export const GrandmasterCrown = ({ className = "" }: { className?: string }) => (
  <motion.div
    className={`relative z-20 pointer-events-none ${className}`}
    animate={{ 
      y: [0, -10, 0], 
      rotate: [-5, 5, -5],
      filter: [
        "drop-shadow(0 0 5px rgba(251, 191, 36, 0.5))",
        "drop-shadow(0 0 20px rgba(251, 191, 36, 0.8))",
        "drop-shadow(0 0 5px rgba(251, 191, 36, 0.5))"
      ]
    }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
  >
    <div className="relative">
      <span className="text-5xl md:text-6xl select-none">👑</span>
      {/* Animated Shine */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
      />
    </div>
  </motion.div>
);

export const GrandmasterParticles = ({ count = 20 }: { count?: number }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: Math.random() * 3 + 1 + "px",
          height: Math.random() * 3 + 1 + "px",
          background: i % 4 === 0 ? "#fbbf24" : i % 4 === 1 ? "#ef4444" : i % 4 === 2 ? "#3b82f6" : "#ffffff",
          boxShadow: `0 0 10px ${i % 4 === 0 ? "#fbbf24" : i % 4 === 1 ? "#ef4444" : i % 4 === 2 ? "#3b82f6" : "#ffffff"}`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -100 - Math.random() * 200],
          x: [0, (Math.random() - 0.5) * 100],
          opacity: [0, 1, 0],
          scale: [0, 1.5, 0],
        }}
        transition={{
          duration: 4 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: "linear",
        }}
      />
    ))}
  </div>
);

export const GrandmasterEnergyWave = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[0, 1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className="absolute w-full h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${
            i % 3 === 0 ? "rgba(251, 191, 36, 0.4)" : i % 3 === 1 ? "rgba(239, 68, 68, 0.4)" : "rgba(59, 130, 246, 0.4)"
          }, transparent)`,
          top: `${20 + i * 20}%`,
        }}
        animate={{
          x: ["-100%", "100%"],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 3 + i,
          repeat: Infinity,
          delay: i * 0.5,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

export const GrandmasterCosmicBackground = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
    <motion.div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(ellipse at 30% 20%, rgba(255,0,0,0.1) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 30%, rgba(0,255,0,0.1) 0%, transparent 50%),
                      radial-gradient(ellipse at 50% 70%, rgba(0,150,255,0.1) 0%, transparent 50%)`,
      }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 5, repeat: Infinity }}
    />
    <div className="absolute inset-0 cosmic-drift" style={{
      backgroundImage: `radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.3), transparent),
                        radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.2), transparent),
                        radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.4), transparent),
                        radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.2), transparent)`,
      backgroundSize: "200px 200px",
    }} />
  </div>
);

export const GrandmasterTitle = ({ displayName, rank = "Grandmaster Elite" }: { displayName: string, rank?: string }) => {
  return (
    <div className="relative py-2">
      <motion.div
        className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r from-amber-500/20 via-red-500/20 to-blue-500/20 blur-2xl opacity-50"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <div className="relative flex flex-col items-center md:items-start">
        <div className="flex items-center gap-3">
          <motion.h1
            className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-2xl"
            animate={{
              textShadow: [
                "0 0 20px rgba(251, 191, 36, 0.5)",
                "0 0 40px rgba(239, 68, 68, 0.5)",
                "0 0 20px rgba(59, 130, 246, 0.5)",
                "0 0 20px rgba(251, 191, 36, 0.5)",
              ]
            }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            {displayName}
          </motion.h1>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-blue-500 text-white rounded-full p-1 shadow-[0_0_15px_rgba(59, 130, 246, 0.5)]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          </motion.div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-400 text-xs font-bold tracking-widest uppercase">
            {rank}
          </span>
          <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-400 text-xs font-bold tracking-widest uppercase">
            Nexora Founder
          </span>
        </div>
      </div>
    </div>
  );
};

export const GrandmasterEffects = ({ rank, type, className = "" }: GrandmasterEffectsProps) => {
  const isGrandmaster = getRankInfoFromString(rank).isGrandmaster;
  if (!isGrandmaster) return null;

  switch (type) {
    case "banner":
      return (
        <>
          <GrandmasterCosmicBackground className={className} />
          <GrandmasterEnergyWave />
          <GrandmasterParticles count={8} />
        </>
      );
    case "avatar":
      return (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}>
          <motion.div
            className="absolute w-full h-full rounded-full"
            style={{ boxShadow: "0 0 30px rgba(255,0,0,0.4), 0 0 60px rgba(0,255,0,0.2), 0 0 90px rgba(0,150,255,0.2)" }}
            animate={{ boxShadow: [
              "0 0 30px rgba(255,0,0,0.4), 0 0 60px rgba(0,255,0,0.2), 0 0 90px rgba(0,150,255,0.2)",
              "0 0 30px rgba(0,255,0,0.4), 0 0 60px rgba(0,0,255,0.2), 0 0 90px rgba(255,0,0,0.2)",
              "0 0 30px rgba(0,0,255,0.4), 0 0 60px rgba(255,0,0,0.2), 0 0 90px rgba(0,255,0,0.2)",
              "0 0 30px rgba(255,0,0,0.4), 0 0 60px rgba(0,255,0,0.2), 0 0 90px rgba(0,150,255,0.2)",
            ]}}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
      );
    case "card":
      return (
        <>
          <GrandmasterCosmicBackground className={className} />
          <GrandmasterParticles count={6} />
        </>
      );
    case "title":
      // Note: GrandmasterTitle requires displayName — use via direct import for named usage
      return null;
    case "full":
      return (
        <>
          <GrandmasterCosmicBackground className={className} />
          <GrandmasterEnergyWave />
          <GrandmasterParticles count={10} />
        </>
      );
  }
};

