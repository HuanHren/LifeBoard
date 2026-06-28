# Stage 28 Release Audit

Date: 2026-06-25

## Build

`npm run build` passed twice:

1. Baseline build at Stage 28 start.
2. Production build after temporarily moving `public/__local_weather_reference/` out of the project.

The only build warning was the existing Vite chunk-size warning.

## Production Preview

Production preview route checks passed for:

- `/`
- `/weather`
- `/weather/cities`
- `/weather/15-day`
- `/todos`
- `/tools`
- `/bookmarks`
- `/settings`
- `/not-found-stage-28`

Evidence:

- `docs/weather-visual-local/stage-28/production-route-results.json`
- `docs/weather-visual-local/stage-28/tablet-production-fallback.png`

## Production Isolation

`dist` scan result: no forbidden matches.

Checked for:

- `__local_weather_reference`
- local manifest naming
- `D:\`
- `D:/`
- Xiaomi-related naming
- MIUI-related naming
- MAML-related naming
- Majestic-related naming
- Stage 28 local evidence naming

Evidence:

- `docs/weather-visual-local/stage-28/production-isolation-results.json`

Production isolation result:

```json
{
  "passed": true,
  "scannedFiles": 52,
  "forbiddenMatches": [],
  "unexpectedRequests": [],
  "distLocalReferenceExists": false
}
```

## Local Reference Isolation

Temporarily moving `public/__local_weather_reference/` away from the project did not break `npm run build`.

The production build did not include:

- local reference directory
- local manifest
- local absolute Windows paths
- Stage 28 JSON evidence
- Stage 28 screenshots

The formal original weather visual coverage at this checkpoint remains `partly-cloudy` day/night. Other weather states that do not yet have formal replacement artwork continue to use neutral fallback behavior in production.

## Release Blockers

No release blocker was found in Stage 28.

## Caveats

- Headless tablet screenshots often captured Pixi while `data-pixi-status="loading"`; the rotation lifecycle run reached `ready` with `data-pixi-max-fps="30"` and route leave canvas count 0.
- The async Pixi chunk-size warning remains an existing build warning, not a Stage 28 regression.
