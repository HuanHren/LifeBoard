# Stage 32A.3 Baseline Visual Audit

Stage 32A.3 started from the Stage 32A.2 authorized vendor runtime:

- Runtime priority: `authorized-vendor -> fallback`.
- LifeBoard original weather assets remain archival and future replacement assets.
- Unknown, unmapped, or failed vendor resources use the neutral fallback.
- No provider, WMO normalization, city search, forecast cache, shell, or non-weather page behavior was changed.

## Baseline Findings

The baseline scene matrix contained 58 vendor scene keys and 26 imported assets. The visual gaps were mostly composition gaps rather than mapping gaps:

- Clear, mostly-clear, partly-cloudy, cloudy, and overcast needed stronger base-sky separation.
- Fog, rime fog, freezing rain, freezing drizzle, and sleet needed a frost/rime edge layer.
- Rain, snow, dust, sand, and storm states needed particle variation without creating separate renderers.
- Mobile low-tier rendering needed deterministic layer caps while retaining a recognizable scene.

## Evidence

Ignored local evidence:

- `docs/weather-xiaomi-audit-local/stage-32a3/baseline-scene-matrix.json`
- `docs/weather-xiaomi-audit-local/stage-32a3/layer-visibility-results.json`
- `docs/weather-xiaomi-audit-local/stage-32a3/asset-usage-matrix.json`

The audit confirmed the baseline had full mapped scene coverage but several visual differentiation gaps that required asset and parameter calibration.
