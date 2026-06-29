# Stage 32A.2 Responsive Report

## Viewport Profiles

| Profile | Behavior |
| --- | --- |
| `desktop` | Full authorized vendor layer budget and 30 FPS. |
| `tablet-portrait` | Balanced layer budget, centered composition, 30 FPS. |
| `tablet-landscape` | Balanced layer budget, 30 FPS. |
| `mobile` | Low layer budget and 24 FPS. |

## Diagnostics

Runtime exposes `data-weather-performance-tier` and Pixi exposes `data-pixi-viewport-profile`. These are used by verification scripts and are not visible to users.

## Browser Evidence

Representative desktop and mobile screenshots are stored under ignored local evidence:

```text
docs/weather-xiaomi-audit-local/stage-32a2/screenshots/
```
