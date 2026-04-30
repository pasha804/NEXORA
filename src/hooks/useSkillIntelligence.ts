import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

export interface SkillBadge {
  badge_id: number;
  user_id: number;
  skill_name: string;
  verification_method?: string | null;
  verification_score: number;
  date_awarded: string;
}

export interface SkillProgress {
  skill_name: string;
  skill_xp: number;
  skill_level: number;
  endorsement_count: number;
  verified: boolean;
  last_updated?: string | null;
}

export interface TrendingSkill {
  skill_name: string;
  trend_score: number;
  engagement_volume: number;
  growth_rate: number;
}

export interface SkillEndorsement {
  endorsement_id: number;
  endorser_user_id: number;
  target_user_id: number;
  skill_name: string;
  timestamp: string;
}

export interface SkillRecommendation {
  skill_name: string;
  reason: string;
  source: string;
  suggested_level?: string | null;
}

export interface SkillIntelligenceSummary {
  user_id: number;
  skills_to_learn: SkillRecommendation[];
  skills_to_verify: SkillRecommendation[];
  trending_skills: TrendingSkill[];
}

export interface SkillActivityEntry {
  id: number;
  user_id: number;
  action_type: string;
  skill_name?: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export const useSkillBadges = (userId?: number) => {
  return useQuery<SkillBadge[]>({
    queryKey: ["skill-badges", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/skills/badges/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch skill badges");
      return res.json();
    },
  });
};

export const useSkillProgression = (userId?: number) => {
  return useQuery<SkillProgress[]>({
    queryKey: ["skill-progression", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/skills/progression/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch skill progression");
      return res.json();
    },
  });
};

export const endorseSkill = async (
  targetUserId: number,
  skillName: string,
  action: "add" | "remove" = "add"
) => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/skills/endorse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ target_user_id: targetUserId, skill_name: skillName, action }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Failed to endorse skill");
  }
  return res.json();
};

export const useTrendingSkills = () => {
  return useQuery<TrendingSkill[]>({
    queryKey: ["trending-skills"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/skills/trending`);
      if (!res.ok) throw new Error("Failed to fetch trending skills");
      return res.json();
    },
  });
};

export const useSkillEndorsements = (userId?: number) => {
  return useQuery<SkillEndorsement[]>({
    queryKey: ["skill-endorsements", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/skills/endorsements/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch endorsements");
      return res.json();
    },
  });
};

export const useSkillIntelligence = (userId?: number) => {
  return useQuery<SkillIntelligenceSummary>({
    queryKey: ["skill-intelligence", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/skills/intelligence/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch skill intelligence");
      return res.json();
    },
  });
};

export const useSkillActivity = (userId?: number) => {
  return useQuery<SkillActivityEntry[]>({
    queryKey: ["skill-activity", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/skills/activity/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch skill activity");
      return res.json();
    },
  });
};


