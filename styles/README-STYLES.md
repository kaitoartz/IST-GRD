# 🎮 GRD Emergency Kit Game - CSS System Guide

This system implements a modern, "alive" design system focused on micro-interactions and motion.

## File Structure

- `00-reset.css`: Minimal reset to ensure consistency.
- `01-variables.css`: Design tokens (Palette, Easings, Durations).
- `02-typography.css`: Font family (Rubik) and hierarchy.
- `03-animations.css`: Keyframes library and animation utilities.
- `04-layout.css`: Grid, Flex, and responsive containers.
- `05-components.css`: Buttons, Cards, HUD, Toasts, Modals.
- `06-screens.css`: Screen transition logic and specific screen styles.
- `08-utilities.css`: Atomic helper classes.

## Core Classes

### Screens
Use `.screen` for all screen containers.
- `.screen--active`: Shows the screen (opacity 1, pointer-events auto).
- `.screen--hidden`: Hides the screen with a subtle scale-down transition.

### Buttons
- `.btn`: Base class.
- `.btn--primary`: Solid brand color with a 3D bottom shadow.
- `.btn--ghost`: Outlined version.
- `.btn--xl`: Larger version for Hero actions.

### Cards & Items
- `.card`: Base container.
- `.item-card`: Used for the draggable game items.
  - `.is-hover`: Simulate hover state via JS.
  - `.is-grabbing`: State while clicking but not moving yet.
  - `.is-dragging`: State while moving (opacity reduced, z-index high).
  - `.is-disabled`: Greyscale and unclickable.

### HUD & UI
- `.hud`: Sticky header for game stats.
- `.hud__timer`: Timer display with tabular numbers.
- `.hud__life`: Heart icons with `.hud__life--lost` state.
- `.toast`: Notification bar for feedback (use `.toast--success`, `.toast--warn`, `.toast--error`).

### Dropzone (Bag)
- `.dropzone`: The area where items are dropped.
  - `.is-active`: Highlighted when an item is being dragged over it.
  - `.is-full`: Solid border when capacity is reached.

## Motion & Animations

The system uses specific easing functions:
- `--ease-entrance`: Fast in, smooth out.
- `--ease-bounce`: Playful overshoot.

**Utility classes:**
- `.animate-heroFloat`: Gentle floating for intro graphics.
- `.animate-pulse`: Continuous scale pulse for CTA buttons.
- `.animate-shake`: Shake effect for failed drops.
- `.animate-explosive`: Large scale-in for success results.

## Accessibility

- **Focus**: `:focus-visible` is styled for keyboard navigation.
- **Reduced Motion**: All animations are disabled if `prefers-reduced-motion` is detected.
- **Contrast**: Colors are picked to meet AA standards for readability.
- **Targets**: Interactive elements have a minimum size of 48px.

## How to use

Import all files in your `main.css` or include them in `index.html` in order:

```html
<link rel="stylesheet" href="styles/00-reset.css">
<link rel="stylesheet" href="styles/01-variables.css">
<link rel="stylesheet" href="styles/02-typography.css">
<link rel="stylesheet" href="styles/03-animations.css">
<link rel="stylesheet" href="styles/04-layout.css">
<link rel="stylesheet" href="styles/05-components.css">
<link rel="stylesheet" href="styles/06-screens.css">
<link rel="stylesheet" href="styles/08-utilities.css">
```
