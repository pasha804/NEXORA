# Implementation Plan: Dynamic Rank Profile Evolution

## Overview

Implement the complete rank-responsive visual system for Nexora profiles. The work is organized into six epics: (1) utility layer, (2) CSS animation layer, (3) new rank visual components, (4) enhanced existing components, (5) property-based tests, and (6) unit/integration tests. Each task builds on the previous, ending with full wiring across all surfaces.

## Tasks

- [ ] 1. Audit and complete the utility layer — `src/lib/rankSystem.ts`
  - [ ] 1.1 Verify and complete `DIVISIONS` array and `TIER_STYLES` lookup
    - Ensure all 9 tiers with correct RP thresholds are present (Novice 0, Bronze 100–400, Silver 400–650, Gold 650–900, Platinum 900–1200, Diamond 1200–2200, Heroic 2200–3200, Master 3200–4200, Grandmaster 4200+)
    - Ensure `TIER_STYLES` has correct `color`, `glowColor`, and `icon` for all 9 tiers
    - Export `RankTier` type, `RankInfo` interface, `DIVISIONS`, and `TIER_STYLES`
    - _Requirements: 13.1, 13.2, 13.3_

  - [ ] 1.2 Implement / verify `getRankInfo(rp: number): RankInfo`
    - Scan `DIVISIONS` descending by `min`; return first entry where `rp >= d.min`
    - Populate all `RankInfo` fields: `full`, `tier`, `division`, `stars`, `rp`, `rpInDivision`, `nextRankRp`, `color`, `glowColor`, `icon`, `isGrandmaster`
    - Use `?? DIVISIONS[DIVISIONS.length - 1]` guard for negative RP
    - _Requirements: 13.1, 13.2, 13.3, 13.9_

  - [ ] 1.3 Implement / verify `getRankInfoFromString(rankStr: string): RankInfo`
    - Look up `rankStr` in `DIVISIONS` by `full` field
    - Return `getRankInfo(0)` (Novice) for any unrecognized string
    - _Requirements: 13.4, 13.5, 1.12_

  - [ ] 1.4 Implement / verify `levelFromXp(totalXp: number): number` and `xpProgressInLevel`
    - `levelFromXp`: iterate accumulating `floor(1000 × (1 + level × 0.15))` per level; cap at 200
    - `xpProgressInLevel`: return `{ current, needed, percent }` with `percent` clamped to `[0, 100]`
    - Export helper `xpForNextLevel(level): number`
    - _Requirements: 13.6, 13.7, 8.9_


- [ ] 2. Audit and complete the CSS animation layer — `src/styles/discover-animations.css`
  - [ ] 2.1 Implement all `xp-bar-{tier}` classes (9 tiers)
    - `xp-bar-novice`: static gray gradient (`#6b7280` → `#9ca3af`)
    - `xp-bar-bronze`: orange/amber gradient
    - `xp-bar-silver`: white/silver gradient
    - `xp-bar-gold`: three-stop gold gradient (`#ca8a04`, `#eab308`, `#facc15`)
    - `xp-bar-platinum`: cyan/purple/pink gradient
    - `xp-bar-diamond`: blue/pink gradient
    - `xp-bar-heroic`: red/purple gradient
    - `xp-bar-master`: blue/gold/blue gradient with 2s shimmer `@keyframes`
    - `xp-bar-grandmaster`: full RGB gradient (red/green/blue/red) with 1.5s shimmer
    - _Requirements: 8.1–8.7_

  - [ ] 2.2 Implement all `rank-card-{tier}` background classes (9 tiers)
    - Match background gradients from the DynamicProfileTheme behavior table in the design
    - _Requirements: 9.1, 1.2–1.10_

  - [ ] 2.3 Implement all `avatar-ring-{tier}` box-shadow classes (9 tiers)
    - `avatar-ring-novice`: 2px gray border, no glow
    - `avatar-ring-bronze`: 2px orange border, 10px orange glow
    - `avatar-ring-silver`: 2px silver border, 12px silver glow
    - `avatar-ring-gold`: 2px gold border, 15px gold glow
    - `avatar-ring-platinum`: 2px cyan border, 18px cyan glow
    - `avatar-ring-diamond`: 2px blue border, 20px blue glow + 40px diffuse outer glow
    - `avatar-ring-heroic`: 2px purple border, 25px purple glow
    - `avatar-ring-master`: 2px red border, 30px red glow
    - `avatar-ring-grandmaster`: 2px amber border (base; RGB cycling applied via Framer Motion)
    - _Requirements: 6.1, 6.4–6.7_


  - [ ] 2.4 Implement animation keyframes and utility classes
    - `@keyframes aura-pulse`: opacity 0.4 → 0.8 → 0.4, 3s ease-in-out infinite
    - `@keyframes aura-pulse-intense`: opacity 0.4 → 1.0 → 0.4 + scale 1 → 1.05 → 1, 2s ease-in-out infinite
    - `@keyframes cosmic-drift`: translate drift pattern, 20s linear infinite
    - `@keyframes energy-wave`: translateX(-100%) → translateX(100%), 2.5s linear infinite
    - `@keyframes shimmer-sweep`: background-position 200% → -200%, 2s linear infinite
    - `.rgb-border`: animated border cycling red → green → blue → red, 3s loop
    - `.rgb-glow`: animated box-shadow cycling RGB, 3s loop
    - `.fire-trail-top` / `.fire-trail-bottom`: fire gradient sweep animation
    - `.text-gradient-animated`: blue/gold/blue background-position animation, 3s
    - `.text-gradient-heroic`: red/purple/red, 4s
    - `.text-gradient-diamond`: blue/pink/blue, 3.5s
    - `.text-glow`: text-shadow glow effect
    - `.prestige-aura`: prestige border pulse animation
    - `@media (prefers-reduced-motion: reduce)`: suppress all looping animations
    - _Requirements: 7.8–7.10, 14.1, 14.3, 14.6_


- [ ] 3. Implement / complete `DynamicProfileTheme` and `RankAvatarRing` — `src/components/profile/DynamicProfileTheme.tsx`
  - [ ] 3.1 Implement `DynamicProfileTheme` component
    - Accept `rank: string`, `children: ReactNode`, `className?: string` props
    - Call `getRankInfoFromString(rank)` to derive `RankInfo`; fall back to Novice for missing/unrecognized rank
    - Apply tier-appropriate background gradient class and inline `boxShadow` glow per the design behavior table
    - For Master: add Framer Motion `animate={{ opacity: [0.8, 1, 0.8] }}` border pulse on 2.5s loop
    - For Grandmaster: add Framer Motion `animate={{ boxShadow: [rgbRed, rgbGreen, rgbBlue, rgbRed] }}` on 3s loop + `rgb-border` CSS class
    - _Requirements: 1.1–1.12_

  - [ ] 3.2 Implement `RankAvatarRing` sub-component
    - Accept `rank: string`, `size?: string`, `children: ReactNode` props
    - Apply `avatar-ring-{tier.toLowerCase()}` CSS class to wrapper
    - For Master/Heroic: Framer Motion `animate={{ opacity: [0.4, 0.8, 0.4] }}` on 2s loop
    - For Grandmaster: Framer Motion `animate={{ boxShadow: [rgbRed, rgbGreen, rgbBlue, rgbRed] }}` on 3s loop
    - Use `position: relative` wrapper; children rendered inside
    - _Requirements: 6.1–6.3, 6.8, 6.9_


- [ ] 4. Implement / complete `RankAura` and `RankParticles` — `src/components/profile/RankAura.tsx`
  - [ ] 4.1 Implement `RankAura` component
    - Accept `rank`, `size?` (`"sm"|"md"|"lg"|"xl"`), `intensity?` (`"low"|"medium"|"high"`), `className?` props
    - Return `null` for Novice (0 layers)
    - Render 1 layer for Bronze/Silver with `aura-pulse` class; 2 layers for Gold/Platinum; 3 layers for Diamond+
    - Apply opacity 0.15 / 0.25 / 0.40 per intensity prop
    - Map size prop to outer/middle/inner pixel dimensions per design size table
    - Use `position: absolute`, `pointer-events-none`, `inset-0` on container
    - _Requirements: 2.1–2.6, 14.2, 14.4_

  - [ ] 4.2 Implement `RankParticles` component
    - Accept `rank`, `className?` props
    - Return `null` for Novice, Bronze, Silver (0 particles)
    - Render 3/4/5/6/8/10 particles for Gold/Platinum/Diamond/Heroic/Master/Grandmaster
    - Each particle: Framer Motion `animate={{ y: [0, -(20+i*5), 0], opacity: [0, 0.8, 0], scale: [0.5, 1, 0.5] }}` with staggered delays
    - Color each particle using `rankInfo.glowColor`
    - Use `position: absolute`, `pointer-events-none` on container
    - _Requirements: 2.7–2.10, 14.2, 14.4, 14.5_


- [ ] 5. Implement / complete `RankBadgeAnimated` and `AnimatedRankStars` — `src/components/profile/RankBadgeAnimated.tsx`
  - [ ] 5.1 Implement `RankBadgeAnimated` component
    - Accept `rp?`, `rank?`, `size?` (`"sm"|"md"|"lg"|"xl"`), `showPrestige?`, `showGlow?` (default true), `className?` props
    - Derive `RankInfo` from `rp` (via `getRankInfo`) or `rank` (via `getRankInfoFromString`); prefer `rp` if both provided
    - Apply size-appropriate padding/font classes per design size table
    - Apply `boxShadow` using `glowColor` when `showGlow` is true
    - For Gold and above: wrap in Framer Motion `whileHover={{ scale: 1.08 }}`
    - For Grandmaster: apply `rgb-border` class; animate `boxShadow` RGB cycling on 3s loop; render crown emoji with `animate={{ rotate: [-5, 5, -5] }}` on 2s loop; skip stars
    - For non-Grandmaster: render `AnimatedRankStars` with `stars` and `tier` props
    - _Requirements: 3.1–3.7_

  - [ ] 5.2 Implement `AnimatedRankStars` sub-component
    - Accept `stars: number` (0–5 filled), `tier: RankTier`, `size?: string` props
    - Render 5 star icons; filled stars use tier `color` class, empty stars use `text-white/15`
    - For Gold and above: each star animates in with `delay: i * 0.08s` via Framer Motion `initial={{ scale: 0 }} animate={{ scale: 1 }}`
    - _Requirements: 3.8_


- [ ] 6. Implement / complete `PrestigeOverlay` and `PrestigeBadge` — `src/components/profile/PrestigeOverlay.tsx`
  - [ ] 6.1 Implement `PrestigeOverlay` component
    - Accept `rank: string`, `prestige: number`, `children?: ReactNode`, `className?` props
    - For `prestige <= 0`: render children as-is with no extra DOM
    - Cap prestige at 5 via `Math.min(prestige, 5)`
    - Apply border using `rankInfo.glowColor` with width from `PRESTIGE_EFFECTS[prestige].borderWidth`
    - For prestige 2: render animated particles around the card
    - For prestige 3: apply `rgb-border` CSS class for RGB cycling border
    - For prestige 4: apply crown aura effect (2.5px border, 0.2 opacity glow)
    - For prestige 5: render radial gradient overlay with Framer Motion `animate={{ opacity: [0.3, 0.6, 0.3] }}` on 4s loop
    - Render `PrestigeBadge` at `top-right` with Framer Motion `animate={{ opacity: [0.7, 1.0, 0.7] }}` on 2s loop
    - Use `position: absolute`, `pointer-events-none` on all decorative layers
    - _Requirements: 4.1–4.8, 14.2, 14.4_

  - [ ] 6.2 Implement `PrestigeBadge` sub-component
    - Accept `prestige: number`, `className?` props
    - Display prestige tier name with gradient background per design prestige gradient table
    - I: `from-blue-500 to-cyan-500`; II: `from-purple-500 to-pink-500`; III: `from-yellow-500 to-red-500`; IV: `from-green-500 to-blue-500`; V: `from-pink-500 via-purple-500 to-indigo-500`
    - _Requirements: 4.9_


- [ ] 7. Implement / complete `GrandmasterEffects` and all sub-components — `src/components/profile/GrandmasterEffects.tsx`
  - [ ] 7.1 Implement `GrandmasterEffects` shell and `type` routing
    - Accept `rank: string`, `type: "banner"|"avatar"|"card"|"title"|"full"`, `className?` props
    - Return `null` immediately when `getRankInfoFromString(rank).isGrandmaster === false`
    - Route to sub-components per design type table: `banner` → Cosmic+EnergyWave+Particles(8); `card` → Cosmic+Particles(6); `full` → Cosmic+EnergyWave+Particles(10); `title` → null; `avatar` → RGB shadow animation
    - _Requirements: 5.1, 5.11, 5.12_

  - [ ] 7.2 Implement `GrandmasterCosmicBackground` sub-component
    - Absolute full-coverage layer with `pointer-events-none`
    - Three radial gradient color orbs (red, green, blue) with Framer Motion `animate={{ opacity: [0.3, 0.6, 0.3] }}` on 5s staggered cycles
    - Star-field pattern using `cosmic-drift` CSS animation (20s drift)
    - _Requirements: 5.6_

  - [ ] 7.3 Implement `GrandmasterEnergyWave` sub-component
    - Three horizontal wave lines (red, green, blue) using `energy-wave` CSS animation
    - Staggered delays: 0s, 0.8s, 1.6s; each on 2.5s cycle
    - `pointer-events-none`, `overflow: hidden`
    - _Requirements: 5.7_

  - [ ] 7.4 Implement `GrandmasterParticles` sub-component
    - Accept `count?: number` prop (default 12)
    - Render `count` particles alternating red/green/blue colors
    - Each particle: Framer Motion `animate={{ y: [0, -80, 0], opacity: [0, 0.8, 0] }}` on staggered 3s cycles
    - `pointer-events-none`, `position: absolute`
    - _Requirements: 5.8_

  - [ ] 7.5 Implement `GrandmasterCrown` sub-component
    - Render crown emoji (👑) with Framer Motion `animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}` on 2.5s loop
    - Position absolutely above avatar
    - _Requirements: 5.2, 6.8_

  - [ ] 7.6 Implement `GrandmasterTitle` sub-component
    - Wrap display name text with Framer Motion `animate={{ textShadow: [rgbRed, rgbGreen, rgbBlue, rgbRed] }}` on 3s loop
    - Base color `text-amber-300`
    - _Requirements: 5.4, 7.7_


- [ ] 8. Checkpoint — verify utility + CSS + new components
  - Ensure all new components render without TypeScript errors
  - Ensure `getRankInfo` and `getRankInfoFromString` return correct data for spot-check values (RP 0, 100, 1200, 4200)
  - Ensure all CSS classes are importable and applied correctly in a test render
  - Ask the user if questions arise before proceeding to enhanced components.

- [ ] 9. Enhance `HeroProfileHeader` — `src/components/profile/HeroProfileHeader.tsx`
  - [ ] 9.1 Wire `DynamicProfileTheme` as outer wrapper and `PrestigeOverlay` around card body
    - Wrap entire header in `<DynamicProfileTheme rank={profile.rank ?? "Novice"}>`
    - Wrap card body content in `<PrestigeOverlay rank={profile.rank ?? "Novice"} prestige={profile.prestige ?? 0}>`
    - For Grandmaster: render `<GrandmasterEffects rank={rank} type="banner" />` inside `DynamicProfileTheme`, plus `.fire-trail-top` and `.fire-trail-bottom` divs
    - _Requirements: 5.1, 5.3, 12.1_

  - [ ] 9.2 Wire avatar section with `GrandmasterCrown`, `RankAura`, `RankParticles`, and `RankAvatarRing`
    - Render `<GrandmasterCrown />` above avatar for Grandmaster
    - Render `<RankAura rank={rank} size="lg" intensity="high" />` behind avatar (absolute, pointer-events-none)
    - Render `<RankParticles rank={rank} />` behind avatar
    - Wrap avatar `<img>` in `<RankAvatarRing rank={rank} size="w-32 h-32">`
    - For Grandmaster: add `rgb-border` class to avatar wrapper
    - _Requirements: 2.1–2.10, 5.2, 5.5, 6.1–6.9_

  - [ ] 9.3 Wire username styling and `GrandmasterTitle`
    - Apply tier-appropriate text class per design username styling table (Novice–Silver: plain white; Gold: `text-yellow-400`; Platinum: `text-cyan-300`; Diamond: `text-blue-300 text-gradient-diamond`; Heroic: `text-purple-400 text-gradient-heroic`; Master: `text-red-400 text-glow text-gradient-animated`)
    - For Grandmaster: replace `<h1>` with `<GrandmasterTitle>` component
    - _Requirements: 7.1–7.7_

  - [ ] 9.4 Wire `RankBadgeAnimated` and XP bar
    - Render `<RankBadgeAnimated rank={rank} size="lg" />` in the badge slot
    - Apply `xp-bar-{tier.toLowerCase()}` CSS class to XP bar fill element
    - Animate XP bar from `width: "0%"` to actual fill using Framer Motion `animate={{ width: \`${percent}%\` }}` with 1s ease-out transition on mount
    - For Master/Grandmaster: render white shimmer sweep `<div>` overlay on XP bar
    - Style XP label with rank's primary `color` class
    - For Grandmaster: style follower/following counts with `text-amber-300`
    - _Requirements: 3.1–3.8, 5.9, 5.10, 8.1–8.10_


- [ ] 10. Enhance `ProfilePage` and `Dashboard` ambient backgrounds — `src/pages/ProfilePage.tsx` and `src/pages/Dashboard.tsx`
  - [ ] 10.1 Add ambient background to `ProfilePage`
    - Render `<DynamicProfileTheme rank={profileOwnerRank}>` as `absolute inset-0 -z-10 pointer-events-none` layer
    - For Grandmaster profile owner: render `<GrandmasterEffects rank={rank} type="full" />` as fixed full-viewport background layer
    - _Requirements: 12.1, 12.2, 12.5, 12.6_

  - [ ] 10.2 Add ambient background to `Dashboard`
    - Render `<DynamicProfileTheme rank={loggedInUserRank}>` as fixed full-page background layer with `pointer-events-none` and negative z-index
    - For Grandmaster logged-in user: render `<GrandmasterEffects rank={rank} type="full" />` as fixed full-viewport background layer
    - _Requirements: 12.3, 12.4, 12.5, 12.6_

- [ ] 11. Enhance `UserCard` and `UserPreviewCard` — `src/components/profile/UserCard.tsx`
  - [ ] 11.1 Enhance `UserCard` with rank visuals
    - Apply `rank-card-{tier.toLowerCase()}` CSS class to card wrapper
    - For Diamond, Heroic, Master, Grandmaster: apply inline `boxShadow` using `glowColor` at 0.1 opacity
    - For Grandmaster: apply RGB gradient overlay + `rgb-border` CSS class
    - Render `<RankAura rank={rank} size="sm" intensity={isGrandmaster ? "high" : "low"} />` behind avatar
    - Render `<RankBadgeAnimated rank={rank} size="sm" />` below avatar section
    - For Grandmaster: render crown emoji (👑) overlaid on avatar
    - _Requirements: 9.1–9.6_

  - [ ] 11.2 Implement / complete `UserPreviewCard` component
    - Display: avatar, display name, username, `<RankBadgeAnimated rank={rank} size="sm" />`, level, `<PrestigeBadge prestige={prestige} />` (if prestige > 0), bio (2-line clamp), top 3 skills
    - Animate in: Framer Motion `initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}` with 150ms ease
    - Animate out: reverse on exit
    - Apply `boxShadow` using `rankInfo.glowColor` at 0.2 opacity
    - For Grandmaster: apply `borderColor: rankInfo.glowColor` (amber)
    - Hide on screens below `lg` breakpoint: `hidden lg:block`
    - _Requirements: 10.2–10.7_


- [ ] 12. Enhance `PersonCard` and `PeopleDiscovery` — `src/components/discover/PeopleDiscovery.tsx`
  - [ ] 12.1 Enhance `PersonCard` with rank visuals and status indicators
    - Apply `rank-card-{tier}` CSS class + glow box-shadow for Diamond and above
    - Apply `rgb-border` for Grandmaster
    - Render `<RankAura rank={rank} size="sm" intensity="low" />` behind avatar
    - Username color: `text-amber-300` for Grandmaster, `text-red-400` for Master
    - Crown emoji overlay on avatar for Grandmaster
    - Green status dot (`bg-green-400`, 10px circle) on avatar when `onlineStatus === "online"`
    - AI match percentage badge when `aiMatch > 0`
    - AI reasoning snippet box at card bottom
    - _Requirements: 9.7–9.9, 15.1–15.5_

  - [ ] 12.2 Implement hover preview trigger in `PeopleDiscovery`
    - Track hover state per card with `useRef` timer; show `UserPreviewCard` after 400ms
    - Position `UserPreviewCard` to the right: `translate-x-[calc(100%+8px)]`
    - Clear timer and hide preview immediately on `onMouseLeave`
    - Only render preview on `lg` breakpoint and above
    - _Requirements: 10.1, 10.8_

  - [ ] 12.3 Implement empty state and "Load More" pagination in `PeopleDiscovery`
    - Show empty state with "Reset Search" button that clears all filters when no results
    - Implement "Load More" button that fetches next page and appends results
    - _Requirements: 15.9, 15.10_


- [ ] 13. Enhance `RecommendationCards` and `TrendingCreators` — `src/components/profile/RecommendationCards.tsx`
  - [ ] 13.1 Implement six-section tab system in `RecommendationCards`
    - Render tab buttons for: Trending Developers, Top Ranked Players, Rising Stars, AI Experts, Competitive Developers, Legendary Creators
    - Highlight active tab; switch displayed users on tab click
    - Fetch from `GET /search/users?page=1&limit=30&sort=xp_high` on mount
    - Apply client-side filters per section (AI Experts: skills include "ai"/"ml"/"machine learning"; Top Ranked: sort by RP desc)
    - Display up to 5 users per section
    - Show 4 animated skeleton rows while loading
    - Show "No users found in this category" for empty sections
    - _Requirements: 11.1–11.7_

  - [ ] 13.2 Wire rank visuals and actions in `RecommendationCards`
    - Render `<RankBadgeAnimated rank={user.rank} size="sm" />` for each user row
    - For Grandmaster users: render crown emoji (👑) next to name
    - Connect button calls `POST /connections/request` with user ID
    - _Requirements: 11.8–11.10, 9.10, 9.11_

  - [ ] 13.3 Enhance `TrendingCreators` with rank visuals
    - Fetch from `GET /search/users?page=1&limit=8&sort=most_followed`
    - Apply `borderColor: rankInfo.glowColor` for Grandmaster creator cards
    - Render `<RankBadgeAnimated rank={creator.rank} size="sm" />` below creator name
    - _Requirements: 9.12, 15.6_

- [ ] 14. Wire `HomeRightSidebar` and `Discover` page integration
  - [ ] 14.1 Add `RecommendationCards` to `HomeRightSidebar`
    - Import and render `<RecommendationCards />` in the sidebar
    - _Requirements: 15.7_

  - [ ] 14.2 Add `RecommendationCards` to `Discover` page
    - Render `<RecommendationCards />` below the `PeopleDiscovery` tab content
    - _Requirements: 15.8_


- [ ] 15. Checkpoint — verify all enhanced components
  - Ensure all enhanced components compile without TypeScript errors
  - Spot-check that rank visuals render correctly for Novice, Gold, Diamond, and Grandmaster users in the browser
  - Verify `pointer-events-none` is applied to all decorative layers
  - Ask the user if questions arise before proceeding to tests.

- [ ] 16. Write property-based tests — `src/test/rankSystem.property.test.ts`
  - [ ] 16.1 Set up fast-check + Vitest test file
    - Install `fast-check` if not present: `npm install --save-dev fast-check`
    - Create `src/test/rankSystem.property.test.ts` with imports for `fc`, `describe`, `it`, `expect`, and all utility functions
    - Import `DIVISIONS` for use as valid rank string source
    - _Requirements: 13.1–13.9_

  - [ ]* 16.2 Write property test for Property 1: Rank string round-trip
    - `fc.constantFrom(...DIVISIONS.map(d => d.full))` as arbitrary
    - Assert `getRankInfoFromString(rankStr).full === rankStr`
    - Tag: `// Feature: dynamic-rank-profile-evolution, Property 1: Rank string round-trip`
    - **Property 1: Rank string round-trip**
    - **Validates: Requirements 13.8**

  - [ ]* 16.3 Write property test for Property 2: RP identity preservation
    - `fc.integer({ min: 0, max: 4500 })` as arbitrary
    - Assert `getRankInfo(rp).rp === rp`
    - Tag: `// Feature: dynamic-rank-profile-evolution, Property 2: RP identity preservation`
    - **Property 2: RP identity preservation**
    - **Validates: Requirements 13.9**

  - [ ]* 16.4 Write property test for Property 3: Unrecognized rank string falls back to Novice
    - `fc.string()` filtered to exclude all valid `DIVISIONS` full strings
    - Assert `getRankInfoFromString(str).tier === "Novice"` and `.rp === 0`
    - Tag: `// Feature: dynamic-rank-profile-evolution, Property 3: Unrecognized rank string falls back to Novice`
    - **Property 3: Unrecognized rank string falls back to Novice**
    - **Validates: Requirements 1.12, 13.5**

  - [ ]* 16.5 Write property test for Property 4: XP progress percent clamped to [0, 100]
    - `fc.nat({ max: 10_000_000 })` as arbitrary
    - Assert `xpProgressInLevel(totalXp).percent >= 0` and `<= 100`
    - Tag: `// Feature: dynamic-rank-profile-evolution, Property 4: XP progress percent clamped`
    - **Property 4: XP progress percent is always clamped to [0, 100]**
    - **Validates: Requirements 13.7, 8.9**


  - [ ]* 16.6 Write property test for Property 5: XP level is monotonically non-decreasing
    - `fc.tuple(fc.nat({ max: 5_000_000 }), fc.nat({ max: 5_000_000 }))` as arbitrary
    - Derive `xp1 = Math.min(a, b)`, `xp2 = Math.max(a, b)`
    - Assert `levelFromXp(xp1) <= levelFromXp(xp2)`
    - Tag: `// Feature: dynamic-rank-profile-evolution, Property 5: XP level monotonically non-decreasing`
    - **Property 5: XP level is monotonically non-decreasing**
    - **Validates: Requirements 13.6**

  - [ ]* 16.7 Write property test for Property 6: Aura layer count is monotonically non-decreasing with tier rank
    - Use `TIER_ORDER` array (Novice=0 … Grandmaster=8) and `AURA_CONFIG` lookup
    - `fc.tuple(fc.integer({ min: 0, max: 8 }), fc.integer({ min: 0, max: 8 }))` as arbitrary
    - For `tierA >= tierB`, assert `AURA_CONFIG[TIER_ORDER[tierA]].layers >= AURA_CONFIG[TIER_ORDER[tierB]].layers`
    - Tag: `// Feature: dynamic-rank-profile-evolution, Property 6: Aura layer count monotonically non-decreasing`
    - **Property 6: Aura layer count is monotonically non-decreasing with tier rank**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

  - [ ]* 16.8 Write property test for Property 7: Particle count is monotonically non-decreasing with tier rank
    - Use `PARTICLE_COUNT` lookup per tier and `TIER_ORDER`
    - Same arbitrary as Property 6
    - For `tierA >= tierB`, assert `PARTICLE_COUNT[TIER_ORDER[tierA]] >= PARTICLE_COUNT[TIER_ORDER[tierB]]`
    - Tag: `// Feature: dynamic-rank-profile-evolution, Property 7: Particle count monotonically non-decreasing`
    - **Property 7: Particle count is monotonically non-decreasing with tier rank**
    - **Validates: Requirements 2.7, 2.8**

  - [ ]* 16.9 Write property test for Property 8: Prestige border width is monotonically non-decreasing
    - `fc.tuple(fc.integer({ min: 1, max: 5 }), fc.integer({ min: 1, max: 5 }))` as arbitrary
    - For `p1 >= p2`, assert `parseFloat(PRESTIGE_EFFECTS[p1].borderWidth) >= parseFloat(PRESTIGE_EFFECTS[p2].borderWidth)`
    - Tag: `// Feature: dynamic-rank-profile-evolution, Property 8: Prestige border width monotonically non-decreasing`
    - **Property 8: Prestige border width is monotonically non-decreasing with prestige level**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6**

  - [ ]* 16.10 Write property test for Property 9: GrandmasterEffects renders null for non-Grandmaster ranks
    - `fc.constantFrom(...DIVISIONS.filter(d => d.tier !== "Grandmaster").map(d => d.full))` as arbitrary
    - Render `<GrandmasterEffects rank={rankStr} type="full" />` and assert result is `null`
    - Tag: `// Feature: dynamic-rank-profile-evolution, Property 9: GrandmasterEffects null for non-GM`
    - **Property 9: GrandmasterEffects renders null for all non-Grandmaster ranks**
    - **Validates: Requirements 5.12**

  - [ ]* 16.11 Write property test for Property 10: AI Experts filter correctness
    - `fc.array(fc.record({ skills: fc.array(fc.record({ name: fc.string() })) }))` as arbitrary
    - Apply AI Experts `filterFn`; assert every returned user has at least one skill matching /ai|ml|machine learning/i
    - Assert no user without such a skill appears in the result
    - Tag: `// Feature: dynamic-rank-profile-evolution, Property 10: AI Experts filter correctness`
    - **Property 10: AI Experts filter only returns users with AI/ML skills**
    - **Validates: Requirements 11.3**

  - [ ]* 16.12 Write property test for Property 11: Rank CSS class construction is consistent
    - `fc.constantFrom(...DIVISIONS.map(d => d.full))` as arbitrary
    - Assert `` `rank-card-${getRankInfoFromString(rank).tier.toLowerCase()}` `` matches `/^rank-card-[a-z]+$/`
    - Tag: `// Feature: dynamic-rank-profile-evolution, Property 11: Rank CSS class construction consistent`
    - **Property 11: Rank CSS class construction is consistent**
    - **Validates: Requirements 9.1, 6.1, 8.1**

  - [ ]* 16.13 Write property test for Property 12: PrestigeOverlay uses rank's glowColor
    - `fc.tuple(fc.constantFrom(...DIVISIONS.map(d => d.full)), fc.integer({ min: 1, max: 5 }))` as arbitrary
    - Render `<PrestigeOverlay rank={rank} prestige={prestige}>` and assert applied border color equals `getRankInfoFromString(rank).glowColor`
    - Tag: `// Feature: dynamic-rank-profile-evolution, Property 12: PrestigeOverlay uses rank glowColor`
    - **Property 12: PrestigeOverlay uses rank's glowColor for all prestige levels**
    - **Validates: Requirements 4.8**


- [ ] 17. Write unit and example-based tests — `src/test/rankComponents.test.tsx`
  - [ ] 17.1 Write unit tests for `DynamicProfileTheme` tier behaviors
    - Test: `rank="Novice"` renders `bg-gray-900/40` and no animated border element
    - Test: `rank="Grandmaster"` renders RGB cycling border Framer Motion element
    - Test: unrecognized rank falls back to Novice theme
    - _Requirements: 1.2, 1.10, 1.12_

  - [ ]* 17.2 Write unit tests for `RankAura` and `RankParticles`
    - Test: `rank="Novice"` returns null
    - Test: `rank="Bronze"` renders 1 aura layer with `aura-pulse` class
    - Test: `rank="Diamond"` renders 3 aura layers with `aura-pulse-intense` class
    - Test: `rank="Gold"` renders 3 particles; `rank="Grandmaster"` renders 10 particles
    - _Requirements: 2.1–2.10_

  - [ ]* 17.3 Write unit tests for `RankBadgeAnimated` and `AnimatedRankStars`
    - Test: `rank="Grandmaster"` renders crown emoji and no stars
    - Test: `rank="Diamond III"` renders 5 stars (3 filled, 2 empty)
    - Test: `showGlow=false` omits box-shadow
    - _Requirements: 3.1–3.8_

  - [ ]* 17.4 Write unit tests for `PrestigeOverlay` and `PrestigeBadge`
    - Test: `prestige=0` renders children without extra DOM elements
    - Test: `prestige=3` applies `rgb-border` class
    - Test: `prestige=5` renders radial gradient overlay element
    - Test: `PrestigeBadge` prestige=1 uses `from-blue-500 to-cyan-500` gradient
    - _Requirements: 4.1–4.9_

  - [ ]* 17.5 Write unit tests for `GrandmasterEffects`
    - Test: non-GM rank returns null
    - Test: `type="banner"` renders CosmicBackground, EnergyWave, and Particles
    - Test: `type="card"` renders CosmicBackground and Particles but not EnergyWave
    - _Requirements: 5.1, 5.11, 5.12_

  - [ ]* 17.6 Write unit tests for `UserPreviewCard`
    - Test: renders avatar, display name, username, rank badge, level, bio, and top 3 skills
    - Test: renders `PrestigeBadge` when `prestige > 0`; omits it when `prestige === 0`
    - Test: hidden on screens below `lg` breakpoint (check `hidden lg:block` class)
    - _Requirements: 10.2, 10.7_

  - [ ]* 17.7 Write unit tests for `PersonCard` interactions
    - Test: green status dot rendered when `onlineStatus === "online"`
    - Test: AI match badge rendered when `aiMatch > 0`
    - Test: `UserPreviewCard` shown after 400ms hover (use `vi.useFakeTimers`)
    - Test: `UserPreviewCard` hidden immediately on mouse leave
    - _Requirements: 10.1, 10.8, 15.3, 15.4_

  - [ ]* 17.8 Write unit tests for `RecommendationCards`
    - Test: shows 4 skeleton rows while loading
    - Test: shows "No users found in this category" for empty sections
    - Test: AI Experts tab filters to only AI/ML skill users
    - Test: Top Ranked Players tab sorts by RP descending
    - _Requirements: 11.1–11.7_

  - [ ]* 17.9 Write unit tests for XP bar behavior in `HeroProfileHeader`
    - Test: XP bar uses `xp-bar-grandmaster` class for Grandmaster rank
    - Test: XP bar animates from 0 to fill percentage on mount
    - Test: Master/Grandmaster renders shimmer sweep overlay element
    - _Requirements: 8.1–8.9_

  - [ ]* 17.10 Write reduced-motion accessibility tests
    - Mock `window.matchMedia` to return `prefers-reduced-motion: reduce`
    - Test: Framer Motion `useReducedMotion()` suppresses looping animations in `RankAura`, `RankParticles`, `GrandmasterEffects`, `PrestigeOverlay`
    - _Requirements: 14.3_


- [ ] 18. Write integration tests — `src/test/rankIntegration.test.tsx`
  - [ ]* 18.1 Write integration tests for `RecommendationCards` API integration
    - Mock `fetch` to return a fixture of 30 users with varied ranks and skills
    - Assert `GET /search/users?page=1&limit=30&sort=xp_high` is called on mount
    - Assert connect button calls `POST /connections/request` with correct user ID
    - Assert `RankBadgeAnimated` is rendered for each user in the list
    - _Requirements: 11.5, 11.9_

  - [ ]* 18.2 Write integration tests for `TrendingCreators` API integration
    - Mock `fetch` to return 8 users
    - Assert `GET /search/users?page=1&limit=8&sort=most_followed` is called
    - Assert Grandmaster creator card has `borderColor` set to amber glow color
    - _Requirements: 9.12, 15.6_

  - [ ]* 18.3 Write integration tests for `PeopleDiscovery` API integration
    - Mock `fetch` for user search endpoint
    - Assert Follow, Message, and Challenge buttons are rendered on each `PersonCard`
    - Assert "Load More" button fetches next page and appends results
    - Assert "Reset Search" button clears filters and re-fetches
    - _Requirements: 15.2, 15.9, 15.10_

- [ ] 19. Final checkpoint — all tests pass
  - Run `npx vitest --run src/test/rankSystem.property.test.ts src/test/rankComponents.test.tsx src/test/rankIntegration.test.tsx`
  - Ensure all property tests pass with ≥ 100 iterations each
  - Ensure no TypeScript errors across all modified files
  - Ensure no more than 12 particle elements are rendered simultaneously in any single profile view
  - Ask the user if questions arise.


## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; all core implementation tasks are required
- Each task references specific requirements for full traceability
- The design document uses TypeScript throughout — all code should be TypeScript with strict types
- Framer Motion is the animation library for all JS-driven animations; CSS keyframes handle compositor-thread animations
- All decorative layers (auras, particles, fire trails, energy waves, cosmic backgrounds) must use `pointer-events-none` and `position: absolute` / `overflow: hidden`
- The `prefers-reduced-motion` media query must suppress all looping animations — implement via both CSS `@media` rule and Framer Motion's `useReducedMotion()` hook
- Property tests use fast-check with Vitest; minimum 100 iterations per property (fast-check default)
- The `GrandmasterEffects` component must return `null` for all non-Grandmaster ranks — this is a hard requirement, not optional
- Maximum 12 animated particle elements simultaneously on any single profile view

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3", "2.4"] },
    { "id": 3, "tasks": ["3.1", "3.2", "4.1", "4.2", "5.1", "5.2", "6.1", "6.2"] },
    { "id": 4, "tasks": ["7.1"] },
    { "id": 5, "tasks": ["7.2", "7.3", "7.4", "7.5", "7.6"] },
    { "id": 6, "tasks": ["9.1", "9.2", "9.3", "9.4", "10.1", "10.2", "11.1", "11.2"] },
    { "id": 7, "tasks": ["12.1", "12.2", "12.3", "13.1", "13.2", "13.3"] },
    { "id": 8, "tasks": ["14.1", "14.2"] },
    { "id": 9, "tasks": ["16.1"] },
    { "id": 10, "tasks": ["16.2", "16.3", "16.4", "16.5", "16.6", "16.7", "16.8", "16.9", "16.10", "16.11", "16.12", "16.13"] },
    { "id": 11, "tasks": ["17.1", "17.2", "17.3", "17.4", "17.5", "17.6", "17.7", "17.8", "17.9", "17.10"] },
    { "id": 12, "tasks": ["18.1", "18.2", "18.3"] }
  ]
}
```
