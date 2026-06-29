# Stage 32A.3 Scene Calibration

Stage 32A.3 recalibrated the authorized vendor manifest instead of changing the weather provider or WMO mapping pipeline.

## Runtime Priority

Current runtime priority remains:

```text
authorized-vendor -> fallback
```

LifeBoard original weather assets remain in the repository as archival and future replacement assets, but they are not selected by the current Stage 32A.3 runtime.

## Scene Calibration Scope

The manifest now composes 58 scene keys from 31 authorized vendor assets. Calibrated scene families include:

- clear
- mostly-clear
- partly-cloudy
- cloudy
- overcast
- fog
- rime-fog
- haze
- drizzle
- freezing-drizzle
- rain
- rain-showers
- freezing-rain
- sleet
- snow
- snow-grains
- snow-showers
- thunderstorm
- thunderstorm-hail
- dust
- sand
- sandstorm

## Renderer Calibration

The Pixi layer now supports:

- per-layer tint and offset parameters;
- fixed-pool particle layers;
- deterministic particle placement;
- hard particle caps;
- no per-frame texture or sprite creation.

Ignored local evidence:

- `docs/weather-xiaomi-audit-local/stage-32a3/calibrated-scene-matrix.json`
- `docs/weather-xiaomi-audit-local/stage-32a3/matrix-results.json`
