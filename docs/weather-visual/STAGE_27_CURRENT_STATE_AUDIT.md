# Stage 27 Current State Audit

Generated: 2026-06-25

## Baseline

- Branch: `main`
- Baseline HEAD: `d33d4c6`
- Working tree before Stage 27 code changes: clean except the Stage 27 skill log created after the Skill Gate.
- Baseline `npm run build`: passed with the existing Vite chunk-size warning.

## Persisted Weather Data

- Selected weather location: `lifeboard-weather-location`.
- Weather favorite cities: `lifeboard-weather-favorite-cities`, versioned separately.
- Weather provider preference: `lifeboard.weather.provider`.
- Caiyun token presence and value: `lifeboard.weather.caiyunToken`.
- AMap key and home auto-location preference: `lifeboard.weather.amapKey`, `lifeboard.weather.autoLocationOnHome`.
- No normalized forecast snapshot is persisted before Stage 27.

## Cache Gaps

- Page reload with a selected city always needs a forecast request before useful weather can render.
- There is no explicit forecast cache version, `fetchedAt`, `expiresAt`, freshness state, or stale-while-revalidate behavior.
- Offline recovery can only show data already in the in-memory Pinia store, not data from a prior browser session.
- Settings data clearing removes selected weather location and favorites, but no forecast cache key exists yet.

## Request Behavior

- Forecast loading has `AbortController` cancellation and a monotonically increasing request id.
- Air quality loading has a 30-minute in-memory freshness window.
- Search cancels the previous search request when a new query starts.
- Forecast and geocoding requests do not currently have explicit timeouts.
- Network requests do not automatically retry.
- The same selected location can be requested again after route reload because no persistent fresh cache exists.
- Home and Weather share the same Pinia store and `isInitialized` flag, so a single app session normally avoids duplicate initial forecast requests.

## Stale Data Behavior

- If a forecast refresh fails while `weather` is already populated, the app keeps rendering the previous forecast and shows a previous-update error message.
- There is no distinction between live, refreshing, stale, offline-stale, and error-no-data states.
- Background refresh uses the same `forecastStatus` value as foreground loading.

## Local Storage Schema

- Selected location is an unversioned serialized `WeatherLocation`.
- Favorites are versioned.
- Provider and AMap preferences are small scalar keys.
- Forecast data is not yet serialized.

## Data Size

- A normalized `WeatherSnapshot` contains current conditions, 24 hourly entries, up to 15 daily entries, advice, short-term precipitation, alerts, units, and provider metadata.
- This is significantly smaller and safer than caching raw Open-Meteo or Caiyun provider responses.

## City Switching Isolation

- Forecast requests are guarded by request id and aborts, so older requests do not normally overwrite newer selected cities.
- There is no persisted cache isolation key yet; Stage 27 must use a stable provider + location key.

## Release Risks To Address

- Add versioned normalized forecast cache with freshness metadata.
- Add safe corrupt/unknown-version cache handling.
- Add explicit forecast and geocoding timeouts.
- Add bounded retry for transient safe network failures.
- Add same-location forecast request deduplication and short-term search query caching.
- Add visible but restrained cache freshness UI states.
- Ensure Settings data clearing also removes forecast cache.
