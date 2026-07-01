# LB-2C Partly Cloudy Night Config Renderer

## Stage Scope

LB-2C migrates only `partly-cloudy-night` onto the LB-2B config-driven renderer path. `clear-day`, `clear-night`, rain, snow, fog, thunderstorm, haze and dust remain on the existing legacy renderer path.

The night scene uses existing LifeBoard-owned desktop and mobile poster assets and the existing Pixi poster-based runtime. No assets, provider APIs, store state, cache keys, DOM structure, CSS files or dependencies are changed in this stage.

## Pre-Migration Path

`WeatherSnapshot -> createWeatherVisualSnapshot() -> getWeatherAtmosphere() / resolveWeatherVisual() -> WeatherHero.vue -> WeatherSnapshotLayer.vue -> WeatherAtmosphere.vue -> picture/poster -> WeatherPixiLayer.vue`

The existing `partly-cloudy-night` runtime parameters were retained:

- Scene key: `partly-cloudy-night`
- Desktop asset: `src/assets/weather/atmosphere/partly-cloudy-night/desktop/partly-cloudy-night-base-desktop.avif` and `.webp`
- Mobile asset: `src/assets/weather/atmosphere/partly-cloudy-night/mobile/partly-cloudy-night-base-mobile.avif` and `.webp`
- Pixi dynamic layers: base sprite plus generated ambient light sprite
- Drift: `x=3`, `y=-1.5`
- Scale: `1.006`
- Ambient opacity: `0.16`
- FPS: desktop `30`, mobile `24`
- Reduced motion: Pixi disabled and the static night poster retained

## Post-Migration Path

`WeatherSnapshot -> WeatherSceneContext -> resolveWeatherScene() -> partly-cloudy-night WeatherScenePreset -> buildWeatherSceneRenderPlan() -> WeatherAtmosphere.vue -> WeatherPixiLayer.vue -> existing Pixi runtime`

`WeatherSnapshotLayer.vue` continues to pass snapshot-derived props only. It does not import scene presets, registry helpers or Pixi runtime details.

## Routing Boundary

The production gate is `shouldUseConfigDrivenRenderer(scene)`. It returns true only when:

- `scene.preset.id === 'partly-cloudy-day'` and the resolved timeline is not `night`, or `scene.preset.id === 'partly-cloudy-night'` and the resolved timeline is `night`
- selected quality is not `static`
- reduced motion is not active

The check uses explicit scene IDs, not prefix matching, so clear, rain, snow, fog, thunderstorm, haze and dust scenes cannot enter the config-driven path by name similarity.

## Config-Driven Renderer Responsibilities

The same `buildWeatherSceneRenderPlan()` code now supports both partly cloudy presets:

- `cloud` layer -> existing base sprite drift, scale and movement
- `light` layer -> existing ambient sprite opacity
- asset registry -> desktop/mobile poster source
- quality -> max FPS and performance tier
- scene id -> existing Pixi visual key

Unsupported layer kinds still produce an explicit fallback issue. Particle and shader layers remain out of scope.

## Reduced Motion And Fallback

When `prefers-reduced-motion: reduce` is active, scene context quality becomes `static`, Pixi remains disabled, and `partly-cloudy-night` uses the registered static night poster. This keeps the night scene from falling back to a blank CSS-only background when motion is intentionally disabled.

Fallback coverage remains:

- Preset validation failure -> poster/legacy fallback
- Missing asset -> poster/legacy fallback
- Unsupported layer -> poster/legacy fallback
- Pixi dynamic import/init failure -> existing `WeatherPixiLayer` static fallback
- WebGL context loss -> existing `WeatherPixiLayer` static fallback
- Save Data -> low quality or existing static fallback inside Pixi capability checks

## Validation Evidence

Baseline:

- Branch: `main`
- Starting HEAD: `e2835b5b09946c361c701e5c801be12a93273a46`
- Remote relation: `main...origin/main [ahead 2]`
- Baseline `npm run build`: PASS
- Baseline `node scripts/lb-2a-validate-weather-scenes.mjs`: PASS
- Baseline `node scripts/lb-2b-validate-partly-cloudy-day-config-renderer.mjs`: PASS

Final results:

- `npm run build`: PASS. Existing warning remains the large Pixi async chunk, now `dist/assets/lib-t6P7_HKg.js 513.51 kB`.
- `node scripts/lb-2a-validate-weather-scenes.mjs`: PASS.
- `node scripts/lb-2b-validate-partly-cloudy-day-config-renderer.mjs`: PASS.
- `node scripts/lb-2c-validate-partly-cloudy-night-config-renderer.mjs`: PASS.
- Browser preview URL: `http://127.0.0.1:5296/weather`.
- Night desktop verification: `1896 x 829`, `partly-cloudy-night`, `data-weather-asset-origin="config-driven"`, `data-weather-scene-key="partly-cloudy-night"`, one Pixi canvas, `layerCount=2`, `loadedLayerCount=2`, `maxFps=30`, `performanceTier=high`, desktop AVIF source, no vendor/reference requests.
- Night mobile verification: `390 x 844`, `partly-cloudy-night`, `data-weather-asset-origin="config-driven"`, one Pixi canvas, `maxFps=24`, `performanceTier=low`, mobile AVIF source.
- Night reduced-motion verification: `390 x 844`, no canvas, `data-weather-asset-origin="fallback"`, `data-weather-pixi-status="static-fallback"`, static mobile night poster retained.
- Day regression verification: `1896 x 829`, `partly-cloudy-day`, `data-weather-asset-origin="config-driven"`, one Pixi canvas, `layerCount=2`, `loadedLayerCount=2`, desktop day AVIF source.
- Legacy verification: `clear-day` and rain stayed out of config-driven routing. The browser attempted the existing vendor manifest for legacy scenes, then remained on fallback when the test blocked that request.
- Screenshot output was kept outside the repo under `%TEMP%\lifeboard-lb2c-browser\` and is not intended for commit.
- The app did not expose a natural in-page day-to-night provider transition without modifying provider/cache/store behavior, so browser coverage used independent seeded sessions. Runtime replacement safety is covered by the existing single `WeatherPixiLayer.vue` watcher/destroy path and static validators.

## Known Limitations

- No other scene is migrated in LB-2C.
- Supported config layer kinds are limited to `cloud` and `light`.
- Particle, shader, post-processing and complex vendor layers remain unsupported in this renderer.
- Browser verification can validate independent day and night sessions. A true in-page day-to-night provider transition is only recorded when it can be triggered without modifying provider, cache or store behavior.

## Legacy Removal Conditions

Do not remove the legacy path until desktop visual comparison, mobile visual comparison, reduced-motion behavior, lifecycle checks, repeated navigation checks and a dedicated cleanup stage have all passed for the migrated scenes.
