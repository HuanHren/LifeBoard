# Stage 32A.3 Rain and Storm Report

Rain and storm states continue to use the shared Pixi renderer. Stage 32A.3 adjusted scene parameters and layer composition rather than creating condition-specific renderers.

## Rain

Rain states are differentiated by:

- rain sheet opacity;
- particle count;
- particle scale;
- vertical speed;
- cloud darkness;
- low mist opacity.

Covered groups:

- drizzle
- light rain
- moderate rain
- heavy rain
- light showers
- moderate showers
- heavy showers

## Thunderstorm

Thunderstorm scenes combine authorized vendor storm layers with the existing LifeBoard procedural thunder overlay. The overlay remains:

- low frequency;
- short duration;
- non-periodic;
- reduced-motion aware;
- text-readable;
- disabled when Pixi is not running.

No fixed lightning texture or upstream animation parameter was copied.

Ignored local evidence:

- `docs/weather-xiaomi-audit-local/stage-32a3/visual-results.json`
- `docs/weather-xiaomi-audit-local/stage-32a3/performance-results.json`
