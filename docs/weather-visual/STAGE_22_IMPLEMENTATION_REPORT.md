# Stage 22 Implementation Report

## Summary

Stage 22 adds original `partly-cloudy-night` runtime assets and registers them in the existing data-driven weather visual chain:

`Open-Meteo WMO code -> LifeBoardCondition -> WeatherEffectGroup -> WeatherTimeline -> WeatherVisualRegistry -> Desktop/Mobile Asset -> Motion Preset -> Fallback -> Weather Hero Rendering`

No weather provider request logic, route logic, city search logic, non-weather pages, source images, Skill files, `docs/skill-audit/`, or `docs copy/` were modified.

## Code Changes

- Added `partly-cloudy-night` AVIF/WebP imports and manifest entries in `src/modules/weather/visual/weather-asset-manifest.ts`.
- Registered `partly-cloudy:night` in `src/modules/weather/visual/weather-visual-registry.ts`.
- Added `partly-cloudy-night-gentle` to visual motion types and presets.
- Added CSS-only night base drift and highlight glow in `WeatherAtmosphere.vue`.
- Added a `data-content-tone` attribute in `WeatherSnapshotLayer.vue` for runtime verification.

## Runtime Assets

| Asset | Dimensions | Bytes | SHA-256 |
|---|---:|---:|---|
| `src/assets/weather/atmosphere/partly-cloudy-night/desktop/partly-cloudy-night-base-desktop.avif` | 1896x829 | 18110 | `370BE4F465DE23C9FD1669E2756680659E2EEA76F7DA062AB621C9E42503D694` |
| `src/assets/weather/atmosphere/partly-cloudy-night/desktop/partly-cloudy-night-base-desktop.webp` | 1896x829 | 22202 | `C4E546F9156796149083B37FC0451F3706D06E79688AFA8690480DA6B08E5148` |
| `src/assets/weather/atmosphere/partly-cloudy-night/mobile/partly-cloudy-night-base-mobile.avif` | 941x1672 | 9031 | `864E12C65FF403FF5427B0342D050498AB5992135FC7AC67178E0003703FCEBE` |
| `src/assets/weather/atmosphere/partly-cloudy-night/mobile/partly-cloudy-night-base-mobile.webp` | 941x1672 | 13454 | `900F62B0ED725EE25D9CED85255C43C6364AD711C3A49970A1CB71F563C26584` |

## Approved Source Hashes

The two approved source PNG hashes were checked before and after implementation:

- Desktop night: `1EEEE03082D8E5C809E7D76DF7959FD3EFCBDA1A4F1FC853F2C461E9D5C48132`
- Mobile night: `133C0667FEBB2DF08E78B493F50EBD60ADAE7FAFA02C3263AE784EC5F5A1FEBF`

## Validation

- Baseline build before implementation: PASS.
- Final `npm run build`: PASS.
- Playwright production preview: 25 cases recorded.
- Desktop/mobile night screenshots: PASS.
- Day regression screenshots: PASS.
- Reduced-motion screenshots: PASS.
- Theme screenshots: PASS.
- Resize assertions: PASS.
- Day/night store-driven transition assertions: PASS.
- Blocked AVIF fallback stability: PASS_WITH_CAVEATS.

## Boundary Checks

- No commit or remote push was performed.
- No `partly-cloudy-day` assets were edited.
- No `partly-cloudy-night` source PNGs were edited.
- No `docs/skill-audit/` files were modified.
- No `docs copy/` files were modified.
- No Xiaomi weather images, shaders, scene configs, native code, resource names, or copied layouts were used.
- Stage 22 source changes contain no absolute Windows runtime paths and no secrets.

## Caveat

When Playwright intentionally aborted the AVIF source request, Chromium did not request the WebP source afterward. The app remained stable and rendered the weather page without horizontal overflow, but the blocked-image cases have `naturalWidth=0` as expected for the simulated primary source failure.
