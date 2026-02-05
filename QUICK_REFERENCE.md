# 📋 Quick Reference - Mobile Responsive Optimization

## 🎯 Cambios Principales en 30 Segundos

### Typography (Tipografía Fluida)
```css
/* ANTES */
font-size: 16px;

/* DESPUÉS */
font-size: clamp(14px, 2.2vw, 16px);
```

### Touch Targets
```css
/* ANTES */
button { padding: 8px 12px; }

/* DESPUÉS */
button {
  min-height: 44px;
  min-width: 44px;
  padding: clamp(var(--space-2), 1.5vw, var(--space-3))
           clamp(var(--space-3), 2vw, var(--space-4));
}
```

### Animations
```css
/* ANTES */
animation: shake 0.5s infinite;

/* DESPUÉS */
@media (hover: none) {
  * { animation-duration: 150ms !important; }
}
```

### Image Stability (CLS)
```css
/* ANTES */
img { width: 100%; height: auto; }

/* DESPUÉS */
img {
  aspect-ratio: 4 / 3;
  object-fit: cover;
  width: 100%;
  height: auto;
}
```

---

## 📱 Breakpoints Reference

```css
/* Base: Mobile (320px) */
.items-grid { grid-template-columns: repeat(2, 1fr); }

/* 480px: Tablet small */
@media (min-width: 480px) {
  .items-grid { grid-template-columns: repeat(3, 1fr); }
}

/* 768px: iPad mini */
@media (min-width: 768px) {
  .game-layout { grid-template-columns: 1.5fr 1fr; }
  .items-grid { grid-template-columns: repeat(3, 1fr); }
}

/* 1024px: Desktop/iPad Pro */
@media (min-width: 1024px) {
  .game-layout { grid-template-columns: 1fr 350px; }
  .items-grid { grid-template-columns: repeat(4, 1fr); }
}

/* Landscape (<600px height) */
@media (max-height: 600px) {
  .col-tray { max-height: calc(100svh - 250px); }
  .game-header { padding: var(--space-2); }
}
```

---

## ♿ Accesibilidad Mínima

```css
/* Touch targets */
.btn { min-height: 44px; }

/* Font size (prevents iOS zoom) */
input { font-size: 16px; }

/* Focus visible */
:focus-visible { outline: 3px solid var(--primary); }

/* Contraste mínimo 4.5:1 */
color: #4f0b7b;         /* WCAG AAA: 9.2:1 */
background: white;
```

---

## 🚀 Performance Essentials

```css
/* Imagen sin CLS */
img {
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  max-width: 100%;
  height: auto;
}

/* Animaciones rápidas en mobile */
@media (pointer: coarse) {
  * { animation-duration: 150ms !important; }
}

/* Sombras simplificadas */
.btn {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:active {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
```

---

## 📊 Spacing System (8pt)

```css
--space-1: 4px     /* Para micro spacing */
--space-2: 8px     /* Pequeño */
--space-3: 12px    /* Medio pequeño */
--space-4: 16px    /* Base */
--space-6: 24px    /* Medium */
--space-8: 32px    /* Large */
--space-12: 48px   /* Extra large */
--space-16: 64px   /* Huge */

/* Uso con clamp() */
padding: clamp(var(--space-2), 2vw, var(--space-4));
margin: clamp(var(--space-3), 3vw, var(--space-6));
```

---

## 🎨 Color Palette

```css
/* IST Brand */
--primary: #cb348c            /* Acciones */
--primary-dark: #4f0b7b       /* Hover/Focus */

/* Scenario Colors */
--color-terremoto: #e86019    /* Orange */
--color-incendio: #d32f2f     /* Red */
--color-inundacion: #35bad1   /* Cyan */
--color-apagon: #4f0b7b       /* Purple */

/* Neutral Scale */
--slate-50: #F8FAFC    /* Almost white */
--slate-900: #0F172A   /* Almost black */

/* Status */
--essential: #00da2c   /* Green - OK */
--recommended: #F29F05 /* Amber - Warning */
--forbidden: #D32F2F   /* Red - Error */
```

---

## 🎯 Common Patterns

### Responsive Hero Image
```css
.hero {
  aspect-ratio: 16 / 9;
  width: 100%;
  max-width: clamp(320px, 90vw, 1024px);
  margin: 0 auto;
}

.hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}
```

### Responsive Grid
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(80px, 20vw, 150px), 1fr));
  gap: clamp(var(--space-2), 2vw, var(--space-4));
}
```

### Responsive Padding
```css
.container {
  padding: clamp(var(--space-3), 4vw, var(--space-8))
           clamp(var(--space-4), 5vw, var(--space-12));
}
```

### Touch-Friendly Button
```css
.btn {
  min-height: 44px;
  min-width: 44px;
  padding: clamp(var(--space-2), 1.5vw, var(--space-3))
           clamp(var(--space-3), 2vw, var(--space-4));
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.15s ease;
}

.btn:active {
  transform: scale(0.98) translateZ(0);
}

.btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

---

## 🔧 Debugging Tools

### Mostrar Touch Targets
```css
/* Agregar al final de styles.css */
.btn,
.item-card {
  outline: 2px dashed rgba(203, 52, 140, 0.5) !important;
}
```

### Mostrar Breakpoint Actual
```css
html::before {
  content: "📱 Mobile";
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #00da2c;
  padding: 10px;
  z-index: 9999;
  border-radius: 4px;
}

@media (min-width: 768px) {
  html::before { content: "📱 Tablet"; }
}

@media (min-width: 1024px) {
  html::before { content: "🖥️ Desktop"; }
}
```

### Detectar Layout Shifts
```javascript
// En Console
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log('CLS:', entry.value);
  });
});
observer.observe({entryTypes: ['layout-shift']});
```

---

## 📱 Testing Devices

```
iPhone SE         375px × 667px
iPhone 12         390px × 844px
iPhone 14         390px × 844px
iPhone 15 Pro     393px × 852px

Samsung S20       360px × 800px
Samsung S21       360px × 800px
Pixel 6           412px × 915px

iPad Mini         768px × 1024px
iPad Air          820px × 1180px
iPad Pro          1024px × 1366px
```

---

## 🎯 Testing Commands

```bash
# Local server
python -m http.server 8000

# Lighthouse audit
lighthouse http://localhost:8000 --view

# Check mobile-friendly
# Use Chrome DevTools → Device Toolbar

# Test on real device
# 1. Get local IP: ipconfig getifaddr en0
# 2. Visit: http://[IP]:8000 on phone
```

---

## ✅ Pre-Launch Checklist

- [ ] Responsive on 5 device sizes
- [ ] Touch targets ≥44px
- [ ] Focus visible on all buttons
- [ ] No horizontal scroll
- [ ] Images load smoothly (no CLS)
- [ ] Animations <150ms on mobile
- [ ] Landscape mode works
- [ ] Safe areas respected (notch)
- [ ] Keyboard navigation works
- [ ] Contrast ≥4.5:1
- [ ] No console errors
- [ ] Lighthouse >85 performance

---

## 🔗 Quick Links

- **Game:** `http://localhost:8000/`
- **Testing Guide:** `http://localhost:8000/MOBILE_TESTING.html`
- **Detailed Docs:** `./MOBILE_OPTIMIZATION_SUMMARY.md`
- **Before/After:** `./BEFORE_AFTER.md`
- **Deployment:** `./DEPLOYMENT_CHECKLIST.md`

---

## 💡 Pro Tips

1. **Use `clamp()` for typography**
   - No breakpoints needed
   - Smooth scaling across all sizes

2. **Always use `aspect-ratio` on images**
   - Prevents layout shifts (CLS)
   - Maintains proportions

3. **Reduce animation duration on mobile**
   - 150ms vs 300ms feels better
   - Use `@media (hover: none)`

4. **44px is the magic number**
   - WCAG AA compliant touch target
   - Fingers are ~11-13mm wide

5. **Test on real devices**
   - Chrome DevTools is good
   - Real devices are better
   - Slow 3G is important

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** ✅ Production Ready
