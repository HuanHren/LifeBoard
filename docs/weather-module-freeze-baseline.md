# Weather Module Freeze Baseline

Date: 2026-07-02

Freeze decision: FROZEN_WITH_ACCEPTED_P2.

Freeze marker: WEATHER_MODULE_FROZEN.

Freeze baseline commit under verification: 0698e4b086c5b893e6bd06a9c7e6543f508cceb4.

## Commands

Build command:

```powershell
npm run build
```

Regression validators:

```powershell
node scripts/lb-2a-validate-weather-scenes.mjs
node scripts/lb-2b-validate-partly-cloudy-day-config-renderer.mjs
node scripts/lb-2c-validate-partly-cloudy-night-config-renderer.mjs
node scripts/lb-2d-validate-weather-scene-runtime-stability.mjs
node scripts/lb-2e-validate-clear-day-suitability.mjs
node scripts/lb-3a-validate-weather-completion-audit.mjs
node scripts/lb-3c-validate-weather-p1-closeout.mjs
node scripts/lb-3c-verify-weather-states.mjs
node scripts/lb-3d-validate-weather-freeze.mjs
```

Optional package scripts at freeze time:

- No npm run typecheck script exists; npm run build runs vue-tsc -b.
- No npm run lint script exists.
- No npm run test script exists.
- No npm run test:unit script exists.

## Frozen Architecture

Mixed renderer is the frozen production architecture for the current weather module.

Config-driven scenes:

- partly-cloudy-day
- partly-cloudy-night

Legacy scenes:

- clear-day
- clear-night
- rain
- snow
- fog
- thunder
- sand/dust/haze
- unknown safe fallback

Frozen routing contract:

| Scene | Renderer |
| --- | --- |
| partly-cloudy-day | config-driven |
| partly-cloudy-night | config-driven |
| clear-day | legacy/authorized-vendor |
| clear-night | legacy/authorized-vendor |
| rain | legacy |
| snow | legacy |
| fog | legacy |
| thunder | legacy |
| sand | legacy |
| unknown | safe fallback |

## Providers

Supported providers:

- Open-Meteo: forecast, visibility, air quality; alerts unsupported.
- Caiyun: forecast, visibility, weather alerts; air quality unsupported in the current module.
- AMap: city search/reverse geocoding when configured; Open-Meteo remains fallback city search.

Provider capability behavior:

- Capability is explicit through WEATHER_PROVIDER_CAPABILITIES.
- Unsupported alerts are not treated as no active alerts.
- Provider switch keeps the selected provider capability meaning.
- UI and store consume normalized WeatherSnapshot data, not raw provider responses.

## Data Reliability

Normalized snapshot data includes:

- current conditions
- hourly forecast
- daily forecast
- timezone and timezone abbreviation
- sunrise and sunset
- wind, humidity, precipitation, UV and pressure
- visibility in km
- provider capabilities
- alerts

Cache and error behavior:

- Cache key includes provider, source, country code and stable coordinates.
- Cache restore validates version, location, hourly, daily, current, units and advice shape.
- Old cache entries without visibility remain safe and render visibility as unavailable.
- Provider failures with stale cache render saved weather with stale/offline language.
- Provider failures without cache render a retryable weather error.
- Partial payloads render readable errors rather than a blank weather surface.

Solar phase rule:

- Solar phase derives from snapshot current time before falling back to browser wall clock.

## Runtime Baseline

Expected active animated scene state:

- one canvas
- one Pixi Application
- one active scene
- one ticker callback
- one visibility listener
- one resize listener

Reduced motion baseline:

- config-driven day: static fallback, zero canvas
- config-driven night: static night poster/fallback, zero canvas
- legacy scenes: no forced high-frequency animation when reduced motion is active

Debug boundary:

- Runtime debug API is gated by development mode or localStorage.__lifeboard_weather_runtime_debug = '1'.
- Debug snapshots contain counters only and no provider payload, city payload or user data.

## Browser Baseline

Required viewport matrix:

- 1896x829
- 1440x900
- 1024x768
- 768x1024
- 390x844
- 360x800

Required state matrix:

- normal online
- visibility present
- visibility missing
- alerts active
- alerts supported none
- alerts unsupported
- provider error
- stale cache
- partial current only
- partial no hourly
- partial no daily
- location denied
- location timeout
- city search empty
- reduced motion
- WebGL unavailable
- route leave/return
- visibility hidden/visible

Screenshot/log policy:

- Store browser evidence under tmp/ or another ignored/temp directory.
- Do not commit screenshots, browser cache, Playwright profiles or generated result JSON.
- Do not treat expected GPU ReadPixels diagnostics or intentionally aborted provider resource errors as app errors.
- Application console/page errors must be listed separately.

## Accepted P2

- Large Vite async chunk warning.
- Texture reuse optimization only if measured runtime churn appears.
- Additional scene migrations.

## DROP

- Broad Xiaomi Weather reverse engineering.
- clear-day migration for architectural uniformity.
- Full renderer unification as a freeze requirement.

## Reopen Conditions

Allowed:

- A verified production bug.
- A provider API breaking change.
- A browser/platform compatibility regression.
- A user-approved weather product feature.
- A confirmed accessibility issue.
- A measured performance regression.

Not allowed:

- Renderer should look cleaner.
- All scenes should use one architecture.
- Xiaomi Weather has another effect.
- A new shader looks interesting.
- More reverse engineering may reveal something.

## Whole-site Upgrade Guard

Future whole-site architecture or commercial-grade visual upgrade work must keep this weather baseline green. Any change that breaks the frozen commands, renderer routing, data semantics, accessibility states, reduced-motion behavior, runtime counters or browser viewport matrix reopens weather only under the allowed reopen conditions above.

## Stage 11 Final Regression

Date: 2026-07-07.

Status: WEATHER_MODULE_FROZEN remains valid.

Regression scope checked:

- Weather routes: `/weather`, `/weather/cities`, `/weather/15-day`.
- Weather code boundary: `src/modules/weather/**`, `src/modules/home/HomeWeatherSummary.vue`, `src/assets/weather/atmosphere/**`, weather route metadata, weather provider/settings touchpoints, and existing weather documentation.
- Build and deterministic validators: build, scene validation, runtime stability, P1 closeout, browser state matrix, and LB-3D freeze matrix.
- Browser smoke: city search, result selection, current weather, hourly forecast, daily forecast, mobile overflow, request-failure handling, and Pixi pointer-event isolation.

Verification results:

- `npm run build`: PASS. Vite still reports the accepted large chunk warning; this remains non-blocking.
- `node scripts/lb-2a-validate-weather-scenes.mjs`: PASS.
- `node scripts/lb-2d-validate-weather-scene-runtime-stability.mjs`: PASS.
- `node scripts/lb-3a-validate-weather-completion-audit.mjs`: PASS.
- `node scripts/lb-3c-validate-weather-p1-closeout.mjs`: PASS.
- `node scripts/lb-3c-verify-weather-states.mjs`: PASS.
- `node scripts/lb-3d-validate-weather-freeze.mjs`: PASS on rerun. An initial run sampled `RESPONSIVE_1896x829` while Pixi was still `loading`; the rerun passed the full matrix and no source change was required.

Known non-blocking issues:

- Large Vite chunk warning remains accepted P2.
- Expected aborted provider-resource console errors remain allowed in mocked/offline browser harnesses.
- Pixi initialization can be timing-sensitive in harness sampling, but the current freeze matrix passes without code changes.

Freeze guard:

- Weather is frozen for feature work.
- Future Weather changes are limited to verified regression fixes, provider breakage, browser compatibility, confirmed accessibility issues, or measured performance regressions.
- Do not add weather scenes, replace approved assets, rewrite Pixi, extend Xiaomi Weather analysis, or expand weather animation before the whole-site architecture and commercial-grade visual upgrade are complete.
