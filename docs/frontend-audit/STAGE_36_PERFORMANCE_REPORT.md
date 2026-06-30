# Stage 36 Performance Report

## Build

`npm run build` passes. The only warning is the pre-existing Vite large async `lib` chunk warning.

## Bundle impact

Baseline Todos route chunk was `22.19 kB` raw and `5.65 kB` gzip. Final Todos route chunk is `28.12 kB` raw and `7.18 kB` gzip.

Home and Weather chunks did not show abnormal growth. The Pixi/lib async chunk remains isolated.

## Runtime boundaries

The `/todos` HAR contained no Pixi requests, no weather vendor manifest/catalog requests, and no 404 responses.

## Timers

The date rollover remains owned by `useLocalToday`, which schedules one timeout for local midnight and disposes on scope cleanup.
