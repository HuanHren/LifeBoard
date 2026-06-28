# Stage 28 Current State Audit

Date: 2026-06-25
Branch: `main`
Baseline: `cb9a84d37c89663dd2c972424b9e75af9641e742`

## Baseline

Commands executed:

- `git branch --show-current` -> `main`
- `git status --short` -> clean before Stage 28 documentation
- `git status -sb` -> `## main...origin/main [ahead 1]`
- `git log -5 --oneline`
- `git rev-parse HEAD` -> `cb9a84d37c89663dd2c972424b9e75af9641e742`
- `npm run build` -> passed with the existing Vite chunk-size warning

Recent commits:

```text
cb9a84d feat(weather): add forecast cache stability layer
d33d4c6 feat: add caiyun weather proxy
fcb329d feat(weather): map weather conditions to Pixi scene presets
08f601c feat(weather): add development-only reference scene adapter
8cbe329 feat(weather): add PixiJS atmosphere renderer
```

## Files Audited

Weather runtime and cache files read for this audit:

- `src/modules/weather/WeatherPage.vue`
- `src/modules/weather/components/WeatherWorkspace.vue`
- `src/modules/weather/components/WeatherHero.vue`
- `src/modules/weather/components/WeatherSnapshotLayer.vue`
- `src/modules/weather/components/WeatherAtmosphere.vue`
- `src/modules/weather/components/HourlyForecastStrip.vue`
- `src/modules/weather/components/DailyForecastStrip.vue`
- `src/modules/weather/components/WeatherSearchForm.vue`
- `src/modules/weather/components/WeatherSearchResults.vue`
- `src/modules/weather/pages/WeatherCityManagementPage.vue`
- `src/modules/home/HomeWeatherSummary.vue`
- `src/modules/weather/renderers/pixi/WeatherPixiLayer.vue`
- `src/modules/weather/stores/weather.ts`
- `src/modules/weather/services/weatherForecastCache.ts`
- `src/modules/weather/services/weatherRequest.ts`
- `src/modules/weather/services/openMeteoService.ts`
- `src/modules/weather/utils/weatherNormalizer.ts`
- `src/modules/weather/constants/weather.ts`
- `package.json`
- `vite.config.ts`
- Stage 27 local verification scripts and error evidence

## Stage 27 Tablet Failure Finding

The Stage 27 tablet failure was a verification harness defect, not a confirmed tablet UI, cache, or Pixi lifecycle defect.

The failing Stage 27 script generated exactly 24 hourly records from `2026-06-25T00:00`. The forecast current time was `2026-06-25T10:00`. `normalizeHourly()` starts at the current hour and `normalizeWeatherForecast()` requires `HOURLY_FORECAST_LENGTH = 24`; only 14 future entries remained, so the forecast was rejected as incomplete and `#weather-hero-title` never rendered.

Stage 28 rebuilt the tablet harness with 72 hourly entries and explicit cache-state setup.

## Current Runtime Assessment

- The weather store restores fresh, stale, and expired cached forecasts through `weatherForecastCache.ts`.
- Fresh cache avoids a forecast request on reload.
- Stale cache displays cached weather and refreshes in the background.
- Expired cache displays offline-stale weather if the network request fails and cached weather is still available.
- Corrupt cache is cleared and recovered by a fresh network response.
- Error-no-data remains an explicit error state when no usable cache exists.
- The current formal LifeBoard original visual scope is `partly-cloudy` day/night.
- `partly-cloudy` continues to prefer LifeBoard original assets.
- Local reference assets remain dev-only behind `import.meta.env.DEV` and `VITE_ENABLE_LOCAL_WEATHER_REFERENCE_ASSETS`.
- Production build removes `dist/__local_weather_reference`.

## Result

No production code defect was established during the current-state audit. Stage 28 proceeded with verification harness repair and documentation only.
