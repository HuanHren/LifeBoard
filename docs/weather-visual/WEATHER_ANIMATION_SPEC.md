# Weather Animation Spec

## Stage 21 Preset

`partly-cloudy-gentle`

- Atmosphere wash: slow transform-only drift, 42s linear infinite.
- Highlight: low-amplitude opacity and transform drift, 18s alternate.
- No JavaScript animation loop.
- No canvas, WebGL, GSAP, Lottie, Three.js, shader, or particle engine.

## Reduced Motion

`WeatherAtmosphere.vue` implements:

```css
@media (prefers-reduced-motion: reduce)
```

Reduced motion disables animations, transitions, and `will-change` on atmosphere layers and generated precipitation layers.

Playwright confirmed animation names become `none,none` in the reduced-motion viewport.
