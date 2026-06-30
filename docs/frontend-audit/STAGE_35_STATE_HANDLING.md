# Stage 35 State Handling

## Store-Owned States

The Weather store remains the source of truth for selected location, forecast status and error, cache UI state, cache timestamps, air-quality status and error, provider state, long-range status and error, search state, favorites, and initialization.

## UI-Owned Derived States

The page derives only display states:

- active location label for the Weather page header;
- compact daily forecast slice;
- cache status message;
- previous forecast update-failure message;
- compact advice priority.

## Loading, Empty, Stale, Offline, Error

- Initial setup and no-city states still render through `BaseEmpty`.
- Initial loading still renders through `WeatherLoadingState`.
- No-data forecast errors still render through `BaseError`.
- Stale, offline-stale, refreshing, and update-failed states remain secondary status messages.
- AQI loading/error/unavailable states remain localized to `AirQualityPanel`.

## Boundary

No SWR behavior, request dedupe, timeout, retry, cache freshness, provider selection, or persistence behavior was changed.
