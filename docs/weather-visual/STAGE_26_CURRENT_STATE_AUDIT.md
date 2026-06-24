# Stage 26 Current State Audit

Generated: 2026-06-24

## Baseline

- Project root: `D:\LifeBoard`
- Branch: `main`
- Baseline HEAD: `fcb329d1aa5129378a19a983366c57965ff48cda`
- Baseline build: passed with the existing Vite chunk size warning.

## Architecture Summary

- `WeatherPage.vue` delegates the weather surface to `WeatherWorkspace.vue`.
- `WeatherWorkspace.vue` initializes the weather store, renders the current hero, advice, forecast strips, provider notices, and empty/error/loading states.
- `stores/weather.ts` owns selected location, favorites, provider preferences, AMap preferences, city search, forecast loading, air quality loading, request abort controllers, and request id guards.
- `openMeteoService.ts` requests Open-Meteo forecast data with `timezone=auto`.
- `weatherNormalizer.ts` converts provider data into LifeBoard weather snapshots.
- `weatherCodes.ts`, `weather-condition.ts`, `weather-timeline.ts`, and `resolve-weather-visual.ts` form the WMO to condition/effect/intensity/timeline/scene resolution chain.
- `WeatherAtmosphere.vue` and `WeatherPixiLayer.vue` own visual scene selection, Pixi lifecycle, reduced-motion behavior, local-reference gating, and production isolation.
- `HomeWeatherSummary.vue` consumes the same weather store and does not mount the Pixi renderer.

## Verified Existing Strengths

- Forecast and search requests use `AbortController`.
- Forecast and air-quality commits are guarded with request ids.
- Failed city updates keep the last valid weather snapshot visible and expose a previous-update error message.
- Selected city, favorites, provider preferences, and location-service preferences are persisted separately from provider responses.
- Open-Meteo timestamps are formatted with target-local string parsing to avoid browser timezone shifts in display labels.
- Pixi is disabled under reduced motion and pauses on document hidden.
- Local-reference scenes are gated by development mode and the explicit local environment flag.
- `partly-cloudy` keeps LifeBoard original visual priority ahead of local-reference scenes.
- Desktop and mobile Pixi FPS caps are implemented at 30 and 24 respectively.
- Local-reference layer count is capped.

## Stage 26 Findings Before Code Changes

- Provider-neutral internal weather condition codes are resolved visually, but `weatherI18n.ts` only recognizes raw WMO codes. Internal cloudy, haze, and sand/dust conditions fall back to “conditions unavailable”.
- City search is submit-driven and accessible by tab, but the results surface does not yet expose listbox-style keyboard navigation, Escape close, outside-click close, or debounced query search.
- Weather response data itself is not persisted as a recent valid cache with expiry; only selected location and preferences are persisted.
- Hourly forecast includes the current hour as the first “Now” item. This should be verified against the Stage 26 expectation that current weather is not duplicated in the forecast body.
- `WeatherPixiLayer.vue` has multiple initialization triggers on mount. Prior checks ended with one canvas, but Stage 26 should re-verify no duplicate long-lived Pixi apps after route and viewport transitions.

## Minimal Fix Targets

- Add provider-neutral condition localization without changing the WMO mapping chain.
- Improve city search result interaction semantics and request debounce while preserving existing store-level abort/race handling.
- Keep any remaining cache or UX limitations documented as caveats unless a clear regression is found during automated verification.
