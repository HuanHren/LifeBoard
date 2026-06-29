# Stage 32A.2 Scene Implementation

## Implemented Families

| Family | Scene keys |
| --- | --- |
| Clear | `clear-day`, `clear-night` |
| Mostly clear | `mostly-clear-day`, `mostly-clear-night` |
| Partly cloudy | `partly-cloudy-day`, `partly-cloudy-night` |
| Cloudy | `cloudy-day`, `cloudy-night` |
| Overcast | `overcast-day`, `overcast-night` |
| Fog / rime fog | `fog-day`, `fog-night`, `rime-fog-day`, `rime-fog-night` |
| Haze | `haze-day`, `haze-night` |
| Drizzle | `drizzle-day`, `drizzle-night` |
| Freezing drizzle | `freezing-drizzle-day`, `freezing-drizzle-night` |
| Rain | `light-rain-*`, `moderate-rain-*`, `heavy-rain-*`, `rain-showers-*`, `freezing-rain-*` |
| Sleet | `sleet-day`, `sleet-night`, with `sleet-freezing-*` retained for provider-neutral mapping |
| Snow | `light-snow-*`, `moderate-snow-*`, `heavy-snow-*`, `snow-grains-*`, `snow-showers-*` |
| Thunderstorm | `thunderstorm-*`, `heavy-thunderstorm-*`, `thunderstorm-hail-*` |
| Sand / dust | `dust-*`, `sand-*`, `sandstorm-*`, `sand-dust-*` |
| Unknown | fallback |

## Partly Cloudy

Partly cloudy now resolves to authorized vendor scenes. The previous LifeBoard original partly-cloudy assets remain archival and are not requested in current runtime verification.

## Unknown

Unknown and unmapped states do not load an unrelated vendor scene. They use fallback.
