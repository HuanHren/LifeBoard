# Stage 33 Performance Report

## Build

`npm run build` passes. The only build warning remains the existing Vite large chunk warning for the shared library chunk.

## Bundle Impact

Stage 33 added small shell and primitive code, plus expanded CSS tokens. No new production dependency was introduced.

Observed production build outputs:

- Main app chunk: `293.53 kB`
- Shared library chunk: `513.51 kB`
- Main CSS: `59.43 kB`
- Weather page CSS: `22.41 kB`

## Runtime Guardrails

- No full-page screenshots were used for visual evidence.
- Non-weather routes did not create Pixi canvas instances.
- Weather route leave returned canvas count to 0.
- Reduced motion kept weather Pixi canvas count at 0.

## Evidence

- `docs/frontend-audit-local/stage-33/bundle-results.json`
- `docs/frontend-audit-local/stage-33/weather-regression-results.json`
- `docs/frontend-audit-local/stage-33/network-results.json`
