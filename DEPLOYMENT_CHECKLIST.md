# 🚀 Deployment & Production Checklist

## Pre-Launch Verification

### ✅ Performance & Core Web Vitals

- [ ] **LCP (Largest Contentful Paint)**
  - [ ] Hero image loads in <2.5s
  - [ ] Preload critical images: `<link rel="preload" as="image">`
  - [ ] Compress images (WebP format recommended)
  
- [ ] **FID (First Input Delay)**
  - [ ] No JS blocking parse: split code
  - [ ] Interactions respond in <100ms
  - [ ] Remove render-blocking CSS/JS
  
- [ ] **CLS (Cumulative Layout Shift)**
  - [ ] aspect-ratio set on all images ✅ DONE
  - [ ] Font-face includes font-display: swap
  - [ ] Ads/embeds have reserved space
  
- [ ] **Lighthouse Audit**
  ```bash
  # Run in terminal
  lighthouse http://localhost:8000 --view
  ```
  Target: Performance >85, Accessibility >90

### ✅ Accesibilidad

- [ ] **WCAG 2.1 AA Compliance**
  - [ ] Color contrast ≥4.5:1 (normal text)
  - [ ] Color contrast ≥3:1 (large text)
  - [ ] Focus visible on all interactive elements
  - [ ] Touch targets ≥44×44px
  - [ ] Text scalable up to 200%
  - [ ] No captchas without alternative
  
- [ ] **Screen Reader Testing**
  - [ ] NVDA (Windows) or JAWS
  - [ ] VoiceOver (iOS/Mac)
  - [ ] All interactive elements labeled
  
- [ ] **Keyboard Navigation**
  - [ ] Tab through all elements
  - [ ] Logical tab order (left-to-right, top-to-bottom)
  - [ ] No keyboard traps
  - [ ] Focus indicator always visible

- [ ] **Color Blind Simulation**
  - [ ] Test with Color Blind Simulator extension
  - [ ] Don't rely on color alone to convey info
  - [ ] Icons + color for status indicators

### ✅ Mobile Testing

- [ ] **Real Devices**
  - [ ] iPhone SE (375px width)
  - [ ] iPhone 14 (390px width)
  - [ ] Samsung Galaxy S21 (360px width)
  - [ ] iPad Mini (768px width)
  - [ ] iPad Air (820px width)
  
- [ ] **Orientations**
  - [ ] Portrait mode (full height)
  - [ ] Landscape mode (<600px height)
  - [ ] Split-view on tablet
  
- [ ] **Network Conditions**
  - [ ] Fast 4G
  - [ ] Regular 4G
  - [ ] Slow 3G
  - [ ] Offline (test gracefully)
  
- [ ] **Touch Interactions**
  - [ ] All buttons respond to touch
  - [ ] No "fast click" issues
  - [ ] No double-tap zoom needed
  - [ ] Swipe gestures work smoothly

### ✅ Browser Compatibility

```
iOS Safari 14+          ✅
Android Chrome 90+      ✅
Android Firefox 87+     ✅
Samsung Internet 13+    ✅
Edge 90+                ✅
IE 11                   ❌ (No support - graceful degradation)
```

**Test URLs:**
```
https://caniuse.com/?search=clamp
https://caniuse.com/?search=aspect-ratio
https://caniuse.com/?search=safe-area
```

### ✅ Security

- [ ] **HTTPS Only**
  - [ ] No mixed content
  - [ ] Certificates valid
  - [ ] HSTS headers configured
  
- [ ] **Content Security Policy**
  ```html
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'self'; 
                 script-src 'self' 'unsafe-inline';
                 style-src 'self' 'unsafe-inline'">
  ```
  
- [ ] **Input Validation**
  - [ ] All form inputs sanitized
  - [ ] No XSS vulnerabilities
  - [ ] CSRF tokens (if forms)
  
- [ ] **Asset Integrity**
  - [ ] SRI hashes for CDN resources
  - [ ] Subresource Integrity implemented

### ✅ SEO & Meta Tags

- [ ] **Meta Tags**
  ```html
  <meta name="description" content="Juego educativo de preparación ante emergencias">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#cb348c">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  ```
  
- [ ] **Open Graph (Social Share)**
  ```html
  <meta property="og:title" content="GRD Bag Game">
  <meta property="og:description" content="Juego de preparación ante emergencias">
  <meta property="og:image" content="https://example.com/og-image.jpg">
  <meta property="og:url" content="https://example.com/">
  ```
  
- [ ] **Structured Data**
  ```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Game",
    "name": "GRD Bag Game",
    "description": "Juego educativo interactivo"
  }
  </script>
  ```

### ✅ Performance Optimization

```html
<!-- 1. Critical Path Optimization -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preload" as="image" href="logo.png">
<link rel="preload" as="style" href="styles.css">

<!-- 2. Defer Non-Critical JS -->
<script defer src="main.js"></script>

<!-- 3. Lazy Load Images -->
<img src="image.jpg" loading="lazy" alt="Description">

<!-- 4. Service Worker for Offline -->
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
</script>
```

### ✅ Testing Tools

```bash
# Performance
lighthouse http://localhost:8000 --output-path=report.html

# Accessibility
npm install -g axe-core
# Use axe DevTools extension in Chrome

# SEO
npx site-audit-cli http://localhost:8000

# Mobile-friendly
# Use Google Mobile-Friendly Test
# https://search.google.com/test/mobile-friendly

# Network simulation
# Chrome DevTools > Network > Throttle (3G/4G)

# Lighthouse Budget
# Create lighthouse-budget.json for automation
```

---

## Deployment Steps

### Step 1: Pre-Deployment Testing

```bash
# 1. Run Lighthouse audit
lighthouse http://localhost:8000 --output-path=lighthouse.html

# 2. Check mobile responsiveness
# Use Chrome DevTools Device Emulation

# 3. Test all interactive elements
# Manual testing on real devices

# 4. Verify all assets load
# Chrome DevTools > Network tab
```

### Step 2: Optimize Assets

```bash
# 1. Minify CSS
# Already done by build tool or manually

# 2. Compress images
# Use ImageOptim, TinyPNG, or Squoosh
# Format: WebP + PNG fallback

# 3. Create srcset for responsive images
<img src="image.jpg" 
     srcset="image-320w.jpg 320w,
             image-640w.jpg 640w,
             image-1024w.jpg 1024w"
     sizes="(max-width: 640px) 100vw,
            640px"
     alt="Description">

# 4. Defer non-critical scripts
# Move analytics, ads to <script defer>
```

### Step 3: Server Configuration

```apache
# .htaccess or server config

# 1. Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml
  AddOutputFilterByType DEFLATE text/css text/javascript
  AddOutputFilterByType DEFLATE application/javascript
</IfModule>

# 2. Cache-Control headers
<FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js|svg)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>

# 3. HTML no-cache
<FilesMatch "\.html$">
  Header set Cache-Control "max-age=3600, public, must-revalidate"
</FilesMatch>

# 4. Enable HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 5. Remove ETags (improve cache hit rate)
Header unset ETag
FileETag None

# 6. Charset declaration
AddDefaultCharset UTF-8
```

### Step 4: Monitor After Launch

```javascript
// Web Vitals Monitoring
import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);

// Error Tracking
window.addEventListener('error', (e) => {
  console.error('Error:', e);
  // Send to logging service
});

// Performance API
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Performance:', entry);
  }
});
observer.observe({entryTypes: ['navigation', 'resource']});
```

---

## Production Checklist Summary

```
PERFORMANCE
  ✅ LCP <2.5s
  ✅ FID <100ms  
  ✅ CLS <0.1
  ✅ Lighthouse >85

ACCESSIBILITY
  ✅ WCAG 2.1 AA
  ✅ Color contrast ≥4.5:1
  ✅ Touch targets ≥44px
  ✅ Focus visible
  ✅ Keyboard navigation

MOBILE
  ✅ Responsive 320px-2560px
  ✅ Touch-friendly
  ✅ Tested on real devices
  ✅ Orientation changes work
  ✅ Fast on slow networks

SECURITY
  ✅ HTTPS only
  ✅ CSP headers
  ✅ No XSS/CSRF
  ✅ Input sanitized

SEO
  ✅ Meta tags
  ✅ Open Graph
  ✅ Structured data
  ✅ Sitemap.xml

MONITORING
  ✅ Error tracking
  ✅ Performance monitoring
  ✅ Analytics configured
  ✅ Log aggregation ready
```

---

## Post-Launch Monitoring

### Week 1
- Monitor error rates
- Check Core Web Vitals
- User feedback collection
- Performance regressions

### Month 1
- SEO performance (rankings, traffic)
- User engagement metrics
- Bounce rate analysis
- Conversion tracking

### Ongoing
- Weekly performance reports
- Monthly accessibility audits
- Quarterly security reviews
- Continuous optimization

---

## Quick Deploy Commands

```bash
# Test locally
python -m http.server 8000

# Build/Optimize
npm run build
# or
npx lighthouse http://localhost:8000

# Deploy (example)
git add .
git commit -m "Production: Mobile responsive optimization"
git push origin main

# Monitor
# GitHub Actions / CI Pipeline
# Vercel / Netlify auto-deploy
# Monitoring dashboard
```

---

## Rollback Plan

If issues occur in production:

1. **Immediate:** Revert CSS changes
   ```bash
   git revert HEAD
   git push
   ```

2. **Monitor:** Check error rates drop
   - Sentry / LogRocket dashboard
   - Google Analytics real-time
   - Lighthouse audit

3. **Communicate:** Notify stakeholders
   - Status page update
   - Twitter/email notification
   - User support alert

4. **Fix:** Create new PR with fix
   - Include regression tests
   - Performance benchmarks
   - Accessibility review

---

## Resources

- **Performance:** https://web.dev/performance/
- **Accessibility:** https://www.w3.org/WAI/WCAG21/quickref/
- **Mobile:** https://developers.google.com/web/mobile
- **Testing:** https://www.chromium.org/developers/testing/
- **SEO:** https://developers.google.com/search/docs

---

**Last Updated:** 2024
**Status:** Ready for Deployment ✅
