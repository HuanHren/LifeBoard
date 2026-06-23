# Stage 23 Current State Audit

## Baseline

- Branch: `main`.
- Working tree before Stage 23 edits: clean.
- Baseline build: `npm run build` passed.
- Stage 22 and Stage 22.1 artifacts are present in Git history at `5862732 feat: add caiyun weather proxy`; the commit title is not stage-specific, but the Stage 22/22.1 files are not uncommitted.

## Current Weather Hero DOM

`WeatherHero.vue` renders a `section.weather-hero` containing:

1. A city-management `RouterLink` above the visual stack.
2. `.weather-hero__viewport`, which owns stable, outgoing, and incoming `WeatherSnapshotLayer` branches.
3. A polite screen-reader update message outside the visual layer.

`WeatherSnapshotLayer.vue` renders each snapshot as:

1. `WeatherAtmosphere` as the absolute visual background.
2. Optional screen-reader summary for the active layer.
3. Normal Vue DOM content for location, temperature, condition, daily high/low, provider, and air quality.

Weather text and controls are ordinary DOM and must remain outside PixiJS.

## Picture Location and Lifecycle

`WeatherAtmosphere.vue` owns the responsive base `<picture>` for the active visual. The base picture is rendered only when a base source exists and the base layer has not failed completely.

The current source order is:

1. Mobile AVIF when `baseFormatState === 'prefer-avif'`.
2. Mobile WebP.
3. Mobile PNG if present.
4. Desktop AVIF when `baseFormatState === 'prefer-avif'`.
5. Desktop WebP.
6. Desktop PNG if present.
7. `<img src>` fallback from the selected fallback source.

The browser still owns AVIF/WebP capability selection and desktop/mobile media selection.

## Image Load Events

The base image emits:

- `loaded` through `markBaseLoaded()` on `<img @load>`.
- `failed` through `markLayerFailed('base')` after the fallback state machine reaches full visual fallback.
- `absent` when no base fallback source exists before visual fallback.

The incoming snapshot transition waits for the incoming base readiness or a short timeout before crossfading.

## Day and Night Identity

The visual chain resolves:

`WeatherSnapshot -> getWeatherAtmosphere -> resolveWeatherVisual -> WeatherVisualRegistry -> WeatherAtmosphere`

Registered real assets currently cover:

- `partly-cloudy + day`: desktop and mobile AVIF/WebP.
- `partly-cloudy + night`: desktop and mobile AVIF/WebP.

The visual identity includes atmosphere, condition, effect group, timeline, and asset URLs. Day and night are isolated by visual identity, so format fallback state does not leak between them.

## Snapshot Transition

`useWeatherSnapshotTransition.ts` keeps:

- `currentSnapshot`
- `outgoingSnapshot`
- `incomingSnapshot`
- `phase`
- generation counters and timers

When the visual identity changes, the previous snapshot becomes outgoing and the next one becomes incoming. The incoming layer reports base-artwork readiness through `WeatherAtmosphere`, then the hero crossfades and settles. Reduced motion or forced colors swaps immediately.

## Reduced Motion

The existing reduced-motion handling is CSS-based:

- `WeatherAtmosphere.vue` disables atmosphere animations, transitions, and `will-change`.
- `WeatherSnapshotLayer.vue` disables content settle animation.
- `WeatherHero.vue` shortens outgoing/incoming transitions through `shouldSwapImmediately`.

Stage 23 should avoid Pixi initialization entirely when `prefers-reduced-motion: reduce` is active.

## Image Format Fallback

Stage 22.1 added a base image state machine:

`prefer-avif -> webp-only -> visual-fallback`

If AVIF request failure fires the base image error handler, AVIF sources are removed for the current visual identity so the same `<picture>` can select WebP. If WebP also fails, the base picture is removed and the existing neutral CSS atmosphere remains.

## Pixi Canvas Insertion Point

The best insertion point is inside `WeatherAtmosphere.vue`, immediately after the base `<picture>` and before detail/precipitation/contrast overlays. That keeps:

- The poster and fallback owner unchanged.
- Pixi below weather text because `WeatherSnapshotLayer` content remains `z-index: 10`.
- Pixi scoped to each atmosphere instance and visual identity.
- The existing transition readiness contract intact.

## Duplicate Download Avoidance

Pixi must receive only the loaded `<img>` element from the existing base picture. It must not import or resolve image URLs and must not call Pixi loaders with asset URLs. Texture creation should use the already-loaded `HTMLImageElement`.

Initialization should wait until:

- The image load event has fired.
- `naturalWidth > 0`.
- The base format state is not `visual-fallback`.
- The visual is `partly-cloudy` with `day` or `night` timeline.

## Long-Lived Context Avoidance

Only the active non-outgoing atmosphere should initialize Pixi. Outgoing transition layers should remain static posters. `WeatherSnapshotLayer` already has a `visualState` prop, so `WeatherAtmosphere` can receive that state and only enable Pixi for `stable` and `incoming`.

Each `WeatherAtmosphere` owns at most one Pixi app. Watchers must destroy the app before reinitializing for a new loaded image, visual key, reduced-motion change, save-data change, or fallback state change.

## Poster and Fallback Retention

The base `<picture>` remains in DOM after Pixi is ready and becomes the poster/fallback owner. Pixi readiness may fade the canvas in, but the picture must not be removed by Pixi. If Pixi fails, the canvas is hidden/destroyed and the poster stays visible.

The neutral CSS fallback remains available for AVIF/WebP total failure and for capability fallback.

## Vue Lifecycle Race Risks

The main risks are:

- Async dynamic import resolves after component unmount.
- `Application.init()` resolves after the visual key has changed.
- Image load races with AVIF/WebP fallback state changes.
- Transition briefly mounts outgoing and incoming atmosphere layers.
- ResizeObserver or visibility listeners survive route leave.

Stage 23 must use a generation/cancel flag, destroy all Pixi resources on `onBeforeUnmount`, remove all listeners, disconnect `ResizeObserver`, and avoid mutating DOM after cancellation.
