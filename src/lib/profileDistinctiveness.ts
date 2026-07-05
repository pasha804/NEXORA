import { getRankInfoFromString } from "./rankSystem";

export interface ProfileAttributes {
  rank: string;
  xp: number;
  reputation: number;
  followers: number;
  achievementCount: number;
  prestige: number;
}

export interface DistinctiveProfileStyle {
  auraIntensity: "low" | "medium" | "high";
  auraClassName: string;
  particleColor: string;
  particleClassName: string;
  animationSpeed: string;
  cardGlowOpacity: number;
  showFameShine: boolean;
  showLegendaryFrame: boolean;
  textGradientClass: string;
  badgeSparkle: boolean;
}

export function getDistinctiveProfileStyle(attrs: Partial<ProfileAttributes>): DistinctiveProfileStyle {
  const rankInfo = getRankInfoFromString(attrs.rank || "Novice");
  const xp = attrs.xp || 0;
  const reputation = attrs.reputation || 0;
  const followers = attrs.followers || 0;
  const achievementCount = attrs.achievementCount || 0;
  const prestige = attrs.prestige || 0;

  const isHighTier = ["Diamond", "Heroic", "Master", "Grandmaster"].includes(rankInfo.tier);
  const xpRatio = Math.min(1, xp / 100000);
  const repRatio = Math.min(1, reputation / 5000);
  const followerRatio = Math.min(1, followers / 10000);

  // Aura intensity varies by XP + reputation
  let auraIntensity: "low" | "medium" | "high";
  let auraClassName: string;
  const auraScore = (xpRatio + repRatio) / 2;
  if (auraScore > 0.7 || rankInfo.isGrandmaster) {
    auraIntensity = "high";
    auraClassName = auraScore > 0.9 ? "aura-pulse-fast" : "aura-pulse-intense";
  } else if (auraScore > 0.3 || isHighTier) {
    auraIntensity = "medium";
    auraClassName = "aura-pulse";
  } else {
    auraIntensity = "low";
    auraClassName = "aura-pulse-slow";
  }

  // Particle color varies by achievements
  let particleColor: string;
  let particleClassName: string;
  if (achievementCount >= 10 || rankInfo.isGrandmaster) {
    particleColor = "rgba(251,191,36,0.6)";
    particleClassName = "particles-mythic";
  } else if (achievementCount >= 6) {
    particleColor = "rgba(236,72,153,0.6)";
    particleClassName = "particles-epic";
  } else if (achievementCount >= 3) {
    particleColor = "rgba(139,92,246,0.6)";
    particleClassName = "particles-rare";
  } else if (achievementCount >= 1) {
    particleColor = "rgba(59,130,246,0.6)";
    particleClassName = "particles-uncommon";
  } else {
    particleColor = "rgba(156,163,175,0.6)";
    particleClassName = "particles-common";
  }

  // Animation speed varies by XP (more XP = faster/smoother animations)
  let animationSpeed: string;
  if (xp > 50000) animationSpeed = "fast";
  else if (xp > 10000) animationSpeed = "normal";
  else animationSpeed = "slow";

  // Card glow opacity varies by followers
  const cardGlowOpacity = Math.min(0.25, 0.05 + followerRatio * 0.2);

  // Fame shine for high follower counts
  const showFameShine = followers > 1000;

  // Legendary frame for high reputation + high tier
  const showLegendaryFrame = repRatio > 0.5 && isHighTier;

  // Text gradient class for high ranks
  let textGradientClass = "";
  if (rankInfo.isGrandmaster) {
    textGradientClass = "text-gradient-animated";
  } else if (rankInfo.tier === "Master") {
    textGradientClass = "text-gradient-animated";
  } else if (rankInfo.tier === "Heroic") {
    textGradientClass = "text-gradient-heroic";
  } else if (rankInfo.tier === "Diamond") {
    textGradientClass = "text-gradient-diamond";
  }

  // Badge sparkle for top achievers
  const badgeSparkle = achievementCount >= 5 || prestige >= 3;

  return {
    auraIntensity,
    auraClassName,
    particleColor,
    particleClassName,
    animationSpeed,
    cardGlowOpacity,
    showFameShine,
    showLegendaryFrame,
    textGradientClass,
    badgeSparkle,
  };
}

export function getUsernameStyle(attrs: Partial<ProfileAttributes>): { className: string; style: React.CSSProperties } {
  const rankInfo = getRankInfoFromString(attrs.rank || "Novice");
  const style = getDistinctiveProfileStyle(attrs);

  if (style.textGradientClass) {
    return {
      className: `font-bold font-display ${style.textGradientClass}`,
      style: {},
    };
  }

  return {
    className: `font-bold font-display ${rankInfo.color}`,
    style: {
      textShadow: rankInfo.isGrandmaster
        ? "0 0 20px rgba(255,200,50,0.5), 0 0 40px rgba(255,200,50,0.3)"
        : rankInfo.tier === "Master"
        ? "0 0 15px rgba(248,113,113,0.4)"
        : rankInfo.tier === "Heroic"
        ? "0 0 15px rgba(192,132,252,0.4)"
        : undefined,
    },
  };
}
