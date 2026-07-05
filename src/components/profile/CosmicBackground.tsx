import { motion } from "framer-motion";

interface CosmicBackgroundProps {
  intensity?: "low" | "medium" | "high";
  className?: string;
}

export const CosmicBackground = ({ intensity = "high", className = "" }: CosmicBackgroundProps) => {
  const opacityMap = {
    low: "opacity-40",
    medium: "opacity-70",
    high: "opacity-100",
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${opacityMap[intensity]} ${className}`}>
      {/* Deep space base */}
      <div className="absolute inset-0 bg-[#050014]" />
      
      {/* Nebula 1: Purple/Magenta */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-40 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(147,51,234,0.8) 0%, rgba(147,51,234,0) 70%)",
          top: "-20%",
          left: "-10%",
          animation: "cosmic-drift 25s ease-in-out infinite alternate"
        }}
      />
      
      {/* Nebula 2: Deep Blue/Cyan */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-30 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.8) 0%, rgba(6,182,212,0) 70%)",
          bottom: "-10%",
          right: "-10%",
          animation: "cosmic-drift 20s ease-in-out infinite alternate-reverse"
        }}
      />
      
      {/* Nebula 3: Core Pink/Red */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blur-[90px] opacity-20 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(225,29,72,0.8) 0%, rgba(225,29,72,0) 70%)",
          top: "40%",
          left: "30%",
          animation: "cosmic-drift 30s ease-in-out infinite alternate"
        }}
      />

      {/* Static Stars Layer (for depth) */}
      <div className="absolute inset-0" style={{
        backgroundImage: "radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px)",
        backgroundSize: "100px 100px",
        opacity: 0.1
      }} />

      {/* Dynamic Star Particles */}
      {intensity === "high" && (
        <div className="absolute inset-0">
           {Array.from({ length: 8 }).map((_, i) => (
             <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]"
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: Math.random() * 100 + "%",
                  scale: Math.random() * 0.5 + 0.5,
                  opacity: Math.random() * 0.5 + 0.2
                }}
                animate={{
                  y: [null, Math.random() * -50 + "%"],
                  opacity: [null, Math.random() * 0.8 + 0.4, 0],
                  scale: [null, Math.random() + 0.5, 0]
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 10
                }}
             />
           ))}
        </div>
      )}

      {/* Lightning/Energy flashes */}
      {intensity === "high" && (
        <div 
          className="absolute inset-0 opacity-0 mix-blend-overlay"
          style={{
            background: "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)",
            animation: "cosmic-flash 8s infinite"
          }}
        />
      )}
    </div>
  );
};
