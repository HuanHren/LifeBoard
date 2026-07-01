# LB-2A Weather Scene Schema Integration

## Before

The production chain was:

`WeatherSnapshot -> resolveWeatherVisual -> resolveVendorWeatherScene -> WeatherAtmosphere.vue -> poster/picture -> WeatherPixiLayer.vue`

`WeatherStore` owned normalized weather data and cache state. Scene-like behavior lived in visual helpers, vendor scene resolution and the Pixi component.

## After

LB-2A adds a parallel foundation:

`WeatherSnapshot + viewport + preferences -> WeatherSceneContext -> resolveWeatherScene -> WeatherScenePreset -> legacy adapter/shadow comparison`

The production chain is not switched.

## File Responsibilities

- `weatherSceneTypes.ts`: serialized scene config and runtime context types.
- `buildWeatherSceneContext.ts`: builds compact context from normalized weather plus caller-supplied solar phase, viewport, quality and motion preference.
- `weatherSceneAssets.ts`: central asset ID registry for current LifeBoard assets.
- `presets/*`: minimal real scene presets for clear and partly cloudy day/night plus static fallback.
- `weatherSceneRegistry.ts`: static preset registry.
- `resolveWeatherScene.ts`: pure scene resolver.
- `validateWeatherScene.ts`: lightweight authoring/runtime validation.
- `legacyWeatherVisualAdapter.ts`: compatibility mapping to current visual-era fields.
- `compareWeatherSceneResolution.ts`: shadow comparison helper for tests/development audits.
- `scripts/lb-2a-validate-weather-scenes.mjs`: no-dependency validation script.

## Compatibility Strategy

The new scene resolver is shadow infrastructure. It does not load resources, create Pixi objects, touch the DOM, read the store, access the network or replace current visual resolution.

## No Visual Change Proof

- `WeatherAtmosphere.vue` is unchanged.
- `WeatherPixiLayer.vue` is unchanged.
- `WeatherHero.vue` and the transition composable are unchanged.
- CSS and animation timing are unchanged.
- Asset files are unchanged.
- Store state shape is unchanged.

## Test Results

Baseline `npm run build` passed before implementation with the existing Vite large-chunk warning. Final validation should run:

- `npm run build`
- `node scripts/lb-2a-validate-weather-scenes.mjs`
- `git diff --check`

## Follow-up Plan

LB-2B should migrate one existing scene to a config-driven renderer path while preserving the current visual output.
