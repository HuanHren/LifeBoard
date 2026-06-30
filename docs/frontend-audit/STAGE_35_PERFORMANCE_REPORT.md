# Stage 35 Performance Report

## Bundle Impact

Baseline build:

- `WeatherPage` JS: `88.26 kB` minified, `23.84 kB` gzip.
- `WeatherPage` CSS: `22.41 kB` minified, `3.74 kB` gzip.

Final build:

- `WeatherPage` JS: `88.75 kB` minified, `24.04 kB` gzip.
- `WeatherPage` CSS: `22.51 kB` minified, `3.81 kB` gzip.

The existing Vite large `lib` chunk warning remains unchanged and the warning limit was not raised.

## Runtime Boundary

- Weather route still lazy-loads Pixi.
- Home still does not render a weather canvas.
- No chart library, UI framework, icon library, or production dependency was added.
- No Pixi renderer, scene, particle, FPS, or lifecycle code was modified.

## Build

`npm run build` passes.
