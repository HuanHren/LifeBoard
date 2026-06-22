# Weather Effect Groups

Source: `src/modules/weather/visual/weather-effect-group.ts`

`LifeBoardCondition` and `WeatherEffectGroup` are separate layers. Several semantic conditions can collapse into a smaller effect group so future weather visuals can be expanded without rewriting API normalization.

Current groups:

- `clear`
- `partly-cloudy`
- `cloudy`
- `overcast`
- `fog`
- `haze`
- `light-rain`
- `moderate-rain`
- `heavy-rain`
- `thunderstorm`
- `light-snow`
- `moderate-snow`
- `heavy-snow`
- `sleet-freezing`
- `sand-dust`
- `unknown`

Stage 21 registers real assets only for:

- condition: `partly-cloudy`
- effect group: `partly-cloudy`
- timeline: `day`
