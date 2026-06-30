# Stage 35 Current State Audit

## Scope

Read before source edits:

- Stage 31 page, visual system, responsive, accessibility, and rebuild roadmap reports.
- Stage 33 design token, app shell, shared primitive, responsive, and implementation reports.
- Stage 32A.2 and 32A.3 Xiaomi weather renderer reports.
- Current Weather main page, Hero, atmosphere, Pixi layer, snapshot layer, hourly, daily, AQI, advice, details, city management, 15-day route, store, cache, provider boundary, normalized model, i18n, route metadata, and Stage 33 primitives.

## Baseline

- Branch: `main`.
- HEAD and `origin/main`: `4b450658846bfb714bc3441ca1b6eba838162540`.
- Working tree before implementation: clean.
- Baseline build: passed with the existing Vite large `lib` chunk warning.
- Vendor catalog hash: `67937E614ACB644AE796B6830A219A642D4C5207CC3CF9B5C568E27932C1E01C`.
- Vendor manifest hash: `F5A70E8FA6A19897D09779F51A55B0D1AA044C7F925E786A882C79DE0C2F9892`.
- Vendor data: 31 catalog assets and 58 manifest scenes.

## Current Component Hierarchy

```text
WeatherPage
-> PageLayout
-> PageHeader
-> WeatherWorkspace
   -> WeatherProviderNotice
   -> setup/loading/error/empty state
   -> WeatherHero
      -> WeatherSnapshotLayer
         -> WeatherAtmosphere
            -> WeatherPixiLayer
         -> AirQualityBadge
   -> cache/update status
   -> WeatherAlertSection
   -> DailyForecastStrip
   -> WeatherAdvicePanel
   -> WeatherDetailsGrid
   -> AirQualityPanel
   -> ShortTermPrecipitationPanel
   -> PrecipitationTimeline
   -> HourlyForecastStrip
   -> 15-day RouterLink
   -> WeatherAttribution
```

Child routes:

```text
/weather/cities
-> PageLayout
-> route header
-> current location panel
-> selected city panel
-> WeatherSearchForm
-> WeatherSearchResults
-> WeatherFavoritesBar

/weather/15-day
-> PageLayout
-> back link
-> route header
-> loading/error/empty/unsupported states
-> LongRangeForecastStrip
-> WeatherAttribution
```

## Findings

1. The main page has one visible page `h1` from `PageHeader`. The Hero uses an `h2` inside `WeatherSnapshotLayer`, so the heading count is structurally valid.
2. Hero content is coupled to `WeatherSnapshotLayer`, so the DOM information layer and visual transition layer are the same component.
3. Hero currently contains location, temperature, condition, high/low, AQI, update time, provider name, city management, and the Pixi decorative scene.
4. The provider name is visually present in Hero meta, which gives it more attention than a source/status detail needs.
5. AQI rules are duplicated in `AirQualityBadge` and `AirQualityPanel` for translation-key selection, but category thresholds are centralized in `utils/airQuality.ts`.
6. Weather advice logic is centralized in `utils/weatherAdvice.ts`, but the panel displays all three advice items and optional notes, which can be too much for the first screen.
7. Hourly forecast is a horizontal strip of 24 cards. It is keyboard-focusable and local-scroll only, but each card is visually heavy.
8. Short daily forecast uses a horizontal strip. On desktop it can leave the right side visually underused, especially with a small provider result set.
9. The 15-day page has a stronger horizontal long-range pattern than the main daily strip but uses separate route chrome and a standalone back link.
10. Weather details are limited to real fields: UV, humidity, apparent temperature, wind, sun, and pressure.
11. Store-owned states include selected location, forecast status/error, cache UI state, cache timestamps, air-quality status/error, provider state, long-range status/error, search state, favorites, and initialization.
12. Components also derive local display states such as `cacheStatusMessage`, `showPreviousForecastError`, AQI category labels, daily slices, and long-range availability messages.
13. Request deduplication exists in the store through active forecast and long-range keys/promises plus abort controllers.
14. Long-range now uses the store/provider boundary, not a separate component-level API call.
15. City switching re-renders Hero, daily/hourly/details/AQI, and long-range state through store updates; Pixi canvas remains inside the Weather route Hero.
16. Pixi canvas remains decorative and independent from semantic DOM content; diagnostics are data attributes, not visible text.
17. Provider, cache TTL, WMO mapping, normalized condition, Pixi renderer, vendor manifest, catalog, and assets are out of scope and must remain unchanged.

## Components To Keep

- `WeatherAtmosphere`, `WeatherPixiLayer`, `WeatherSnapshotLayer` renderer handoff.
- Store/provider/cache behavior.
- Central weather formatting and i18n utilities.
- Existing city search/favorite behavior.
- Existing 15-day provider loading path.

## Components To Reorganize

- `WeatherWorkspace` should own the Weather page product sequence and header actions.
- `WeatherSnapshotLayer` should keep visual snapshot content but reduce provider/status prominence.
- `DailyForecastStrip` should use full page width on desktop instead of behaving like a narrow row of cards.
- `HourlyForecastStrip` should scan more like a timeline and less like separate cards.
- `WeatherAdvicePanel` should become a compact most-important advice surface.
- Route headers for `/weather`, `/weather/cities`, and `/weather/15-day` should share tone and action hierarchy.

## Implementation Boundary

No edits are planned for:

- Weather provider request protocols.
- Forecast cache freshness or SWR behavior.
- WMO or normalized condition mapping.
- Xiaomi scene mapping, Pixi presets, Pixi FPS, renderer lifecycle, vendor manifest, catalog, or assets.
- Home, Todos, Tools, Bookmarks, Settings, or App Shell behavior.
