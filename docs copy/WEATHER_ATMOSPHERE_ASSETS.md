# Weather Atmosphere Assets

LifeBoard weather atmosphere artwork must be original local artwork that supports the existing CSS fallback. The app must continue to work when an asset is missing, fails to load, or is intentionally removed.

## Approved States

- `clear-day`
- `clear-night`
- `partly-cloudy-day`
- `partly-cloudy-night`
- `overcast`
- `rain-day`
- `rain-night`
- `thunderstorm`
- `fog-haze`
- `snow`
- `neutral`

## Naming Convention

Use lowercase state names and layer names:

- `base.avif`
- `base.webp`
- `depth.avif`
- `depth.webp`
- `foreground.avif`
- `foreground.webp`

Mobile-specific base artwork uses:

- `base-mobile.avif`
- `base-mobile.webp`

## Directory Structure

Future artwork should live under `src/assets/weather/atmosphere`:

```text
src/assets/weather/atmosphere/
  clear-day/
    desktop/
      base.avif
      base.webp
      depth.avif
      depth.webp
      foreground.avif
      foreground.webp
    mobile/
      base-mobile.avif
      base-mobile.webp
  rain-night/
    desktop/
      base.avif
      base.webp
    mobile/
      base-mobile.avif
      base-mobile.webp
```

Only add files for layers that are useful. Missing layers are valid because `WeatherAtmosphere.vue` keeps the CSS fallback active.

## Required Formats

- AVIF is the preferred format.
- WebP is the required fallback when AVIF is added.
- Do not add PNG or JPEG for final atmosphere layers unless there is a measured browser compatibility reason.
- Do not reference remote images.

## Desktop And Mobile Dimensions

- Desktop base: `1600x700`
- Mobile base: `900x900`
- Desktop depth and foreground: no larger than `1800x780`
- Mobile depth and foreground: no larger than `1000x1000`

These bounds match the weather hero surface and avoid shipping full-screen artwork that the layout never displays.

## File-Size Limits

- Target each AVIF or WebP layer under `220 KB`.
- Target each complete weather state under `520 KB`.
- Target the first complete weather artwork batch under `3 MB`.
- Re-check bundle size after every added state.

## Text-Safe Zones

Keep the left 58 percent of desktop artwork calm enough for text. On mobile, keep the upper 64 percent calm enough for location, temperature, condition, and controls.

Avoid high-detail elements behind:

- location label and city name
- temperature
- air quality badge
- high and low summary
- updated time and provider label
- manage cities control

The component adds a contrast layer, but artwork should not depend on that layer to rescue low-contrast text.

## Originality Requirement

Artwork must be original to LifeBoard. It may be created manually or generated specifically for this project, then reviewed and optimized before import.

## Prohibited Source Material

Do not use:

- stock photos
- unsourced internet images
- copyrighted weather illustrations
- provider logos or provider screenshots
- maps, satellite imagery, or radar imagery
- remote image URLs
- user-uploaded private images

## Optimization Steps

1. Export clean source artwork outside the app.
2. Crop to the approved dimensions.
3. Compress to AVIF and WebP.
4. Inspect text-safe zones in light and dark themes.
5. Import only the final compressed files.
6. Wire the files into `WEATHER_ATMOSPHERE_ASSETS`.
7. Run `npm run build`.
8. Verify `/weather` on desktop and mobile widths.

## Replacement Procedure

1. Add the local asset files under the matching state directory.
2. Import the files in `src/modules/weather/constants/weatherAtmosphereAssets.ts`.
3. Assign the imports to `base`, `depth`, or `foreground`.
4. Keep `fallbackClass` unchanged unless the CSS fallback also changes.
5. Check that missing or failed layers still leave the CSS atmosphere visible.

## Reduced-Motion Behavior

Depth drift is optional and disabled by `prefers-reduced-motion: reduce`. Do not add asset motion that cannot be disabled by the existing media query.

## Motion Presets

Weather atmosphere motion is scoped to `WeatherAtmosphere.vue` and is resolved from the normalized atmosphere state, not from provider-specific condition codes. The base artwork must remain static. CSS fallback motion uses transform and opacity only, with decorative layers hidden in forced-colors mode and stopped under `prefers-reduced-motion: reduce`.

| Atmosphere | Motion preset | Active animated layers | Behavior |
| --- | --- | ---: | --- |
| `clear-day` | `clear-glow` | 1 | Subtle detail glow movement; base artwork stays static. |
| `clear-night` | `static` | 0 | Static until dedicated artwork or a real decorative layer is approved. |
| `partly-cloudy-day` | `cloud-drift` | 0 without depth asset, 1 with depth asset | Only a real depth asset may drift. |
| `partly-cloudy-night` | `cloud-drift` | 0 without depth asset, 1 with depth asset | Only a real depth asset may drift. |
| `overcast` | `overcast-drift` | 1 | Slow CSS haze shift. |
| `rain-day` | `rain` | 2 | Low-opacity CSS rain texture layers. |
| `rain-night` | `rain` | 2 | Lower-contrast CSS rain texture layers. |
| `thunderstorm` | `storm-shadow` | 1 | Slow shadow-density movement with no lightning flash. |
| `fog-haze` | `fog` | 1 | Slow low-distance haze movement. |
| `snow` | `snow` | 2 | Sparse low-opacity CSS snow texture layers. |
| `neutral` | `static` | 0 | No decorative motion. |

Do not add JavaScript animation controllers, canvas, WebGL, video, remote artwork, or per-particle DOM nodes for atmosphere motion.

## Verification Checklist

- Weather hero renders with no assets.
- Weather hero renders when only a base asset exists.
- Weather hero renders when base, depth, and foreground assets exist.
- Missing assets fall back to CSS without a blank hero.
- Failed image loads do not hide the CSS fallback.
- No remote image requests are made.
- No script-drawn rendering surface, 3D rendering context, moving-media asset, or animation library is introduced.
- Light theme text remains readable.
- Dark theme text remains readable.
- Forced-colors mode remains usable.
- Reduced-motion disables asset drift.
- Desktop hero has no overflow.
- Mobile hero has no overflow.
- Keyboard focus remains visible on hero controls.
