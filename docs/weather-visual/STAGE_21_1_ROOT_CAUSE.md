# Stage 21.1 Root Cause

## Scope

This audit covers the Stage 21 responsive weather base artwork request duplication and runtime stability issue for the current LifeBoard weather visual system.

Project root: `D:\LifeBoard`

## Evidence

Production preview was started from the current Stage 21 code and verified with Playwright against `http://127.0.0.1:5173/weather`.

The initial desktop reduced-motion reproduction used a 1440 x 1000 viewport with `prefers-reduced-motion: reduce`.

Observed network sequence:

1. `t=138ms` requested `/assets/partly-cloudy-day-base-desktop-uHEYhr8c.avif`
2. `t=180ms` received desktop AVIF `200`, `content-length=13910`
3. `t=1255ms` requested `/assets/partly-cloudy-day-base-mobile-9Hq0kv7k.avif`
4. `t=1297ms` received mobile AVIF `200`, `content-length=9338`
5. `t=1304ms` requested `/assets/partly-cloudy-day-base-desktop-uHEYhr8c.avif`
6. `t=1319ms` received desktop AVIF `200`, `content-length=13910`

The final DOM still selected the desktop AVIF:

```text
currentSrc=http://127.0.0.1:5173/assets/partly-cloudy-day-base-desktop-uHEYhr8c.avif
animationName=none
scrollWidth=1440
innerWidth=1440
```

A follow-up focused diagnostic for the same desktop reduced-motion viewport captured only the desktop AVIF. During that run:

```text
window.innerWidth=1440
window.outerWidth=1440
devicePixelRatio=1
matchMedia('(max-width: 639px)').matches=false
matchMedia('(prefers-reduced-motion: reduce)').matches=true
```

This means the extra mobile request is not reproduced on every run, but the first reproduction confirms that the production runtime can request the wrong responsive endpoint in a desktop reduced-motion session.

## Current Implementation

`WeatherAtmosphere.vue` currently owns responsive source selection in Vue state:

```text
isMobileViewport = shallowRef(window.matchMedia('(max-width: 639px)').matches)
onMounted() registers a MediaQueryList change handler
activeBaseSource chooses mobile or desktop based on isMobileViewport
the template renders only the active source with v-if
```

The rendered `<picture>` therefore does not expose a stable native responsive source list. Instead, Vue replaces the source set when `isMobileViewport` changes or is initialized on mount.

## Root Cause

The root cause is runtime-driven responsive asset selection in `WeatherAtmosphere.vue`.

The browser is designed to choose the correct responsive image from a stable `<picture>` source list using `media` attributes. The current implementation moves that decision into Vue reactivity and lifecycle code, which can rebuild the picture source children after initial image selection. In the reduced-motion reproduction, this produced a transient mobile AVIF request in a desktop viewport before returning to the desktop AVIF.

The reduced-motion preference is not itself choosing mobile assets. It exposes the instability because the visual runtime still changes animation state and lifecycle timing while the source list is controlled by JavaScript.

## Ruled Out

- No CSS `background-image` rule references the partly-cloudy base assets.
- The WMO condition resolver selected the expected `partly-cloudy` visual.
- The final DOM after the faulty run selected the desktop AVIF, so the issue is a transient request path rather than a persistent incorrect desktop render.
- The source image files themselves are unchanged and are not the cause.

## Required Fix

Use a stable native `<picture>` structure for the base artwork:

- render mobile sources with a mobile `media` condition;
- render desktop sources as the default sources;
- keep one stable `<img>` fallback;
- remove JavaScript viewport detection from `WeatherAtmosphere.vue`;
- keep the weather visual resolver viewport-neutral, returning the complete responsive asset set instead of a selected viewport asset.

This is a product-code stability fix, not only a test-script correction.

## Post-fix Verification Clarification

The first post-fix matrix still showed mobile requests on desktop when screenshots were captured with Playwright `fullPage: true`. A focused diagnostic that separated the assertion phase from the screenshot phase confirmed that `fullPage` screenshot capture can pollute image request logs.

Final verification therefore records product network assertions before screenshot capture and uses viewport screenshots for evidence. With that corrected verification boundary, desktop sessions request only the desktop base artwork, mobile sessions request only the mobile base artwork, reduced-motion/theme toggles do not request a new base image, and breakpoint resize requests only the newly matching endpoint.
