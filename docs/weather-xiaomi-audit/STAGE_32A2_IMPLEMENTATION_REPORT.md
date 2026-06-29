# Stage 32A.2 Implementation Report

## Summary

Stage 32A.2 implemented authorized vendor all-weather scene selection and Pixi rendering support using the Stage 32A.1 Xiaomi mapping audit as input.

## Completed

- Added formal vendor `catalog.json`.
- Expanded vendor `manifest.json` to all required scene families.
- Imported five small browser-readable particle/glow assets from audited Stage 32A.1 candidates.
- Removed LifeBoard original weather assets from current runtime resolver selection.
- Enabled partly-cloudy to resolve through authorized vendor scenes.
- Added WMO-aware vendor scene-key routing without adding WMO switches to Vue components.
- Extended the existing single Pixi renderer with performance tiers, viewport profiles, per-scene layer caps, URL texture dedupe, layer failure tolerance, and diagnostic attributes.
- Generated local matrix, resource, visual, performance, lifecycle, and production evidence.

## Caveats

- The browser implementation is a PixiJS reconstruction. It does not port Xiaomi native/MGL rendering, shader source, smali, or native libraries.
- The original LifeBoard weather assets are retained for future per-scene replacement work.

## Evidence

Ignored local evidence lives at:

```text
docs/weather-xiaomi-audit-local/stage-32a2/
```
