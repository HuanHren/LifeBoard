# Stage 22.1 Network Verification

## Environment

- Project root: `D:\LifeBoard`
- Preview URL: `http://127.0.0.1:5173/weather`
- Browser: Playwright Chromium
- Forecast data: deterministic Open-Meteo fixtures
- Evidence root: `docs/weather-visual/screenshots/stage-22-1`
- Network JSON: `docs/weather-visual/screenshots/stage-22-1/network/stage-22-1-network-results.json`

## Result

PASS_WITH_CAVEATS

All required functional assertions passed. Browser console resource errors appear in intentionally blocked asset scenarios because Playwright aborts image requests; no Vue page errors were observed.

## Coverage

| Group | Scenarios | Result |
|---|---:|---|
| Normal AVIF | 4 | PASS |
| AVIF failure to WebP | 4 | PASS |
| AVIF and WebP failure to neutral fallback | 2 | PASS |
| Theme after WebP fallback | 1 | PASS |
| Reduced motion after WebP fallback | 1 | PASS |
| Resize while in WebP fallback | 2 | PASS |
| Day/night visual key isolation | 2 | PASS |
| Same visual data update | 1 | PASS |

## Key Assertions

- Normal day/night desktop/mobile cases requested one AVIF and no WebP.
- AVIF failure cases requested the matching viewport WebP and ended with `naturalWidth > 0`.
- Desktop fallback did not request mobile WebP.
- Mobile fallback did not request desktop WebP.
- When AVIF and WebP both failed, `data-format-state="visual-fallback"` and `data-neutral-fallback-active="true"` were set.
- Theme and reduced-motion changes after WebP fallback did not retry AVIF or WebP.
- Resize after WebP fallback requested the target viewport WebP and did not request the target viewport AVIF.
- New day/night visual keys could try AVIF again and did not inherit the previous key's failed AVIF state.
- Same visual key data refresh stayed in `webp-only` and did not retry AVIF.

## Caveat

During day/night visual transitions, the outgoing layer can be represented by a fresh component branch, so a successfully loaded WebP may be requested again by the browser. Failed AVIF URLs are not retried, final visual state is correct, and no infinite failure loop occurs.
