# Stage 27 Cache Design

Generated: 2026-06-25

## Scope

Stage 27 adds a small client-side cache for normalized weather forecast snapshots. It does not cache raw provider responses, Pixi state, local-reference manifests, local assets, AbortControllers, Promises, DOM objects, debug logs, or provider asset metadata.

## Storage

- Key: `lifeboard.weather.forecastCache.v1`
- Schema version: `1`
- Data shape:
  - `version`
  - `locationKey`
  - `location`
  - `forecast`
  - `fetchedAt`
  - `expiresAt`

The forecast payload is the normalized `WeatherSnapshot` used by the page.

## Location Isolation

Cache entries are isolated by:

- provider
- location source
- country code
- latitude rounded to 4 decimals
- longitude rounded to 4 decimals

This avoids mixing cities after city switching while keeping the key stable across reloads.

## Freshness

- Fresh: first 10 minutes after `fetchedAt`.
- Stale display window: up to 60 minutes after `fetchedAt`.
- Expired: older than 60 minutes.

Fresh cache restores immediately and avoids a duplicate forecast request. Stale cache restores immediately and revalidates in the background. Expired cache is not presented as current weather; it is only used as explicitly marked offline-stale data if the network request fails.

## Safety

- Invalid JSON is removed.
- Unknown schema version is removed.
- Missing or invalid `expiresAt` is removed.
- `expiresAt < fetchedAt` is removed.
- Location-key mismatch is ignored.
- Cache write failures return `false` and do not crash the page.
- Settings weather data clearing removes the forecast cache.

## Request Policy

- Geocoding timeout: 8 seconds.
- Forecast timeout: 12 seconds.
- Automatic retry: at most once, only for transient network/timeout failures.
- 4xx and provider-structured errors are not retried by the helper.
- User abort remains silent and does not show an error.

## UI States

Internal states are mapped to restrained user-facing messages:

- `live`: no extra warning.
- `refreshing`: “Refreshing weather in the background...”
- `stale`: “Showing recently saved weather...”
- `offline-stale`: “Showing saved weather because the latest update failed...”
- `error-no-data`: existing full error state with retry.
