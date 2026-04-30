import { motion } from "framer-motion";
import { UserProps } from "./TopCompetitorCard";
import { Star } from "lucide-react";
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

// Generate a color based on the index or rank
const getAvatarColor = (rank: number) => {
  const colors = [
    "bg-emerald-500", // 4
    "bg-purple-500",  // 5
    "bg-pink-500",    // 6
    "bg-orange-500",  // 7
    "bg-blue-500",    // 8
    "bg-indigo-500",  // 9
    "bg-teal-500",    // 10
  ];
  return colors[(rank - 4) % colors.length] || "bg-gray-500";
};

export const LeaderboardRow = ({ user, index }: { user: UserProps; index: number }) => {
  const avatarColor = getAvatarColor(user.rank);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
      className="flex items-center gap-4 py-3 px-4 rounded-xl border border-white/5 bg-[#0F172A]/40 backdrop-blur-sm transition-colors"
    >
      {/* Rank Box */}
      <div className="w-8 h-8 rounded flex items-center justify-center bg-white/5 border border-white/10 text-slate-300 font-medium">
        {user.rank}
      </div>

      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center ${avatarColor}`}>
        <span className="text-xs font-bold text-white tracking-wider">
          {user.display_name.substring(0, 2).toUpperCase()}
        </span>
      </div>

      {/* Name and Role */}
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
        <h4 className="font-semibold text-white truncate text-base">{user.display_name}</h4>
        <p className="text-sm text-slate-400 truncate hidden md:block">{user.role}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="text-cyan-400 font-medium text-base w-24 text-right">
          <CountUp value={user.xp} suffix=" XP" />
        </div>
        <div className="flex items-center gap-1.5 text-yellow-500 w-24 justify-end font-medium">
          <Star className="w-4 h-4 fill-current text-yellow-500" />
          <CountUp value={user.wins} suffix=" Wins" />
        </div>
      </div>
    </motion.div>
  );
};
