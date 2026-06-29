# Stage 32A.1 Browser Portability Audit

## Rendering Architecture Finding

The audited Xiaomi implementation uses a Majestic/MGL/OpenGL path for its main animated weather scene. Evidence includes a render layout in the main weather activity, scene classes extending the MGL scene system, renderer classes, and native MGL libraries.

This means the visual system is not directly portable to browser runtime. Stage 32A.2 should rebuild behavior in PixiJS using LifeBoard-owned abstractions.

## Portability Classes

| Class | Examples | Recommendation |
| --- | --- | --- |
| Direct import candidates | Authorized static PNG/WebP assets already approved or selected for import | Import only after license and provenance are recorded. |
| Parameter references | Weather code maps, scene family ids, timeline bucket counts, cloud layout names | Translate into LifeBoard-owned data tables. |
| Visual intent references | Fog, dust, rain, snow, thunder shader names and output roles | Recreate procedurally in PixiJS without copying source. |
| Native-only implementation | MGL scene classes, native libraries, compute/shader execution model | Do not port. Use as behavior evidence only. |
| Forbidden public evidence | Full decompiled source, full private path lists, full hash inventories | Keep out of public docs and commits. |

## Pixi Runtime Constraints

- Identified weather scenes currently use authorized vendor assets first, with fallback only for unknown, unmapped, or failed asset loads.
- Existing LifeBoard original weather assets are retained as archival and future replacement assets, not selected by the current Stage 32A.2 runtime plan.
- One Pixi app per active weather visual surface.
- Hard caps for rain, snow, dust, droplet, and cloud layers.
- No per-frame texture creation.
- Ticker paused when hidden or unmounted.
- Desktop maximum remains 30 FPS.
- Mobile maximum remains 24 FPS.
- Reduced motion disables animated precipitation and thunder brightness pulses.
- Existing LifeBoard fallback remains available for unsupported scenes.
