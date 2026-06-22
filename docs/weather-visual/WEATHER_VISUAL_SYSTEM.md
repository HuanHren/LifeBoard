# Weather Visual System

Stage 21 adds a data-driven visual chain without changing weather providers:

`Open-Meteo WMO code -> LifeBoardCondition -> WeatherEffectGroup -> WeatherTimeline -> WeatherVisualRegistry -> Desktop/Mobile Asset -> Motion Preset -> Fallback -> Weather Hero Rendering`

## Runtime Entry

- Resolver: `src/modules/weather/visual/resolve-weather-visual.ts`
- Snapshot integration: `src/modules/weather/utils/weatherVisualSnapshot.ts`
- Hero rendering: `src/modules/weather/components/WeatherHero.vue`
- Layer rendering: `src/modules/weather/components/WeatherSnapshotLayer.vue`
- Visual surface: `src/modules/weather/components/WeatherAtmosphere.vue`

## Registered Visuals

Only `partly-cloudy + day` has real Stage 21 assets.

Unregistered conditions resolve to typed fallback metadata and continue through the existing neutral/legacy atmosphere fallback instead of referencing missing files.

## Clean Boundaries

- Weather request and city search behavior remains unchanged.
- WMO text labels remain in `weatherCodes.ts`.
- WMO semantic visual mapping lives in `src/modules/weather/visual/`.
- Runtime assets are imported from `src/assets`, never from `docs`.
