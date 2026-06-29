# Stage 32A.1 Asset Inventory Audit

## Inventory Sources

| Source | Purpose |
| --- | --- |
| apktool resources | Static resource names, XML references, drawables, and weather config JSON. |
| extracted assets | File-level inventory and candidate import metadata. |
| Stage 4 visual mapping | Prior representative samples and weather visual master map. |
| LifeBoard vendor weather assets | Current authorized runtime subset already present in the project. |

## Full Static Inventory

The ignored local evidence file `asset-inventory.json` records 3164 static resource rows from the audited reverse-engineering run.

| Extension | Count |
| --- | ---: |
| `.xml` | 2041 |
| `.png` | 614 |
| `.webp` | 325 |
| `.data` | 86 |
| `.glsl` | 82 |
| `.json` | 7 |
| `.comp` | 7 |
| `.jpg` | 1 |
| `.bin` | 1 |

## Representative Weather Asset Groups

| Group | Representative resource names | Stage 32A.2 use |
| --- | --- | --- |
| Day icons | `icon_sunny`, `icon_cloudy`, `icon_overcast`, `icon_light_rain`, `icon_moderate_rain`, `icon_heavy_rain`, `icon_t_storm`, `icon_light_snow`, `icon_moderate_snow`, `icon_heavy_snow`, `icon_sand` | Optional UI/icon source if license and attribution rules allow. |
| Night icons | `icon_sunny_night`, `icon_cloudy_night`, `icon_fog_night` | Day/night parity reference. |
| Rain | Rain particle, line emitter, screen-rain, and droplet references | Rebuild as Pixi particle and overlay parameters. |
| Snow | Snow particle, line emitter, and screen-snow references | Rebuild as Pixi particle layers. |
| Fog/haze/dust | Fog, haze, sand, and dust shader references | Use visual intent only; do not copy shader code. |
| Thunder | Thunder light and thunder fragment references | Rebuild with low-frequency Pixi brightness overlay. |

## Current LifeBoard Vendor Subset

LifeBoard currently contains a small authorized vendor subset under `public/weather-assets/vendor/xiaomi`. It includes atmosphere, cloud, dust, frost, light, rain, snow, and manifest files. This is not the full Xiaomi weather visual system.

## Import Policy

- Full decompiled directories, native libraries, smali, and shader source are not import candidates.
- Large path and hash inventories stay in `docs/weather-xiaomi-audit-local/stage-32a1/`.
- Public docs may reference resource names and scene families, but must not publish full hash manifests or private extraction paths.
