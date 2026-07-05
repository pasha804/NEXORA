# Requirements Document

## Introduction

The Dynamic Rank Profile Evolution feature redesigns the Nexora profile system so that every visual element of a user's profile — avatar border, card background, username styling, XP bar, badges, particles, and ambient effects — evolves automatically based on the user's rank, prestige level, XP level, and reputation score. The goal is to make the profile itself feel like a reward: low-rank profiles feel basic and beginner, mid-rank profiles feel polished and competitive, high-rank profiles feel elite and impressive, and Grandmaster profiles feel cinematic, legendary, and impossible to ignore. The system is inspired by Free Fire, Valorant, PUBG Mobile, Discord Nitro, League of Legends, and Apex Legends.

The feature spans nine rank tiers (Novice, Bronze I–V, Silver I–V, Gold I–V, Platinum I–V, Diamond I–V, Heroic I–V, Master I–V, Grandmaster), five prestige levels, and affects the following surfaces: the full-page profile (HeroProfileHeader, ProfilePage), user cards in Discover and recommendations (UserCard, PeopleDiscovery, RecommendationCards), and home feed suggestions (Dashboard, HomeRightSidebar). Five new components are created (RankAura, RankBadgeAnimated, PrestigeOverlay, GrandmasterEffects, DynamicProfileTheme) and several existing components are enhanced.

---

## Glossary

- **Profile_System**: The complete set of React components that render a user's profile, including HeroProfileHeader, ProfilePage, UserCard, and all rank-visual sub-components.
- **Rank_Tier**: One of nine named tiers — Novice, Bronze, Silver, Gold, Platinum, Diamond, Heroic, Master, Grandmaster — derived from the user's RP (Rank Points).
- **RP**: Rank Points, the numeric score that determines a user's Rank_Tier and division (I–V within each tier).
- **Division**: A sub-rank within a tier (I = highest, V = lowest). Each division spans 50 RP and contains 5 stars.
- **Prestige**: A 0–5 integer representing how many times a user has reset at Level 100. Higher prestige unlocks additional visual overlays.
- **XP_Level**: The user's current level (1–100+) derived from total XP using the progressive formula `1000 × (1 + level × 0.15)`.
- **Reputation_Score**: A 0–100 composite score derived from verified skills, endorsements, PvP wins, achievements, and followers.
- **RankAura**: A React component that renders concentric animated glow rings behind the avatar, scaled by rank tier and intensity.
- **RankBadgeAnimated**: A React component that renders an animated rank badge with tier icon, full rank name, and division stars, with motion effects scaled by tier.
- **PrestigeOverlay**: A React component that wraps a profile card and adds prestige-level border glow, label, and cinematic overlay for Prestige V.
- **GrandmasterEffects**: A React component that renders Grandmaster-exclusive cinematic effects: cosmic background, energy waves, RGB particles, animated crown, and fire border trails.
- **DynamicProfileTheme**: A React component that wraps the entire profile card and applies rank-appropriate background gradient, border glow, and animated border effects.
- **RankAvatarRing**: A sub-component of DynamicProfileTheme that wraps the avatar with a rank-colored animated ring.
- **Glow_Color**: A CSS rgba string associated with each Rank_Tier, used for box-shadow, border, and particle colors.
- **Rank_Theme**: The combination of background gradient, border glow, card color, and text color associated with a Rank_Tier.
- **UserPreviewCard**: A hover-triggered mini card showing avatar, rank, level, prestige, followers, bio, and top skills.
- **Recommendation_Engine**: The frontend logic that fetches and categorizes users into sections: Trending Developers, Top Ranked Players, Rising Stars, Legendary Creators, AI Experts, Competitive Developers.
- **PersonCard**: The card component used in PeopleDiscovery to display a discoverable user with rank visuals, follow/message/challenge actions, and hover preview.

---

## Requirements

### Requirement 1: Rank-Based Visual Theme System

**User Story:** As a user, I want my profile's visual theme to automatically reflect my rank tier, so that my profile communicates my competitive standing at a glance.

#### Acceptance Criteria

1. THE Profile_System SHALL derive the active Rank_Theme from the user's current Rank_Tier using the `getRankInfoFromString` function.
2. WHEN a user's Rank_Tier is Novice, THE DynamicProfileTheme SHALL apply a dark gray background (`bg-gray-900/40`), no border glow, and a flat static UI with no animations.
3. WHEN a user's Rank_Tier is Bronze, THE DynamicProfileTheme SHALL apply an orange/bronze metallic gradient background and a weak orange glow (`0 0 8px rgba(251,146,60,0.6)`).
4. WHEN a user's Rank_Tier is Silver, THE DynamicProfileTheme SHALL apply a white/silver gradient background, a sharper silver glow (`0 0 10px rgba(203,213,225,0.6)`), and smooth hover effects.
5. WHEN a user's Rank_Tier is Gold, THE DynamicProfileTheme SHALL apply a gold/yellow premium gradient background, a rich gold glow (`0 0 15px rgba(250,204,21,0.7)`), and dynamic shadows.
6. WHEN a user's Rank_Tier is Platinum, THE DynamicProfileTheme SHALL apply a cyan/purple glassmorphism gradient background and a neon glow (`0 0 20px rgba(103,232,249,0.7)`).
7. WHEN a user's Rank_Tier is Diamond, THE DynamicProfileTheme SHALL apply a blue/pink crystal gradient background and a high-end glow (`0 0 25px rgba(147,197,253,0.8)`).
8. WHEN a user's Rank_Tier is Heroic, THE DynamicProfileTheme SHALL apply a red/purple cyberpunk gradient background and an intense glow (`0 0 30px rgba(192,132,252,0.8)`).
9. WHEN a user's Rank_Tier is Master, THE DynamicProfileTheme SHALL apply an electric blue/gold gradient background, a massive neon glow (`0 0 35px rgba(248,113,113,0.8)`), and an animated pulsing border.
10. WHEN a user's Rank_Tier is Grandmaster, THE DynamicProfileTheme SHALL apply an RGB cosmic neon theme with a cycling RGB border animation, a 40px glow, and the full GrandmasterEffects component.
11. THE DynamicProfileTheme SHALL accept a `rank` string prop and a `className` prop and wrap its children without altering their layout.
12. IF the `rank` prop is absent or unrecognized, THEN THE DynamicProfileTheme SHALL fall back to the Novice theme.

---

### Requirement 2: Rank Aura and Particle Effects

**User Story:** As a user, I want animated aura rings and floating particles around my avatar that scale with my rank, so that higher-rank profiles feel visually alive and impressive.

#### Acceptance Criteria

1. THE RankAura component SHALL render zero aura layers for Novice rank.
2. THE RankAura component SHALL render one aura layer for Bronze and Silver ranks with a slow pulse animation (`aura-pulse`, 3s cycle).
3. THE RankAura component SHALL render two aura layers for Gold and Platinum ranks with an intense pulse animation (`aura-pulse-intense`, 2s cycle).
4. THE RankAura component SHALL render three aura layers for Diamond, Heroic, Master, and Grandmaster ranks with scale animation (`scale: [1, 1.05, 1]`).
5. WHEN the `intensity` prop is `"high"`, THE RankAura SHALL use opacity 0.4 for aura layers; WHEN `"medium"`, opacity 0.25; WHEN `"low"`, opacity 0.15.
6. THE RankAura component SHALL accept `size` prop values of `"sm"`, `"md"`, `"lg"`, `"xl"` and map them to corresponding pixel dimensions for outer, middle, and inner rings.
7. THE RankParticles component SHALL render zero floating particles for Novice, Bronze, and Silver ranks.
8. THE RankParticles component SHALL render 3 particles for Gold, 4 for Platinum, 5 for Diamond, 6 for Heroic, 8 for Master, and 10 for Grandmaster.
9. WHEN rendering particles, THE RankParticles component SHALL animate each particle with upward float, sideways drift, fade-in/fade-out, and scale transitions using the rank's Glow_Color.
10. THE RankAura and RankParticles components SHALL be positioned absolutely with `pointer-events-none` so they do not interfere with click targets.

---

### Requirement 3: Animated Rank Badge

**User Story:** As a user, I want my rank badge to be animated with tier-appropriate effects, so that my rank feels prestigious and visually distinct from lower ranks.

#### Acceptance Criteria

1. THE RankBadgeAnimated component SHALL display the rank icon emoji, full rank name (e.g., "Diamond III"), and 5 division stars for all non-Grandmaster ranks.
2. WHEN the Rank_Tier is Grandmaster, THE RankBadgeAnimated component SHALL display the crown emoji (👑) with a rotation animation instead of division stars.
3. WHEN the Rank_Tier is Gold, Platinum, Diamond, Heroic, Master, or Grandmaster, THE RankBadgeAnimated component SHALL apply motion animations including `whileHover: { scale: 1.08 }`.
4. WHEN the Rank_Tier is Grandmaster, THE RankBadgeAnimated component SHALL animate the box-shadow through RGB color cycling (red → green → blue → red) on a 3-second loop.
5. THE RankBadgeAnimated component SHALL accept `size` prop values of `"sm"`, `"md"`, `"lg"`, `"xl"` and apply corresponding padding and font-size classes.
6. THE RankBadgeAnimated component SHALL accept either an `rp` number prop or a `rank` string prop to derive rank information.
7. WHEN `showGlow` is true (default), THE RankBadgeAnimated component SHALL apply a box-shadow using the rank's Glow_Color.
8. THE AnimatedRankStars sub-component SHALL animate each star sequentially with a 0.08s delay between stars for Gold and above ranks.

---

### Requirement 4: Prestige Visual Overlay System

**User Story:** As a user who has achieved prestige, I want my profile to display prestige-level visual overlays that stack on top of my rank effects, so that my dedication to grinding is visually recognized.

#### Acceptance Criteria

1. WHEN a user's prestige is 0, THE PrestigeOverlay component SHALL render its children without any additional visual effects.
2. WHEN a user's prestige is 1 (Prestige I), THE PrestigeOverlay component SHALL render a small aura border (1px solid, opacity 0.08 inner glow) and a "Prestige I" label badge.
3. WHEN a user's prestige is 2 (Prestige II), THE PrestigeOverlay component SHALL render animated particles around the profile card in addition to the border.
4. WHEN a user's prestige is 3 (Prestige III), THE PrestigeOverlay component SHALL render an RGB cycling border (2px) in addition to the prestige label.
5. WHEN a user's prestige is 4 (Prestige IV), THE PrestigeOverlay component SHALL render a crown aura effect (2.5px border, 0.2 opacity glow) around the profile.
6. WHEN a user's prestige is 5 (Prestige Master), THE PrestigeOverlay component SHALL render a full cinematic prestige profile with a radial gradient overlay that pulses on a 4-second cycle.
7. THE PrestigeOverlay component SHALL display a prestige label badge at the top-right of the wrapped element, pulsing between 0.7 and 1.0 opacity on a 2-second cycle.
8. THE PrestigeOverlay component SHALL use the rank's Glow_Color for all prestige border and glow effects, so prestige visuals harmonize with the rank theme.
9. THE PrestigeBadge sub-component SHALL display the prestige tier name with a gradient background specific to each prestige level (I: blue/cyan, II: purple/pink, III: yellow/red, IV: green/blue, V: pink/purple/indigo).

---

### Requirement 5: Grandmaster Cinematic Experience

**User Story:** As a Grandmaster-ranked user, I want my profile to deliver a completely different, AAA gaming showcase experience with cinematic effects, so that my profile feels legendary and impossible to ignore.

#### Acceptance Criteria

1. WHEN a user's Rank_Tier is Grandmaster, THE Profile_System SHALL render the GrandmasterEffects component with a cosmic animated background, energy waves, and RGB particles.
2. WHEN a user's Rank_Tier is Grandmaster, THE HeroProfileHeader SHALL render a GrandmasterCrown component above the avatar that floats with a `y: [0, -6, 0]` and `rotate: [-3, 3, -3]` animation on a 2.5-second loop.
3. WHEN a user's Rank_Tier is Grandmaster, THE HeroProfileHeader SHALL render fire/energy border trails (`.fire-trail-top` and `.fire-trail-bottom`) on the profile card.
4. WHEN a user's Rank_Tier is Grandmaster, THE HeroProfileHeader SHALL render the GrandmasterTitle component for the display name, which cycles text-shadow through RGB colors (red → green → blue) on a 3-second loop.
5. WHEN a user's Rank_Tier is Grandmaster, THE RankAvatarRing SHALL animate the avatar ring box-shadow through RGB color cycling on a 3-second loop.
6. WHEN a user's Rank_Tier is Grandmaster, THE GrandmasterCosmicBackground component SHALL render a drifting star-field pattern with radial gradient color orbs (red, green, blue) that pulse between 0.3 and 0.6 opacity on a 5-second cycle.
7. WHEN a user's Rank_Tier is Grandmaster, THE GrandmasterEnergyWave component SHALL render three horizontal energy wave lines that sweep across the banner from left to right, each in a different RGB color, on staggered 2.5-second cycles.
8. WHEN a user's Rank_Tier is Grandmaster, THE GrandmasterParticles component SHALL render 12 RGB-colored floating particles (alternating red, green, blue) that rise and fade on staggered 3-second cycles.
9. WHEN a user's Rank_Tier is Grandmaster, THE XP bar SHALL use the `xp-bar-grandmaster` CSS class which animates a full RGB gradient across the bar on a 1.5-second shimmer cycle.
10. WHEN a user's Rank_Tier is Grandmaster, THE follower and following count numbers SHALL be styled with `text-amber-300` color.
11. THE GrandmasterEffects component SHALL accept a `type` prop of `"banner"`, `"avatar"`, `"card"`, `"title"`, or `"full"` and render the appropriate subset of effects for each context.
12. IF a user's Rank_Tier is not Grandmaster, THEN THE GrandmasterEffects component SHALL render null without any DOM output.

---

### Requirement 6: Avatar Component Evolution

**User Story:** As a user, I want my avatar to display rank-appropriate animated borders, glow intensity, and hover effects, so that my avatar communicates my rank at a glance.

#### Acceptance Criteria

1. THE RankAvatarRing component SHALL apply a CSS class `avatar-ring-{tier}` (e.g., `avatar-ring-diamond`) to the avatar wrapper, which provides tier-specific box-shadow glow.
2. WHEN the Rank_Tier is Master or Heroic, THE RankAvatarRing SHALL apply a pulsing box-shadow animation (`opacity: [0.4, 0.8, 0.4]`) on a 2-second cycle.
3. WHEN the Rank_Tier is Grandmaster, THE RankAvatarRing SHALL apply an RGB cycling box-shadow animation cycling through red, green, and blue glow states on a 3-second loop.
4. WHEN the Rank_Tier is Novice, THE avatar-ring-novice CSS class SHALL apply only a subtle 2px gray border with no glow.
5. WHEN the Rank_Tier is Bronze, THE avatar-ring-bronze CSS class SHALL apply a 2px orange border with a 10px orange glow.
6. WHEN the Rank_Tier is Gold, THE avatar-ring-gold CSS class SHALL apply a 2px gold border with a 15px gold glow.
7. WHEN the Rank_Tier is Diamond, THE avatar-ring-diamond CSS class SHALL apply a 2px blue border with a 20px blue glow and a 40px diffuse outer glow.
8. WHEN the Rank_Tier is Grandmaster, THE HeroProfileHeader SHALL render a GrandmasterCrown emoji above the avatar with a floating animation.
9. WHEN the Rank_Tier is Grandmaster, THE HeroProfileHeader SHALL render the `rgb-border` CSS class on the avatar for a cycling RGB border effect.

---

### Requirement 7: Username and Text Styling by Rank

**User Story:** As a user, I want my username to be styled with rank-appropriate colors, gradients, and glow effects, so that my name visually reflects my competitive tier.

#### Acceptance Criteria

1. WHEN the Rank_Tier is Novice, Bronze, or Silver, THE HeroProfileHeader SHALL render the display name as plain white text with no special styling.
2. WHEN the Rank_Tier is Gold, THE HeroProfileHeader SHALL render the display name with a gold text color (`text-yellow-400`).
3. WHEN the Rank_Tier is Platinum, THE HeroProfileHeader SHALL render the display name with a cyan text color (`text-cyan-300`).
4. WHEN the Rank_Tier is Diamond, THE HeroProfileHeader SHALL render the display name with a blue text color (`text-blue-300`) and the `text-gradient-diamond` animated gradient class.
5. WHEN the Rank_Tier is Heroic, THE HeroProfileHeader SHALL render the display name with a purple text color (`text-purple-400`) and the `text-gradient-heroic` animated gradient class.
6. WHEN the Rank_Tier is Master, THE HeroProfileHeader SHALL render the display name with a red text color (`text-red-400`), the `text-glow` class, and the `text-gradient-animated` class.
7. WHEN the Rank_Tier is Grandmaster, THE HeroProfileHeader SHALL render the GrandmasterTitle component which cycles text-shadow through RGB colors on a 3-second loop.
8. THE `text-gradient-animated` CSS class SHALL animate a blue/gold/blue gradient across the text on a 3-second cycle using `background-size: 200% 100%`.
9. THE `text-gradient-heroic` CSS class SHALL animate a red/purple/red gradient across the text on a 4-second cycle.
10. THE `text-gradient-diamond` CSS class SHALL animate a blue/pink/blue gradient across the text on a 3.5-second cycle.

---

### Requirement 8: XP Bar Evolution

**User Story:** As a user, I want my XP progress bar to use rank-appropriate colors and animations, so that the bar feels like a premium reward indicator at higher ranks.

#### Acceptance Criteria

1. THE HeroProfileHeader SHALL render an XP progress bar that uses a CSS class determined by the user's Rank_Tier: `xp-bar-novice`, `xp-bar-bronze`, `xp-bar-silver`, `xp-bar-gold`, `xp-bar-platinum`, `xp-bar-diamond`, `xp-bar-heroic`, `xp-bar-master`, or `xp-bar-grandmaster`.
2. WHEN the Rank_Tier is Novice, THE `xp-bar-novice` class SHALL apply a static gray gradient (`#6b7280` to `#9ca3af`).
3. WHEN the Rank_Tier is Bronze, THE `xp-bar-bronze` class SHALL apply an orange/amber gradient.
4. WHEN the Rank_Tier is Gold, THE `xp-bar-gold` class SHALL apply a three-stop gold gradient (`#ca8a04`, `#eab308`, `#facc15`).
5. WHEN the Rank_Tier is Platinum, THE `xp-bar-platinum` class SHALL apply a cyan/purple/pink gradient.
6. WHEN the Rank_Tier is Master, THE `xp-bar-master` class SHALL apply a blue/gold/blue gradient with a 2-second shimmer animation.
7. WHEN the Rank_Tier is Grandmaster, THE `xp-bar-grandmaster` class SHALL apply a full RGB gradient (red/green/blue/red) with a 1.5-second shimmer animation.
8. WHEN the Rank_Tier is Master or Grandmaster, THE HeroProfileHeader SHALL render a white shimmer sweep animation over the XP bar that travels from left to right on a 2-second loop.
9. THE XP bar SHALL animate from 0% to the actual fill percentage using a 1-second ease-out transition on mount.
10. THE XP bar label SHALL display the current XP within the level and the XP needed for the next level, colored with the rank's primary color.

---

### Requirement 9: User Card Rank Evolution (Discover & Recommendations)

**User Story:** As a user browsing the Discover page or home feed, I want user cards to visually reflect each person's rank with appropriate backgrounds, glows, and effects, so that I can immediately identify elite players.

#### Acceptance Criteria

1. THE UserCard component SHALL apply a CSS class `rank-card-{tier}` (e.g., `rank-card-diamond`) to the card wrapper for rank-appropriate background gradients.
2. WHEN the Rank_Tier is Diamond, Heroic, Master, or Grandmaster, THE UserCard component SHALL apply a box-shadow using the rank's Glow_Color at 0.1 opacity.
3. WHEN the Rank_Tier is Grandmaster, THE UserCard component SHALL apply an RGB gradient background overlay and the `rgb-border` CSS class for a cycling border.
4. THE UserCard component SHALL render a RankAura component behind the avatar with `size="sm"` and intensity `"high"` for Grandmaster, `"low"` for all other ranks.
5. THE UserCard component SHALL render a RankBadge component below the avatar section showing the user's rank with stars.
6. WHEN the Rank_Tier is Grandmaster, THE UserCard component SHALL display a crown emoji (👑) overlaid on the avatar.
7. THE PersonCard component in PeopleDiscovery SHALL apply the same rank-card CSS class and glow box-shadow as UserCard.
8. WHEN the Rank_Tier is Grandmaster, THE PersonCard component SHALL display the username in `text-amber-300` color.
9. WHEN the Rank_Tier is Master, THE PersonCard component SHALL display the username in `text-red-400` color.
10. THE RecommendationCards component SHALL display a RankBadge for each user in the recommendation list.
11. WHEN the Rank_Tier is Grandmaster, THE RecommendationCards component SHALL display a crown emoji next to the user's name in the list.
12. THE TrendingCreators component SHALL apply a rank-colored border to Grandmaster creator cards.

---

### Requirement 10: User Profile Hover Preview System

**User Story:** As a user browsing the Discover page, I want to see an animated mini profile card when hovering over a user, so that I can quickly assess their rank, level, prestige, and skills without navigating away.

#### Acceptance Criteria

1. WHEN a user hovers over a PersonCard for 400ms or more, THE PeopleDiscovery component SHALL display a UserPreviewCard positioned to the right of the card.
2. THE UserPreviewCard SHALL display: avatar, display name, username, rank badge, level, prestige badge (if prestige > 0), bio (truncated to 2 lines), and top 3 skills.
3. THE UserPreviewCard SHALL animate in with `opacity: 0 → 1` and `scale: 0.95 → 1` using a 150ms ease transition.
4. THE UserPreviewCard SHALL animate out with `opacity: 1 → 0` and `scale: 1 → 0.95` when the hover ends.
5. THE UserPreviewCard SHALL apply a box-shadow using the hovered user's rank Glow_Color at 0.2 opacity.
6. WHEN the Rank_Tier is Grandmaster, THE UserPreviewCard SHALL apply an amber-colored border (`borderColor: rankInfo.glowColor`).
7. THE UserPreviewCard SHALL only be visible on screens wider than the `lg` breakpoint (1024px) to avoid mobile layout issues.
8. WHEN the user moves the mouse away from the PersonCard, THE PeopleDiscovery component SHALL hide the UserPreviewCard within 0ms (immediate on mouse leave).

---

### Requirement 11: Dynamic Recommendation Engine Sections

**User Story:** As a user, I want the recommendation system to organize discoverable users into meaningful sections based on rank, skills, and activity, so that I can find the right people to follow, challenge, or collaborate with.

#### Acceptance Criteria

1. THE RecommendationCards component SHALL display users organized into six sections: Trending Developers, Top Ranked Players, Rising Stars, AI Experts, Competitive Developers, and Legendary Creators.
2. THE RecommendationCards component SHALL allow switching between sections via tab buttons, with the active section highlighted.
3. WHEN the "AI Experts" section is active, THE RecommendationCards component SHALL filter users to those whose skills include "ai", "ml", or "machine learning" (case-insensitive).
4. WHEN the "Top Ranked Players" section is active, THE RecommendationCards component SHALL sort users by rank (highest RP first).
5. THE RecommendationCards component SHALL fetch users from `GET /search/users?page=1&limit=30&sort=xp_high` and apply client-side filtering per section.
6. THE RecommendationCards component SHALL display up to 5 users per section.
7. WHEN no users match a section's filter, THE RecommendationCards component SHALL display a "No users found in this category" message.
8. THE RecommendationCards component SHALL display a RankBadge for each user in the list.
9. THE RecommendationCards component SHALL provide a connect/follow button for each user that calls `POST /connections/request` with the user's ID.
10. WHEN the RecommendationCards component is loading, THE component SHALL display 4 animated skeleton placeholder rows.

---

### Requirement 12: Profile Page Ambient Background by Rank

**User Story:** As a user viewing any profile, I want the entire page background to subtly reflect the profile owner's rank, so that the immersive rank experience extends beyond just the profile card.

#### Acceptance Criteria

1. THE ProfilePage SHALL render a DynamicProfileTheme component as an absolute full-page background layer (`absolute inset-0 -z-10 pointer-events-none`) using the profile owner's rank.
2. WHEN the profile owner's Rank_Tier is Grandmaster, THE ProfilePage SHALL render a fixed full-viewport GrandmasterEffects component with `type="full"` as a background layer.
3. THE Dashboard page SHALL render a DynamicProfileTheme component as a fixed full-page background layer using the logged-in user's rank.
4. WHEN the logged-in user's Rank_Tier is Grandmaster, THE Dashboard page SHALL render a fixed full-viewport GrandmasterEffects component with `type="full"`.
5. THE ambient background layers SHALL use `pointer-events-none` and negative z-index so they do not intercept user interactions.
6. THE ambient background SHALL not cause layout shifts or affect the scrollable content area.

---

### Requirement 13: Rank System Data Integrity

**User Story:** As a developer, I want the rank system utility functions to correctly derive rank information from both RP numbers and rank strings, so that all visual components receive accurate data.

#### Acceptance Criteria

1. THE `getRankInfo(rp)` function SHALL return a RankInfo object with the correct `tier`, `division`, `stars`, `color`, `glowColor`, `icon`, and `isGrandmaster` fields for any RP value from 0 to 5000.
2. WHEN `rp` is 0, THE `getRankInfo` function SHALL return tier "Novice" with division 0 and stars 0.
3. WHEN `rp` is 4200 or above, THE `getRankInfo` function SHALL return tier "Grandmaster" with `isGrandmaster: true`.
4. THE `getRankInfoFromString(rankStr)` function SHALL return the same RankInfo as `getRankInfo(div.min)` for any valid rank string (e.g., "Diamond III" → RP 1600).
5. IF `getRankInfoFromString` receives an unrecognized string, THEN THE function SHALL return the Novice RankInfo (RP 0).
6. THE `levelFromXp(totalXp)` function SHALL return the correct level for any XP value using the formula `1000 × (1 + level × 0.15)`.
7. THE `xpProgressInLevel(totalXp)` function SHALL return `{ current, needed, percent }` where `percent` is clamped to 0–100.
8. FOR ALL valid rank strings in the DIVISIONS array, parsing with `getRankInfoFromString` then accessing `.full` SHALL return the original rank string (round-trip property).
9. FOR ALL RP values from 0 to 4500, THE `getRankInfo(rp).rp` SHALL equal the input `rp` value.

---

### Requirement 14: CSS Animation Performance and Accessibility

**User Story:** As a user, I want rank animations to be smooth and performant, and as a user with motion sensitivity, I want the option to reduce animations, so that the experience is inclusive.

#### Acceptance Criteria

1. THE Profile_System SHALL use CSS `transform` and `opacity` properties for all rank animations to enable GPU compositing and avoid layout reflow.
2. THE Profile_System SHALL use `pointer-events-none` on all decorative animation layers (auras, particles, fire trails, energy waves) so they do not block interactive elements.
3. WHEN the user's OS or browser has `prefers-reduced-motion: reduce` set, THE Profile_System SHALL suppress all looping animations (aura pulses, particle floats, RGB cycling, fire trails) while preserving static rank-themed colors and gradients.
4. THE RankAura, RankParticles, GrandmasterEffects, and PrestigeOverlay components SHALL use `position: absolute` and `overflow: hidden` to prevent animation elements from extending outside their container bounds.
5. THE Profile_System SHALL not render more than 12 animated particle elements simultaneously on any single profile view to maintain rendering performance.
6. THE fire trail animations SHALL use CSS `animation` (not JavaScript `requestAnimationFrame`) to minimize main-thread work.

---

### Requirement 15: Discover Page User Discoverability

**User Story:** As a user, I want to be discoverable in the Discover page, home feed suggestions, trending creators, and leaderboard sections with my rank, RP, followers, prestige, verified skills, and animated badges visible, so that other users can find and evaluate me.

#### Acceptance Criteria

1. THE PeopleDiscovery component SHALL display each user's rank badge, level, prestige badge (if prestige > 0), follower count, and top 3 skills on their PersonCard.
2. THE PeopleDiscovery component SHALL display a Follow button, Message button, and Challenge (PvP) button on each PersonCard.
3. WHEN a user is online (`onlineStatus === "online"`), THE PersonCard SHALL display a green status dot on the avatar.
4. THE PersonCard SHALL display an AI match percentage badge when `aiMatch > 0`.
5. THE PersonCard SHALL display an AI reasoning snippet in a styled box at the bottom of the card.
6. THE TrendingCreators component on the Dashboard SHALL display each creator's rank badge below their name.
7. THE HomeRightSidebar SHALL include the RecommendationCards component to surface ranked user suggestions on the home feed.
8. THE Discover page SHALL include the RecommendationCards component below the PeopleDiscovery tab content.
9. WHEN the PeopleDiscovery component has no results, THE component SHALL display an empty state with a "Reset Search" button that clears all filters.
10. THE PeopleDiscovery component SHALL support infinite scroll via a "Load More" button that fetches the next page of results.
