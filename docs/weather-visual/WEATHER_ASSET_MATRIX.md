# Weather Asset Matrix

| Visual key | Runtime path | Format | Dimensions | Use |
|---|---|---|---:|---|
| `partly-cloudy-day.desktop.avif` | `src/assets/weather/atmosphere/partly-cloudy-day/desktop/partly-cloudy-day-base-desktop.avif` | AVIF | 1600x700 | Desktop primary |
| `partly-cloudy-day.desktop.webp` | `src/assets/weather/atmosphere/partly-cloudy-day/desktop/partly-cloudy-day-base-desktop.webp` | WebP | 1600x700 | Desktop fallback |
| `partly-cloudy-day.mobile.avif` | `src/assets/weather/atmosphere/partly-cloudy-day/mobile/partly-cloudy-day-base-mobile.avif` | AVIF | 900x900 | Mobile primary |
| `partly-cloudy-day.mobile.webp` | `src/assets/weather/atmosphere/partly-cloudy-day/mobile/partly-cloudy-day-base-mobile.webp` | WebP | 900x900 | Mobile fallback |
| `partly-cloudy-night.desktop.avif` | `src/assets/weather/atmosphere/partly-cloudy-night/desktop/partly-cloudy-night-base-desktop.avif` | AVIF | 1896x829 | Desktop primary |
| `partly-cloudy-night.desktop.webp` | `src/assets/weather/atmosphere/partly-cloudy-night/desktop/partly-cloudy-night-base-desktop.webp` | WebP | 1896x829 | Desktop fallback |
| `partly-cloudy-night.mobile.avif` | `src/assets/weather/atmosphere/partly-cloudy-night/mobile/partly-cloudy-night-base-mobile.avif` | AVIF | 941x1672 | Mobile primary |
| `partly-cloudy-night.mobile.webp` | `src/assets/weather/atmosphere/partly-cloudy-night/mobile/partly-cloudy-night-base-mobile.webp` | WebP | 941x1672 | Mobile fallback |

The source PNG files remain in `docs` and are not imported at runtime.

`WeatherAtmosphere.vue` uses one stable `<picture>` with media-qualified mobile sources and desktop defaults. Stage 21.1 verified the browser downloads only the matching viewport asset set during initial render and during resize.

Stage 22.1 adds request-failure fallback for this same asset shape. Normal loads still request AVIF only. If the selected AVIF request fails, the component switches the current visual identity to WebP-only mode while preserving native desktop/mobile media selection. If WebP also fails, it removes the base image and uses the existing neutral CSS fallback.
