import { motion } from "framer-motion";

interface AnimatedRankStarsProps {
  rankTier: string; // e.g. "Bronze", "Grandmaster"
  subRank?: number; // 1 to 5
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const AnimatedRankStars = ({ rankTier, subRank = 0, className = "", size = "md" }: AnimatedRankStarsProps) => {
  if (rankTier === "Novice") return null;

  const starCount = rankTier === "Grandmaster" ? 5 : subRank;
  if (starCount === 0) return null;

  const isGrandmaster = rankTier === "Grandmaster";
  const sizeClass = size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5";

  // Colors based on rank
  const getStarColor = () => {
    switch(rankTier) {
      case "Bronze": return "text-[#CD7F32]";
      case "Silver": return "text-gray-300";
      case "Gold": return "text-yellow-400";
      case "Platinum": return "text-cyan-400";
      case "Diamond": return "text-blue-400";
      case "Heroic": return "text-red-500";
      case "Master": return "text-purple-400";
      case "Grandmaster": return "text-yellow-300"; // Or animated RGB class
      default: return "text-primary";
    }
  };

  const starColor = getStarColor();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: starCount }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: i * 0.1, 
            type: "spring",
            stiffness: 260,
            damping: 20 
          }}
          className={`relative flex items-center justify-center ${isGrandmaster ? "animate-pulse" : ""}`}
        >
          {isGrandmaster && (
            <motion.div 
              className="absolute inset-0 bg-yellow-400/50 rounded-full blur-sm"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          )}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`${sizeClass} ${starColor} ${isGrandmaster ? "drop-shadow-[0_0_5px_rgba(253,224,71,0.8)] rgb-glow" : "drop-shadow-md"}`}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};
