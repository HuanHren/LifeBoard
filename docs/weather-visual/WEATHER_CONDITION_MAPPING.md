# Weather Condition Mapping

Source: `src/modules/weather/visual/weather-condition.ts`

| WMO code | LifeBoardCondition |
|---:|---|
| 0, 1 | `clear` |
| 2 | `partly-cloudy` |
| 3 | `overcast` |
| 45, 48 | `fog` |
| 51, 53, 55 | `drizzle` |
| 56, 57, 66, 67 | `sleet-freezing` |
| 61, 80 | `light-rain` |
| 63, 81 | `moderate-rain` |
| 65, 82 | `heavy-rain` |
| 71, 77, 85 | `light-snow` |
| 73 | `moderate-snow` |
| 75, 86 | `heavy-snow` |
| 95, 96, 99 | `thunderstorm` |
| unknown | `unknown` |

The mapping keeps Open-Meteo weather descriptions intact through `weatherCodes.ts` and only adds LifeBoard visual semantics.
