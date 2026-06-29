# Stage 34 Performance Report

## Build Impact

Baseline build:

- Home route chunk: `22.96 kB`, gzip `5.30 kB`
- Main app chunk: `293.53 kB`, gzip `85.46 kB`
- CSS: `59.44 kB`, gzip `10.99 kB`
- `lib`: `513.51 kB`, gzip `145.82 kB`
- WeatherPage chunk: `88.27 kB`, gzip `23.85 kB`

Stage 34 build:

- Home route chunk: `26.01 kB`, gzip `6.65 kB`
- Main app chunk: `299.37 kB`, gzip `87.04 kB`
- CSS: `59.13 kB`, gzip `10.94 kB`
- `lib`: `513.51 kB`, gzip `145.82 kB`
- WeatherPage chunk: `88.26 kB`, gzip `23.84 kB`

## Runtime Boundaries

- Home canvas count: zero.
- Home vendor manifest requests: zero.
- Home Pixi requests: zero.
- Home weather API requests in isolated cached/no-city validation: zero.
- Countdown display is day-based, not second-based.
- Sorting is centralized in computed selectors and existing store getters.

## Warning

The build keeps the existing Vite large chunk warning for `lib`.

## Evidence

Machine-readable results:

```text
docs/frontend-audit-local/stage-34/home-performance-results.json
docs/frontend-audit-local/stage-34/home-network-results.json
```
