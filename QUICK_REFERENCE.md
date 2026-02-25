# Chat Framework Quick Reference
**Apple Design System v2.0 - Cheat Sheet**

## CSS Variables (Most Used)

```css
/* Colors */
--color-accent-blue: #007AFF;
--color-success: #30D158;
--color-text-primary: #1D1D1F;
--color-text-secondary: #86868B;

/* Spacing (8px grid) */
--space-sm: 16px;
--space-md: 24px;
--space-lg: 32px;
--space-xl: 48px;

/* Easing */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Shadows */
--shadow-sm: 0 2px 4px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.03);
--shadow-md: 0 2px 4px rgba(0,0,0,0.02), 0 8px 16px rgba(0,0,0,0.03), 0 16px 32px rgba(0,0,0,0.04);
--shadow-lg: 0 4px 8px rgba(0,0,0,0.02), 0 12px 24px rgba(0,0,0,0.03), 0 24px 48px rgba(0,0,0,0.05), 0 32px 64px rgba(0,0,0,0.06);

/* Radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
```

---

## Common Animations

### Slide Up (Most Used)
```css
animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards;
```

### Fade In
```css
animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
```

### Scale On Hover
```css
transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
transform: scale(1.02);
```

### Lift On Hover
```css
transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
transform: translateY(-2px);
box-shadow: var(--shadow-md);
```

---

## JavaScript Helpers

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

### Stagger Animations
```javascript
buttons.forEach((btn, index) => {
  btn.style.animation = `slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms backwards`;
});
```

---

## Glassmorphism

```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.18);
box-shadow: var(--shadow-lg);
```

---

## Timing Chart

| Element | Duration | Easing | Delay |
|---------|----------|--------|-------|
| Bubble entrance | 400ms | ease-out | 50ms |
| Button hover | 200ms | ease-out | 0ms |
| Button active | 100ms | ease-out | 0ms |
| Progress bar | 600ms | ease-out | 0ms |
| Emoji pop | 500ms | ease-bounce | 0ms |
| Results card | 800ms | ease-out | 0ms |

---

## Color Palette

### Light Mode
```
Background: #FFFFFF, #F5F5F7
Text: #1D1D1F, #86868B
Blue: #007AFF
Green: #30D158
```

### Dark Mode
```
Background: #000000, #1C1C1E
Text: #F5F5F7, #98989D
Blue: #0A84FF
Green: #30D158
```

---

## Shadow Layers

Small (buttons, inputs):
```
2px blur, 2% opacity
4px blur, 3% opacity
```

Medium (cards):
```
2px blur, 2% opacity
8px blur, 3% opacity
16px blur, 4% opacity
```

Large (modals, results):
```
4px blur, 2% opacity
12px blur, 3% opacity
24px blur, 5% opacity
32px blur, 6% opacity
```

---

## Button States

```css
/* Default */
background: white;
border: 2px solid rgba(0,0,0,0.08);
transform: scale(1);

/* Hover */
background: rgba(0,122,255,0.04);
border-color: #007AFF;
transform: translateY(-2px) scale(1.01);
box-shadow: var(--shadow-md);

/* Active */
transform: translateY(0) scale(0.98);
transition-duration: 0.1s;
```

---

## Typography Scale

```
Hero: 72px / 4.5rem (bold, -0.02em)
H1: 48px / 3rem (bold, -0.02em)
H2: 36px / 2.25rem (bold, -0.02em)
H3: 24px / 1.5rem (semibold, -0.01em)
Body: 17px / 1.0625rem (regular, -0.01em)
Small: 15px / 0.9375rem (regular, 0em)
```

---

## Accessibility

### Focus States
```css
.element:focus-visible {
  outline: 3px solid var(--color-accent-blue);
  outline-offset: 2px;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## File Paths

```
CSS:  /styles/chat-ui.css (816 lines)
JS:   /scripts/chat-framework.js (628 lines)
Demo: /tools/showcase.html (583 lines)
Docs: /ANIMATION_SYSTEM.md
      /REDESIGN_COMPARISON.md
      /REDESIGN_SUMMARY.md
```

---

## Browser Support

```
Chrome 90+  ✅
Safari 14+  ✅
Firefox 88+ ✅
Edge 90+    ✅
```

---

## Performance Tips

1. Use `transform` and `opacity` only
2. Avoid animating `width`, `height`, `top`, `left`
3. Stagger delays prevent janky transitions
4. Multi-layer shadows pre-calculated
5. GPU acceleration enabled automatically

---

## Common Issues

**Backdrop-filter not working?**
Add `-webkit-backdrop-filter` for Safari.

**Animations too fast/slow?**
Adjust duration in keyframe declaration.

**Shadows too subtle?**
Increase opacity in shadow presets.

**Text too tight?**
Adjust `letter-spacing` (default: -0.01em).

---

**Last Updated:** February 26, 2026
**Version:** 2.0
**Status:** Production Ready
