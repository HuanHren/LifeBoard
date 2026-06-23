# Weather Clean-room Rules

Allowed references:

- Weather code normalization.
- Fewer visual effect groups than provider condition codes.
- Sunrise/day/sunset/night timeline buckets.
- Data-driven visual registry and fallback architecture.
- Device and reduced-motion degradation concepts.

Forbidden and not used:

- Xiaomi source images.
- Xiaomi icons.
- Xiaomi shader code.
- Xiaomi JSON or MAML scene configs.
- Xiaomi native code.
- Xiaomi resource naming systems.
- Xiaomi page layout.
- Xiaomi animation parameters.

Stage 21 through Stage 22.1 use LifeBoard naming, Vue/TypeScript code, CSS, and approved local original assets. Stage 22.1 changes only generic image failure handling and does not add or derive any visual asset.

## Stage 23 PixiJS Boundary

Stage 23 uses PixiJS v8 as a general-purpose 2D renderer and does not copy or port any Xiaomi implementation detail.

Additional forbidden items for this stage:

- Xiaomi shaders, MAML, JSON scene descriptions, native code, or resource names.
- Xiaomi images or generated replicas.
- Particle systems, Pixi filters, WebGPU-specific effects, custom scene DSLs, plugin systems, or Android GL/MGL compatibility layers.

The only new visual content is a LifeBoard-authored procedural ambient light texture generated in browser memory.
