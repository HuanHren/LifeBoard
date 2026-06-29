# Stage 32A.1 Pixi Architecture Plan

## Goal for Stage 32A.2

Extend the existing LifeBoard Pixi weather renderer so it can express all mapped weather families using authorized assets and LifeBoard-owned animation logic.

## Proposed Internal Modules

```text
src/modules/weather/
  renderers/pixi/
    scene-presets/
    particle-presets/
    timeline-presets/
    vendor-adapters/
    layers/
```

Module names are illustrative. The implementation should follow the current project structure and avoid introducing a second renderer.

## Data Flow

```text
WeatherSnapshot
-> normalized LifeBoard condition
-> effect group
-> intensity preset
-> timeline bucket
-> Pixi scene preset
-> asset resolver
-> layer renderer
```

## Layer Plan

| Layer | Responsibility | Constraints |
| --- | --- | --- |
| Sky | Timeline color and atmosphere base | Static or low-frequency updates only. |
| Cloud | Cloud sprites and drift | Reuse textures; hard layer cap. |
| Precipitation | Rain/snow/sleet particles | Shared renderer with intensity presets. |
| Atmosphere | Fog, haze, dust, storm darkness | No expensive filters. |
| Foreground | Droplets or near-field snow | Optional and capped. |
| Thunder overlay | Brightness pulse | LifeBoard-owned random cadence, disabled in reduced motion. |

## Intensity Presets

Rain and snow should continue to share renderers and vary only by data:

```text
density, speed, opacity, cloudDarkness, atmosphereOpacity
```

Do not create separate renderers for light, moderate, and heavy variants.

## Runtime Priority

Stage 32A.2 runtime selection should be:

```text
authorized-vendor
-> fallback
```

Existing LifeBoard original weather assets remain archival and future replacement assets. They should not be selected at runtime until a replacement scene is completed and approved per scene key.

## Vendor Adapter Boundary

Any Xiaomi-derived mapping should remain in an internal adapter layer. Public LifeBoard condition types should remain provider-neutral.

## Verification Plan

Stage 32A.2 should verify:

- All target WMO codes.
- Day/night.
- Desktop/tablet/mobile.
- Reduced motion.
- Production build isolation.
- No unexpected local asset requests.
- Canvas lifecycle on route leave and return.
