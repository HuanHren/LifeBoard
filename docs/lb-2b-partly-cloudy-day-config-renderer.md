# LB-2B Partly Cloudy Day Config Renderer

## Stage Scope

LB-2B migrates only `partly-cloudy-day` to the LB-2A config-driven scene foundation. `clear-day`, `clear-night`, `partly-cloudy-night`, rain, snow, fog, thunderstorm, haze and dust remain on the existing legacy renderer path.

`partly-cloudy-day` was selected because it already had approved desktop and mobile LifeBoard assets and an existing Pixi poster-based runtime with simple drift and ambient-light parameters.

## Pre-Migration Path

`WeatherSnapshot -> createWeatherVisualSnapshot() -> getWeatherAtmosphere() / resolveWeatherVisual() -> WeatherHero.vue -> WeatherSnapshotLayer.vue -> WeatherAtmosphere.vue -> picture/poster -> WeatherPixiLayer.vue`

The existing `partly-cloudy-day` behavior used:

- Scene key: `partly-cloudy-day`
- Desktop asset: `src/assets/weather/atmosphere/partly-cloudy-day/desktop/partly-cloudy-day-base-desktop.avif` and `.webp`
- Mobile asset: `src/assets/weather/atmosphere/partly-cloudy-day/mobile/partly-cloudy-day-base-mobile.avif` and `.webp`
- Poster source: the loaded `<picture>` base image, passed as `HTMLImageElement` into Pixi
- Pixi dynamic layers: base sprite plus generated ambient light sprite
- Drift: `x=5`, `y=-2`
- Scale: `1.008`
- Ambient opacity: `0.2`
- FPS: desktop `30`, mobile `24`
- DPR cap: desktop `1.5`, mobile `1.25`
- Ticker: one Pixi ticker callback, stopped on hidden document and destroyed on unmount
- Reduced motion: Pixi disabled and static poster retained
- Fallback: picture/poster remains visible when Pixi cannot initialize

## Post-Migration Path

`WeatherSnapshot -> WeatherSceneContext -> resolveWeatherScene() -> partly-cloudy-day WeatherScenePreset -> buildWeatherSceneRenderPlan() -> WeatherAtmosphere.vue -> WeatherPixiLayer.vue -> existing Pixi runtime`

`WeatherAtmosphere.vue` derives scene context from the snapshot weather, solar phase, viewport, render quality and reduced-motion media query. It does not write scene state into the store.

## Single-Scene Routing Boundary

The production gate is `shouldUseConfigDrivenRenderer(scene)`. It returns true only when:

- `scene.preset.id === 'partly-cloudy-day'`
- selected quality is not `static`
- reduced motion is not active

`buildWeatherSceneRenderPlan()` then requires preset validation, resolved poster/fallback assets, and supported layer kinds. Failure returns an explicit issue and the UI falls back to existing poster/legacy behavior.

## Config-Driven Renderer Responsibilities

The renderer boundary consumes serialized scene config and resolved assets, then builds a small Pixi plan:

- `cloud` layer -> existing base sprite drift, scale and movement
- `light` layer -> existing ambient sprite opacity
- asset registry -> desktop/mobile poster source
- quality -> max FPS and performance tier

It does not store Pixi instances in the preset, resolver, store or provider.

## Responsive Assets

Desktop and mobile sources are resolved through `WEATHER_SCENE_ASSETS`, which delegates to the existing LifeBoard atmosphere assets. The mobile source remains the independent mobile file, not a crop of the desktop asset.

## Lifecycle

`WeatherPixiLayer.vue` still owns Pixi lifecycle:

- `Application.init()`
- resize through `ResizeObserver`
- pause/resume through `visibilitychange`
- WebGL context loss fallback
- ticker callback registration/removal
- async init generation checks
- idempotent destroy

LB-2B adds only an optional `scenePlan` prop so the same runtime can consume config-driven parameters.

## Reduced Motion And Fallback

When `prefers-reduced-motion: reduce` is active, scene context quality becomes `static`, `resolveWeatherScene()` resolves to the static fallback, and Pixi remains disabled. The poster/picture layer remains visible.

Fallback coverage:

- Preset validation failure -> poster/legacy fallback
- Missing asset -> poster/legacy fallback
- Unsupported layer -> poster/legacy fallback
- Pixi dynamic import/init failure -> existing `WeatherPixiLayer` static fallback
- WebGL context loss -> existing `WeatherPixiLayer` static fallback
- Save Data -> low quality or existing static fallback inside Pixi capability checks

## Visual Verification

Required browser viewports:

- Desktop: `1896 x 829`
- Mobile: `390 x 844`

The acceptable differences are limited to animation phase, position within the existing drift path and subpixel rendering. Asset changes, composition changes, wrong mobile assets, poster flicker, blank backgrounds and obvious opacity/brightness changes are not acceptable.

## Performance Verification

The config-driven path reuses the existing single `WeatherPixiLayer.vue` runtime. There is still one `new pixi.Application()` call path, one `app.ticker.add(onTick)` registration, one `ResizeObserver`, one visibility listener per mounted layer, and texture creation from the already-loaded poster image.

## Accessibility

The atmosphere remains `aria-hidden="true"`. The Pixi canvas remains decorative with `aria-hidden="true"`, `role="presentation"` and `tabindex="-1"`. No new user-facing controls, focus targets or ARIA output were added.

## Validation Evidence

Baseline:

- Branch: `main`
- Starting HEAD: `6ca5e5196cb59f5dc6df2bf2f449407c9646f154`
- Remote relation: `main...origin/main [ahead 1]`
- Baseline `npm run build`: PASS
- Existing warning: `dist/assets/lib--k1V9ieH.js 513.51 kB`

Final results:

- `npm run build`: PASS. Existing warning remains `dist/assets/lib-DHvb2koH.js 513.51 kB`.
- `node scripts/lb-2a-validate-weather-scenes.mjs`: PASS.
- `node scripts/lb-2b-validate-partly-cloudy-day-config-renderer.mjs`: PASS.
- Browser preview URL: `http://127.0.0.1:5295/weather`.
- Desktop verification: `1896 x 829`, `partly-cloudy-day`, `data-weather-asset-origin="config-driven"`, `data-weather-scene-key="partly-cloudy-day"`, one Pixi canvas, `layerCount=2`, `loadedLayerCount=2`, desktop AVIF source.
- Mobile verification: `390 x 844`, `partly-cloudy-day`, `data-weather-asset-origin="config-driven"`, one Pixi canvas, `maxFps=24`, `performanceTier=low`, mobile AVIF source.
- Reduced motion verification: `390 x 844`, no canvas, `data-weather-asset-origin="fallback"`, `data-weather-pixi-status="static-fallback"`.
- Legacy verification: `clear-day` and `partly-cloudy-night` stayed on `authorized-vendor` legacy routing, not `config-driven`.
- Screenshot output was kept outside the repo under `%TEMP%\lifeboard-lb2b-browser\` and is not intended for commit.
- Headless Chromium emitted GPU `ReadPixels` performance diagnostics during WebGL capture; these were browser diagnostics, not application console errors.

## Known Limitations

- No other scene is migrated in LB-2B.
- Supported config layer kinds are limited to `cloud` and `light`.
- Particle, shader, post-processing and complex vendor layers remain unsupported in this renderer.
- `partly-cloudy-night` remains legacy and is the recommended next candidate only after LB-2B verification is stable.

## Legacy Removal Conditions

Do not remove the legacy path until desktop visual comparison, mobile visual comparison, reduced-motion behavior, lifecycle checks, repeated navigation checks and a dedicated cleanup stage have all passed.
