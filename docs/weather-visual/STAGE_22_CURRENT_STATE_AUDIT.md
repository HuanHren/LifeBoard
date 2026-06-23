# Stage 22 Current State Audit

## Scope

Stage 22 starts from checkpoint commit `e46b0001fbeabaa5affd59b01fcb7059d93fe045` on branch `main`.

Untracked items present before implementation:

- `docs/skill-audit/`
- `docs copy/`
- `docs/partly-cloudy-night-base-desktop-source.png`
- `docs/partly-cloudy-night-base-mobile-source.png`

`docs/skill-audit/` and `docs copy/` are not part of this stage and must remain untouched.

## Baseline Build

`npm run build` passed before Stage 22 code or asset changes.

`package.json` has `build`, `dev`, and `preview` scripts only. There are no independent `typecheck`, `test`, or `lint` scripts.

## Source Asset Gate

| Source | Path | Dimensions | Bytes | SHA-256 | Mode | Alpha | Format |
|---|---|---:|---:|---|---|---:|---|
| Desktop night | `D:\LifeBoard\docs\partly-cloudy-night-base-desktop-source.png` | 1896x829 | 1246172 | `1EEEE03082D8E5C809E7D76DF7959FD3EFCBDA1A4F1FC853F2C461E9D5C48132` | RGB | false | PNG |
| Mobile night | `D:\LifeBoard\docs\partly-cloudy-night-base-mobile-source.png` | 941x1672 | 1350144 | `133C0667FEBB2DF08E78B493F50EBD60ADAE7FAFA02C3263AE784EC5F5A1FEBF` | RGB | false | PNG |

Both source images match the required dimensions and are opaque RGB PNGs. They must not be overwritten, cropped, regenerated, or edited.

## Existing Architecture

The Stage 21 and Stage 21.1 runtime chain exists:

`Open-Meteo WMO code -> LifeBoardCondition -> WeatherEffectGroup -> WeatherTimeline -> WeatherVisualRegistry -> responsive asset set -> WeatherSnapshotLayer -> WeatherAtmosphere`

Key files read before implementation:

- `src/modules/weather/visual/`
- `src/modules/weather/components/WeatherAtmosphere.vue`
- `src/modules/weather/components/WeatherSnapshotLayer.vue`
- `src/modules/weather/utils/weatherAtmosphere.ts`
- `src/modules/weather/utils/weatherVisualSnapshot.ts`
- `src/modules/weather/types/weatherVisualSnapshot.ts`
- `src/modules/weather/utils/weatherCodes.ts`
- Stage 21 and Stage 21.1 weather visual documentation

## Confirmed Details

1. `partly-cloudy-day` is registered as `condition: partly-cloudy`, `effectGroup: partly-cloudy`, `timeline: day`.
2. Asset imports are centralized in `weather-asset-manifest.ts`.
3. Registry lookup uses a typed `${LifeBoardCondition}:${WeatherTimeline}` key.
4. `resolveWeatherVisual()` accepts weather code, day flag, sunrise, sunset, and current time; it returns the complete desktop/mobile responsive asset set.
5. `WeatherTimeline` first uses valid current time plus sunrise/sunset windows, then falls back to provider `isDay`, then to `day`.
6. `WeatherAtmosphere.vue` uses one stable `<picture>` for base artwork.
7. Mobile sources use `media="(max-width: 39.9375rem)"`; desktop sources are the default.
8. Reduced motion only disables animations/transitions and does not control asset paths.
9. There is no `WeatherViewport`, `selectedAsset`, `window.innerWidth`, or mounted viewport source switching in the visual path.
10. Fallback remains the legacy atmosphere asset set when no registered visual exists or when the base image fails.
11. Content tone is carried by `ResolvedWeatherVisual.contentTone`; Stage 21 day content tone is `dark`.
12. Current motion preset names are `static`, `partly-cloudy-gentle`, and `fallback-calm`.

## Stage 22 Component Map

- `weather-asset-manifest.ts`: single runtime source for day/night responsive base assets.
- `weather-visual-registry.ts`: maps `partly-cloudy + day/night` to asset sets, tone, preset, and fallback key.
- `weather-motion-presets.ts`: declares typed motion preset metadata.
- `WeatherAtmosphere.vue`: renders the resolved asset set and CSS-only atmosphere motion/readability treatment.
- `WeatherSnapshotLayer.vue`: passes resolved visual metadata to the atmosphere layer and preserves snapshot transition behavior.

No new component is required for Stage 22.
