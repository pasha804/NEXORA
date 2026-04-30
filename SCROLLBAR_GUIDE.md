# Custom Scrollbar Implementation Guide

## Overview
Custom scrollbar styling for Nexora's triple-dark theme with glassmorphism effects, electric blue gradients, and smooth animations.

## Usage

### 1. **Global Scrollbar** (All scrollable elements)
```tsx
// Applied automatically to all elements via global CSS
// No class needed
```

### 2. **Nexora Scrollbar** (Standard vertical/horizontal)
```tsx
<div className="nexora-scrollbar overflow-auto">
  {/* Content */}
</div>
```

### 3. **Horizontal Scroll** (Tab navigation, carousels)
```tsx
<div className="discover-tabs-scroll">
  {/* Tabs */}
</div>
```

### 4. **Minimal Variant** (Auto-hide, shows on hover)
```tsx
<div className="nexora-scrollbar nexora-scrollbar-minimal overflow-auto">
  {/* Content */}
</div>
```

### 5. **Glow Variant** (Extra neon effect)
```tsx
<div className="nexora-scrollbar nexora-scrollbar-glow overflow-auto">
  {/* Content */}
</div>
```

### 6. **Glass Variant** (Enhanced glassmorphism)
```tsx
<div className="nexora-scrollbar nexora-scrollbar-glass overflow-auto">
  {/* Content */}
</div>
```

## Utility Classes

- `scrollbar-hide` - Completely hides scrollbar
- `scrollbar-auto-hide` - Shows only on hover/scroll
- `smooth-scroll` - Enables smooth scrolling behavior

## Features

✅ **Cross-browser Support**
- WebKit (Chrome, Edge, Safari)
- Firefox
- Fallback for unsupported browsers

✅ **Animations**
- Smooth opacity transitions
- Width/height expansion on hover
- Glow effects on interaction

✅ **Accessibility**
- Respects `prefers-reduced-motion`
- High contrast mode support
- Touch-friendly on mobile

✅ **Mobile Optimizations**
- Thinner scrollbars (3px vs 6px)
- Auto-hide by default
- Shows only when actively scrolling

## Color System

- **Track**: `rgba(0, 0, 0, 0.3)` - Triple dark
- **Thumb**: Blue-purple gradient
  - Base: `rgba(59, 130, 246, 0.3)` to `rgba(139, 92, 246, 0.3)`
  - Hover: `rgba(59, 130, 246, 0.6)` to `rgba(139, 92, 246, 0.6)`
- **Border**: `rgba(59, 130, 246, 0.2-0.5)`
- **Glow**: `0 0 8px rgba(59, 130, 246, 0.4)`

## Implementation

Custom scrollbar styling is automatically imported in `main.tsx`:
```tsx
import "./styles/scrollbar-theme.css";
```

Used in `DiscoverTabs.tsx`:
```tsx
<div className="discover-tabs-scroll">
  {/* Tab buttons */}
</div>
```

## Reels Page Scrollbar

### 7. **Ultra-Thin Reels Scroll** (Instagram/TikTok style)
```tsx
<div className="reels-scroll">
  {/* Vertical scroll container */}
</div>
```

### 8. **Premium Reels Scroll** (Enhanced with glassmorphism)
```tsx
<div className="reels-scroll-premium">
  {/* Full-screen reels with custom scrollbar */}
</div>
```

### Reels Container Pattern
```tsx
<div className="reels-container">
  <div className="reels-scroll-wrapper reels-scroll-premium">
    <div className="reel-item">
      {/* Full-screen reel with scroll-snap */}
    </div>
  </div>
</div>
```

## Browser Testing

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | WebKit styling |
| Edge | ✅ Full | WebKit styling |
| Safari | ✅ Full | WebKit styling |
| Firefox | ✅ Good | Limited styling via scrollbar-color |
| Mobile Safari | ✅ Good | Auto-hide, touch optimized |
| Mobile Chrome | ✅ Good | Auto-hide, touch optimized |

## Performance

- ✅ No layout shifts
- ✅ GPU-accelerated transitions
- ✅ Lightweight (< 5KB CSS)
- ✅ No JavaScript required
