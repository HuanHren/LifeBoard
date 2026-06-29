# Stage 32A.2 Renderer Architecture

## Runtime Priority

Current runtime priority is:

```text
authorized-vendor
-> fallback
```

LifeBoard original weather files remain in the repository as archival and future replacement assets. They are not selected by the Stage 32A.2 runtime resolver.

## Data Flow

```text
WeatherSnapshot
-> LifeBoard condition
-> effect group
-> intensity
-> timeline
-> authorized vendor scene key
-> Pixi layer stack
```

## Renderer Boundary

The implementation extends the existing single Pixi renderer. Vue components still pass scene data and diagnostics; Pixi sprites, textures, ticker, resize, and cleanup remain inside `WeatherPixiLayer.vue`.

## Texture Management

- Vendor manifest fetch is cached and has a failed-retry cooldown.
- Scene textures are loaded on demand.
- Duplicate URLs within a scene are loaded once and reused.
- Individual layer failures are skipped; fallback is used only if no core scene layer can load.
- No startup path loads all vendor weather textures.

## Diagnostics

The weather atmosphere surface exposes non-visible diagnostic attributes:

- `data-weather-asset-origin`
- `data-weather-scene-key`
- `data-weather-scene-family`
- `data-weather-timeline`
- `data-weather-intensity`
- `data-weather-performance-tier`
- `data-weather-layer-count`
- `data-weather-loaded-layer-count`
- `data-weather-pixi-status`

These attributes are not user-visible content and the Pixi canvas remains decorative.
