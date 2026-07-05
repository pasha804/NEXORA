import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Users, MapPin, Home, UserCheck, ShieldCheck, MessageSquare, Settings, Star } from "lucide-react";
import { getRankInfoFromString, levelFromXp } from "@/lib/rankSystem";
import { Button } from "@/components/ui/button";
import { RankAura } from "./RankAura";

interface UserCardData {
  id: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  rank?: string;
  xp?: number;
  level?: number;
  prestige?: number;
  followers_count?: number;
  skills?: Array<{ name: string; level?: string | number } | string>;
  location?: string;
  is_verified?: boolean;
}

interface UserCardProps {
  user: UserCardData;
  index?: number;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export const UserCard = ({ user, index = 0, showActions = true, compact = false, className = "", onClick }: UserCardProps) => {
  const navigate = useNavigate();
  const rankStr = user.rank || "Novice";
  const rankInfo = getRankInfoFromString(rankStr);
  const userLevel = user.level || (user.xp ? levelFromXp(user.xp) : 1);
  const prestige = user.prestige || 0;
  const theme = rankInfo.theme;

  const initials = (user.display_name || user.username)
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isHighRank = ["Diamond", "Heroic", "Master", "Grandmaster"].includes(rankInfo.tier);

  const handleClick = () => {
    if (onClick) onClick();
    else navigate(`/profile/${user.username}`);
  };

  const skillList = user.skills?.slice(0, 3).map(s => typeof s === "string" ? s : s.name) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onClick={handleClick}
      className={`relative overflow-hidden rounded-2xl border transition-all cursor-pointer group shadow-xl ${className}`}
      style={{
        background: `linear-gradient(135deg, rgba(0,0,0,0.8), rgba(20,20,20,0.9))`,
        borderColor: isHighRank ? theme.primary.replace("rgb", "rgba").replace(")", ", 0.2)") : "rgba(255,255,255,0.05)",
        boxShadow: isHighRank ? `0 10px 30px ${theme.primary.replace("rgb", "rgba").replace(")", ", 0.1)")}` : "none",
      }}
    >
      {/* Dynamic Animated background for High Ranks */}
      {isHighRank && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity">
          <motion.div
            className="absolute -inset-[100%]"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, transparent, ${theme.primary}, transparent 40%)`,
            }}
          />
        </div>
      )}

      {/* Grandmaster Cosmic Drift */}
      {rankInfo.isGrandmaster && (
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] cosmic-drift" />
        </div>
      )}

      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <RankAura rank={rankStr} size="sm" intensity={rankInfo.isGrandmaster ? "high" : "low"} />
            <Avatar className={`w-16 h-16 ring-2 transition-transform duration-300 group-hover:scale-110`}
              style={{ ringColor: theme.primary }}
            >
              <AvatarImage src={user.avatar_url} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-black text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-black rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black text-white shadow-xl">
              {userLevel}
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className={`font-black tracking-tight text-lg truncate group-hover:text-primary transition-colors text-white`}>
                {user.display_name || user.username}
              </h3>
              {user.is_verified && (
                <div className="bg-blue-500 text-white rounded-full p-0.5 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                </div>
              )}
            </div>
            <p className="text-xs text-white/40 font-medium">@{user.username}</p>
          </div>
        </div>

        {/* Rank Badge Area */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-lg">
                {rankInfo.icon}
             </div>
             <div className={`text-xs font-black uppercase tracking-widest ${rankInfo.isGrandmaster ? 'text-gradient-animated' : ''}`} style={{ color: !rankInfo.isGrandmaster ? theme.primary : undefined }}>
               {rankStr}
             </div>
          </div>
          {prestige > 0 && (
            <div className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-[9px] font-black uppercase tracking-tighter">
              ✦ Prestige {prestige}
            </div>
          )}
        </div>

        {/* Bio */}
        {!compact && user.bio && (
          <p className="text-xs text-white/60 mb-4 line-clamp-2 leading-relaxed italic">
            "{user.bio}"
          </p>
        )}

        {/* Skills */}
        {skillList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {skillList.map((skill, i) => (
              <Badge key={i} variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-white/5 bg-white/5 text-white/70 group-hover:border-primary/20 group-hover:text-primary transition-all">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {!compact && (
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Followers</span>
                <span className="text-sm font-black text-white">{(user.followers_count || 0).toLocaleString()}</span>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/5 text-white/40 hover:text-white">
              View Profile
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const RANK_ASSETS: Record<string, string> = {
  Novice: "/assets/1783155182.png",
  Bronze: "/assets/1783155061.png",
  Silver: "/assets/1783155177.png",
  Gold: "/assets/1783155099.png",
  Platinum: "/assets/1783155237.png",
  Diamond: "/assets/1783155123.png",
  Heroic: "/assets/1783155215.png",
  Master: "/assets/1783155220.png",
  Grandmaster: "/assets/1783155226.png",
};

export const UserPreviewCard = ({ user }: { user: UserCardData }) => {
  const rankStr = user.rank || "Novice";
  const rankInfo = getRankInfoFromString(rankStr);
  const theme = rankInfo.theme;
  const assetUrl = RANK_ASSETS[rankInfo.tier] || RANK_ASSETS.Novice;
  const level = user.level || 1;
  const matches = (user as any).matches || 5;
  const winRate = (user as any).winRate || "20%";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="relative w-[340px] overflow-hidden rounded-xl border border-white/10 shadow-2xl flex"
      style={{
        background: `linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(5,5,5,0.98) 100%)`,
        borderColor: rankInfo.glowColor.replace(")", ", 0.4)"),
        boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 40px ${rankInfo.glowColor.replace(")", ", 0.15)")}`
      }}
    >
      {/* Left Icon Rail */}
      <div className="w-10 bg-black/40 border-r border-white/5 flex flex-col items-center py-4 gap-6 shrink-0 z-10">
        <Home className="w-4 h-4 text-white/50 hover:text-white transition-colors cursor-pointer" />
        <UserCheck className="w-4 h-4 text-white/50 hover:text-white transition-colors cursor-pointer" />
        <ShieldCheck className="w-4 h-4 text-white/50 hover:text-white transition-colors cursor-pointer" />
        <MessageSquare className="w-4 h-4 text-white/50 hover:text-white transition-colors cursor-pointer" />
        <Settings className="w-4 h-4 text-white/50 hover:text-white transition-colors cursor-pointer mt-auto" />
      </div>

      <div className="flex-1 p-5 relative z-10">
        {/* Header Profile Info */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <Avatar className="w-12 h-12 ring-2 shadow-xl" style={{ ringColor: rankInfo.glowColor }}>
              <AvatarImage src={user.avatar_url} className="object-cover" />
              <AvatarFallback className="bg-gray-800 text-white font-black text-sm">
                {(user.display_name || user.username)?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-bold text-sm text-white truncate max-w-[140px] leading-tight">{user.display_name || user.username}</h4>
              <div className="text-[10px] text-white/40 mb-1">@{user.username}</div>
              <div className="text-[9px] text-white/60 line-clamp-1">{user.bio || "New to Nexora"}</div>
              <div className="text-[9px] text-white/40 flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5" /> Earth
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center border border-white/10 rounded-md bg-white/5 px-2 py-1">
            <span className="text-[8px] text-white/40 uppercase">Level</span>
            <span className="text-xs font-bold text-white">{level}</span>
          </div>
        </div>

        {/* Large Emblem */}
        <div className="flex justify-center mb-2 h-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />
          <img src={assetUrl} alt={rankInfo.tier} className="w-full h-full object-contain filter drop-shadow-2xl" />
        </div>

        {/* Rank & RP */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Rank</div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              {rankStr}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Matches</div>
            <div className="font-bold text-sm text-white">{matches}</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-[9px] text-white/40 uppercase tracking-widest">Win Rate</div>
            <div className="text-sm font-bold text-green-400">{winRate}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-[9px] text-white/40 uppercase tracking-widest">Followers</div>
            <div className="text-sm font-bold text-white">{(user.followers_count || 0).toLocaleString()}</div>
          </div>
        </div>

        <Button className="w-full rounded-lg bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-[10px] h-9">
          View Full Profile
        </Button>
      </div>
    </motion.div>
  );
};
