# Stage 22.1 Implementation Report

## Summary

Stage 22.1 adds a generic weather base image network-error fallback in `WeatherAtmosphere.vue`.

The state machine is:

`prefer-avif -> webp-only -> visual-fallback`

The resolver, WMO mapping, timeline resolver, visual registry, provider requests, routes, city search, and runtime image assets were not changed.

## Implementation

- `prefer-avif`: renders AVIF and WebP `<source>` entries. Normal browser source selection remains native.
- `webp-only`: removes AVIF `<source>` entries after a selected AVIF request fails. The stable responsive `<picture>` keeps mobile WebP media sources and desktop WebP defaults.
- `visual-fallback`: removes the base image after WebP also fails and applies the existing neutral CSS atmosphere fallback.

Format state is keyed by `visualIdentity`, which is derived from atmosphere, condition, effect group, timeline, and asset URLs. Data-only updates reuse the same visual identity and do not retry failed AVIF. New day/night visual identities can try AVIF again.

## Files Changed

- `src/modules/weather/components/WeatherAtmosphere.vue`
- `src/modules/weather/components/WeatherHero.vue`
- `src/modules/weather/composables/useWeatherSnapshotTransition.ts`
- `src/modules/weather/types/weatherVisualSnapshot.ts`
- `src/modules/weather/utils/weatherVisualSnapshot.ts`
- `docs/weather-visual/STAGE_22_1_FALLBACK_ROOT_CAUSE.md`
- `docs/weather-visual/STAGE_22_1_NETWORK_VERIFICATION.md`
- `docs/weather-visual/STAGE_22_1_IMPLEMENTATION_REPORT.md`
- `docs/weather-visual/WEATHER_VISUAL_SYSTEM.md`
- `docs/weather-visual/WEATHER_ASSET_MATRIX.md`
- `docs/weather-visual/WEATHER_CLEAN_ROOM_RULES.md`

## Verification

- Baseline build before Stage 22.1 changes: PASS.
- Build after implementation: PASS.
- Playwright network verification: PASS_WITH_CAVEATS.
- Screenshot evidence saved under `docs/weather-visual/screenshots/stage-22-1`.

## Boundaries

- No source image was modified.
- No runtime image was modified.
- No production dependency was added.
- No JavaScript viewport asset selection was added.
- No `window.innerWidth`, `WeatherViewport`, `selectedAsset`, or runtime active source logic was restored.
- `docs/skill-audit/` was not modified.
- `docs copy/` was not modified.
- No commit or push was performed.
