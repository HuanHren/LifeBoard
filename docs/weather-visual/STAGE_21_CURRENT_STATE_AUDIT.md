# Stage 21 Current State Audit

Date: 2026-06-22
Project root: `D:\LifeBoard`

## Git Baseline

- Branch: `main`
- Pre-existing uncommitted state: `?? docs/skill-audit/`
- Recent commits:
  - `8c790e0 feat: add caiyun weather proxy`
  - `7998445 feat: add caiyun weather proxy`
  - `5e377f5 feat: add caiyun weather proxy`
  - `6f7b7d1 feat: add caiyun weather proxy`
  - `19bb251 feat: add clear-night weather assets`

No reset, clean, commit, push, or Git config changes were made.

## Technical Stack

- Vue 3.5, Vite 8, TypeScript 6, Pinia 3, Vue Router 5.
- Tailwind CSS v4 is installed through `@tailwindcss/vite`.
- `npm run build` is the only validation script in `package.json`; it runs `vue-tsc -b && vite build`.
- No separate `typecheck`, `test`, or `lint` script is present.

## Baseline Build

Pre-change command: `npm run build`

Result: pass.

Notes:

- `vue-tsc -b` completed.
- Vite production build completed.
- Existing production output already included `partly-cloudy-day` desktop and mobile assets.

## Current File Structure

Weather module entry points:

- `src/modules/weather/WeatherPage.vue`
- `src/modules/weather/components/WeatherWorkspace.vue`
- `src/modules/weather/components/WeatherHero.vue`
- `src/modules/weather/components/WeatherSnapshotLayer.vue`
- `src/modules/weather/components/WeatherAtmosphere.vue`
- `src/modules/weather/stores/weather.ts`
- `src/modules/weather/utils/weatherCodes.ts`
- `src/modules/weather/utils/weatherAtmosphere.ts`
- `src/modules/weather/utils/weatherSolarPhase.ts`
- `src/modules/weather/utils/weatherLighting.ts`
- `src/modules/weather/utils/weatherVisualSnapshot.ts`
- `src/modules/weather/constants/weatherAtmosphereAssets.ts`

Weather routes:

- `/weather`
- `/weather/cities`
- `/weather/15-day`

Home weather summary:

- `src/modules/home/HomeWeatherSummary.vue`

## Current Data Flow

1. `WeatherWorkspace` initializes `useWeatherStore`.
2. `weatherForecastProvider` fetches from the selected provider.
3. Open-Meteo responses are normalized by `weatherNormalizer.ts`.
4. Current WMO `weather_code` becomes a `WeatherCondition` through `getWeatherCondition`.
5. `WeatherHero` derives `WeatherVisualSnapshot`.
6. `createWeatherVisualSnapshot` calls `getWeatherAtmosphere`.
7. `WeatherSnapshotLayer` renders text, AQI, and `WeatherAtmosphere`.
8. `WeatherAtmosphere` resolves assets from `WEATHER_ATMOSPHERE_ASSETS` and renders a responsive `<picture>`.

## Current Visual Entry

Primary runtime visual entry is:

`WeatherHero -> WeatherSnapshotLayer -> WeatherAtmosphere`

`HomeWeatherSummary` does not currently reuse the shared weather hero and remains a compact summary card.

## Current WMO Mapping

Current WMO text mapping lives in:

`src/modules/weather/utils/weatherCodes.ts`

Current atmosphere mapping lives in:

`src/modules/weather/utils/weatherAtmosphere.ts`

Existing behavior:

- `0`, `1` -> clear day/night atmosphere.
- `2` -> partly-cloudy day/night atmosphere.
- `3` -> overcast.
- `45`, `48` -> fog-haze.
- `51`-`67`, `80`-`82` -> rain day/night.
- `71`-`77`, `85`, `86` -> snow.
- `95`, `96`, `99` -> thunderstorm.
- Unknown values -> neutral.

Gap:

- There is no separate Stage 21 chain for `LifeBoardCondition`, `WeatherEffectGroup`, `WeatherTimeline`, typed registry, and a single visual resolver.

## Current Timeline Logic

Current solar phase logic lives in:

`src/modules/weather/utils/weatherSolarPhase.ts`

It uses weather timezone, daily sunrise/sunset when valid, local time fallback, and `current.isDay` fallback. It already avoids relying only on the user's computer hour for remote cities.

Gap:

- Current phases are richer than Stage 21 timeline buckets and are not exposed as `sunrise | day | sunset | night` for visual registry lookup.

## Current Asset Loading

Current runtime atmosphere assets live under:

`src/assets/weather/atmosphere/`

Approved source images remain in:

- `D:\LifeBoard\docs\partly-cloudy-day-base-desktop-source.png`
- `D:\LifeBoard\docs\partly-cloudy-day-base-mobile-source.png`

Source asset verification:

| Asset | Size | Bytes | SHA-256 | Pixel format | Alpha |
|---|---:|---:|---|---|---:|
| Desktop source | 1896x829 | 1430202 | `D2F197E445FF3607B427E29AD8C71CE15C7F7DD0ED015650570510662CDE2318` | Format24bppRgb | false |
| Mobile source | 941x1672 | 1503592 | `643987AFE85013D08034948ED600DB80F9FCD8DA33B02C73ADA46C7A0B69FDB9` | Format24bppRgb | false |

Existing runtime `partly-cloudy-day` assets:

- `src/assets/weather/atmosphere/partly-cloudy-day/desktop/partly-cloudy-day-base-desktop.webp`
- `src/assets/weather/atmosphere/partly-cloudy-day/desktop/partly-cloudy-day-base-desktop.avif`
- `src/assets/weather/atmosphere/partly-cloudy-day/mobile/partly-cloudy-day-base-mobile.webp`
- `src/assets/weather/atmosphere/partly-cloudy-day/mobile/partly-cloudy-day-base-mobile.avif`

The current runtime does not import `docs` source images directly.

## Current Responsive Breakpoints

Observed weather atmosphere media behavior:

- `WeatherAtmosphere.vue` switches mobile sources at `max-width: 639px`.
- Tailwind-style responsive classes use `sm`, `lg`, and compact mobile-first layout patterns.
- `WeatherHero` is a contained rounded hero with minimum height and text over a decorative atmosphere layer.

## Reusable Code

Reusable:

- Store, provider, city search, weather normalization, and existing weather page structure.
- Existing `WeatherHero`, `WeatherSnapshotLayer`, `WeatherAtmosphere`, transition composable, solar phase utility, and lighting utility.
- Existing source/runtime asset directories and `<picture>` responsive loading strategy.

## Code To Modify

Required Stage 21 changes should be limited to:

- Add a visual architecture folder under `src/modules/weather/visual/`.
- Integrate the new resolver into `weatherVisualSnapshot.ts`.
- Adjust visual snapshot types to carry resolver output.
- Adjust `WeatherSnapshotLayer`, `WeatherHero`, and `WeatherAtmosphere` to consume the new resolved visual while preserving existing behavior.
- Update or add documentation under `docs/weather-visual/`.

## Code Not To Modify

Do not modify:

- Weather provider request URLs or provider selection behavior.
- City search, Amap/geolocation, favorites storage, and provider token storage.
- Non-weather routes and modules.
- Existing source images in `docs`.
- Skill files and Skill audit input documents.

## Risks

- Existing `partly-cloudy-day` code already exists but is coupled to `WeatherAtmosphere`; refactoring must preserve runtime behavior.
- Adding a parallel mapping system could duplicate WMO logic unless `getWeatherCondition` and `getWeatherAtmosphere` are carefully bridged.
- Responsive `<picture>` must not download both desktop and mobile large images under normal browser selection.
- Fallback must not create references to non-existent assets for unimplemented states.

## Implementation Plan

1. Add a typed visual architecture layer with condition, effect group, timeline, motion preset, asset manifest, registry, and resolver.
2. Preserve current `WeatherCondition` text labels and provider normalization.
3. Map WMO code to `LifeBoardCondition` once, then map condition to effect group.
4. Convert existing detailed solar phase into Stage 21 timeline buckets.
5. Register real assets only for `partly-cloudy + day`.
6. Return a neutral fallback for missing assets or unimplemented states.
7. Feed the resolved visual into the existing Hero rendering path.
8. Keep animation CSS compositor-oriented and reduced-motion safe.
9. Run build and Playwright visual verification after implementation.
