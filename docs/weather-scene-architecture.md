# Weather Scene Architecture

LifeBoard weather rendering is split into three layers:

1. Normalization: providers produce a normalized `WeatherSnapshot` with condition code, precipitation, cloud cover, wind, timezone, sunrise and sunset.
2. Resolution: `src/modules/weather/scenes` builds a compact `WeatherSceneContext` and resolves it to a `WeatherScenePreset`.
3. Rendering: the existing visual resolver, poster/picture fallback, vendor scene resolver and `WeatherPixiLayer.vue` remain the production rendering path for now.

The weather store does not save scene presets. It owns weather data, cache state, city selection and provider state. Scene selection is derived from a snapshot by pure functions so the store does not gain renderer coupling.

Scene config is serialized data. It may contain IDs, match rules, asset references, responsive layout, quality, accessibility, transition and fallback settings. It must not contain Pixi objects, DOM objects, Vue refs, Pinia stores, timers, abort controllers, provider raw responses or executable callbacks.

To add a scene, register existing LifeBoard assets in `weatherSceneAssets.ts`, add a preset under `scenes/presets`, include it in `weatherSceneRegistry.ts`, and cover it through `validateWeatherScenePreset` plus the LB-2A validation script. Do not add a scene unless the resources already exist or the stage explicitly authorizes new assets.

The compatibility layer lives in `scenes/adapters/legacyWeatherVisualAdapter.ts`. It maps a resolved scene to current visual-era fields for comparison without switching the renderer. The helper in `compareWeatherSceneResolution.ts` compares current visual resolution against the new scene result without logging, telemetry or behavior changes.

The current production path is still:

`WeatherSnapshot -> resolveWeatherVisual -> resolveVendorWeatherScene -> WeatherAtmosphere.vue -> picture/poster -> WeatherPixiLayer.vue`

Future migration order:

1. Keep the current production renderer and run shadow comparisons.
2. Move one existing scene to config-driven resolution.
3. Replace the compatibility adapter once scene presets drive the existing runtime directly.
4. Only then consider additional effects.

`ShaderLayer` is defined only as a disabled reserved type. Active shader support is not part of this foundation.

The prior weather research provides general architecture reference only. This implementation is a LifeBoard clean-room design with LifeBoard-owned names, assets and Web/PixiJS constraints.
