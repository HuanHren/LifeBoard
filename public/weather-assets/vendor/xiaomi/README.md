# Xiaomi Authorized Transitional Weather Assets

This directory contains the authorized transitional vendor weather assets used by the LifeBoard weather Pixi renderer.

## Runtime Structure

| Directory | Role |
| --- | --- |
| `backgrounds/` | Large reference backgrounds used only when a scene needs a cold/frost field. |
| `sky/` | Small authorized skybox-derived sky gradients used as browser scene base layers. |
| `clouds/` | Cloud layers for clear, cloudy, partly cloudy, overcast, rain, snow, and storm scenes. |
| `lights/` | Broad day/night light layers. |
| `sun/` | Small sun particle texture candidates. |
| `glows/` | Small glow particle texture candidates. |
| `frost/` | Frost edge mask used for rime fog, freezing drizzle, freezing rain, and sleet scenes. |
| `rain/` | Rain sheets and rain particle textures. |
| `snow/` | Snow sheets, snow particles, and frost overlays. |
| `atmosphere/` | Fog and haze sheets from the existing authorized set. |
| `haze/` | Haze particle texture candidates. |
| `dust/` | Dust and sand atmosphere layers. |
| `lightning/` | Reserved for future authorized static lightning assets; Stage 32A.2 uses procedural brightness overlay instead. |
| `droplets/` | Reserved for future authorized foreground droplet assets. |
| `atlases/` | Reserved for future split atlas assets. |
| `sequences/` | Reserved for future bounded sequence assets. |

## Files

- `manifest.json` is the runtime scene manifest consumed by the weather renderer.
- `catalog.json` records the public runtime asset catalog, including source and file hashes without local extraction paths.

## Replacement Policy

Current runtime priority is:

```text
authorized-vendor
-> fallback
```

Existing LifeBoard original weather assets remain in the repository as archival and future replacement assets. They are not selected by the current Stage 32A.2 runtime resolver. Future original scenes can replace vendor scenes per scene key after they are completed and approved.
