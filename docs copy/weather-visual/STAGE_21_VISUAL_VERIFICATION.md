# Stage 21 Visual Verification

Tooling:

- Vite dev server: `http://127.0.0.1:5173/`
- Playwright Chromium installed with `npx playwright install chromium`
- Mocked Open-Meteo forecast response: WMO code `2`, `is_day=1`, current time `2026-06-22T12:00`, valid sunrise/sunset.

## Screenshots

All screenshots are in:

`D:\LifeBoard\docs\weather-visual\screenshots\stage-21`

| Case | Screenshot | Result |
|---|---|---|
| Desktop 1440x1000 light | `weather-1440x1000-light-motion-20260622.png` | PASS |
| Desktop 1600x900 light | `weather-1600x900-light-motion-20260622.png` | PASS |
| Mobile 390x844 light | `weather-390x844-light-motion-20260622.png` | PASS |
| Mobile 430x932 light | `weather-430x932-light-motion-20260622.png` | PASS |
| Mobile 360x800 light | `weather-360x800-light-motion-20260622.png` | PASS |
| Desktop 1440x1000 reduced motion | `weather-1440x1000-light-reduced-motion-20260622.png` | PASS |
| Desktop 1440x1000 image fallback | `weather-1440x1000-light-fallback-20260622.png` | PASS_WITH_EXPECTED_404 |
| Desktop 1440x1000 dark | `weather-1440x1000-dark-motion-20260622.png` | PASS |

Raw result JSON:

`D:\LifeBoard\docs\weather-visual\screenshots\stage-21\stage-21-playwright-results.json`

## Assertions

- WMO code `2` triggered `condition=partly-cloudy`.
- Effect group was `partly-cloudy`.
- Timeline was `day`.
- Hero atmosphere was `partly-cloudy-day`.
- Desktop `currentSrc` used desktop AVIF.
- Mobile `currentSrc` used mobile AVIF.
- No horizontal overflow was detected.
- Console had no unexpected errors in normal cases.
- Reduced motion disabled motion animations.
- Fallback case retained readable weather content when image requests were forced to 404.

## Caveat

The reduced-motion verification recorded an extra mobile image request during initial snapshot transition, even though the final `currentSrc` was desktop AVIF and animations were disabled. Normal desktop and dark desktop cases loaded only the desktop runtime image after the viewport source-set tightening.
