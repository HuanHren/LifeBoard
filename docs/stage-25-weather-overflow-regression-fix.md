# Stage 25 Weather Overflow Regression Fix

Date: 2026-07-08

Status: completed locally. Weather remains frozen except for this verified layout regression fix.

## 1. Baseline

- Branch: `main`.
- Starting workspace: clean.
- Starting HEAD: `3234c38 chore(deps): sync lockfile for ci`.
- Local ahead/behind at baseline: none observed from `origin/main..HEAD` and `HEAD..origin/main`.
- This stage runs after the Weather module freeze and is allowed only because it fixes a verified responsive layout regression.

## 2. Skill Gate Summary

Read from `C:\Users\jingr\codex-skills`:

- `impeccable\SKILL.md`
- `gpt-taste\SKILL.md`
- `redesign-existing-projects\SKILL.md`
- `baseline-ui\SKILL.md`
- `vue-best-practices\SKILL.md`
- `fixing-accessibility\SKILL.md`
- `fixing-motion-performance\SKILL.md`
- `playwright-cli\SKILL.md`

Additional references read:

- `impeccable\reference\product.md`
- `vue-best-practices\references\reactivity.md`
- `vue-best-practices\references\sfc.md`
- `vue-best-practices\references\component-data-flow.md`
- `vue-best-practices\references\composables.md`
- `playwright-cli\references\running-code.md`

The project-local impeccable context script was not present at `.agents\skills\impeccable\scripts\context.mjs`, so `PRODUCT.md`, `DESIGN.md`, and the required register reference were read directly.

## 3. Scope

Changed only Weather layout components and the existing route QA runner:

- Weather page container and section width constraints.
- Forecast and precipitation horizontal scroll container constraints.
- Weather route QA now enters a loaded forecast state and checks 1600px / 1920px only for Weather.

Not changed:

- Weather store, services, cache keys, provider code, runtime, PixiJS layer, assets, scenes, i18n, or data structures.
- Non-Weather business modules.
- Package files or workflows.

## 4. Screenshot Symptom Summary

The reported screenshot showed `/weather` with a global bottom horizontal scrollbar while the right-side vertical scrollbar was normal. The visible affected areas were the hero, weather alerts, 24-hour forecast, 7-day forecast, details grid, and precipitation sections.

## 5. Root Cause

The loaded Weather page had horizontal track elements (`w-max` / previous `min-w-max`) inside forecast sections. Those tracks are valid only when their parent chain has a definite shrink boundary.

The WeatherWorkspace root and several intermediate section/grid wrappers did not consistently declare `min-width: 0` and `max-width: 100%`, so the wide forecast track contributed to the page shell's min-content width. That expanded the Weather content column to roughly 3656px and produced document-level horizontal scrolling.

## 6. Offending Elements Found

Before the fix, the seeded loaded Weather route showed:

- `390x844`: `html/body scrollWidth 3672`, `clientWidth 390`.
- `768x1024`: `html/body scrollWidth 3674`, `clientWidth 768`.
- `1600x900`: `html/body scrollWidth 3736`, `clientWidth 1600`.
- `1920x1080`: `html/body scrollWidth 3896`, `clientWidth 1920`.

Primary offenders:

- `WeatherWorkspace` root flex container expanding to about `3656px`.
- `HourlyForecastStrip` horizontal forecast track and scroll wrapper.
- `PrecipitationTimeline` horizontal precipitation track.
- `WeatherHero` atmosphere decoration appeared in offender lists, but it is decorative and clipped; it was not the layout root cause once the parent width chain was fixed.

## 7. Files Changed

- `src/modules/weather/components/WeatherWorkspace.vue`: added `min-w-0` / `max-w-full` to the root, header, loaded content groups, grid wrappers, and status stack wrappers.
- `src/modules/weather/components/WeatherHero.vue`: added local `max-width: 100%` and `min-width: 0` to the hero and viewport.
- `src/modules/weather/components/HourlyForecastStrip.vue`: constrained the section and scroll container; kept the horizontal track internal to the scroll region.
- `src/modules/weather/components/DailyForecastStrip.vue`: constrained the section, card wrapper, and grid.
- `src/modules/weather/components/PrecipitationTimeline.vue`: constrained the section, panel, and internal horizontal scroll region.
- `scripts/qa-route-a11y.mjs`: seeds a loaded Weather forecast state in isolated contexts, mocks air-quality for deterministic route QA, and adds Weather-only `1600x900` / `1920x1080` overflow checks.

## 8. Fix Strategy

The fix addresses the root width chain instead of hiding overflow globally:

- Add `min-width: 0` and `max-width: 100%` at Weather composition boundaries.
- Keep horizontal forecast and precipitation tracks as internal scroll content.
- Preserve keyboard focus on scroll regions.
- Do not add `body { overflow-x: hidden; }`.

## 9. Viewports Verified

Loaded Weather route after the fix:

| Viewport | html scroll/client | body scroll/client | Result |
| --- | --- | --- | --- |
| 390x844 | 390 / 390 | 390 / 390 | PASS |
| 768x1024 | 768 / 768 | 768 / 768 | PASS |
| 1440x900 | 1440 / 1440 | 1440 / 1440 | PASS |
| 1600x900 | 1600 / 1600 | 1600 / 1600 | PASS |
| 1920x1080 | 1920 / 1920 | 1920 / 1920 | PASS |

The 24-hour forecast remains horizontally scrollable inside its own `.forecast-scroll` container. This is intended carousel behavior, not page overflow.

## 10. QA Results

Final local validation:

- `npm ci --dry-run`: PASS.
- `npm run build`: PASS.
- `npm run qa:a11y:routes`: PASS, 29/29 route-viewports, 0 console errors.
- `npm run qa:a11y:routes:ci`: PASS, 29/29 route-viewports, 0 console errors.
- `npm run qa:a11y:routes:json`: PASS, JSON status `PASS`.
- `npm run qa:a11y:routes:json:file`: PASS, wrote `.qa/route-a11y-summary.json`.
- `npm run qa`: PASS.

Preview cleanup:

- Manual Stage 25 preview on port `4185` was stopped.
- QA-owned preview processes were cleaned up by the runner.

## 11. Weather Freeze Boundary

Weather remains frozen. This stage did not modify:

- Weather data normalization.
- Weather store or persistence keys.
- Weather API services.
- Weather runtime or PixiJS.
- Weather image assets or scene definitions.
- Weather i18n keys.
- Xiaomi Weather analysis.

## 12. Known Limitations

- Internal horizontal scrolling still exists for forecast-style lists by design.
- Vite large chunk warning remains an accepted non-blocking P2.
- Route QA remains smoke-level and does not replace full visual screenshot review.

## 13. Stage 26 Recommendation

Stage 26 should keep Weather frozen and focus only on confirming the remote `QA` workflow after this regression fix is pushed. Do not start Weather visual refactoring, animation expansion, PixiJS changes, asset replacement, or Xiaomi Weather material analysis.
