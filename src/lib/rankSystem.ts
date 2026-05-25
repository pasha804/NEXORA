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

const TIER_STYLES: Record<RankTier, { color: string; glowColor: string; icon: string }> = {
  Novice:      { color: "text-gray-400",    glowColor: "rgba(156,163,175,0.5)",  icon: "🔰" },
  Bronze:      { color: "text-orange-400",  glowColor: "rgba(251,146,60,0.6)",   icon: "🥉" },
  Silver:      { color: "text-slate-300",   glowColor: "rgba(203,213,225,0.6)",  icon: "🥈" },
  Gold:        { color: "text-yellow-400",  glowColor: "rgba(250,204,21,0.7)",   icon: "🥇" },
  Platinum:    { color: "text-cyan-300",    glowColor: "rgba(103,232,249,0.7)",  icon: "💎" },
  Diamond:     { color: "text-blue-300",    glowColor: "rgba(147,197,253,0.8)",  icon: "💠" },
  Heroic:      { color: "text-purple-400",  glowColor: "rgba(192,132,252,0.8)",  icon: "⚡" },
  Master:      { color: "text-red-400",     glowColor: "rgba(248,113,113,0.8)",  icon: "🔥" },
  Grandmaster: { color: "text-amber-300",   glowColor: "rgba(252,211,77,1.0)",   icon: "👑" },
};

export function getRankInfo(rp: number): RankInfo {
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
    division: div.division,
    stars,
    rp,
    rpInDivision: rpInDiv,
    nextRankRp,
    color: style.color,
    glowColor: style.glowColor,
    icon: style.icon,
    isGrandmaster: div.tier === "Grandmaster",
  };
}

/** Parse a rank string like "Diamond III" into RankInfo by finding its RP floor */
export function getRankInfoFromString(rankStr: string): RankInfo {
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
