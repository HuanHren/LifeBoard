# Stage 32A.2 Asset Import Report

## Summary

Stage 32A.2 expanded the authorized vendor weather asset set for runtime scene use. The import stayed limited to browser-readable static image assets with direct Stage 32A.1 evidence.

## Imported Assets

| Asset | Runtime role | Source evidence |
| --- | --- | --- |
| `rain/rain-particle.png` | Fine and near rain particle layer | Stage 32A.1 `asset-import-plan.json` particle texture row |
| `snow/snow-particle.png` | Snow, sleet, hail, and grain particle layer | Stage 32A.1 `asset-import-plan.json` particle texture row |
| `haze/haze-particle.png` | Haze, dust, and sand particle layer | Stage 32A.1 `asset-import-plan.json` particle texture row |
| `sun/sun-particle-a.png` | Day clear and mostly-clear sparkle layer | Stage 32A.1 `asset-import-plan.json` particle texture row |
| `glows/sun-particle-b.png` | Night clear and mostly-clear glow layer | Stage 32A.1 `asset-import-plan.json` particle texture row |

No APK, JADX, smali, native library, shader source, or full Xiaomi configuration file was imported.

## Catalog

`public/weather-assets/vendor/xiaomi/catalog.json` records 26 runtime assets. Each row includes id, URL, category, role, dimensions, alpha flag, source SHA-256, and committed file SHA-256. It does not contain local absolute paths or private approval transcripts.

## Manifest

`public/weather-assets/vendor/xiaomi/manifest.json` was expanded to include all Stage 32A.2 scene families and aliases required by the WMO/provider-neutral matrix.

## Local Evidence

Detailed validation is stored in the ignored local directory:

```text
docs/weather-xiaomi-audit-local/stage-32a2/
```
