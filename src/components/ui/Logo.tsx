import { motion } from "framer-motion";

export const Logo = ({ 
  className = "", 
  showText = true, 
  animated = false,
  textClassName = "text-2xl",
  iconSize = "w-10 h-10"
}: { 
  className?: string, 
  showText?: boolean, 
  animated?: boolean,
  textClassName?: string,
  iconSize?: string
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon Part */}
      <motion.div 
        className={`relative ${iconSize} flex-shrink-0`}
        whileHover={animated ? { scale: 1.05, rotate: -5 } : {}}
      >
        <div className="absolute inset-0 bg-blue-500 rounded-xl transform rotate-45 blur-[12px] opacity-40 shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10 drop-shadow-md">
          {/* Base Diamond */}
          <rect x="50" y="10" width="56.5" height="56.5" rx="14" transform="rotate(45 50 10)" fill="url(#blue_grad)" />
          {/* The white cut-out arrow */}
          <path d="M65 30 L40 50 L65 70 L75 60 L55 50 L75 40 Z" fill="white" />
          <defs>
            <linearGradient id="blue_grad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA"/>
              <stop offset="0.5" stopColor="#3B82F6"/>
              <stop offset="1" stopColor="#1E3A8A"/>
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      {/* Text Part */}
      {showText && (
        <span className={`font-bold tracking-wide text-white ${textClassName}`} style={{ fontFamily: "'Inter', sans-serif" }}>
          NEXORA
        </span>
      )}
    </div>
  );
};
