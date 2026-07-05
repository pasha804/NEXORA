import { getRankInfoFromString } from "@/lib/rankSystem";
import { GrandmasterProfileHeader } from "./GrandmasterProfileHeader";
import { StandardRankProfileHeader } from "./StandardRankProfileHeader";

interface ProfileData {
  id?: number;
  display_name: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  is_verified?: boolean;
  followers?: number;
  followers_count?: number;
  following?: number;
  following_count?: number;
  friends?: number;
  rank?: string;
  level?: number;
  xp?: number;
  prestige?: number;
  location?: string;
  website?: string;
  github_url?: string;
  linkedin_url?: string;
  ranking_score?: number;
  created_at?: string;
  skills?: { name: string; level?: string | number; verified?: boolean }[];
  social_stats?: {
    battle_wins?: number;
    battle_losses?: number;
    reputation_score?: number;
    streak_days?: number;
  };
}

interface HeroProfileHeaderProps {
  profile: ProfileData;
  isOwnProfile: boolean;
  onEdit?: () => void;
}

export const HeroProfileHeader = ({ profile, isOwnProfile, onEdit }: HeroProfileHeaderProps) => {
  const rankStr = profile.rank || "Novice";
  const isGrandmaster = getRankInfoFromString(rankStr).isGrandmaster;

  if (isGrandmaster) {
    return (
      <GrandmasterProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={onEdit}
      />
    );
  }

  return (
    <StandardRankProfileHeader
      profile={profile}
      isOwnProfile={isOwnProfile}
      onEdit={onEdit}
    />
  );
};
