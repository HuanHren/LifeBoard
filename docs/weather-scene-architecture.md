# Weather Scene Architecture

LifeBoard weather rendering is split into three layers:

1. Normalization: providers produce a normalized `WeatherSnapshot` with condition code, precipitation, cloud cover, wind, timezone, sunrise and sunset.
2. Resolution: `src/modules/weather/scenes` builds a compact `WeatherSceneContext` and resolves it to a `WeatherScenePreset`.
3. Rendering: `partly-cloudy-day` now has a narrow config-driven renderer path that turns a validated `WeatherScenePreset` into the existing Pixi runtime. All other scenes continue through the existing visual resolver, poster/picture fallback, vendor scene resolver and `WeatherPixiLayer.vue` legacy path.

The weather store does not save scene presets. It owns weather data, cache state, city selection and provider state. Scene selection is derived from a snapshot by pure functions so the store does not gain renderer coupling.

Scene config is serialized data. It may contain IDs, match rules, asset references, responsive layout, quality, accessibility, transition and fallback settings. It must not contain Pixi objects, DOM objects, Vue refs, Pinia stores, timers, abort controllers, provider raw responses or executable callbacks.

To add a scene, register existing LifeBoard assets in `weatherSceneAssets.ts`, add a preset under `scenes/presets`, include it in `weatherSceneRegistry.ts`, and cover it through `validateWeatherScenePreset` plus the LB-2A validation script. Do not add a scene unless the resources already exist or the stage explicitly authorizes new assets.

The compatibility layer lives in `scenes/adapters/legacyWeatherVisualAdapter.ts`. It maps a resolved scene to current visual-era fields for comparison without switching the renderer. The helper in `compareWeatherSceneResolution.ts` compares current visual resolution against the new scene result without logging, telemetry or behavior changes.

The current production path is still:

`WeatherSnapshot -> resolveWeatherVisual -> resolveVendorWeatherScene -> WeatherAtmosphere.vue -> picture/poster -> WeatherPixiLayer.vue`

Current production routing:

1. Build the normal `WeatherVisualSnapshot`.
2. In `WeatherAtmosphere.vue`, derive `WeatherSceneContext` from the snapshot weather, solar phase, viewport, render quality and reduced-motion preference.
3. Resolve the scene through `resolveWeatherScene()`.
4. Use `buildWeatherSceneRenderPlan()` only when the resolved scene id is `partly-cloudy-day`, validation passes, required assets resolve, quality is not `static`, and reduced motion is not active.
5. Pass the resulting plan to the existing `WeatherPixiLayer.vue`; otherwise keep the legacy renderer and static poster fallback.

The LB-2B config-driven renderer supports only the layer kinds used by `partly-cloudy-day`: `cloud` for the existing base drift parameters and `light` for the existing ambient overlay opacity. Unsupported layer kinds produce an explicit fallback issue instead of silent visual corruption.

Future migration order:

1. Keep `partly-cloudy-day` on the config-driven renderer and all other scenes on legacy.
2. Verify desktop, mobile, reduced-motion, lifecycle and repeated navigation behavior.
3. Move at most one compatible next scene after LB-2B has proven stable.
4. Replace the compatibility adapter only after config presets drive all intended existing runtime behavior.
5. Only then consider additional effects.

`ShaderLayer` is defined only as a disabled reserved type. Active shader support is not part of this foundation.

The prior weather research provides general architecture reference only. This implementation is a LifeBoard clean-room design with LifeBoard-owned names, assets and Web/PixiJS constraints.
