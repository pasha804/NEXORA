import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings, Edit, MessageCircle, UserPlus, UserCheck,
  Share2, Loader2, MapPin
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { DynamicProfileTheme, RankAvatarRing } from "./DynamicProfileTheme";
import { RankAura, RankParticles } from "./RankAura";
import { RankEmblemLarge } from "./RankEmblemLarge";
import { RankBadgeAnimated } from "./RankBadgeAnimated";
import { EnergyWaveSystem } from "./EnergyWaveSystem";
import { getRankInfoFromString, xpProgressInLevel, getTierVisualConfig } from "@/lib/rankSystem";
import { getDistinctiveProfileStyle } from "@/lib/profileDistinctiveness";
import { FollowersModal } from "./FollowersModal";
import { PrestigeOverlay } from "./PrestigeOverlay";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface ProfileData {
  id?: number;
  display_name: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  followers?: number;
  followers_count?: number;
  following?: number;
  following_count?: number;
  rank?: string;
  level?: number;
  xp?: number;
  prestige?: number;
  location?: string;
  ranking_score?: number;
  social_stats?: { battle_wins?: number; battle_losses?: number };
}

interface Props {
  profile: ProfileData;
  isOwnProfile: boolean;
  onEdit?: () => void;
}

export const StandardRankProfileHeader = ({ profile, isOwnProfile, onEdit }: Props) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersModal, setFollowersModal] = useState<{ open: boolean; tab: "followers" | "following" }>({
    open: false, tab: "followers",
  });

  const rankStr = profile.rank || "Novice";
  const rankInfo = getRankInfoFromString(rankStr);
  const { tier, theme } = rankInfo;
  const followers = profile.followers ?? profile.followers_count ?? 0;
  const following = profile.following ?? profile.following_count ?? 0;
  const level = profile.level ?? 1;
  const xp = profile.xp ?? 0;
  const { percent: xpPercent, current: currentXp, needed: neededXp } = xpProgressInLevel(xp);
  const prestige = profile.prestige ?? 0;
  const rp = profile.ranking_score ?? rankInfo.rp;

  const stats = profile.social_stats;
  const wins = stats?.battle_wins ?? 0;
  const losses = stats?.battle_losses ?? 0;
  const matches = wins + losses;
  const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;

  const distinctive = getDistinctiveProfileStyle({
    rank: rankStr,
    xp,
    reputation: 0,
    followers,
    achievementCount: 0,
    prestige,
  });

  const visualConfig = getTierVisualConfig(tier);
  const particleCount = visualConfig.particleCount;
  const auraIntensity = distinctive.auraIntensity;
  const showEnergy = visualConfig.energyWaves;

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

  const avatarSize = ["Diamond", "Heroic", "Master"].includes(tier)
    ? "w-36 h-36 md:w-40 md:h-40"
    : ["Gold", "Platinum"].includes(tier)
    ? "w-32 h-32"
    : "w-28 h-28";

  return (
    <PrestigeOverlay rank={rankStr} prestige={prestige} className="mb-8 rounded-3xl">
      <DynamicProfileTheme rank={rankStr} className="rounded-3xl overflow-hidden">
        {showEnergy && <EnergyWaveSystem color={rankInfo.glowColor.replace(")", ", 0.35)")} />}
        <div className={`rank-card-${tier.toLowerCase()} relative`}>
          {/* Banner */}
          <div className="h-32 md:h-40 relative overflow-hidden">
            {profile.banner_url ? (
              <img src={profile.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            ) : (
              <div
                className="absolute inset-0 opacity-40"
                style={{ background: `linear-gradient(135deg, ${theme.primary}22, transparent, ${theme.secondary}22)` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            {particleCount > 0 && (
              <RankParticles rank={rankStr} count={particleCount} className="absolute inset-0" />
            )}
          </div>

          <div className="relative px-6 pb-6 -mt-16">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="relative shrink-0 mx-auto md:mx-0">
                <RankAura rank={rankStr} size="lg" intensity={auraIntensity} />
                <RankAvatarRing rank={rankStr} size={avatarSize}>
                  <Avatar className="w-full h-full">
                    <AvatarImage src={profile.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-gray-800 text-white text-3xl font-bold">
                      {profile.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </RankAvatarRing>
                <div
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 border-black"
                  style={{ background: theme.primary, color: "#000" }}
                >
                  {level}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left space-y-2 pt-4 md:pt-8 min-w-0">
                <h1 className={`text-2xl md:text-3xl font-black text-white ${distinctive.textGradientClass}`}>
                  {profile.display_name}
                </h1>
                <p className="text-white/50">@{profile.username}</p>
                {profile.location && (
                  <p className="text-white/40 text-sm flex items-center gap-1 justify-center md:justify-start">
                    <MapPin className="w-3 h-3" /> {profile.location}
                  </p>
                )}
                <p className="text-white/60 text-sm max-w-lg">{profile.bio || "No bio yet."}</p>
                <div className="flex justify-center md:justify-start">
                  <RankBadgeAnimated rank={rankStr} size="md" />
                </div>
              </div>

              {/* Rank emblem - visible on md+ */}
              <div className="hidden md:block shrink-0">
                <RankEmblemLarge rank={rankStr} rp={rp} />
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full md:w-auto justify-center md:flex-col shrink-0">
                {isOwnProfile ? (
                  <Button onClick={onEdit} variant="outline" size="sm" className="rounded-xl border-white/20 bg-white/5 text-white">
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                ) : (
                  <Button onClick={handleFollow} disabled={followLoading} size="sm" className="rounded-xl">
                    {followLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  </Button>
                )}
                <Button onClick={handleShare} variant="outline" size="sm" className="rounded-xl border-white/20 bg-white/5 text-white">
                  <Share2 className="w-4 h-4" />
                </Button>
                {isOwnProfile && (
                  <Button variant="outline" size="sm" className="rounded-xl border-white/20 bg-white/5 text-white" onClick={() => navigate("/settings")}>
                    <Settings className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mt-6">
              {[
                { label: "Followers", value: followers.toLocaleString(), onClick: () => setFollowersModal({ open: true, tab: "followers" }) },
                { label: "Following", value: following.toLocaleString(), onClick: () => setFollowersModal({ open: true, tab: "following" }) },
                { label: "Matches", value: matches.toLocaleString() },
                { label: "Win Rate", value: matches > 0 ? `${winRate}%` : "—" },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={s.onClick}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-center hover:bg-white/10 transition-colors"
                >
                  <p className="text-lg font-black text-white">{s.value}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">{s.label}</p>
                </button>
              ))}
            </div>

            {/* XP bar */}
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs text-white/50">
                <span>Level {level}</span>
                <span>{currentXp.toLocaleString()} / {neededXp.toLocaleString()} XP</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  className={`h-full rounded-full ${visualConfig.xpBarClass}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <p className="text-right text-[10px] font-mono text-white/40">{rp} RP</p>
            </div>
          </div>
        </div>

        <FollowersModal
          isOpen={followersModal.open}
          onClose={() => setFollowersModal({ ...followersModal, open: false })}
          userId={profile.id!}
          initialTab={followersModal.tab}
        />
      </DynamicProfileTheme>
    </PrestigeOverlay>
  );
};
