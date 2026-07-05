import { motion } from "framer-motion";

interface EnergyWaveSystemProps {
  color?: string; // e.g., "rgba(255,0,0,0.5)"
  className?: string;
}

export const EnergyWaveSystem = ({ color = "rgba(147,51,234,0.3)", className = "" }: EnergyWaveSystemProps) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Wave 1 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          filter: "blur(20px)",
          width: "200%",
          left: "-50%"
        }}
        animate={{
          x: ["0%", "50%", "0%"],
          scaleY: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Wave 2 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
          filter: "blur(30px)",
          height: "200%",
          top: "-50%"
        }}
        animate={{
          y: ["0%", "50%", "0%"],
          scaleX: [1, 1.5, 1],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      {/* Dynamic scanline overlay to give it a futuristic energy feel */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          background: "repeating-linear-gradient(transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
          backgroundSize: "100% 4px"
        }}
      />
    </div>
  );
};
