# Stage 32 Current State Audit

## Git and Build Baseline

Stage 32 started on `main` at `d51f5eb98a5005792d7299be18740c5537975d63`, matching `origin/main`. The worktree was clean before Stage 32 edits. `npm run build` passed with the existing Vite warning for the `lib` chunk above 500 KB.

## Weather Data Boundary

Weather routes are lazy-loaded from `src/router/routes.ts`:

- `/weather` -> `src/modules/weather/WeatherPage.vue`
- `/weather/cities` -> `src/modules/weather/pages/WeatherCityManagementPage.vue`
- `/weather/15-day` -> `src/modules/weather/pages/LongRangeForecastPage.vue`

The main weather page uses `useWeatherStore()` and `loadForecast()`. That path calls `fetchWeatherForecastForProvider()`, which selects Open-Meteo or Caiyun, uses shared request timeout/retry primitives, normalizes provider responses, writes the short forecast cache, and guards races with request ids.

Before Stage 32, `/weather/15-day` directly imported:

- `fetchOpenMeteoForecast` from `openMeteoService`
- `normalizeWeatherForecast` from `weatherNormalizer`
- `createAirQualityLocationId` for its own location identity

It also owned a separate `AbortController`, `longRangeRequestId`, `longRangeStatus`, `longRangeError`, and `longRangeWeather`. This meant the page bypassed the provider abstraction, duplicated error/request state, and implemented a second location identity outside the forecast-provider boundary.

## Long-range Cache Decision

The existing Open-Meteo request already asks for `DAILY_FORECAST_LENGTH` days. The page can often reuse the active weather snapshot when provider/location match. Persistent long-range cache would duplicate the existing short forecast cache without clear benefit. Stage 32 should use provider-boundary loading with in-flight de-duplication and a lightweight session cache, not a second persistent localStorage schema.

## WeatherHero Token State

`WeatherHero.vue` referenced:

- `--radius-xl`
- `--shadow-sm`

Current tokens define `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`, and `--shadow-soft`. The undefined references are isolated to `WeatherHero.vue`; no other source file referenced these two names.

## Bundle Baseline

The baseline build generated:

- `lib-*.js`: about 513 KB, gzip about 146 KB
- `index-*.js`: about 289 KB, gzip about 84 KB
- `WeatherPage-*.js`: about 84 KB, gzip about 23 KB
- `SettingsPage-*.js`: about 63 KB, gzip about 14 KB
- Pixi chunks such as `Geometry`, `GraphicsContext`, `RenderTargetSystem`, and `FilterSystem` as separate async chunks
- `ToolsPage-*.js`, `BookmarksPage-*.js`, `TodosPage-*.js`, and weather child routes as lazy route chunks

The app has only four production dependencies: Vue, Vue Router, Pinia, and PixiJS. PixiJS is not bundled into the first route chunk; it remains split into async renderer chunks. The `lib` warning is primarily shared Vue ecosystem/runtime aggregation rather than a discovered accidental static Pixi import. No blind `manualChunks` or warning-limit change is justified by the baseline evidence.
