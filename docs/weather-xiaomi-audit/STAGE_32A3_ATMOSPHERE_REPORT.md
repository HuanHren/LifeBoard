# Stage 32A.3 Atmosphere Report

Atmospheric scenes were calibrated with authorized vendor layers and low-cost particle pools.

## Fog and Haze

Fog and haze use layered atmospheric sheets with separate day/night scene keys. Rime fog adds frost edge treatment.

## Dust, Sand, and Sandstorm

Dust, sand, and sandstorm scenes are differentiated by:

- warm sky or dust base;
- foreground dust or sand wall layers;
- particle count and speed;
- opacity and scale.

## Unknown

Unmapped weather codes continue to resolve to:

```text
unknown -> fallback
```

The unknown fallback was verified through an isolated cached browser run with external forecast requests blocked.
