# LB-2E Clear Day Migration Suitability

## Stage Scope

LB-2E evaluates whether `clear-day` is suitable as the next single-scene config-driven renderer migration target. It does not migrate `clear-day`, change renderer routing, change scene presets, change assets, change CSS, change provider/store/cache behavior, or add runtime capabilities.

Decision: `NOT_SUITABLE_YET`.

Stage result: `PASS`.

## Skill Gate

Read and applied:

| Skill | Path | Use |
| --- | --- | --- |
| vue-best-practices | `C:\Users\jingr\codex-skills\vue-best-practices\SKILL.md` | Vue architecture and SFC/data-flow constraints while auditing component boundaries. |
| vue reactivity reference | `C:\Users\jingr\codex-skills\vue-best-practices\references\reactivity.md` | Confirmed scene state remains derived and local, not store-owned. |
| vue SFC reference | `C:\Users\jingr\codex-skills\vue-best-practices\references\sfc.md` | Confirmed no production SFC edits are required for this audit. |
| vue data flow reference | `C:\Users\jingr\codex-skills\vue-best-practices\references\component-data-flow.md` | Confirmed `WeatherSnapshotLayer.vue` remains props-down only. |
| vue composables reference | `C:\Users\jingr\codex-skills\vue-best-practices\references\composables.md` | Confirmed no new composable is justified in this audit-only stage. |
| fixing-motion-performance | `C:\Users\jingr\codex-skills\fixing-motion-performance\SKILL.md` | Assessed continuous ticker motion, particles, and CSS glow motion risk. |
| fixing-accessibility | `C:\Users\jingr\codex-skills\fixing-accessibility\SKILL.md` | Confirmed atmosphere and Pixi canvas remain decorative. |
| audit | `C:\Users\jingr\codex-skills\audit\SKILL.md` | Used as the technical audit frame; `PRODUCT.md` and `DESIGN.md` were read. |
| harden | `C:\Users\jingr\codex-skills\harden\SKILL.md` | Used for fallback, lifecycle, and edge-case checks. |
| playwright-cli | `C:\Users\jingr\codex-skills\playwright-cli\SKILL.md` | `playwright-cli` was unavailable; existing Playwright 1.61.1 runtime was reused without installing dependencies. |

## Branch And Baseline

Preflight:

- Repository root: `D:/LifeBoard`
- Branch: `main`
- HEAD: `9d1c7ca8322c5afb778f098402d4eb5ea0cdcc2f`
- Remote relation: `main...origin/main [ahead 4]`
- Worktree before LB-2E edits: clean
- Required commits present in recent history: `9d1c7ca`, `78538ff`, `e2835b5`, `6ca5e51`

No reset, clean, restore, checkout, rebase, push, dependency install, provider edit, store edit, cache edit, asset edit, renderer edit, or runtime capability edit was performed.

## Build And Regression Baseline

Baseline commands:

- `npm run build`: PASS
- `node scripts/lb-2a-validate-weather-scenes.mjs`: PASS
- `node scripts/lb-2b-validate-partly-cloudy-day-config-renderer.mjs`: PASS
- `node scripts/lb-2c-validate-partly-cloudy-night-config-renderer.mjs`: PASS
- `node scripts/lb-2d-validate-weather-scene-runtime-stability.mjs`: PASS

No `typecheck`, `lint`, `test`, or `test:unit` package scripts exist. The existing Vite large chunk warning remains for the Pixi `lib` chunk at about `513.51 kB` minified.

## Existing Clear Day Path

Current production chain:

`NormalizedWeatherSnapshot -> createWeatherVisualSnapshot() -> getWeatherAtmosphere() / resolveWeatherVisual() -> resolveVendorWeatherScene() -> WeatherAtmosphere.vue -> CSS fallback + optional vendor Pixi reference scene -> WeatherPixiLayer.vue`

Evidence:

- Scene atmosphere key: `clear-day`, from `getWeatherAtmosphere()` when WMO condition maps to `clear` and `current.isDay === true`.
- Weather condition mapping: WMO `0` maps to `LifeBoardCondition` `clear`.
- `resolveWeatherVisual()` does not register a clear-day visual definition. It returns `hasRegisteredVisual: false`, `motionPreset: 'fallback-calm'`, `fallbackReason: 'unregistered-visual'`, and no desktop/mobile visual assets.
- `WeatherAtmosphere.vue` therefore does not render the local clear-day `<picture>` base image for the normal visual path because `resolvedBase` returns `null` when `props.visual.hasRegisteredVisual` is false.
- `resolveVendorWeatherScene()` normalizes non-night timelines to `day` and resolves WMO `0` to vendor key `clear-day`.
- The browser baseline confirms `data-weather-asset-origin="authorized-vendor"`, `data-weather-scene-key="clear-day"`, `data-weather-scene-family="clear"`, and one Pixi canvas when motion is allowed.

The current checked-in `clearDayScenePreset` is a static typed foundation preset, not an enabled config-driven renderer plan. It has no layers and uses `staticSceneQuality`.

## Desktop Asset Readiness

Readiness: `PARTIAL`.

Local LifeBoard desktop files exist and are statically discovered by Vite:

- `src/assets/weather/atmosphere/clear-day/desktop/clear-day-base-desktop.avif`
- `src/assets/weather/atmosphere/clear-day/desktop/clear-day-base-desktop.webp`

The build output includes both desktop formats. However, the current production clear-day path does not use these local files as the visible base poster when `props.visual` is present but unregistered. The active legacy dynamic scene uses vendor assets from `public/weather-assets/vendor/xiaomi/manifest.json`, including:

- `/weather-assets/vendor/xiaomi/sky/skybox-front.png`
- `/weather-assets/vendor/xiaomi/lights/sun-light.webp`
- `/weather-assets/vendor/xiaomi/sun/sun-particle-a.png`

The current fallback is the CSS class `weather-atmosphere--clear-day`, not a local poster image.

## Mobile Asset Readiness

Readiness: `PARTIAL`.

Local LifeBoard mobile files exist and are statically discovered by Vite:

- `src/assets/weather/atmosphere/clear-day/mobile/clear-day-base-mobile.avif`
- `src/assets/weather/atmosphere/clear-day/mobile/clear-day-base-mobile.webp`

The build output includes both mobile formats. They appear to be independent files, not runtime crops of desktop files. However, browser baseline shows the current production clear-day path has `imgCurrentSrc: null` on both desktop and mobile because clear-day is not registered in the visual asset manifest. The active mobile legacy scene is the same vendor `clear-day` reference scene with mobile performance tier and `maxFps=24`, not a separate mobile-specific local poster.

Because the current equivalent production path does not actually use the local independent mobile asset, clear-day cannot be rated `SUITABLE`.

## Legacy Layer Model

Current browser-verified legacy layer count: `3`.

Vendor `clear-day` layers:

| Order | Type | Role | Asset | Opacity | Scale | Position | Speed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `sprite` | `open-day-sky` | `skybox-front.png` | `0.9` | `1.08` | `x=0.08` | `x=0.001`, `y=0` |
| 2 | `sprite` | `sun-disc-halo` | `sun-light.webp` | `0.34` | `1.05` | `x=0.2`, `y=-0.1` | `x=0.001`, `y=-0.001` |
| 3 | `particle` | `sun-air-sparkle` | `sun-particle-a.png` | `0.16` | `0.7`, `particleScale=0.28` | seeded | `x=0.001`, `y=-0.001` |

For WMO `1`, vendor key `mostly-clear-day` is separate and has four layers, including a small far cloud and particles. That is not the WMO `0` clear-day baseline, but it shows that the clear family is not a single poster-only shape.

## Motion Parameters

Current clear-day motion is not the same as partly-cloudy day/night:

- Vendor local/reference sprite layers drift through `WeatherPixiLayer.vue` using `speedX` and `speedY` scaled by viewport width/height in the ticker.
- Particle sprites are seeded, wrapped around the viewport, and advanced each tick.
- `getSceneOptions()` for reference scenes derives drift, scale, ambient opacity, FPS, and performance tier from the current viewport and intensity preset.
- Desktop baseline: `maxFps=30`, `performanceTier=high`.
- Mobile baseline: `maxFps=24`, `performanceTier=low`.
- CSS fallback class `weather-atmosphere--motion-fallback-calm` has no dedicated animation rule, while `weather-atmosphere--clear-day` sets static sky/detail variables.
- Reduced motion disables Pixi entirely and leaves CSS fallback only.

## Solar Period And Resolver Boundary

Current atmosphere and scene resolution are not based on one identical condition:

- `getWeatherAtmosphere()` uses `current.isDay` directly for clear: `clear-day` when true, `clear-night` when false, `neutral` when unknown.
- `resolveWeatherVisual()` computes `timeline` from `current.time`, `daily[0].sunrise`, `daily[0].sunset`, and then `isDay` fallback.
- Vendor resolver normalizes every non-night timeline to `day`, so `sunrise` and `sunset` resolve to vendor `clear-day`.
- Typed scene preset `clearDayScenePreset` uses solar periods `day`, `late-day`, and `golden-hour`; `clearNightScenePreset` uses `night`, `pre-dawn`, and `dusk`.
- Current `WeatherTimeline` values are `sunrise`, `day`, `sunset`, and `night`, while `WeatherSolarPhase` values include `day`, `late-day`, `golden-hour`, `night`, `pre-dawn`, and `dusk`.

Migration should consume only an already resolved `scene.id`, but direct equivalence would still need the renderer to preserve current behavior across `isDay`, timeline normalization, and vendor key resolution. Copying those weather business rules into renderer routing would be a boundary violation.

## Runtime Capability Comparison

| clear-day requirement | Existing runtime support | Result | Classification |
| --- | --- | --- | --- |
| Base sprite | Existing Pixi reference path supports sprite; config render plan does not for clear-day | GAP | `UNSUPPORTED` |
| Ambient sprite | Existing partly-cloudy plan supports generated ambient light only for partly-cloudy visual keys | GAP | `SMALL_GENERIC_EXTENSION` if generalized |
| Cloud layer | Layer type exists in scene schema and partly-cloudy plan | MATCH for schema, GAP for clear-day plan | `ALREADY_SUPPORTED` for schema |
| Light layer | Layer type exists in scene schema | MATCH for schema, GAP for sun-disc equivalence | `SMALL_GENERIC_EXTENSION` |
| Overlay layer | Schema has overlay; current plan rejects it | GAP | `UNSUPPORTED` |
| Continuous drift | Supported in partly-cloudy plan and reference scene ticker | MATCH | `ALREADY_SUPPORTED` |
| Scale pulse | Not used by current clear-day baseline | MATCH | `ALREADY_SUPPORTED` |
| Opacity pulse | Particle/reference alpha wave exists for local layers; not expressible by config plan | GAP | `UNSUPPORTED` |
| Responsive asset | Local clear-day assets exist but are not current production source | GAP | `SMALL_GENERIC_EXTENSION` |
| Responsive layout | Existing picture/runtime viewport profile exists | MATCH | `ALREADY_SUPPORTED` |
| Static fallback | CSS fallback exists | MATCH | `ALREADY_SUPPORTED` |
| Reduced motion | Pixi disabled, no canvas | MATCH | `ALREADY_SUPPORTED` |
| Scene replacement | LB-2D runtime handles replacement | MATCH | `ALREADY_SUPPORTED` |
| Error fallback | Pixi errors fall back to static poster/CSS status | MATCH | `ALREADY_SUPPORTED` |

## Layer Applicability

Allowed target union for this assessment: `sprite`, `cloud`, `light`, `overlay`. Disallowed: `particle`, `shader`.

| Capability | Current use | Assessment |
| --- | --- | --- |
| Strong sun glow | Vendor `sun-disc-halo` sprite is part of current clear-day equivalence | `REQUIRED_FOR_EQUIVALENCE` |
| Multi-layer radial gradient | CSS ambient/highlight gradients exist as fallback, but current dynamic equivalence is vendor sprite based | `OPTIONAL_DECORATION` |
| blend mode | Vendor uses `blendMode: normal` only | `NOT_CURRENTLY_USED` |
| blur filter | Not used | `NOT_CURRENTLY_USED` |
| mask | Not used | `NOT_CURRENTLY_USED` |
| color matrix | Not used | `NOT_CURRENTLY_USED` |
| additive blending | Not used | `NOT_CURRENTLY_USED` |
| animated light pulse | Current dynamic sun layer drifts; CSS clear glow is not active for current `fallback-calm` visual | `OPTIONAL_DECORATION` |
| texture tiling | Not used | `NOT_CURRENTLY_USED` |
| parallax | Vendor layers use different speeds/positions | `REQUIRED_FOR_EQUIVALENCE` |
| viewport-relative sun position | Vendor sun layer uses `positionX=0.2`, `positionY=-0.1` and cover fitting | `REQUIRED_FOR_EQUIVALENCE` |
| CSS and Pixi mixed linkage | CSS fallback plus vendor Pixi coexist | `REQUIRED_FOR_EQUIVALENCE` |
| particle | Vendor sparkle layer is loaded and animated | `REQUIRED_FOR_EQUIVALENCE` |

Because a current required layer is `particle`, the migration is blocked under this stage's rules.

## Fallback Readiness

Fallback is reliable but not poster-equivalent:

- Motion-allowed fallback if vendor manifest or WebGL fails: CSS `weather-atmosphere--clear-day`.
- Reduced motion: no Pixi canvas; CSS fallback only.
- Image base fallback: `imgCurrentSrc` is `null` in browser baseline because no registered clear-day visual asset is used.
- Config scene fallback references `clear-day-poster`, but that path is not currently used by production clear-day rendering.

## Visual Equivalence Feasibility

| Item | Feasibility |
| --- | --- |
| Same desktop asset | `BROWSER_VERIFIABLE`, but current equivalent is vendor assets, not local poster |
| Same mobile asset | `BROWSER_VERIFIABLE`, but current equivalent is vendor assets, not local poster |
| Same poster | `NOT_VERIFIABLE` for current path because no `<picture>` base image is active |
| Same layer count | `AUTOMATICALLY_VERIFIABLE` through DOM/debug metrics |
| Same opacity | `MANUAL_ONLY` unless vendor layer config is parsed in a custom validator |
| Same scale | `MANUAL_ONLY` unless vendor layer config is parsed in a custom validator |
| Same drift | `MANUAL_ONLY` for visual phase; parameters are statically inspectable |
| Same FPS | `AUTOMATICALLY_VERIFIABLE` through Pixi data attributes |
| Same z-order | `MANUAL_ONLY`; vendor scene add order is inspectable but not exposed per layer |
| Same reduced-motion | `BROWSER_VERIFIABLE` |
| Same fallback | `BROWSER_VERIFIABLE` |
| Same DOM/CSS | `AUTOMATICALLY_VERIFIABLE` through static guards plus browser DOM |
| Same lifecycle | `AUTOMATICALLY_VERIFIABLE` through LB-2D debug counters |

No key behavior is impossible to observe, but equivalence would require validating vendor particle/sprite layers that the config-driven runtime is not allowed to express in this stage.

## Browser Baseline

Preview URL: `http://127.0.0.1:5302/weather`.

The natural page had no selected city, so no weather scene rendered. For the clear-day baseline, a fresh browser-local forecast cache was seeded with WMO `0`, `isDay=true`, current time `2026-07-01T12:00:00+08:00`, sunrise `2026-07-01T04:49:00+08:00`, and sunset `2026-07-01T19:47:00+08:00`. Provider network responses were not intercepted or modified.

Desktop `1896 x 829`:

- Route: `/weather`
- Renderer: legacy authorized vendor reference scene
- Atmosphere: `clear-day`
- Scene key / sceneKey: `clear-day`
- Asset origin: `authorized-vendor`
- Base image: none, `imgCurrentSrc=null`
- Canvas count: `1`
- FPS: `30`
- Layer count: `3`
- Loaded layer count: `3`
- Runtime debug: one app, one canvas, one scene, one ticker, one resize observer, one visibility listener, three media query listeners
- Overflow: horizontal false, vertical true
- Console errors: none
- Screenshot: `%TEMP%\lifeboard-lb2e-browser\desktop-clear-day.png`

Mobile `390 x 844`:

- Route: `/weather`
- Renderer: legacy authorized vendor reference scene
- Atmosphere: `clear-day`
- Scene key / sceneKey: `clear-day`
- Asset origin: `authorized-vendor`
- Base image: none, `imgCurrentSrc=null`
- Canvas count: `1`
- FPS: `24`
- Layer count: `3`
- Loaded layer count: `3`
- Performance tier: `low`
- Overflow: horizontal false, vertical true
- Console errors: none
- Screenshot: `%TEMP%\lifeboard-lb2e-browser\mobile-clear-day.png`

Reduced motion `390 x 844`:

- Route: `/weather`
- Renderer: static CSS fallback
- Atmosphere: `clear-day`
- Scene key: `fallback`
- Asset origin: `fallback`
- Canvas count: `0`
- Layer count: `0`
- Pixi status: `idle`
- Base image: none, `imgCurrentSrc=null`
- Overflow: horizontal false, vertical true
- Console errors: none
- Screenshot: `%TEMP%\lifeboard-lb2e-browser\reduced-motion-clear-day.png`

## Runtime Risk

Risk: `HIGH`.

Evidence:

1. New layer kind in config plan: required if equivalence keeps current particle sparkle; `particle` is defined in schema but forbidden for this stage and rejected by the current partly-cloudy plan.
2. New ticker behavior: required for seeded particle wrapping and per-layer sprite drift if not using the existing reference path.
3. Filter: not required.
4. Blend mode: not required beyond `normal`.
5. Texture ownership: likely needs expansion from borrowed poster plus generated ambient texture to multiple vendor/static textures or registered sprite assets.
6. Responsive swap: unclear because current dynamic vendor path has no local desktop/mobile base image; local clear-day poster would be a behavior change.
7. Async init: existing lifecycle can handle one runtime, but additional asset loads increase race surface.
8. Scene replacement: existing LB-2D ownership is stable, but new plan types would broaden watcher and plan invalidation cases.
9. Fallback: reliable CSS fallback exists, but current poster fallback is absent.
10. `WeatherPixiLayer.vue`: would need clear-day-specific branching or a more generic reference-layer config plan.
11. `WeatherAtmosphere.vue`: would need clear-day visual registration or plan routing changes to use local assets.
12. Existing day/night scenes: risk is high if particle/reference support is added inside the narrow partly-cloudy renderer without a separate generic design.

## Migration Value

Value: `MEDIUM`.

Reasons:

- Clear sky is likely common and is a core weather-page display family.
- It would exercise a second weather family beyond partly-cloudy.
- It could reduce one legacy special case and improve configuration coverage.
- It could prepare the ground for future clear-night only if clear family boundaries are designed generically.

The value is not `HIGH` for this immediate next stage because current equivalence depends on authorized-vendor particle/sprite behavior and the local clear-day assets are not the production visual source today. Migrating now would spend runtime complexity before the target visual contract is stable.

## Prerequisites

None are listed because the decision is `NOT_SUITABLE_YET`.

If product value later justifies reopening clear-day, the blocking gap should be addressed as a separate design decision: either accept a local-poster-only visual baseline that intentionally drops vendor particles, or define a generic non-particle clear-light layer model. That decision must happen before migration and must not be hidden inside LB-2F.

## Final Decision

`NOT_SUITABLE_YET`.

Reasons:

- Current clear-day equivalence requires a vendor `particle` layer.
- Current config-driven production renderer only accepts partly-cloudy day/night and requires one `cloud` plus one `light` layer.
- Current clear-day local desktop/mobile assets are present but not used by the production clear-day visual path.
- No active poster image exists in the browser baseline for current clear-day.
- Direct migration would either drop visible legacy behavior or add clear-day-specific/runtime-expanding logic.
- Runtime risk is `HIGH`, while migration value is `MEDIUM`.

## Production Code Confirmation

`clear-day` remains Legacy:

- `weatherSceneCapabilities.ts` still enables only `partly-cloudy-day` and `partly-cloudy-night`.
- `buildWeatherSceneRenderPlan()` still rejects any non-partly-cloudy scene.
- `WeatherAtmosphere.vue` still routes legacy non-config scenes through vendor/local reference logic.
- No production renderer, runtime, scene registry, scene preset, asset registry, CSS, provider, store, cache, city, location, or asset file was changed for LB-2E.

## Validation

Required validation after LB-2E document/script creation:

- `npm run build`
- `node scripts/lb-2a-validate-weather-scenes.mjs`
- `node scripts/lb-2b-validate-partly-cloudy-day-config-renderer.mjs`
- `node scripts/lb-2c-validate-partly-cloudy-night-config-renderer.mjs`
- `node scripts/lb-2d-validate-weather-scene-runtime-stability.mjs`
- `node scripts/lb-2e-validate-clear-day-suitability.mjs`
- `git diff --check`

No extra package scripts exist for typecheck, lint, or tests.

## Files Changed

- `docs/lb-2e-clear-day-migration-suitability.md`
- `docs/weather-scene-architecture.md`
- `scripts/lb-2e-validate-clear-day-suitability.mjs`

## Recommended Next Step

Keep clear-day on Legacy and address the specific blocking gap only if product value justifies it.
