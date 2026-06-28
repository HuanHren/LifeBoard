# Stage 32 Long-range Data Boundary

## Boundary Before Stage 32

`LongRangeForecastPage.vue` previously called the Open-Meteo client and normalizer directly. It also owned a page-local `AbortController`, request id, status, error, and forecast snapshot state.

That made the route provider-specific and created a second request boundary next to the main weather store.

## Boundary After Stage 32

Long-range loading now goes through `useWeatherStore()`:

```text
LongRangeForecastPage.vue
-> loadLongRangeForecast()
-> fetchLongRangeForecastForProvider()
-> fetchWeatherForecastForProvider()
-> provider client
-> provider normalizer
-> NormalizedLongRangeForecast
```

The page no longer imports provider clients, provider normalizers, location identity helpers, or `AbortController`.

## Normalized Model

`NormalizedLongRangeForecast` intentionally contains only long-range display fields:

- provider
- location
- timezone
- timezoneAbbreviation
- fetchedAt
- daily
- units

It is derived from the same provider-normalized `WeatherSnapshot` shape used by the main weather page, but it does not expose current, hourly, advice, alert, or air-quality state to the long-range page.

## Request Cancellation and Race Handling

The store owns long-range cancellation and stale-response handling:

- in-flight requests are de-duplicated by provider and location cache key.
- a new long-range request aborts the previous long-range request.
- request ids reject late responses after route, provider, or location changes.
- aborted requests do not surface as user-facing errors.
- provider/location changes clear stale long-range state.

## Cache Decision

Stage 32 does not add a second persistent long-range localStorage cache.

The main forecast request already returns the daily range needed by `/weather/15-day`. The store therefore reuses the active weather snapshot when provider and location match, and otherwise uses a lightweight in-memory session cache with a short expiry.

This keeps long-range behavior aligned with the existing freshness policy and avoids a new persistent cache invalidation surface.

## Loading, Empty, Unsupported, and Error States

The store now exposes a dedicated long-range status:

- `idle`
- `loading`
- `success`
- `empty`
- `error`
- `unsupported`

The long-range page renders provider-neutral states from that status. Empty and unsupported copy is localized in the existing i18n module files.

## Verification

Local production preview verification used a mocked weather API and a same-SPA navigation flow:

```text
/weather
-> one forecast request
-> app link navigation to /weather/15-day
-> no additional forecast request
```

The route matrix also verified that `/weather/15-day` renders without a Pixi canvas, without local reference asset requests, and without horizontal overflow on desktop, tablet, and mobile viewports.
