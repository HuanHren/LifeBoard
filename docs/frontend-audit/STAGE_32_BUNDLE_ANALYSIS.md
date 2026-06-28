# Stage 32 Bundle Analysis

## Baseline

The Stage 32 baseline build already emitted an existing Vite warning for the shared `lib` chunk above 500 KB after minification.

The application has four production dependencies:

- Vue
- Vue Router
- Pinia
- PixiJS

No Stage 32 change added a production dependency.

## Build Output After Stage 32

The production build passed with the same Vite chunk-size warning class. The largest generated JavaScript chunks remained:

- shared `lib` chunk: about 513 KB
- app entry chunk: about 290 KB
- weather route chunk: about 84 KB

Weather rendering internals such as geometry, graphics context, render target, and filter chunks remain emitted as async assets rather than being directly referenced by the initial HTML.

## Route Loading Decision

Stage 32 does not add manual chunking and does not raise `chunkSizeWarningLimit`.

The current evidence shows the warning is a shared-runtime composition issue, not an accidental static import introduced by the long-range page. A manual split without a broader app-shell strategy would risk extra requests without clearly reducing user-perceived cost.

## Production Isolation

Static dist scanning verified:

- no `__local_weather_reference` marker in production output.
- no local reference manifest marker in production output.
- no Windows user path marker in production output.
- no temp path marker in production output.
- no base64-embedded local reference assets were introduced by Stage 32.

Production preview network verification also showed no local reference asset requests.

## Weather Asset Regression

The weather route still reports:

- `partly-cloudy-day` as `lifeboard-original`.
- `clear-day` as `authorized-vendor`.
- Pixi max FPS of `30` on desktop preview.
- reduced-motion fallback with zero canvas elements.

Stage 32 did not modify vendor weather assets, visual manifests, WMO mapping, or Pixi renderer scene parameters.
