# Stage 21.1 Network Verification

## Environment

- Project root: `D:\LifeBoard`
- Preview URL: `http://127.0.0.1:5173/weather`
- Browser: Playwright Chromium
- Weather data: local Playwright route fixtures for Open-Meteo forecast and air quality
- Selected city: Beijing fixture in `lifeboard-weather-location`
- Visual condition: `partly-cloudy`, `day`
- Evidence folder: `D:\LifeBoard\docs\weather-visual\screenshots\stage-21-1`

## Verification Boundary

The network assertion phase is separated from screenshot capture. Playwright `fullPage` screenshots were found to pollute responsive image request logs, so the final run uses viewport screenshots after assertions and excludes screenshot-phase requests from the product result.

Primary evidence files:

- `post-network-verification-final.json`
- `post-network-summary-final.json`
- `desktop-1440-motion.png`
- `desktop-1600-motion.png`
- `desktop-1440-reduced.png`
- `desktop-1440-dark.png`
- `desktop-1440-dark-reduced.png`
- `mobile-390-motion.png`
- `mobile-430-motion.png`
- `mobile-390-reduced.png`
- `mobile-390-dark.png`
- `mobile-390-dark-reduced.png`
- `resize-mobile-to-desktop.png`
- `resize-desktop-to-mobile.png`
- `toggle-reduced-after-open.png`
- `toggle-theme-after-open.png`
- `fallback-404.png`

## Results

| Case | Assertion requests | Final currentSrc | Result |
| --- | --- | --- | --- |
| desktop-1440-motion | desktop | desktop AVIF | PASS |
| desktop-1600-motion | desktop | desktop AVIF | PASS |
| desktop-1440-reduced | desktop | desktop AVIF | PASS |
| desktop-1440-dark | desktop | desktop AVIF | PASS |
| desktop-1440-dark-reduced | desktop | desktop AVIF | PASS |
| mobile-390-motion | mobile | mobile AVIF | PASS |
| mobile-430-motion | mobile | mobile AVIF | PASS |
| mobile-390-reduced | mobile | mobile AVIF | PASS |
| mobile-390-dark | mobile | mobile AVIF | PASS |
| mobile-390-dark-reduced | mobile | mobile AVIF | PASS |
| resize-mobile-to-desktop | mobile, then desktop | desktop AVIF | PASS |
| resize-desktop-to-mobile | desktop, then mobile | mobile AVIF | PASS |
| toggle-reduced-after-open | desktop only | desktop AVIF | PASS |
| toggle-theme-after-open | desktop only | desktop AVIF | PASS |
| fallback-404 | desktop 404 route | no base image, text intact | PASS |

## Notes

- Desktop viewports did not transfer mobile base artwork during assertion.
- Mobile viewports did not transfer desktop base artwork during assertion.
- Reduced motion disabled animations and did not trigger a new base image request after page load.
- Theme switching did not trigger a new base image request after page load.
- Resizing across the breakpoint requested the newly matching endpoint once.
- Fallback 404 kept the weather page text present with `bodyTextLength=2804`.
