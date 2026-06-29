# Stage 32A.3 Performance Report

Stage 32A.3 keeps the existing Pixi runtime model and adds fixed-pool particles only.

## Runtime Limits

- Desktop FPS target: <= 30.
- Mobile FPS target: <= 24.
- Maximum canvas count: 1.
- Reduced-motion canvas count: 0.
- Maximum manifest layer count observed: 5.
- Maximum loaded layer count observed: 5.
- Particle layer hard cap: 96 sprites per layer.

## Allocation Discipline

The Pixi ticker updates existing sprites only. It does not create textures, sprites, arrays, or large objects per frame.

## Lifecycle

Verified lifecycle behavior:

- Weather route canvas before leave: 1.
- Route leave canvas count: 0.
- Route return canvas count: 1.
- Texture failure enters static fallback instead of retrying indefinitely.

Ignored local evidence:

- `docs/weather-xiaomi-audit-local/stage-32a3/performance-results.json`
- `docs/weather-xiaomi-audit-local/stage-32a3/lifecycle-results.json`
