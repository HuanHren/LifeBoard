# LB-3A Weather Definition Of Done

This definition is the freeze gate for the LifeBoard weather module. It describes completion, not the next scene migration.

## Functional

- Current weather, 24-hour forecast, multi-day forecast, city search, selected city, favorites, manual refresh/retry and long-range route work from normalized `WeatherSnapshot` data.
- Weather details include temperature, apparent temperature, humidity, wind, UV, pressure, visibility, sunrise and sunset.
- Visibility is implemented end to end for Open-Meteo and Caiyun, with unavailable formatting for missing cached/provider values.
- Air quality renders loading, success, failure and retry states.
- Weather alerts are supported for Caiyun and clearly labelled as unsupported for providers without alert capability.
- Open-Meteo remains usable without additional keys; Caiyun and AMap paths degrade cleanly when credentials are absent.

## Visual

- Mixed renderer is accepted as the formal architecture.
- Clear-day remains Legacy and is not considered an unfinished migration.
- Partly-cloudy config-renderer coverage must match browser evidence, not only static script assertions.
- Reduced motion and static quality do not instantiate animated Pixi canvas.
- The weather page has no horizontal overflow on 1896x829, 1440x900, 1024x768, 768x1024, 390x844 and 360x800.
- No more weather scene migration is required for freeze unless a P1 fix explicitly needs it.

## Reliability

- Forecast, search, air-quality and long-range requests use abort-safe request ownership.
- Forecast cache restores fresh and stale snapshots only after version, key and shape validation.
- Timeout and transient retry behavior remains centralized.
- Route leave/return does not accumulate extra active canvases for the same weather scene.
- Expired cache, stale cache, provider unavailable, incomplete data, location denied/timeout and empty search paths have reproducible verification.

## Accessibility

- Main weather regions are labelled.
- Loading, success, error and stale states expose status or alert semantics where appropriate.
- City search supports keyboard navigation, validation messaging and Escape close behavior.
- Decorative weather imagery/canvas remains hidden from assistive technology.
- Text weather data remains available independent of visual scene rendering.

## Scope

- Freeze does not require renderer unification.
- Freeze does not require clear-day migration.
- Freeze does not require additional Xiaomi Weather reverse engineering.
- Freeze does not require new dependencies.
- Freeze does not include unrelated app-wide bundle, design-system or navigation refactors.

## Freeze Gate

Weather is done when P0 is zero, every P1 in `docs/lb-3a-weather-issue-matrix.csv` is fixed or explicitly accepted, LB-2A through LB-3C validation passes, and the browser matrix is refreshed without unexpected console errors or layout overflow.

## LB-3D Freeze Review

| Area | LB-3D result | Notes |
| --- | --- | --- |
| Functional | PASS | Current weather, hourly, daily, long range, city search, selected city, favorites, retry, auto-location states, visibility, AQI, UV, alerts, timezone, sunrise/sunset, wind, humidity and precipitation are complete for freeze. |
| Reliability | PASS | Timeout, retry, AbortController, request id, stale cache, provider error, partial payload, location denied and location timeout paths have validator or browser coverage. |
| Visual | PASS | Mixed renderer, poster fallback, mobile assets and the six required viewports pass without horizontal overflow. |
| Runtime | PASS | Config-driven partly-cloudy day/night and legacy clear/rain paths pass; route and visibility loops do not accumulate runtime counters. |
| Accessibility | PASS | Search labels, keyboard behavior, focusable retries, explicit error/location/empty/alert states, decorative canvas semantics and reduced-motion behavior are verified. |
| Scope | PASS | Freeze does not require renderer unification, clear-day migration, additional reverse engineering, new dependencies or shader/native parity. |
| P2 backlog | ACCEPTED_P2 | Large Vite chunk warning, texture reuse and further scene migrations remain non-blocking post-freeze work. |

Freeze decision: FROZEN_WITH_ACCEPTED_P2.

Freeze marker: WEATHER_MODULE_FROZEN.
