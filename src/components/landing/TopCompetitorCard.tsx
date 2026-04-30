import { motion } from "framer-motion";
import { Crown, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useMotionValue, useTransform, animate } from "framer-motion";

const CountUp = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const animation = animate(count, value, {
      duration: 2,
      onUpdate: (latest) => {
        setDisplay(Math.round(latest).toLocaleString());
      }
    });
    return animation.stop;
  }, [value, count]);

  return <>{display}{suffix}</>;
};

export interface UserProps {
  rank: number;
  username: string;
  display_name: string;
  role: string;
  xp: number;
  wins: number;
  rank_level: string;
  avatar: string | null;
}

const Medal = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return <Crown className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" fill="currentColor" />;
  }
  
  const isSilver = rank === 2;
  const bgColor = isSilver ? "bg-slate-300" : "bg-[#B87333]";
  const ribbonColor = "bg-[#5A87C6]"; // Blue ribbon for both 2 and 3 as in the image

  return (
    <div className="relative flex flex-col items-center">
      {/* Ribbon part */}
      <div className="flex gap-[2px] mb-[-6px] z-0">
        <div className={`w-3 h-4 ${ribbonColor} rounded-sm transform -skew-y-[20deg]`} />
        <div className={`w-3 h-4 ${ribbonColor} rounded-sm transform skew-y-[20deg]`} />
      </div>
      {/* Medal circle */}
      <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center z-10 shadow-lg border-2 border-[#0B1120]`}>
        <span className="text-[#0B1120] font-black text-sm">{rank}</span>
      </div>
    </div>
  );
};

export const TopCompetitorCard = ({ user, position }: { user: UserProps; position: number }) => {
  const isFirst = position === 1;
  const isSecond = position === 2;
  const isThird = position === 3;

  const getStyles = () => {
    if (isFirst) {
      return {
        card: "bg-[#0B1120]/80 border-cyan-400/80 shadow-[0_0_30px_rgba(34,211,238,0.3)]",
        avatarBg: "bg-gradient-to-br from-yellow-400 to-orange-500",
        size: "w-full md:w-[300px]",
        scale: 1,
      };
    }
    if (isSecond) {
      return {
        card: "bg-[#0B1120]/60 border-slate-500/50",
        avatarBg: "bg-gradient-to-br from-slate-200 to-slate-400",
        size: "w-full md:w-[260px]",
        scale: 1,
      };
    }
    return {
      card: "bg-[#0B1120]/60 border-[#8A4A23]/50",
      avatarBg: "bg-gradient-to-br from-orange-600 to-red-700",
      size: "w-full md:w-[260px]",
      scale: 1,
    };
  };

  const styles = getStyles();

  // The central card floats
  const floatAnimation = isFirst ? { y: [-5, 5, -5] } : {};
  const floatTransition = isFirst ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : {};

  return (
    <div className={`relative flex flex-col items-center ${styles.size} ${isFirst ? 'z-20' : 'z-10 mt-10 md:mt-16'}`}>
      
      {/* Medal Icon positioned above the card slightly */}
      <div className={`absolute ${isFirst ? '-top-12' : '-top-10'} z-30 flex justify-center w-full`}>
        <Medal rank={position} />
      </div>

      {/* Main Card */}
      <motion.div 
        animate={floatAnimation}
        transition={floatTransition}
        className={`relative w-full rounded-2xl overflow-hidden ${styles.card} border flex flex-col items-center pt-14 pb-8 px-6 backdrop-blur-md`}
      >
        {/* Glow effect for first place inside card */}
        {isFirst && (
          <div className="absolute inset-0 bg-cyan-400/5 pointer-events-none" />
        )}

        {/* Avatar */}
        <div className={`w-24 h-24 rounded-full mb-6 flex items-center justify-center ${styles.avatarBg} shadow-lg`}>
          <span className="text-3xl font-bold text-white tracking-wider">{user.display_name.substring(0, 2).toUpperCase()}</span>
        </div>

        {/* User Info */}
        <h3 className="text-2xl font-bold text-white text-center mb-1">{user.display_name}</h3>
        <p className="text-slate-400 text-sm mb-6">{user.role}</p>

        {/* XP and Wins */}
        <div className="flex flex-col items-center space-y-3">
          <div className="text-cyan-400 font-bold text-2xl tracking-wide">
            <CountUp value={user.xp} suffix=" XP" />
          </div>
          <div className="flex items-center gap-1.5 text-yellow-500 font-medium text-lg">
            <Star className="w-5 h-5 fill-current text-yellow-500" />
            <CountUp value={user.wins} suffix=" Wins" />
          </div>
        </div>
      </motion.div>

      {/* Futuristic Floor Stand for #1 */}
      {isFirst && (
        <div className="absolute -bottom-16 w-48 h-20 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-full h-4 border border-cyan-500/40 rounded-[100%] shadow-[0_0_15px_rgba(34,211,238,0.5)] absolute bottom-8 opacity-50" />
          <div className="w-3/4 h-2 border border-cyan-400/80 rounded-[100%] shadow-[0_0_20px_rgba(34,211,238,0.8)] absolute bottom-6 opacity-80" />
          <div className="w-1/2 h-1 bg-cyan-300 rounded-[100%] shadow-[0_0_25px_rgba(34,211,238,1)] absolute bottom-4" />
          {/* Light beam shooting up */}
          <div className="w-16 h-24 bg-gradient-to-t from-cyan-400/20 to-transparent absolute bottom-5 rounded-[100%] blur-sm" />
        </div>
      )}
    </div>
  );
};
