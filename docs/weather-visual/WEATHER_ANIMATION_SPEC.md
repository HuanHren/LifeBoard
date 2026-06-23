# Weather Animation Spec

## Stage 21 Day Preset

`partly-cloudy-gentle`

- Atmosphere wash: slow transform-only drift, 42s linear infinite.
- Highlight: low-amplitude opacity and transform drift, 18s alternate.
- No JavaScript animation loop.
- No canvas, WebGL, GSAP, Lottie, Three.js, shader, or particle engine.

## Stage 23 PixiJS Presets

Stage 23 keeps the existing CSS poster path and adds a PixiJS enhancement only after the poster image loads.

`partly-cloudy-day`

- Pixi ticker capped at 30 FPS on desktop.
- Mobile ticker capped at 24 FPS.
- DPR capped at 1.5 on desktop and 1.25 on mobile.
- Base sprite uses cover fitting and a scale range below 1.012.
- Ambient layer uses one generated low-resolution canvas texture.
- Motion is limited to slow transform and opacity drift.

`partly-cloudy-night`

- Same lifecycle and FPS/DPR caps as day.
- Ambient opacity is lower and cooler than day.
- No particles, filters, shaders, blur animation, meshes, scroll-linked motion, mouse tracking, or independent cloud layers.

## Stage 22 Night Preset

`partly-cloudy-night-gentle`

- Base image: very slow transform-only drift, 64s alternate.
- Highlight: low-amplitude opacity and transform drift, 22s alternate.
- No JavaScript animation loop.
- No canvas, WebGL, GSAP, Lottie, Three.js, shader, or particle engine.

## Reduced Motion

`WeatherAtmosphere.vue` implements:

```css
@media (prefers-reduced-motion: reduce)
```

Reduced motion disables animations, transitions, and `will-change` on atmosphere layers and generated precipitation layers, including the Stage 22 night preset.

Playwright confirmed animation names become `none,none` in the reduced-motion viewport.

Stage 23 additionally avoids Pixi initialization when `prefers-reduced-motion: reduce` is active. If the preference changes at runtime, the Pixi layer is destroyed and the static poster remains.
