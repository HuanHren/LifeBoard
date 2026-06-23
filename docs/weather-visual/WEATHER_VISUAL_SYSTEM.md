# Weather Visual System

Stage 21 added a data-driven visual chain without changing weather providers:

`Open-Meteo WMO code -> LifeBoardCondition -> WeatherEffectGroup -> WeatherTimeline -> WeatherVisualRegistry -> Desktop/Mobile Asset -> Motion Preset -> Fallback -> Weather Hero Rendering`

## Runtime Entry

- Resolver: `src/modules/weather/visual/resolve-weather-visual.ts`
- Snapshot integration: `src/modules/weather/utils/weatherVisualSnapshot.ts`
- Hero rendering: `src/modules/weather/components/WeatherHero.vue`
- Layer rendering: `src/modules/weather/components/WeatherSnapshotLayer.vue`
- Visual surface: `src/modules/weather/components/WeatherAtmosphere.vue`

## Registered Visuals

Registered real assets:

- `partly-cloudy + day`: Stage 21 approved day sources and runtime assets.
- `partly-cloudy + night`: Stage 22 approved night sources and runtime assets.

Unregistered conditions resolve to typed fallback metadata and continue through the existing neutral/legacy atmosphere fallback instead of referencing missing files.

## Image Format Failure Flow

`WeatherAtmosphere.vue` keeps browser-native responsive `<picture>` selection and adds a presentation-layer network-error fallback:

`prefer-avif -> webp-only -> visual-fallback`

`<picture>` format capability selection is not the same as network-error retry. If the browser selects AVIF and that request fails, LifeBoard removes AVIF sources for the current visual identity so the same responsive asset set can select WebP. If WebP also fails, the base image is removed and the existing neutral CSS atmosphere remains behind the weather text.

The format state is keyed to the visual identity, not to global app state. Data-only updates, theme changes, and reduced-motion changes do not reset the format state. A new day/night visual identity can try AVIF again.

## Clean Boundaries

- Weather request and city search behavior remains unchanged.
- WMO text labels remain in `weatherCodes.ts`.
- WMO semantic visual mapping lives in `src/modules/weather/visual/`.
- Runtime assets are imported from `src/assets`, never from `docs`.
- Stage 22 did not change Open-Meteo request logic, city search logic, routes, or non-weather pages.
- Stage 22.1 keeps format fallback inside the image presentation layer and does not modify WMO mapping, timeline calculation, or visual registry selection.

## Stage 23 PixiJS Layer

Stage 23 adds a PixiJS v8 enhancement layer only for registered `partly-cloudy + day` and `partly-cloudy + night` visuals.

The runtime chain is:

`visual resolver -> responsive <picture> -> loaded HTMLImageElement -> Pixi ImageSource/Texture -> base Sprite + ambient Sprite -> decorative canvas`

Boundaries:

- The existing `<picture>` remains the poster and format fallback owner.
- Pixi does not request weather base images by URL.
- Pixi does not select viewport, image format, weather condition, or timeline.
- Reduced motion, Save Data, WebGL failure, unsupported weather states, and full image fallback keep the static poster.
- Outgoing transition layers stay static so the hero does not keep multiple long-lived Pixi contexts.
