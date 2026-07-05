/**
 * Nexora Free Fire-Style Rank System
 * 8 tiers × 5 divisions + Grandmaster
 * RP starts at 1000, each division = 50 RP, 5 stars per division
 */

export type RankTier =
  | "Novice"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Heroic"
  | "Master"
  | "Grandmaster";

export interface RankInfo {
  full: string;        // e.g. "Diamond III"
  tier: RankTier;      // e.g. "Diamond"
  tierIndex: number;   // 0=Novice … 8=Grandmaster
  division: number;    // 1-5 (1 = highest in tier), 0 for Grandmaster
  stars: number;       // 0-5 filled stars in current division
  rp: number;          // raw RP value
  rpInDivision: number; // 0-49 progress within division
  nextRankRp: number;  // RP needed to reach next division
  color: string;       // Tailwind color class
  glowColor: string;   // CSS glow color
  icon: string;        // emoji icon
  isGrandmaster: boolean;
}

// RP thresholds — each division is 50 RP wide
// Tier starts: Novice=0, Bronze=100, Silver=400, Gold=650, Platinum=900,
//              Diamond=1200, Heroic=2200, Master=3200, Grandmaster=4200
const DIVISIONS: { min: number; full: string; tier: RankTier; division: number }[] = [
  { min: 4200, full: "Grandmaster",  tier: "Grandmaster", division: 0 },
  { min: 4000, full: "Master V",     tier: "Master",      division: 5 },
  { min: 3800, full: "Master IV",    tier: "Master",      division: 4 },
  { min: 3600, full: "Master III",   tier: "Master",      division: 3 },
  { min: 3400, full: "Master II",    tier: "Master",      division: 2 },
  { min: 3200, full: "Master I",     tier: "Master",      division: 1 },
  { min: 3000, full: "Heroic V",     tier: "Heroic",      division: 5 },
  { min: 2800, full: "Heroic IV",    tier: "Heroic",      division: 4 },
  { min: 2600, full: "Heroic III",   tier: "Heroic",      division: 3 },
  { min: 2400, full: "Heroic II",    tier: "Heroic",      division: 2 },
  { min: 2200, full: "Heroic I",     tier: "Heroic",      division: 1 },
  { min: 2000, full: "Diamond V",    tier: "Diamond",     division: 5 },
  { min: 1800, full: "Diamond IV",   tier: "Diamond",     division: 4 },
  { min: 1600, full: "Diamond III",  tier: "Diamond",     division: 3 },
  { min: 1400, full: "Diamond II",   tier: "Diamond",     division: 2 },
  { min: 1200, full: "Diamond I",    tier: "Diamond",     division: 1 },
  { min: 1100, full: "Platinum V",   tier: "Platinum",    division: 5 },
  { min: 1050, full: "Platinum IV",  tier: "Platinum",    division: 4 },
  { min: 1000, full: "Platinum III", tier: "Platinum",    division: 3 },
  { min: 950,  full: "Platinum II",  tier: "Platinum",    division: 2 },
  { min: 900,  full: "Platinum I",   tier: "Platinum",    division: 1 },
  { min: 850,  full: "Gold V",       tier: "Gold",        division: 5 },
  { min: 800,  full: "Gold IV",      tier: "Gold",        division: 4 },
  { min: 750,  full: "Gold III",     tier: "Gold",        division: 3 },
  { min: 700,  full: "Gold II",      tier: "Gold",        division: 2 },
  { min: 650,  full: "Gold I",       tier: "Gold",        division: 1 },
  { min: 600,  full: "Silver V",     tier: "Silver",      division: 5 },
  { min: 550,  full: "Silver IV",    tier: "Silver",      division: 4 },
  { min: 500,  full: "Silver III",   tier: "Silver",      division: 3 },
  { min: 450,  full: "Silver II",    tier: "Silver",      division: 2 },
  { min: 400,  full: "Silver I",     tier: "Silver",      division: 1 },
  { min: 350,  full: "Bronze V",     tier: "Bronze",      division: 5 },
  { min: 300,  full: "Bronze IV",    tier: "Bronze",      division: 4 },
  { min: 250,  full: "Bronze III",   tier: "Bronze",      division: 3 },
  { min: 200,  full: "Bronze II",    tier: "Bronze",      division: 2 },
  { min: 100,  full: "Bronze I",     tier: "Bronze",      division: 1 },
  { min: 0,    full: "Novice",       tier: "Novice",      division: 0 },
];

const TIER_STYLES: Record<RankTier, { color: string; glowColor: string; icon: string; theme: any }> = {
  Novice: {
    color: "text-gray-400",
    glowColor: "rgba(156,163,175,0.3)",
    icon: "🔰",
    theme: {
      primary: "rgb(156, 163, 175)",
      secondary: "rgb(75, 85, 99)",
      accent: "rgb(209, 213, 219)",
      glow: "rgba(156, 163, 175, 0.2)"
    }
  },
  Bronze: {
    color: "text-orange-500",
    glowColor: "rgba(249, 115, 22, 0.4)",
    icon: "🥉",
    theme: {
      primary: "rgb(249, 115, 22)",
      secondary: "rgb(194, 65, 12)",
      accent: "rgb(251, 146, 60)",
      glow: "rgba(249, 115, 22, 0.3)"
    }
  },
  Silver: {
    color: "text-slate-300",
    glowColor: "rgba(203, 213, 225, 0.5)",
    icon: "🥈",
    theme: {
      primary: "rgb(203, 213, 225)",
      secondary: "rgb(148, 163, 184)",
      accent: "rgb(241, 245, 249)",
      glow: "rgba(203, 213, 225, 0.4)"
    }
  },
  Gold: {
    color: "text-yellow-400",
    glowColor: "rgba(250, 204, 21, 0.6)",
    icon: "🥇",
    theme: {
      primary: "rgb(250, 204, 21)",
      secondary: "rgb(161, 98, 7)",
      accent: "rgb(254, 240, 138)",
      glow: "rgba(250, 204, 21, 0.5)"
    }
  },
  Platinum: {
    color: "text-cyan-400",
    glowColor: "rgba(34, 211, 238, 0.6)",
    icon: "💎",
    theme: {
      primary: "rgb(34, 211, 238)",
      secondary: "rgb(147, 51, 234)",
      accent: "rgb(165, 243, 252)",
      glow: "rgba(34, 211, 238, 0.5)"
    }
  },
  Diamond: {
    color: "text-blue-400",
    glowColor: "rgba(96, 165, 250, 0.7)",
    icon: "💠",
    theme: {
      primary: "rgb(96, 165, 250)",
      secondary: "rgb(236, 72, 153)",
      accent: "rgb(191, 219, 254)",
      glow: "rgba(96, 165, 250, 0.6)"
    }
  },
  Heroic: {
    color: "text-red-500",
    glowColor: "rgba(239, 68, 68, 0.8)",
    icon: "⚡",
    theme: {
      primary: "rgb(239, 68, 68)",
      secondary: "rgb(147, 51, 234)",
      accent: "rgb(252, 165, 165)",
      glow: "rgba(239, 68, 68, 0.7)"
    }
  },
  Master: {
    color: "text-red-500",
    glowColor: "rgba(220, 38, 38, 0.85)",
    icon: "🔥",
    theme: {
      primary: "rgb(220, 38, 38)",
      secondary: "rgb(234, 179, 8)",
      accent: "rgb(252, 165, 165)",
      glow: "rgba(220, 38, 38, 0.7)"
    }
  },
  Grandmaster: {
    color: "text-amber-400",
    glowColor: "rgba(251, 191, 36, 1.0)",
    icon: "👑",
    theme: {
      primary: "rgb(251, 191, 36)",
      secondary: "rgb(220, 38, 38)",
      accent: "rgb(254, 243, 199)",
      glow: "rgba(251, 191, 36, 0.8)"
    }
  },
};

const TIER_ORDER: RankTier[] = ["Novice","Bronze","Silver","Gold","Platinum","Diamond","Heroic","Master","Grandmaster"];

export function getRankInfo(rp: number): RankInfo & { theme: any } {
  const div = DIVISIONS.find(d => rp >= d.min) ?? DIVISIONS[DIVISIONS.length - 1];
  const style = TIER_STYLES[div.tier];

  // Find next division threshold
  const idx = DIVISIONS.indexOf(div);
  const nextDiv = idx > 0 ? DIVISIONS[idx - 1] : null;
  const nextRankRp = nextDiv ? nextDiv.min : div.min;

  // Stars: 0-5 within current 50-RP division window
  const rpInDiv = rp - div.min;
  const divWidth = nextDiv ? nextDiv.min - div.min : 50;
  const stars = div.tier === "Grandmaster" ? 5 : Math.min(5, Math.floor((rpInDiv / divWidth) * 5));

  return {
    full: div.full,
    tier: div.tier,
    tierIndex: TIER_ORDER.indexOf(div.tier),
    division: div.division,
    stars,
    rp,
    rpInDivision: rpInDiv,
    nextRankRp,
    color: style.color,
    glowColor: style.glowColor,
    icon: style.icon,
    theme: style.theme,
    isGrandmaster: div.tier === "Grandmaster",
  };
}

/** Parse a rank string like "Diamond III" into RankInfo by finding its RP floor */
export function getRankInfoFromString(rankStr: string): RankInfo & { theme: any } {
  const div = DIVISIONS.find(d => d.full === rankStr);
  if (!div) return getRankInfo(0);
  return getRankInfo(div.min);
}

/** XP required to reach next level: 1000 × (1 + level × 0.15) */
export function xpForNextLevel(level: number): number {
  return Math.floor(1000 * (1 + level * 0.15));
}

/** Current level from total XP using progressive formula */
export function levelFromXp(totalXp: number): number {
  let level = 1;
  let accumulated = 0;
  while (true) {
    const needed = xpForNextLevel(level);
    if (accumulated + needed > totalXp) break;
    accumulated += needed;
    level++;
    if (level > 200) break; // safety cap
  }
  return level;
}

/** XP progress within current level */
export function xpProgressInLevel(totalXp: number): { current: number; needed: number; percent: number } {
  let level = 1;
  let accumulated = 0;
  while (true) {
    const needed = xpForNextLevel(level);
    if (accumulated + needed > totalXp) {
      const current = totalXp - accumulated;
      return { current, needed, percent: Math.min(100, (current / needed) * 100) };
    }
    accumulated += needed;
    level++;
    if (level > 200) break;
  }
  return { current: 0, needed: 1000, percent: 0 };
}

/** Milestone levels that unlock special rewards */
export const MILESTONE_LEVELS = [10, 25, 50, 75, 100];

export function isMilestoneLevel(level: number): boolean {
  return MILESTONE_LEVELS.includes(level);
}

/** Prestige tier from prestige count */
export function prestigeTierName(prestige: number): string {
  const tiers = ["", "Prestige I", "Prestige II", "Prestige III", "Prestige IV", "Prestige Master"];
  return tiers[Math.min(prestige, 5)] || `Prestige ${prestige}`;
}

// ─── Single source-of-truth for all tier visual configs ───────────────────────
export interface TierVisualConfig {
  /** Hex primary color */
  primaryHex: string;
  /** CSS rgba glow color */
  glowColor: string;
  /** Max particle count (0 = none) */
  particleCount: number;
  /** CSS animation class for avatar ring */
  ringAnimation: "none" | "aura-pulse" | "aura-pulse-intense" | "rgb-glow";
  /** Card background Tailwind classes */
  cardBgClass: string;
  /** Border Tailwind/CSS */
  borderClass: string;
  /** XP bar CSS class */
  xpBarClass: string;
  /** Whether to show shimmer border overlay */
  shimmerBorder: boolean;
  /** Whether to show glassmorphism (Platinum+) */
  glassmorphism: boolean;
  /** Whether to show fire-trail top/bottom (Grandmaster only) */
  fireTrail: boolean;
  /** Whether to show RGB cycle effects */
  rgbCycle: boolean;
  /** CSS class for rank text glow */
  textGlowClass: string;
  /** Avatar aura layer count (0–5) */
  auraLayers: number;
  /** Whether energy waves should show */
  energyWaves: boolean;
}

const TIER_VISUAL_CONFIGS: Record<RankTier, TierVisualConfig> = {
  Novice: {
    primaryHex: "#6B7280", glowColor: "rgba(107,114,128,0.3)",
    particleCount: 0, ringAnimation: "none",
    cardBgClass: "bg-gray-900/60", borderClass: "border border-gray-700/30",
    xpBarClass: "xp-bar-novice", shimmerBorder: false, glassmorphism: false,
    fireTrail: false, rgbCycle: false, textGlowClass: "", auraLayers: 0, energyWaves: false,
  },
  Bronze: {
    primaryHex: "#D97706", glowColor: "rgba(217,119,6,0.4)",
    particleCount: 0, ringAnimation: "none",
    cardBgClass: "bg-gradient-to-br from-orange-950/40 to-black/60",
    borderClass: "border border-orange-700/25",
    xpBarClass: "xp-bar-bronze", shimmerBorder: false, glassmorphism: false,
    fireTrail: false, rgbCycle: false, textGlowClass: "", auraLayers: 1, energyWaves: false,
  },
  Silver: {
    primaryHex: "#94A3B8", glowColor: "rgba(148,163,184,0.5)",
    particleCount: 3, ringAnimation: "aura-pulse",
    cardBgClass: "bg-gradient-to-br from-slate-900/50 to-black/70",
    borderClass: "border border-slate-400/25",
    xpBarClass: "xp-bar-silver", shimmerBorder: false, glassmorphism: false,
    fireTrail: false, rgbCycle: false, textGlowClass: "", auraLayers: 1, energyWaves: false,
  },
  Gold: {
    primaryHex: "#EAB308", glowColor: "rgba(234,179,8,0.6)",
    particleCount: 5, ringAnimation: "aura-pulse",
    cardBgClass: "bg-gradient-to-br from-yellow-950/40 via-black/60 to-amber-950/40",
    borderClass: "border border-yellow-500/35",
    xpBarClass: "xp-bar-gold", shimmerBorder: true, glassmorphism: false,
    fireTrail: false, rgbCycle: false, textGlowClass: "", auraLayers: 2, energyWaves: false,
  },
  Platinum: {
    primaryHex: "#22D3EE", glowColor: "rgba(34,211,238,0.6)",
    particleCount: 8, ringAnimation: "aura-pulse-intense",
    cardBgClass: "bg-gradient-to-br from-cyan-950/40 via-purple-950/30 to-black/70 backdrop-blur-3xl",
    borderClass: "border border-cyan-400/35",
    xpBarClass: "xp-bar-platinum", shimmerBorder: true, glassmorphism: true,
    fireTrail: false, rgbCycle: false, textGlowClass: "", auraLayers: 2, energyWaves: false,
  },
  Diamond: {
    primaryHex: "#3B82F6", glowColor: "rgba(96,165,250,0.7)",
    particleCount: 10, ringAnimation: "aura-pulse-intense",
    cardBgClass: "bg-gradient-to-br from-blue-950/40 via-pink-950/20 to-black/80 backdrop-blur-[40px]",
    borderClass: "border border-blue-400/45",
    xpBarClass: "xp-bar-diamond", shimmerBorder: true, glassmorphism: true,
    fireTrail: false, rgbCycle: false, textGlowClass: "text-gradient-diamond", auraLayers: 3, energyWaves: false,
  },
  Heroic: {
    primaryHex: "#A855F7", glowColor: "rgba(168,85,247,0.8)",
    particleCount: 12, ringAnimation: "aura-pulse-intense",
    cardBgClass: "bg-gradient-to-br from-red-950/50 via-purple-950/30 to-black/90 backdrop-blur-[50px]",
    borderClass: "border border-purple-500/55",
    xpBarClass: "xp-bar-heroic", shimmerBorder: true, glassmorphism: true,
    fireTrail: false, rgbCycle: false, textGlowClass: "text-gradient-heroic", auraLayers: 3, energyWaves: true,
  },
  Master: {
    primaryHex: "#DC2626", glowColor: "rgba(220,38,38,0.85)",
    particleCount: 18, ringAnimation: "aura-pulse-intense",
    cardBgClass: "bg-gradient-to-br from-red-950/60 via-black/80 to-red-950/30 backdrop-blur-[60px]",
    borderClass: "border border-red-600/60 legendary-frame",
    xpBarClass: "xp-bar-master", shimmerBorder: true, glassmorphism: true,
    fireTrail: false, rgbCycle: false, textGlowClass: "text-gradient-animated", auraLayers: 4, energyWaves: true,
  },
  Grandmaster: {
    primaryHex: "#F59E0B", glowColor: "rgba(251,191,36,1.0)",
    particleCount: 24, ringAnimation: "rgb-glow",
    cardBgClass: "bg-black/90 backdrop-blur-[100px]",
    borderClass: "border-0",
    xpBarClass: "xp-bar-grandmaster", shimmerBorder: false, glassmorphism: true,
    fireTrail: true, rgbCycle: true, textGlowClass: "text-gradient-animated", auraLayers: 5, energyWaves: true,
  },
};

export function getTierVisualConfig(tier: RankTier): TierVisualConfig {
  return TIER_VISUAL_CONFIGS[tier] ?? TIER_VISUAL_CONFIGS.Novice;
}
