# Stage 22 Visual Verification

## Scope

Stage 22 verified `partly-cloudy + night` runtime visuals in production preview, with Open-Meteo forecast and air-quality requests fulfilled by deterministic Playwright fixtures.

Evidence root:

`docs/weather-visual/screenshots/stage-22`

Network result file:

`docs/weather-visual/screenshots/stage-22/network/stage-22-playwright-results.json`

## Result

PASS_WITH_CAVEATS

The primary night, day-regression, resize, reduced-motion, theme, and day/night transition checks passed. Fallback failure checks also passed for page stability, but Chromium did not request WebP after the AVIF source request was intentionally aborted; it reported the AVIF request failure and the weather hero kept registered visual metadata with no horizontal overflow.

## Coverage

| Area | Evidence | Result |
|---|---|---|
| Desktop night | `desktop-night/*.png` | PASS |
| Mobile night | `mobile-night/*.png` | PASS |
| Day regression | `day-regression/*.png` | PASS |
| Reduced motion | `reduced-motion/*.png` | PASS |
| Theme variants | `theme/*.png` | PASS |
| Resize | `resize/*.png` | PASS |
| Day/night transitions | `transition/*.png` | PASS |
| Network assertions | `network/stage-22-playwright-results.json` | PASS |
| Blocked AVIF fallback stability | `fallback/*.png` | PASS_WITH_CAVEATS |

## Network Assertions

Network assertions were run separately from screenshot capture. The first four cases asserted viewport-specific asset loading:

- Desktop night requested `night-desktop-avif` and did not request day or mobile assets.
- Mobile night requested `night-mobile-avif` and did not request day or desktop assets.
- Desktop day regression requested `day-desktop-avif` and did not request night or mobile assets.
- Mobile day regression requested `day-mobile-avif` and did not request night or desktop assets.

Resize checks confirmed viewport changes request the newly required night asset and do not request day assets.

Theme and reduced-motion after-open checks confirmed no additional base image requests after the state change.

## DOM Assertions

Verified representative night states:

- `data-life-board-condition="partly-cloudy"`
- `data-effect-group="partly-cloudy"`
- `data-timeline="night"`
- `data-fallback-reason="registered"`
- `data-content-tone="light"`
- Desktop image natural size: 1896x829
- Mobile image natural size: 941x1672
- Reduced motion base/highlight animation names: `none`
- No horizontal document overflow
- No page errors

## Visual Review

Desktop and mobile screenshots were manually sampled after Playwright capture. Both rendered nonblank hero art, readable foreground weather text, stable controls, and no obvious overlap.

## Caveat

For blocked-primary-image checks, Chromium did not continue from the aborted AVIF `<source>` to the WebP `<source>`. The page handled the failed image without crashing or layout overflow, but natural image dimensions were `0x0` in those two intentional failure cases.
