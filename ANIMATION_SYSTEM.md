# Chat Framework Animation System
**Apple Design System v2.0**

## Overview
Complete redesign with Apple-level polish using spring physics, glassmorphism, and multi-layer shadows. Every animation uses Apple's signature cubic-bezier easing curves.

---

## Easing Functions (Apple Standard)

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);        /* Primary - smooth deceleration */
--ease-in-out: cubic-bezier(0.76, 0, 0.24, 1);   /* Secondary - symmetric */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful - overshoot */
```

### When to Use Each
- **ease-out** (90% of animations): Buttons, bubbles, cards, progress
- **ease-in-out**: Progress bar width, blur transitions
- **ease-bounce**: Emojis, feedback indicators, playful elements

---

## Animation Catalog

### 1. Chat Bubble Entrance
**Effect:** Slide up + scale + fade in
**Duration:** 400ms
**Easing:** `ease-out`
**Stagger:** 100ms between bubbles

```css
@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

**Implementation:**
```javascript
msgDiv.style.animationDelay = '50ms';
```

---

### 2. Typing Indicator
**Effect:** 3 dots bounce vertically
**Duration:** 600ms per cycle
**Loop:** Infinite
**Offset:** 200ms stagger

```css
.typing-dots span:nth-child(1) { animation-delay: 0ms; }
.typing-dots span:nth-child(2) { animation-delay: 200ms; }
.typing-dots span:nth-child(3) { animation-delay: 400ms; }

@keyframes typingBounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.8;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
```

---

### 3. Progress Bar
**Effect:** Width transition + shimmer + color shift
**Duration:** 600ms width, 2s shimmer loop
**Color shift:** Blue → Green at 100%

```css
.chat-progress-bar {
  transition: width 0.6s var(--ease-out);
}

/* Shimmer effect */
.chat-progress-bar::after {
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}
```

**JavaScript:**
```javascript
if (progress === 100) {
  this.progressBar.style.background =
    'linear-gradient(90deg, #30D158 0%, #34C759 100%)';
}
```

---

### 4. Button Interactions

#### Hover State
**Effect:** Scale + lift + shadow
**Duration:** 200ms

```css
.chat-button:hover {
  border-color: var(--color-accent-blue);
  background: rgba(0, 122, 255, 0.04);
  transform: translateY(-2px) scale(1.01);
  box-shadow: var(--shadow-md);
}
```

#### Active State
**Effect:** Scale down (haptic feedback)
**Duration:** 100ms

```css
.chat-button:active {
  transform: translateY(0) scale(0.98);
  transition-duration: 0.1s;
}
```

#### Emoji Pop
**Effect:** Emoji scales independently
**Duration:** 200ms

```css
.chat-button:hover .button-emoji {
  transform: scale(1.15);
}
```

---

### 5. Emoji Animations

#### Pop Entrance
**Effect:** Scale + rotate + fade
**Duration:** 500ms
**Easing:** `ease-bounce`

```css
@keyframes emojiPop {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-12deg);
  }
  50% {
    transform: scale(1.1) rotate(8deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
```

---

### 6. Feedback Checkmark
**Effect:** Scale + rotate + fade with haptic shrink
**Duration:** 500ms entrance, 400ms exit

```css
@keyframes feedbackPop {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-45deg);
  }
  50% {
    transform: scale(1.3) rotate(12deg);
  }
  70% {
    transform: scale(0.9) rotate(-6deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
```

**JavaScript exit:**
```javascript
setTimeout(() => {
  feedback.style.transform = 'scale(0.8)';
  feedback.style.opacity = '0';
}, 600);
```

---

### 7. Results Card (Glassmorphism)

#### Card Entrance
**Effect:** Fade + slide + blur-in
**Duration:** 800ms

```css
@keyframes resultsCardFadeIn {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
    backdrop-filter: blur(0px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    backdrop-filter: blur(20px) saturate(180%);
  }
}
```

#### Title Animation
**Delay:** 200ms after card
**Duration:** 600ms

```css
@keyframes resultsCardTitle {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Row Stagger
**Base delay:** 300ms
**Increment:** 100ms per row

```css
.result-row:nth-child(2) { animation-delay: 300ms; }
.result-row:nth-child(3) { animation-delay: 400ms; }
.result-row:nth-child(4) { animation-delay: 500ms; }
/* ... */

@keyframes resultsCardRow {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
```

---

### 8. Blur-In Effect (JavaScript)
Dynamic blur reduction for glassmorphism cards

```javascript
addBlurInEffect(element) {
  let blurValue = 20;
  const interval = setInterval(() => {
    blurValue -= 2;
    if (blurValue <= 0) {
      clearInterval(interval);
      element.style.backdropFilter = 'blur(20px) saturate(180%)';
    } else {
      element.style.backdropFilter = `blur(${blurValue}px) saturate(180%)`;
    }
  }, 30); // 30ms intervals = 600ms total
}
```

---

### 9. Value Highlight
**Effect:** Scale pulse
**Duration:** 600ms
**Trigger:** Values with `.highlight` class

```css
@keyframes valueHighlight {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
```

---

### 10. Share Buttons
**Effect:** Lift + shadow increase
**Duration:** 200ms

```css
.share-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: var(--shadow-lifted);
}

.share-btn:active {
  transform: translateY(-1px) scale(0.98);
  transition-duration: 0.1s;
}
```

---

## Shadow System (Multi-layer)

Apple uses multiple shadow layers for depth:

```css
--shadow-sm:
  0 2px 4px rgba(0, 0, 0, 0.02),
  0 4px 8px rgba(0, 0, 0, 0.03);

--shadow-md:
  0 2px 4px rgba(0, 0, 0, 0.02),
  0 8px 16px rgba(0, 0, 0, 0.03),
  0 16px 32px rgba(0, 0, 0, 0.04);

--shadow-lg:
  0 4px 8px rgba(0, 0, 0, 0.02),
  0 12px 24px rgba(0, 0, 0, 0.03),
  0 24px 48px rgba(0, 0, 0, 0.05),
  0 32px 64px rgba(0, 0, 0, 0.06);

--shadow-lifted:
  0 8px 16px rgba(0, 0, 0, 0.04),
  0 16px 32px rgba(0, 0, 0, 0.06),
  0 32px 64px rgba(0, 0, 0, 0.08);
```

---

## Glassmorphism (Frosted Glass)

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
```

**Dark mode:**
```css
@media (prefers-color-scheme: dark) {
  .glass-card {
    background: rgba(28, 28, 30, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
}
```

---

## Timing Reference

| Element | Duration | Easing | Delay |
|---------|----------|--------|-------|
| Chat bubble entrance | 400ms | ease-out | 50ms |
| Button hover | 200ms | ease-out | 0ms |
| Button active | 100ms | ease-out | 0ms |
| Progress bar | 600ms | ease-out | 0ms |
| Typing dots | 600ms | ease-in-out | 0/200/400ms |
| Emoji pop | 500ms | ease-bounce | 0ms |
| Feedback checkmark | 500ms | ease-bounce | 0ms |
| Results card | 800ms | ease-out | 0ms |
| Results title | 600ms | ease-out | 200ms |
| Results rows | 500ms | ease-out | 300ms+ |
| Share buttons | 600ms | ease-out | 1000ms |

---

## JavaScript API

### Spring Physics
```javascript
addSpringPhysics(element) {
  element.addEventListener('mouseenter', () => {
    element.style.transform = 'scale(1.02)';
    element.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
  });

  element.addEventListener('mouseleave', () => {
    element.style.transform = 'scale(1)';
  });
}
```

### Stagger Delays
```javascript
container.querySelectorAll('.chat-button').forEach((btn, index) => {
  btn.style.animation =
    `slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms backwards`;
});
```

---

## Performance Notes

1. **Use `transform` and `opacity` only** - GPU accelerated
2. **Avoid animating:** `width`, `height`, `top`, `left`
3. **Use `will-change` sparingly** - only for active animations
4. **Stagger delays** prevent janky simultaneous animations
5. **Reduced motion** - respect `prefers-reduced-motion: reduce`

---

## Accessibility

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Focus States
All interactive elements have visible focus indicators:
```css
.chat-button:focus-visible {
  outline: 3px solid var(--color-accent-blue);
  outline-offset: 2px;
}
```

---

## Color System

### Light Mode
```css
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F5F5F7;
--color-text-primary: #1D1D1F;
--color-text-secondary: #86868B;
--color-accent-blue: #007AFF;
--color-success: #30D158;
```

### Dark Mode
```css
--color-bg-primary: #000000;
--color-bg-secondary: #1C1C1E;
--color-text-primary: #F5F5F7;
--color-text-secondary: #98989D;
--color-accent-blue: #0A84FF;
--color-success: #30D158;
```

---

## Typography (SF Pro Stack)

```css
--font-system: -apple-system, BlinkMacSystemFont,
               "SF Pro Display", "SF Pro Text",
               "Segoe UI", system-ui, sans-serif;
```

**Font smoothing:**
```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

**Letter spacing:**
- Headings (48px+): `-0.02em`
- Body (17px): `-0.01em`
- Small (14px): `0em` or `0.02em`

---

## File Sizes

- **chat-ui.css:** 816 lines (~28KB)
- **chat-framework.js:** 628 lines (~19KB)
- **showcase.html:** 583 lines (~20KB)

---

## Browser Support

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

**Fallbacks:**
- `-webkit-backdrop-filter` for Safari
- Multiple shadow layers degrade gracefully
- CSS variables with fallback values

---

## Credits

Design inspired by:
- Apple.com (spring physics, shadows)
- iOS Messages (bubble design)
- macOS Big Sur (glassmorphism)
- SF Pro Display (typography)
