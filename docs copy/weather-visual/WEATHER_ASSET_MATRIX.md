# Weather Asset Matrix

| Visual key | Runtime path | Format | Dimensions | Use |
|---|---|---|---:|---|
| `partly-cloudy-day.desktop.avif` | `src/assets/weather/atmosphere/partly-cloudy-day/desktop/partly-cloudy-day-base-desktop.avif` | AVIF | 1600x700 | Desktop primary |
| `partly-cloudy-day.desktop.webp` | `src/assets/weather/atmosphere/partly-cloudy-day/desktop/partly-cloudy-day-base-desktop.webp` | WebP | 1600x700 | Desktop fallback |
| `partly-cloudy-day.mobile.avif` | `src/assets/weather/atmosphere/partly-cloudy-day/mobile/partly-cloudy-day-base-mobile.avif` | AVIF | 900x900 | Mobile primary |
| `partly-cloudy-day.mobile.webp` | `src/assets/weather/atmosphere/partly-cloudy-day/mobile/partly-cloudy-day-base-mobile.webp` | WebP | 900x900 | Mobile fallback |

The source PNG files remain in `docs` and are not imported at runtime.

`WeatherAtmosphere.vue` renders only the active viewport source set after Stage 21, reducing accidental desktop/mobile image downloads.
