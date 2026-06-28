# Stage 30 Vendor Integration

## Runtime Priority

Weather scene resolution now uses this priority:

1. LifeBoard original scene
2. Authorized vendor scene
3. Neutral fallback

`partly-cloudy` remains LifeBoard original for both day and night. `unknown` remains fallback.

## Formal Vendor Layer

The formal vendor runtime code lives in:

`src/modules/weather/visual/vendor/`

It loads:

`/weather-assets/vendor/xiaomi/manifest.json`

The manifest request is cached, and failed manifest loads are throttled for 30 seconds to avoid infinite retry loops.

## Pixi Integration

`WeatherPixiLayer.vue` now accepts a provider-neutral reference scene shape. The same Pixi lifecycle, FPS caps, reduced-motion behavior, image loading, route cleanup, thunder overlay, and layer cap remain in place.

The local development adapter remains development-only and environment-gated. The production path uses the formal authorized vendor manifest.
