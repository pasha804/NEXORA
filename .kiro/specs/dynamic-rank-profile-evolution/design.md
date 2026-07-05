# Design Document: Dynamic Rank Profile Evolution

## Overview

The Dynamic Rank Profile Evolution feature transforms every visual surface of the Nexora profile system into a living, rank-responsive experience. Every element — avatar border, card background, username styling, XP bar, badges, particles, and ambient effects — evolves automatically based on the user's rank tier, prestige level, XP level, and reputation score.

The design philosophy is borrowed from AAA mobile games (Free Fire, PUBG Mobile, Valorant, Apex Legends): low-rank profiles feel basic and beginner, mid-rank profiles feel polished and competitive, high-rank profiles feel elite and impressive, and Grandmaster profiles feel cinematic and legendary.

The system is already partially implemented. This design document captures the complete intended architecture, the contracts between components, the CSS animation system, and the correctness properties that must hold across all rank tiers.

### Research Summary

The existing codebase already contains:
- `src/lib/rankSystem.ts` — complete rank utility functions (`getRankInfo`, `getRankInfoFromString`, `levelFromXp`, `xpProgressInLevel`)
- `src/styles/discover-animations.css` — all rank-specific CSS classes (`xp-bar-*`, `rank-card-*`, `avatar-ring-*`, `rgb-border`, `fire-trail-*`, `aura-pulse`, `cosmic-drift`, `text-gradient-*`)
- `src/components/profile/DynamicProfileTheme.tsx` — theme wrapper + `RankAvatarRing`
- `src/components/profile/RankAura.tsx` — aura rings + `RankParticles`
- `src/components/profile/RankBadgeAnimated.tsx` — animated badge + `AnimatedRankStars`
- `src/components/profile/GrandmasterEffects.tsx` — cinematic GM effects and all sub-components
- `src/components/profile/PrestigeOverlay.tsx` — prestige border/label system
- `src/components/profile/HeroProfileHeader.tsx` — full profile header integrating all rank components
- `src/components/profile/UserCard.tsx` — user card + `UserPreviewCard`
- `src/components/profile/RecommendationCards.tsx` — recommendation engine + `TrendingCreators`
- `src/components/discover/PeopleDiscovery.tsx` — discover grid + `PersonCard` with hover preview

The design below specifies the complete intended behavior, including gaps that still need implementation.

---

## Architecture

The system is organized into three layers:

```
┌─────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (React Components)                          │
│                                                                 │
│  Full Profile          Cards / Discover       Ambient           │
│  ─────────────         ────────────────       ───────           │
│  HeroProfileHeader     UserCard               ProfilePage bg    │
│  ProfilePage           PersonCard             Dashboard bg      │
│                        UserPreviewCard                          │
│                        RecommendationCards                      │
│                        TrendingCreators                         │
├─────────────────────────────────────────────────────────────────┤
│  RANK VISUAL COMPONENTS (New / Enhanced)                        │
│                                                                 │
│  DynamicProfileTheme   RankAura               GrandmasterEffects│
│  RankAvatarRing        RankParticles          PrestigeOverlay   │
│  RankBadgeAnimated     AnimatedRankStars      PrestigeBadge     │
│  GrandmasterCrown      GrandmasterTitle       GrandmasterCosmicBackground │
│  GrandmasterEnergyWave GrandmasterParticles                     │
├─────────────────────────────────────────────────────────────────┤
│  DATA / UTILITY LAYER                                           │
│                                                                 │
│  getRankInfo(rp)        getRankInfoFromString(rankStr)          │
│  levelFromXp(totalXp)   xpProgressInLevel(totalXp)             │
│  prestigeTierName(n)    xpForNextLevel(level)                   │
│  DIVISIONS[]            TIER_STYLES{}                           │
├─────────────────────────────────────────────────────────────────┤
│  CSS ANIMATION LAYER (discover-animations.css)                  │
│                                                                 │
│  xp-bar-{tier}          rank-card-{tier}      avatar-ring-{tier}│
│  aura-pulse             aura-pulse-intense    rgb-border        │
│  rgb-glow               fire-trail-top/bottom cosmic-drift      │
│  text-gradient-animated text-gradient-heroic  text-gradient-diamond │
│  shimmer-border         prestige-aura         energy-wave       │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Profile Data (rank, xp, prestige, reputation)
        │
        ▼
getRankInfoFromString(rank) → RankInfo { tier, glowColor, color, icon, isGrandmaster, ... }
        │
        ├──► DynamicProfileTheme (card background, border glow)
        ├──► RankAvatarRing (avatar border, glow animation)
        ├──► RankAura + RankParticles (floating effects)
        ├──► RankBadgeAnimated (tier badge with stars)
        ├──► GrandmasterEffects (cinematic overlay, GM only)
        └──► PrestigeOverlay (prestige border + label)
```

### Rank Tier Ordering

Tiers are ordered by visual intensity (lowest to highest):

```
Novice → Bronze → Silver → Gold → Platinum → Diamond → Heroic → Master → Grandmaster
  0         1        2       3        4          5        6        7          8
```

This ordering is used to enforce monotonic properties: higher tiers always have equal or greater visual intensity than lower tiers.

---

## Components and Interfaces

### 1. Utility Layer — `src/lib/rankSystem.ts`

All rank visual components derive their data from this layer. The functions are pure and have no side effects.

#### `getRankInfo(rp: number): RankInfo`

Converts a raw RP value to a complete `RankInfo` object by scanning the `DIVISIONS` array (sorted descending by `min`) for the first entry where `rp >= d.min`.

```typescript
interface RankInfo {
  full: string;          // "Diamond III"
  tier: RankTier;        // "Diamond"
  division: number;      // 1–5 (1=highest in tier), 0 for Grandmaster
  stars: number;         // 0–5 filled stars in current division
  rp: number;            // raw RP input
  rpInDivision: number;  // progress within 50-RP window
  nextRankRp: number;    // RP threshold for next division
  color: string;         // Tailwind text class e.g. "text-blue-300"
  glowColor: string;     // CSS rgba e.g. "rgba(147,197,253,0.8)"
  icon: string;          // emoji e.g. "💠"
  isGrandmaster: boolean;
}
```

**Tier → RP thresholds:**

| Tier        | Start RP | Divisions | Division width |
|-------------|----------|-----------|----------------|
| Novice      | 0        | 1 (flat)  | 100 RP         |
| Bronze      | 100      | I–V       | 60 RP each     |
| Silver      | 400      | I–V       | 50 RP each     |
| Gold        | 650      | I–V       | 50 RP each     |
| Platinum    | 900      | I–V       | 50 RP each     |
| Diamond     | 1200     | I–V       | 200 RP each    |
| Heroic      | 2200     | I–V       | 200 RP each    |
| Master      | 3200     | I–V       | 200 RP each    |
| Grandmaster | 4200     | —         | —              |

#### `getRankInfoFromString(rankStr: string): RankInfo`

Looks up `rankStr` in `DIVISIONS` by `full` field. Returns `getRankInfo(0)` (Novice) for any unrecognized string.

#### `levelFromXp(totalXp: number): number`

Iterates levels starting at 1, accumulating `xpForNextLevel(level) = floor(1000 × (1 + level × 0.15))` until the accumulated total exceeds `totalXp`. Returns the current level. Capped at level 200 for safety.

#### `xpProgressInLevel(totalXp: number): { current: number; needed: number; percent: number }`

Returns XP progress within the current level. `percent` is clamped to `[0, 100]` via `Math.min(100, ...)`.

---

### 2. `DynamicProfileTheme` — `src/components/profile/DynamicProfileTheme.tsx`

**Purpose:** Wraps any profile card or page section and applies rank-appropriate background gradient, border glow, and animated border effects.

**Props:**
```typescript
interface DynamicProfileThemeProps {
  rank: string;       // rank string e.g. "Diamond III"
  children: ReactNode;
  className?: string;
}
```

**Behavior per tier:**

| Tier        | Background                                       | Box-shadow glow                        | Animated border      |
|-------------|--------------------------------------------------|----------------------------------------|----------------------|
| Novice      | `bg-gray-900/40`                                 | none                                   | none                 |
| Bronze      | `from-orange-900/20 to-amber-900/10`             | `0 0 8px rgba(251,146,60,0.6)`         | none                 |
| Silver      | `from-slate-800/20 to-zinc-800/10`               | `0 0 10px rgba(203,213,225,0.6)`       | none                 |
| Gold        | `from-yellow-900/20 to-amber-800/15`             | `0 0 15px rgba(250,204,21,0.7)`        | none                 |
| Platinum    | `from-cyan-900/20 via-purple-900/15`             | `0 0 20px rgba(103,232,249,0.7)`       | none                 |
| Diamond     | `from-blue-900/20 via-pink-900/10`               | `0 0 25px rgba(147,197,253,0.8)`       | none                 |
| Heroic      | `from-red-900/25 via-purple-900/20`              | `0 0 30px rgba(192,132,252,0.8)`       | none                 |
| Master      | `from-blue-900/25 via-yellow-900/15`             | `0 0 35px rgba(248,113,113,0.8)`       | opacity pulse (2.5s) |
| Grandmaster | `from-red-900/15 via-gray-900/5 to-blue-900/15`  | `0 0 40px rgba(252,211,77,0.6)`        | RGB cycling (3s)     |

**Fallback:** Any unrecognized rank string falls back to Novice theme via `getRankInfoFromString` returning Novice RankInfo.

---

### 3. `RankAvatarRing` — `src/components/profile/DynamicProfileTheme.tsx`

**Purpose:** Wraps the avatar element with a rank-colored animated ring.

**Props:**
```typescript
interface RankAvatarRingProps {
  rank: string;
  size?: string;   // Tailwind size classes e.g. "w-32 h-32"
  children: ReactNode;
}
```

**CSS class applied:** `avatar-ring-{tier.toLowerCase()}` (defined in `discover-animations.css`)

**Per-tier CSS class behavior:**

| CSS Class              | Border                        | Glow                                    |
|------------------------|-------------------------------|-----------------------------------------|
| `avatar-ring-novice`   | 2px solid gray, no glow       | none                                    |
| `avatar-ring-bronze`   | 2px orange border             | 10px orange glow                        |
| `avatar-ring-silver`   | 2px silver border             | 12px silver glow                        |
| `avatar-ring-gold`     | 2px gold border               | 15px gold glow                          |
| `avatar-ring-platinum` | 2px cyan border               | 18px cyan glow                          |
| `avatar-ring-diamond`  | 2px blue border               | 20px blue glow + 40px diffuse outer     |
| `avatar-ring-heroic`   | 2px purple border             | 22px purple glow                        |
| `avatar-ring-master`   | 2px red border                | 25px red glow                           |
| `avatar-ring-grandmaster` | `rgb-border` CSS class     | RGB cycling box-shadow (3s loop)        |

**Framer Motion animation overrides:**
- Master / Heroic: `opacity: [0.4, 0.8, 0.4]` on a 2s loop
- Grandmaster: `boxShadow` cycling through red → green → blue → red states on a 3s loop

---

### 4. `RankAura` and `RankParticles` — `src/components/profile/RankAura.tsx`

#### `RankAura`

**Purpose:** Renders concentric animated glow rings behind the avatar, scaled by rank tier and intensity.

**Props:**
```typescript
interface RankAuraProps {
  rank: string;
  size?: "sm" | "md" | "lg" | "xl";
  intensity?: "low" | "medium" | "high";
  className?: string;
}
```

**Layer count per tier:**

| Tier                              | Layers | Animation class           |
|-----------------------------------|--------|---------------------------|
| Novice                            | 0      | none (returns null)       |
| Bronze, Silver                    | 1      | `aura-pulse` (3s)         |
| Gold, Platinum                    | 2      | `aura-pulse` (3s)         |
| Diamond, Heroic, Master, GM       | 3      | `aura-pulse-intense` (2s) + `scale: [1, 1.05, 1]` |

**Opacity by intensity:**

| Intensity  | Opacity |
|------------|---------|
| `"low"`    | 0.15    |
| `"medium"` | 0.25    |
| `"high"`   | 0.40    |

**Size map (outer / middle / inner):**

| Size | Outer      | Middle     | Inner      |
|------|------------|------------|------------|
| `sm` | w-20 h-20  | w-16 h-16  | w-12 h-12  |
| `md` | w-32 h-32  | w-28 h-28  | w-24 h-24  |
| `lg` | w-40 h-40  | w-36 h-36  | w-32 h-32  |
| `xl` | w-52 h-52  | w-48 h-48  | w-44 h-44  |

Both `RankAura` and `RankParticles` use `position: absolute` and `pointer-events-none`.

#### `RankParticles`

**Purpose:** Renders floating colored particles that rise and fade around the avatar.

**Props:**
```typescript
interface RankParticlesProps {
  rank: string;
  count?: number;  // overrides default count for the tier
}
```

**Particle count per tier:**

| Tier        | Count |
|-------------|-------|
| Novice      | 0     |
| Bronze      | 0     |
| Silver      | 0     |
| Gold        | 3     |
| Platinum    | 4     |
| Diamond     | 5     |
| Heroic      | 6     |
| Master      | 8     |
| Grandmaster | 10    |

Each particle animates with: upward float (`y: [0, -(20+i*5), 0]`), sideways drift (`x: [0, ±(5+i*3), 0]`), fade-in/fade-out (`opacity: [0, 0.8, 0]`), and scale transitions (`scale: [0.5, 1, 0.5]`). Color is the tier's `glowColor`.

---

### 5. `RankBadgeAnimated` and `AnimatedRankStars` — `src/components/profile/RankBadgeAnimated.tsx`

#### `RankBadgeAnimated`

**Purpose:** Renders an animated rank badge with tier icon, full rank name, and division stars.

**Props:**
```typescript
interface RankBadgeAnimatedProps {
  rp?: number;           // derive rank from RP value
  rank?: string;         // derive rank from string (used when rp is absent)
  size?: "sm" | "md" | "lg" | "xl";
  showPrestige?: boolean;
  showGlow?: boolean;    // default true — applies box-shadow using glowColor
  className?: string;
}
```

**Size map:**

| Size | Badge padding/font          | Icon size    | Stars size    |
|------|-----------------------------|--------------|---------------|
| `sm` | `px-2 py-1 text-[11px]`     | `text-sm`    | `text-[9px]`  |
| `md` | `px-3 py-1.5 text-sm`       | `text-base`  | `text-[11px]` |
| `lg` | `px-4 py-2 text-base`       | `text-xl`    | `text-xs`     |
| `xl` | `px-5 py-2.5 text-lg`       | `text-2xl`   | `text-sm`     |

**Animation rules:**
- Gold and above: `whileHover: { scale: 1.08 }` via Framer Motion
- Grandmaster: `animate.boxShadow` cycles RGB (red → green → blue → red) on 3s loop; `rgb-border` CSS class applied; crown emoji (👑) with rotation animation replaces division stars
- Non-Grandmaster: 5 division stars rendered via `AnimatedRankStars`
- `showGlow=true` (default): applies `boxShadow: 0 0 12px {glowColor}` (non-GM) or RGB cycling shadow (GM)

#### `AnimatedRankStars`

**Purpose:** Renders 5 stars with sequential animation for Gold and above.

**Props:**
```typescript
interface AnimatedRankStarsProps {
  stars: number;   // 0–5 filled stars
  color: string;   // Tailwind color class for filled stars
  tier: string;    // used to determine if animation applies
}
```

For Gold and above, each star animates in sequentially with `delay: i * 0.08s`. Filled stars use the tier's `color` class; empty stars use `text-white/15`.

---

### 6. `PrestigeOverlay` and `PrestigeBadge` — `src/components/profile/PrestigeOverlay.tsx`

#### `PrestigeOverlay`

**Purpose:** Wraps a profile card and adds prestige-level border glow, label, and cinematic overlay.

**Props:**
```typescript
interface PrestigeOverlayProps {
  rank: string;
  prestige: number;   // 0–5
  children?: ReactNode;
  className?: string;
}
```

**Effect table:**

| Prestige | Border width | Inner glow opacity | Extra effects                                          |
|----------|--------------|--------------------|--------------------------------------------------------|
| 0        | none         | none               | none (renders children as-is)                          |
| 1        | 1px          | 0.08               | label badge                                            |
| 2        | 1.5px        | 0.12               | label badge + animated particles                       |
| 3        | 2px          | 0.16               | label badge + RGB cycling border                       |
| 4        | 2.5px        | 0.20               | label badge + crown aura                               |
| 5        | 3px          | 0.25               | label badge + full cinematic overlay (radial gradient, 4s pulse) |

Border and glow color always equals `rankInfo.glowColor` for the user's current rank, ensuring prestige visuals harmonize with the rank theme.

Label badge pulses `opacity: [0.7, 1.0, 0.7]` on a 2s cycle, positioned at `top-right` (`absolute -top-2 right-4`).

#### `PrestigeBadge`

Standalone badge component for use outside `PrestigeOverlay`.

**Props:** `{ prestige: number }`

**Gradient per prestige level:**

| Prestige   | Gradient                                        |
|------------|-------------------------------------------------|
| I          | `from-blue-500 to-cyan-500`                     |
| II         | `from-purple-500 to-pink-500`                   |
| III        | `from-yellow-500 to-red-500`                    |
| IV         | `from-green-500 to-blue-500`                    |
| V (Master) | `from-pink-500 via-purple-500 to-indigo-500`    |

---

### 7. `GrandmasterEffects` and Sub-components — `src/components/profile/GrandmasterEffects.tsx`

**Purpose:** Renders Grandmaster-exclusive cinematic effects. Returns `null` for all non-Grandmaster ranks.

**Props:**
```typescript
interface GrandmasterEffectsProps {
  rank: string;
  type: "banner" | "avatar" | "card" | "title" | "full";
  className?: string;
}
```

**Type → rendered sub-components:**

| Type     | Sub-components rendered                                                          |
|----------|----------------------------------------------------------------------------------|
| `banner` | `GrandmasterCosmicBackground` + `GrandmasterEnergyWave` + `GrandmasterParticles(8)` |
| `avatar` | RGB cycling box-shadow animation on avatar ring                                  |
| `card`   | `GrandmasterCosmicBackground` + `GrandmasterParticles(6)`                        |
| `title`  | null (title handled by `GrandmasterTitle` directly)                              |
| `full`   | `GrandmasterCosmicBackground` + `GrandmasterEnergyWave` + `GrandmasterParticles(10)` |

**Guard:** `if (!getRankInfoFromString(rank).isGrandmaster) return null;` — no DOM output for non-GM ranks.

#### Sub-components

**`GrandmasterCrown`**

Props: `{ className?: string }`

Floating crown emoji. Animation: `y: [0, -6, 0]`, `rotate: [-3, 3, -3]`, 2.5s loop, `ease: "easeInOut"`. Positioned absolutely above the avatar (`absolute -top-8 left-1/2 -translate-x-1/2`).

**`GrandmasterTitle`**

Props: `{ displayName: string }`

Wraps display name with RGB text-shadow cycling (red → green → blue → red) on a 3s loop. Uses `text-amber-300` base color. Also renders a blurred RGB radial gradient behind the title for depth.

**`GrandmasterCosmicBackground`**

Props: `{ className?: string }`

Absolute full-coverage layer with:
- Three radial gradient color orbs (red at 30%/20%, green at 70%/30%, blue at 50%/70%) pulsing `opacity: [0.3, 0.6, 0.3]` on 5s cycle
- Star-field pattern using `cosmic-drift` CSS animation (20s drift) with `backgroundSize: "200px 200px"`

**`GrandmasterEnergyWave`**

Three horizontal energy wave lines (red, green, blue) sweeping left-to-right using `energy-wave` CSS animation on staggered 2.5s cycles (delays: 0s, 1.2s, 2.4s). Each line is `h-[2px]`, positioned at 30%, 55%, 80% vertical.

**`GrandmasterParticles`**

Props: `{ count?: number }` (default 12)

RGB-colored floating particles (alternating red/green/blue by `i % 3`) rising and fading on staggered 3s cycles. Each particle: `w-1 h-1 rounded-full`, positioned randomly within the container.

---

### 8. `HeroProfileHeader` — `src/components/profile/HeroProfileHeader.tsx`

**Purpose:** Full-page profile header integrating all rank visual components.

**Props:**
```typescript
interface HeroProfileHeaderProps {
  profile: ProfileData;
  isOwnProfile: boolean;
  onEdit?: () => void;
}
```

**Component tree:**

```
HeroProfileHeader
├── DynamicProfileTheme (outer wrapper, rank-based card bg + glow)
│   ├── GrandmasterEffects type="banner" (GM only)
│   ├── fire-trail-top / fire-trail-bottom divs (GM only)
│   ├── rgb-glow overlay div (GM only)
│   └── Banner image / gradient
├── PrestigeOverlay (wraps card body)
│   └── Card body
│       ├── GrandmasterCrown (GM only, absolute -top-8 above avatar)
│       ├── RankAura (behind avatar, size="lg")
│       ├── RankParticles (behind avatar)
│       ├── RankAvatarRing (avatar border)
│       │   └── Avatar (w-32 h-32)
│       ├── GrandmasterTitle OR styled h1 (username)
│       ├── RankBadgeAnimated (rank badge, size="md")
│       ├── XP progress bar (xp-bar-{tier} CSS class)
│       └── follower/following counts (text-amber-300 for GM)
```

**Username styling by tier:**

| Tier          | Class applied                                      |
|---------------|----------------------------------------------------|
| Novice–Silver | plain white (no special class)                     |
| Gold          | `text-yellow-400`                                  |
| Platinum      | `text-cyan-300`                                    |
| Diamond       | `text-blue-300 text-gradient-diamond`              |
| Heroic        | `text-purple-400 text-gradient-heroic`             |
| Master        | `text-red-400 text-glow text-gradient-animated`    |
| Grandmaster   | `GrandmasterTitle` component (RGB text-shadow)     |

**XP bar:** Uses `xp-bar-{tier.toLowerCase()}` CSS class. Animates from `width: 0` to actual fill on mount (1s ease-out via Framer Motion `initial={{ width: 0 }} animate={{ width: \`${percent}%\` }}`). Master and Grandmaster also render a white shimmer sweep overlay (`w-8 bg-white/20`, `x: ["-10%", "110%"]`, 2s linear loop).

**Follower/following counts:** `text-amber-300 font-bold` for Grandmaster; `group-hover:text-primary` for all other tiers.

---

### 9. `UserCard` — `src/components/profile/UserCard.tsx`

**Purpose:** Compact user card for Discover and recommendation surfaces.

**Props:**
```typescript
interface UserCardProps {
  user: UserCardData;
  index?: number;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}
```

**Rank integration:**
- Applies `rank-card-{tier.toLowerCase()}` CSS class to card wrapper
- For Diamond, Heroic, Master, Grandmaster: applies `boxShadow: 0 0 20px {glowColor at 0.1 opacity}`
- For Grandmaster: applies RGB gradient overlay + `rgb-border` CSS class on the card wrapper
- Renders `RankAura` behind avatar (`size="sm"`, intensity `"high"` for GM, `"low"` otherwise)
- Renders `RankBadge` below avatar section
- For Grandmaster: renders crown emoji (👑) overlaid on avatar (`absolute -top-2 -right-2`)

---

### 10. `UserPreviewCard` — `src/components/profile/UserCard.tsx`

**Purpose:** Hover-triggered mini card shown to the right of a `PersonCard` after 400ms hover.

**Props:** `{ user: UserCardData }`

**Required fields displayed:** avatar, display name, username, rank badge, level, prestige badge (if prestige > 0), bio (2-line clamp), top 3 skills.

**Animation:** `opacity: 0→1`, `scale: 0.95→1` on enter (150ms ease); reverse on exit via Framer Motion `AnimatePresence`.

**Rank integration:**
- `boxShadow: 0 10px 40px {glowColor at 0.2 opacity}`
- Grandmaster: `borderColor: rankInfo.glowColor` (amber)

**Visibility:** Hidden on screens below `lg` breakpoint (`hidden lg:block` on the wrapper div).

**Positioning:** `absolute -top-2 right-0 z-50 translate-x-[calc(100%+8px)]`

---

### 11. `PersonCard` — `src/components/discover/PeopleDiscovery.tsx`

**Purpose:** Individual user card in the Discover grid.

**Rank integration (mirrors UserCard):**
- `rank-card-{tier}` CSS class + glow box-shadow for high ranks
- `rgb-border` CSS class for Grandmaster
- `RankAura` behind avatar (`size="sm"`, intensity `"medium"` for GM, `"low"` otherwise)
- `avatar-ring-{tier}` CSS class on the Avatar component for high ranks
- Username color: `text-amber-300` for GM, `text-red-400` for Master, `group-hover:text-primary` for others
- Crown emoji overlay (`absolute -top-2 -right-2`) for GM
- Green status dot (`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500`) when `onlineStatus === "online"`
- AI match percentage badge (`bg-green-500/15 text-green-400`) when `aiMatch > 0`
- AI reasoning snippet box (`bg-primary/5 border border-primary/15`)

**Hover preview:** After 400ms hover (`setTimeout(..., 400)`), renders `UserPreviewCard` positioned to the right. Clears immediately on mouse leave (`setShowPreview(false)` with no delay).

---

### 12. `RecommendationCards` and `TrendingCreators` — `src/components/profile/RecommendationCards.tsx`

#### `RecommendationCards`

Six sections with tab switching:

| Section                | Filter / Sort logic                                                              |
|------------------------|----------------------------------------------------------------------------------|
| Trending Developers    | No filter (top by XP from API)                                                   |
| Top Ranked Players     | Client-side sort by RP descending (`getRankInfoFromString(u.rank).rp`)           |
| Rising Stars           | No filter (newest/fastest growing)                                               |
| AI Experts             | `skills.some(s => name.toLowerCase().includes("ai" or "ml" or "machine learning"))` |
| Competitive Developers | No filter (top PvP)                                                              |
| Legendary Creators     | No filter (most followed)                                                        |

Fetches from `GET /search/users?page=1&limit=30&sort=xp_high`. Displays up to 5 users per section. Shows 4-row skeleton while loading. Shows "No users found in this category" for empty sections.

Each user row renders `RankBadge` + crown emoji (👑) for GM. Connect button calls `POST /connections/request` with `{ receiver_id: userId }`.

#### `TrendingCreators`

Horizontal scroll strip. Fetches from `GET /search/users?page=1&limit=8&sort=most_followed`. Applies `borderColor: rankInfo.glowColor` for GM cards. Renders `RankBadge` below creator name.

---

---

## Data Models

### `RankInfo` (from `src/lib/rankSystem.ts`)

```typescript
export type RankTier =
  | "Novice" | "Bronze" | "Silver" | "Gold" | "Platinum"
  | "Diamond" | "Heroic" | "Master" | "Grandmaster";

export interface RankInfo {
  full: string;           // "Diamond III"
  tier: RankTier;         // "Diamond"
  division: number;       // 1–5 (1=highest), 0 for Grandmaster
  stars: number;          // 0–5 filled stars
  rp: number;             // raw RP input
  rpInDivision: number;   // 0–(divWidth-1) progress within division
  nextRankRp: number;     // RP threshold for next division
  color: string;          // Tailwind text class
  glowColor: string;      // CSS rgba string
  icon: string;           // emoji
  isGrandmaster: boolean;
}
```

### `TIER_STYLES` lookup (from `src/lib/rankSystem.ts`)

```typescript
const TIER_STYLES: Record<RankTier, { color: string; glowColor: string; icon: string }> = {
  Novice:      { color: "text-gray-400",   glowColor: "rgba(156,163,175,0.5)", icon: "🔰" },
  Bronze:      { color: "text-orange-400", glowColor: "rgba(251,146,60,0.6)",  icon: "🥉" },
  Silver:      { color: "text-slate-300",  glowColor: "rgba(203,213,225,0.6)", icon: "🥈" },
  Gold:        { color: "text-yellow-400", glowColor: "rgba(250,204,21,0.7)",  icon: "🥇" },
  Platinum:    { color: "text-cyan-300",   glowColor: "rgba(103,232,249,0.7)", icon: "💎" },
  Diamond:     { color: "text-blue-300",   glowColor: "rgba(147,197,253,0.8)", icon: "💠" },
  Heroic:      { color: "text-purple-400", glowColor: "rgba(192,132,252,0.8)", icon: "⚡" },
  Master:      { color: "text-red-400",    glowColor: "rgba(248,113,113,0.8)", icon: "🔥" },
  Grandmaster: { color: "text-amber-300",  glowColor: "rgba(252,211,77,1.0)",  icon: "👑" },
};
```

### `ProfileData` (used by `HeroProfileHeader`)

```typescript
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
  rank?: string;          // rank string e.g. "Diamond III"
  level?: number;
  xp?: number;
  prestige?: number;      // 0–5
  location?: string;
  website?: string;
  github_url?: string;
  linkedin_url?: string;
  learning_goals?: string;
  collaboration_preference?: string;
}
```

### `UserCardData` (used by `UserCard`, `UserPreviewCard`)

```typescript
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
```

### CSS Class Naming Convention

All rank-specific CSS classes follow the pattern `{category}-{tier.toLowerCase()}`:

```
xp-bar-novice, xp-bar-bronze, xp-bar-silver, xp-bar-gold, xp-bar-platinum,
xp-bar-diamond, xp-bar-heroic, xp-bar-master, xp-bar-grandmaster

rank-card-novice, rank-card-bronze, ..., rank-card-grandmaster

avatar-ring-novice, avatar-ring-bronze, ..., avatar-ring-grandmaster
```

This allows dynamic class construction: `` `xp-bar-${rankInfo.tier.toLowerCase()}` ``

The pattern is validated by Property 11 (CSS class construction consistency).

### `PRESTIGE_EFFECTS` model

```typescript
const PRESTIGE_EFFECTS: Record<number, { borderWidth: string; auraOpacity: number; label: string }> = {
  1: { borderWidth: "1px",   auraOpacity: 0.08, label: "Prestige I" },
  2: { borderWidth: "1.5px", auraOpacity: 0.12, label: "Prestige II" },
  3: { borderWidth: "2px",   auraOpacity: 0.16, label: "Prestige III" },
  4: { borderWidth: "2.5px", auraOpacity: 0.20, label: "Prestige IV" },
  5: { borderWidth: "3px",   auraOpacity: 0.25, label: "Prestige Master" },
};
```

### `AURA_CONFIG` model

```typescript
const AURA_CONFIG: Record<RankTier, { layers: number; pulse: string }> = {
  Novice:      { layers: 0, pulse: "" },
  Bronze:      { layers: 1, pulse: "aura-pulse" },
  Silver:      { layers: 1, pulse: "aura-pulse" },
  Gold:        { layers: 2, pulse: "aura-pulse" },
  Platinum:    { layers: 2, pulse: "aura-pulse-intense" },
  Diamond:     { layers: 3, pulse: "aura-pulse-intense" },
  Heroic:      { layers: 3, pulse: "aura-pulse-intense" },
  Master:      { layers: 3, pulse: "aura-pulse-intense" },
  Grandmaster: { layers: 3, pulse: "aura-pulse-intense" },
};
```

---

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

This feature has significant pure-function logic in the utility layer (`getRankInfo`, `getRankInfoFromString`, `levelFromXp`, `xpProgressInLevel`) and in the component-to-CSS-class mapping logic. These are well-suited for property-based testing. The visual animation layers (Framer Motion, CSS keyframes) are not suitable for PBT and are covered by example-based tests.

**Property-based testing library:** [fast-check](https://fast-check.dev/) (TypeScript-native, integrates with Vitest)

---

### Property 1: Rank string round-trip

*For any* valid rank string in the `DIVISIONS` array, parsing it with `getRankInfoFromString` and then reading `.full` should return the original rank string unchanged.

**Validates: Requirements 13.8**

---

### Property 2: RP identity preservation

*For any* RP value in the range `[0, 4500]`, calling `getRankInfo(rp)` should return a `RankInfo` object whose `.rp` field equals the input `rp`.

**Validates: Requirements 13.9**

---

### Property 3: Unrecognized rank string falls back to Novice

*For any* string that is not present in the `DIVISIONS` array as a `full` value, `getRankInfoFromString` should return a `RankInfo` with `tier === "Novice"` and `rp === 0`.

**Validates: Requirements 1.12, 13.5**

---

### Property 4: XP progress percent is always clamped to [0, 100]

*For any* non-negative integer `totalXp`, `xpProgressInLevel(totalXp).percent` should be a number in the closed interval `[0, 100]`.

**Validates: Requirements 13.7, 8.9**

---

### Property 5: XP level is monotonically non-decreasing

*For any* two non-negative integers `xp1` and `xp2` where `xp1 <= xp2`, `levelFromXp(xp1) <= levelFromXp(xp2)`. Earning more XP never decreases your level.

**Validates: Requirements 13.6**

---

### Property 6: Aura layer count is monotonically non-decreasing with tier rank

*For any* two rank strings where tier A has a higher rank index than tier B (using the ordering Novice=0 through Grandmaster=8), the number of aura layers for tier A should be greater than or equal to the number of aura layers for tier B.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

---

### Property 7: Particle count is monotonically non-decreasing with tier rank

*For any* two rank strings where tier A has a higher rank index than tier B, the particle count for tier A should be greater than or equal to the particle count for tier B.

**Validates: Requirements 2.7, 2.8**

---

### Property 8: Prestige border width is monotonically non-decreasing with prestige level

*For any* two prestige levels `p1 > p2` (both in range `[1, 5]`), the border width value for prestige `p1` should be greater than or equal to the border width value for prestige `p2` when parsed as a float.

**Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6**

---

### Property 9: GrandmasterEffects renders null for all non-Grandmaster ranks

*For any* rank string where `getRankInfoFromString(rank).isGrandmaster === false`, the `GrandmasterEffects` component should render null and produce no DOM output.

**Validates: Requirements 5.12**

---

### Property 10: AI Experts filter only returns users with AI/ML skills

*For any* array of user objects, applying the AI Experts `filterFn` should return only users whose `skills` array contains at least one skill whose name includes "ai", "ml", or "machine learning" (case-insensitive). No user without such a skill should appear in the filtered result.

**Validates: Requirements 11.3**

---

### Property 11: Rank CSS class construction is consistent

*For any* valid rank string, the CSS classes `rank-card-${tier}`, `xp-bar-${tier}`, and `avatar-ring-${tier}` (where `tier = getRankInfoFromString(rank).tier.toLowerCase()`) should each be a non-empty string matching the pattern `[a-z-]+-[a-z]+`.

**Validates: Requirements 9.1, 6.1, 8.1**

---

### Property 12: PrestigeOverlay uses rank's glowColor for all prestige levels

*For any* rank string and prestige level `> 0`, the border color applied by `PrestigeOverlay` should equal `getRankInfoFromString(rank).glowColor`. Prestige visuals always harmonize with the rank theme regardless of which rank/prestige combination is used.

**Validates: Requirements 4.8**

---

### Property 13: RP-to-string-to-tier round-trip consistency

*For any* RP value in `[0, 4500]`, the tier derived from `getRankInfo(rp).tier` should equal the tier derived from `getRankInfoFromString(getRankInfo(rp).full).tier`. The string representation of a rank is always consistent with its RP-derived tier.

**Validates: Requirements 3.6, 13.4**

---

**Property Reflection — Redundancy Check:**

- Properties 1 and 13 are distinct: Property 1 tests string→string round-trip (`.full` field); Property 13 tests RP→string→tier consistency (`.tier` field). Neither subsumes the other.
- Properties 1 and 2 are distinct: Property 1 tests string→string round-trip; Property 2 tests RP→RP identity. Neither subsumes the other.
- Properties 6 and 7 are distinct: aura layers and particle counts are separate data structures with different values per tier. Both are needed.
- Properties 3 and 9 are distinct: Property 3 tests the utility function fallback; Property 9 tests the component rendering behavior.
- Property 11 is not redundant with Properties 6/7/8 — it tests the string construction pattern, not the values.
- Property 12 is not redundant with Property 8 — Property 8 tests prestige border width monotonicity; Property 12 tests that the color source is always `glowColor`.
- All 13 properties provide unique validation value.

---

---

## Error Handling

### Invalid / Missing Rank Data

**Problem:** API responses may omit the `rank` field, return `null`, or return an unrecognized string.

**Strategy:**
- All components default `rank` to `"Novice"` when the prop is absent: `const rankStr = user.rank || "Novice"`
- `getRankInfoFromString` returns Novice RankInfo for any unrecognized string (explicit fallback: `if (!div) return getRankInfo(0)`)
- `getRankInfo(rp)` uses `?? DIVISIONS[DIVISIONS.length - 1]` to guarantee a result even for negative RP

### Invalid XP / Level Data

**Problem:** XP values may be `null`, `undefined`, or negative from the API.

**Strategy:**
- `levelFromXp` and `xpProgressInLevel` receive `totalXp` which should be coerced: `const xp = profile.xp ?? 0`
- The safety cap `if (level > 200) break` in `levelFromXp` prevents infinite loops for extreme XP values
- `xpProgressInLevel` clamps `percent` to `[0, 100]` via `Math.min(100, ...)`

### Invalid Prestige Values

**Problem:** Prestige may be out of range (negative, > 5, or non-integer).

**Strategy:**
- `PrestigeOverlay` uses `Math.min(prestige, 5)` to cap at Prestige Master
- `if (prestige <= 0) return <>{children}</>` handles zero and negative values
- `PrestigeBadge` uses `Math.min(prestige, 5)` for array indexing

### Component Rendering Failures

**Problem:** A rank visual component may throw during render (e.g., missing `glowColor`).

**Strategy:**
- All rank components have defensive defaults: `const { tier, glowColor } = rankInfo` where `rankInfo` is always a valid object from `getRankInfoFromString`
- `GrandmasterEffects` returns `null` early for non-GM ranks, preventing unnecessary rendering
- `RankAura` returns `null` for Novice (0 layers), preventing empty DOM nodes

### Animation Performance Degradation

**Problem:** Too many simultaneous animated elements may cause frame drops on low-end devices.

**Strategy:**
- Maximum 12 particles per profile view (enforced in `GrandmasterParticles` default count)
- All decorative layers use `pointer-events-none` to avoid hit-testing overhead
- CSS animations (`fire-trail`, `cosmic-drift`, `aura-pulse`) run on the compositor thread via `transform` and `opacity`
- `prefers-reduced-motion` media query suppresses all looping animations (see Testing Strategy)

### Network Failures in Recommendation Components

**Problem:** `RecommendationCards` and `TrendingCreators` may fail to fetch users.

**Strategy:**
- Both components catch fetch errors silently and set empty arrays: `catch (err) { setUsers([]); }`
- Loading state shows skeleton placeholders (4 rows) to prevent layout shift
- Empty state message shown when section has no users: "No users found in this category"

---

---

## Testing Strategy

### Dual Testing Approach

This feature uses both unit/example-based tests and property-based tests:

- **Property-based tests** cover the pure utility functions and component-to-class mapping logic, where universal properties hold across all valid inputs
- **Unit/example tests** cover specific tier behaviors, animation configurations, UI interactions, and integration points

### Property-Based Testing Setup

**Library:** [fast-check](https://fast-check.dev/) with Vitest

**Configuration:** Minimum 100 iterations per property test (fast-check default is 100).

**Test file location:** `src/test/rankSystem.property.test.ts`

**Tag format:** `// Feature: dynamic-rank-profile-evolution, Property {N}: {property_text}`

**Example test structure:**

```typescript
import fc from "fast-check";
import { describe, it, expect } from "vitest";
import { getRankInfo, getRankInfoFromString, levelFromXp, xpProgressInLevel } from "@/lib/rankSystem";
import { DIVISIONS } from "@/lib/rankSystem";

// Feature: dynamic-rank-profile-evolution, Property 1: Rank string round-trip
it("round-trips all valid rank strings", () => {
  const validRankStrings = DIVISIONS.map(d => d.full);
  fc.assert(
    fc.property(fc.constantFrom(...validRankStrings), (rankStr) => {
      expect(getRankInfoFromString(rankStr).full).toBe(rankStr);
    })
  );
});

// Feature: dynamic-rank-profile-evolution, Property 2: RP identity preservation
it("getRankInfo preserves the input rp value", () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 4500 }), (rp) => {
      expect(getRankInfo(rp).rp).toBe(rp);
    })
  );
});

// Feature: dynamic-rank-profile-evolution, Property 3: Unrecognized rank string falls back to Novice
it("unrecognized rank strings fall back to Novice", () => {
  const validFullNames = new Set(DIVISIONS.map(d => d.full));
  fc.assert(
    fc.property(fc.string(), (s) => {
      fc.pre(!validFullNames.has(s));
      const info = getRankInfoFromString(s);
      expect(info.tier).toBe("Novice");
      expect(info.rp).toBe(0);
    })
  );
});

// Feature: dynamic-rank-profile-evolution, Property 4: XP progress percent clamped to [0, 100]
it("xpProgressInLevel percent is always in [0, 100]", () => {
  fc.assert(
    fc.property(fc.nat({ max: 10_000_000 }), (totalXp) => {
      const { percent } = xpProgressInLevel(totalXp);
      expect(percent).toBeGreaterThanOrEqual(0);
      expect(percent).toBeLessThanOrEqual(100);
    })
  );
});

// Feature: dynamic-rank-profile-evolution, Property 5: XP level is monotonically non-decreasing
it("levelFromXp is monotonically non-decreasing", () => {
  fc.assert(
    fc.property(
      fc.nat({ max: 5_000_000 }),
      fc.nat({ max: 5_000_000 }),
      (xp1, xp2) => {
        const [lo, hi] = xp1 <= xp2 ? [xp1, xp2] : [xp2, xp1];
        expect(levelFromXp(lo)).toBeLessThanOrEqual(levelFromXp(hi));
      }
    )
  );
});
```

### Unit / Example Tests

**Test file location:** `src/test/rankComponents.test.tsx`

**Key example tests:**

1. `DynamicProfileTheme` with `rank="Novice"` renders `bg-gray-900/40` and no animated border element
2. `DynamicProfileTheme` with `rank="Grandmaster"` renders RGB cycling border motion element
3. `DynamicProfileTheme` with `rank="Master"` renders opacity-pulsing border element
4. `RankAura` with `rank="Novice"` returns null
5. `RankAura` with `rank="Diamond"` renders 3 aura layer divs
6. `RankBadgeAnimated` with `rank="Grandmaster"` renders crown emoji and no star elements
7. `RankBadgeAnimated` with `rank="Diamond III"` renders 5 star elements and the diamond icon
8. `PrestigeOverlay` with `prestige=0` renders children without extra DOM elements
9. `PrestigeOverlay` with `prestige=3` renders RGB cycling border element
10. `GrandmasterEffects` with a non-GM rank returns null
11. `GrandmasterEffects` with `rank="Grandmaster"` and `type="banner"` renders cosmic background, energy waves, and particles
12. `UserPreviewCard` renders all required fields (avatar, name, rank badge, level, bio, skills)
13. `PersonCard` shows green status dot when `onlineStatus === "online"`
14. `PersonCard` shows `UserPreviewCard` after 400ms hover delay
15. `PersonCard` hides `UserPreviewCard` immediately on mouse leave
16. `RecommendationCards` shows 4-row skeleton while loading
17. `RecommendationCards` shows "No users found in this category" for empty sections
18. XP bar animates from 0 to fill percentage on mount (Framer Motion initial/animate)
19. Master/Grandmaster XP bar renders shimmer sweep overlay element
20. `getRankInfo(0)` returns `{ tier: "Novice", division: 0, stars: 0 }`
21. `getRankInfo(4200)` returns `{ tier: "Grandmaster", isGrandmaster: true }`

### CSS Animation Tests

CSS animation classes are verified by checking that the class names are applied correctly in component output. The actual keyframe behavior is validated visually and through browser DevTools.

**Reduced motion:** The `prefers-reduced-motion: reduce` media query is tested by mocking `window.matchMedia` in unit tests and verifying that Framer Motion's `useReducedMotion()` hook suppresses looping animations.

### Integration Tests

**Scope:** API integration for `RecommendationCards`, `TrendingCreators`, and `PeopleDiscovery`.

**Approach:** Mock `fetch` responses and verify:
- Correct endpoint called with expected query params (`/search/users?page=1&limit=30&sort=xp_high`)
- User data correctly mapped to rank visual components
- Follow/connect/challenge actions call correct endpoints (`POST /social/follow/:id`, `POST /connections/request`, `POST /pvp/queue/join`)

### Performance Validation

- Verify no more than 12 particle elements are rendered simultaneously (count DOM nodes with `querySelectorAll(".particle")`)
- Verify all decorative layers have `pointer-events-none` (covered by unit tests)
- Verify `position: absolute` and `overflow: hidden` on aura/particle containers

### Accessibility

- Verify `prefers-reduced-motion` suppresses all looping animations
- Verify decorative elements have `aria-hidden="true"` or are excluded from the accessibility tree via `pointer-events-none` + no focusable children
- Verify rank badge text is readable (color contrast ≥ 4.5:1 for normal text)

> **Note:** Full WCAG compliance requires manual testing with assistive technologies and expert accessibility review beyond what automated tests can verify.
