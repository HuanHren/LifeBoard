# Stage 23 PixiJS Architecture

## Runtime Chain

Stage 23 keeps the existing resolver path and adds Pixi only after the browser has selected and loaded the poster image:

`Weather data -> visual resolver -> responsive <picture> -> loaded HTMLImageElement -> Pixi ImageSource/Texture -> Sprite + ambient light -> canvas`

PixiJS does not calculate condition, timeline, viewport, or format fallback.

## Component Boundary

- `WeatherAtmosphere.vue`: keeps the poster `<picture>`, AVIF/WebP fallback state, neutral fallback, and Pixi enablement decision.
- `WeatherPixiLayer.vue`: owns one Pixi Application for the current atmosphere instance.
- `src/modules/weather/renderers/pixi/*`: contains capability checks, texture creation, sprite fitting, and partly-cloudy presets.

Only `partly-cloudy` with `day` or `night` timeline enables Pixi. Outgoing transition layers stay static to avoid two long-lived contexts.

## Dynamic Loading

PixiJS is loaded only inside `WeatherPixiLayer.vue` with `await import('pixi.js')` after:

- The base poster image has loaded.
- Reduced motion is not active.
- Save Data is not active.
- WebGL context creation is possible.
- The visual key is `partly-cloudy-day` or `partly-cloudy-night`.

## Texture Reuse

`createPixiTextureFromImage.ts` creates a Pixi `ImageSource` and `Texture` from the existing `HTMLImageElement`. It does not pass an image URL to Pixi and does not use Pixi loaders or `Assets.load`.

## Scene Layers

Stage 23 contains only:

- Base sprite with cover fitting.
- Programmatic low-resolution ambient light texture.
- Tiny transform/opacity drift on the scene and ambient sprite.

It does not use particles, shaders, filters, meshes, OffscreenCanvas, workers, or a scene DSL.

## Lifecycle

The layer handles:

- Async import/init cancellation via a generation counter.
- `ResizeObserver` for canvas and cover fitting.
- `visibilitychange` for ticker pause/resume.
- Runtime reduced-motion changes by destroying Pixi and returning to poster.
- `webglcontextlost` by destroying Pixi and keeping the static poster.
- `onBeforeUnmount` cleanup for ticker callbacks, listeners, observer, canvas, and Pixi resources.
