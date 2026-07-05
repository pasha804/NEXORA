import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings, Edit, MessageCircle, UserPlus, UserCheck,
  Share2, Loader2, MapPin, Link2, Github, Calendar,
  Trophy, Flame, Swords, Crown, Star, Zap, Target, Users, Eye
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CosmicBackground } from "./CosmicBackground";
import { GrandmasterEffects, GrandmasterCrown } from "./GrandmasterEffects";
import { RankEmblemLarge } from "./RankEmblemLarge";
import { RankAura, RankParticles } from "./RankAura";
import { getRankInfoFromString, xpProgressInLevel, prestigeTierName } from "@/lib/rankSystem";
import { FollowersModal } from "./FollowersModal";
import { HolographicOverlay } from "./HolographicOverlay";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface ProfileData {
  id?: number;
  display_name: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  is_verified?: boolean;
  followers?: number;
  followers_count?: number;
  following?: number;
  following_count?: number;
  rank?: string;
  level?: number;
  xp?: number;
  prestige?: number;
  location?: string;
  website?: string;
  github_url?: string;
  created_at?: string;
  skills?: { name: string; verified?: boolean }[];
  social_stats?: {
    battle_wins?: number;
    battle_losses?: number;
    reputation_score?: number;
    streak_days?: number;
  };
  ranking_score?: number;
}

interface Props {
  profile: ProfileData;
  isOwnProfile: boolean;
  onEdit?: () => void;
}

const SHOWCASE_BADGES = [
  { name: "Nexora Legend", color: "from-purple-600 to-pink-600" },
  { name: "AI Battle King", color: "from-red-600 to-orange-600" },
  { name: "Grandmaster Elite", color: "from-amber-500 to-yellow-400" },
  { name: "Top Developer", color: "from-blue-600 to-cyan-500" },
  { name: "Code Conqueror", color: "from-indigo-600 to-purple-600" },
];

export const GrandmasterProfileHeader = ({ profile, isOwnProfile, onEdit }: Props) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersModal, setFollowersModal] = useState<{ open: boolean; tab: "followers" | "following" }>({
    open: false, tab: "followers",
  });

  const rankStr = profile.rank || "Grandmaster";
  const rankInfo = getRankInfoFromString(rankStr);
  const followers = profile.followers ?? profile.followers_count ?? 0;
  const following = profile.following ?? profile.following_count ?? 0;
  const level = profile.level ?? 100;
  const xp = profile.xp ?? 999999;
  const { percent: xpPercent, current: currentXp, needed: neededXp } = xpProgressInLevel(xp);
  const prestige = profile.prestige ?? 5;
  const rp = profile.ranking_score ?? 99999;

  const stats = profile.social_stats;
  const wins = stats?.battle_wins ?? 3012;
  const losses = stats?.battle_losses ?? 200;
  const matches = wins + losses || 5243;
  const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 94;
  const winStreak = stats?.streak_days ?? 47;
  const mvp = Math.floor(wins * 0.57) || 3012;

  const verifiedSkills = (profile.skills || []).filter(s => s.verified).slice(0, 5);

  useEffect(() => {
    if (!profile?.id || isOwnProfile) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;
    fetch(`${API_URL}/social/is-following/${profile.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setIsFollowing(data.is_following || false); })
      .catch(() => {});
  }, [profile?.id, isOwnProfile]);

  const handleFollow = async () => {
    const token = localStorage.getItem("access_token");
    if (!token || !profile.id) return;
    setFollowLoading(true);
    try {
      const endpoint = isFollowing
        ? `${API_URL}/social/unfollow/${profile.id}`
        : `${API_URL}/social/follow/${profile.id}`;
      const resp = await fetch(endpoint, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? "Unfollowed" : `Following ${profile.display_name}!`);
      }
    } catch { toast.error("Network error"); }
    finally { setFollowLoading(false); }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${profile.username}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Profile link copied!"));
  };

  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Jan 2025";

  return (
    <div className="relative overflow-hidden rounded-3xl mb-8 border border-amber-500/20">
      <CosmicBackground intensity="high" />
      <GrandmasterEffects rank={rankStr} type="full" />
      <HolographicOverlay />
      <div className="fire-trail-top" />
      <div className="fire-trail-bottom" />

      <div className="relative z-10 p-6 md:p-8 space-y-6">
        {/* Main header row */}
        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 items-start">
          {/* Avatar with ornate frame */}
          <div className="relative shrink-0 mx-auto xl:mx-0">
            <RankAura rank={rankStr} size="xl" intensity="high" />
            <RankParticles rank={rankStr} count={12} />
            <GrandmasterCrown className="absolute -top-10 left-1/2 -translate-x-1/2 z-30" />

            <motion.div
              className="gm-avatar-ornate relative"
              whileHover={{ scale: 1.03 }}
              animate={{
                boxShadow: [
                  "0 0 40px rgba(251,191,36,0.5), 0 0 80px rgba(147,51,234,0.3)",
                  "0 0 50px rgba(239,68,68,0.4), 0 0 90px rgba(59,130,246,0.3)",
                  "0 0 40px rgba(251,191,36,0.5), 0 0 80px rgba(147,51,234,0.3)",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Avatar className="w-40 h-40 md:w-48 md:h-48 ring-0">
                <AvatarImage src={profile.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-gray-900 text-amber-400 text-5xl font-black">
                  {profile.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
              <span className="px-4 py-1 bg-black/80 border border-amber-500/50 rounded-full text-amber-400 text-[10px] font-black uppercase tracking-widest">
                Grandmaster Elite
              </span>
            </div>
            <p className="text-center mt-6 text-amber-400/80 text-xs font-mono font-bold">
              {rp.toLocaleString()} RP
            </p>
          </div>

          {/* Center: identity */}
          <div className="flex-1 text-center xl:text-left space-y-3 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 text-[10px] font-black uppercase tracking-widest">
                #1 Global Leader
              </span>
            </motion.div>

            <div className="flex flex-col xl:flex-row xl:items-center gap-2 justify-center xl:justify-start">
              <motion.h1
                className="text-3xl md:text-5xl font-black text-white tracking-tight"
                animate={{
                  textShadow: [
                    "0 0 30px rgba(251,191,36,0.4)",
                    "0 0 40px rgba(239,68,68,0.3)",
                    "0 0 30px rgba(59,130,246,0.3)",
                    "0 0 30px rgba(251,191,36,0.4)",
                  ],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                {profile.display_name}
              </motion.h1>
              {profile.is_verified !== false && (
                <span className="inline-flex w-6 h-6 rounded-full bg-blue-500 items-center justify-center mx-auto xl:mx-0">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                </span>
              )}
            </div>

            <p className="text-white/50">@{profile.username}</p>

            <div className="flex flex-wrap gap-2 justify-center xl:justify-start">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
                Nexora Founder
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase">
                {rankStr}
              </span>
            </div>

            {/* Verified skills */}
            {verifiedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center xl:justify-start pt-1">
                {verifiedSkills.map((skill) => (
                  <span
                    key={skill.name}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white/80"
                  >
                    <Zap className="w-3 h-3 text-primary" />
                    {skill.name}
                    <span className="text-[9px] text-green-400 font-bold">Verified</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: rank emblem */}
          <div className="hidden lg:flex flex-col items-center shrink-0">
            <RankEmblemLarge rank={rankStr} rp={rp} />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 w-full xl:w-auto shrink-0">
            {isOwnProfile ? (
              <>
                <Button onClick={onEdit} className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold border-0">
                  <Edit className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
                <Button onClick={handleShare} variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10">
                  <Share2 className="w-4 h-4 mr-2" /> Share Profile
                </Button>
                <Button variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleFollow} disabled={followLoading} className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold">
                  {followLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isFollowing ? <UserCheck className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white" onClick={() => navigate("/messages")}>
                  <MessageCircle className="w-4 h-4 mr-2" /> Message
                </Button>
              </>
            )}
            <div className="p-3 rounded-xl bg-white/5 border border-amber-500/20 text-center">
              <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Season Rank</p>
              <p className="text-xs font-bold text-amber-300">Season 7 Top 1 Global</p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Level", value: level, sub: level >= 100 ? "Max Level" : "", icon: Star, color: "text-purple-400" },
            { label: "Prestige", value: prestigeTierName(prestige).replace("Prestige ", ""), sub: "", icon: Crown, color: "text-amber-400" },
            { label: "XP", value: `${currentXp.toLocaleString()}`, sub: `/ ${neededXp.toLocaleString()}`, icon: Trophy, color: "text-yellow-400" },
            { label: "Win Streak", value: winStreak, sub: "wins", icon: Flame, color: "text-orange-400" },
            { label: "Win Rate", value: `${winRate}%`, sub: winRate >= 90 ? "Legendary" : "", icon: Target, color: "text-green-400" },
            { label: "Matches", value: matches.toLocaleString(), sub: "", icon: Swords, color: "text-blue-400" },
            { label: "MVP", value: mvp.toLocaleString(), sub: "", icon: Crown, color: "text-amber-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center hover:bg-white/10 transition-colors"
            >
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className="text-[9px] text-white/40 uppercase tracking-wider font-bold">{stat.label}</p>
              <p className="text-lg font-black text-white">{stat.value}</p>
              {stat.sub && <p className="text-[9px] text-white/40">{stat.sub}</p>}
            </motion.div>
          ))}
        </div>

        {/* Energy progress bar */}
        <div className="h-2 rounded-full overflow-hidden bg-white/5 border border-white/10 p-0.5">
          <motion.div
            className="h-full rounded-full gm-energy-bar"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, xpPercent)}%` }}
            transition={{ duration: 1.2 }}
          />
        </div>

        {/* Bio + showcase badges */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm">
              {profile.bio?.split(".")[0] || "Nexora Founder • Full-Stack Architect • AI Battle King"}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              {profile.bio || "Building the future of competitive developer social. Grandmaster rank holder and Nexora platform architect."}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-white/50">
              {profile.location && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>
              )}
              {profile.website && (
                <a href={profile.website} className="flex items-center gap-1 hover:text-primary"><Link2 className="w-3 h-3" />Website</a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} className="flex items-center gap-1 hover:text-primary"><Github className="w-3 h-3" />GitHub</a>
              )}
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {joinDate}</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">Showcase Badges</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-end">
              {SHOWCASE_BADGES.map((badge, i) => (
                <motion.div
                  key={badge.name}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center border-2 border-white/20 shadow-lg cursor-pointer`}
                  title={badge.name}
                >
                  <span className="text-[8px] font-black text-white text-center leading-tight px-1">
                    {badge.name.split(" ")[0]}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Social quick stats */}
        <div className="flex flex-wrap gap-6 justify-center text-sm text-white/60 border-t border-white/10 pt-4">
          <button onClick={() => setFollowersModal({ open: true, tab: "followers" })} className="hover:text-white transition-colors">
            <span className="font-bold text-white">{followers >= 1000 ? `${(followers/1000).toFixed(0)}K+` : followers}</span> Followers
          </button>
          <button onClick={() => setFollowersModal({ open: true, tab: "following" })} className="hover:text-white transition-colors">
            <span className="font-bold text-white">{following}</span> Following
          </button>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span className="font-bold text-white">1.2M+</span> Profile Views
          </span>
        </div>

        {/* Footer motto */}
        <div className="text-center pt-2 border-t border-white/5">
          <p className="text-white/30 text-xs flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Online
            <span className="mx-2">•</span>
            <Crown className="w-3 h-3 text-amber-400" />
            "Code. Build. Compete. Conquer. Repeat."
          </p>
        </div>
      </div>

      <FollowersModal
        isOpen={followersModal.open}
        onClose={() => setFollowersModal({ ...followersModal, open: false })}
        userId={profile.id!}
        initialTab={followersModal.tab}
      />
    </div>
  );
};
