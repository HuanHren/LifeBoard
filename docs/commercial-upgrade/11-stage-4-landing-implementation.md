# Stage 4 Landing Implementation

## 1. Scope

Stage 4 implements the `/` Landing experience only. The route, layout resolver, App shell, Workspace, Weather, Todos, Bookmarks, Tools, Settings, stores, storage formats, and Weather rendering internals remain outside this stage.

## 2. Files Implemented

- `src/modules/landing/LandingPage.vue` now contains the commercial Landing page with hero, scroll narrative scene, direct app entries, a local interactive demo, and final CTA.
- `src/modules/landing/composables/useLandingScrollNarrative.ts` owns the Landing-only GSAP runtime.
- `src/i18n/keys.ts`, `src/i18n/locales/en-US.ts`, and `src/i18n/locales/zh-CN.ts` define the visible Landing copy.
- `package.json` and `package-lock.json` add only `gsap`.

## 3. Route And Layout Boundary

The implementation relies on the Stage 3 route contract:

- `/` uses route name `landing`, `LandingLayout`, and lazy-loads `src/modules/landing/LandingPage.vue`.
- App routes remain under `AppLayout`.
- The Landing runtime is not imported by `src/app/App.vue`, the router, App layouts, or Weather.

## 4. Motion Runtime

GSAP is loaded only after the Landing component mounts and only when this media query matches:

```text
(min-width: 64rem) and (prefers-reduced-motion: no-preference)
```

The runtime dynamically imports:

```ts
import('gsap')
import('gsap/ScrollTrigger')
```

The desktop runtime creates one pinned `ScrollTrigger` timeline for the narrative scene. The mobile, tablet, and reduced-motion paths remain static and use normal document scrolling. The runtime cleans up with `context.revert()` on unmount or media-query changes.

## 5. Interaction Model

The local demo section uses component-local state only:

- Weather demo: static CSS preview.
- Todos demo: local checkbox state.
- Tools demo: local textarea input.

No Pinia store, localStorage, Weather service, Todo storage, or Tool persistence is read or mutated by this page.

## 6. Accessibility

The page keeps the Stage 3 layout accessibility contract:

- One `main#main-content` from `LandingLayout`.
- One page-level `h1`.
- Section headings use ordered heading levels.
- Direct CTA links remain available before the scroll narrative.
- Reduced motion receives the same content without pinned animation.
- Keyboard users can tab through direct entries, demo tabs, checkbox, textarea, and CTAs.

The demo tabs use `role="tablist"`, `role="tab"`, `aria-selected`, and `role="tabpanel"`. The current implementation changes tabs by click and focus activation through native button behavior.

## 7. Responsive Behavior

The Landing page is designed as:

- Mobile: single-column static narrative, no long pinning.
- Tablet: static narrative, no GSAP runtime.
- Desktop: one pinned narrative scene with scroll-linked transforms.

The content avoids horizontal scrolling by using constrained widths, `minmax(0, 1fr)`, and mobile-specific full-width CTAs.

## 8. Weather Freeze Boundary

The Landing weather preview is CSS-only and uses generic displayed text. It does not import or modify:

- `src/modules/weather/**`
- `src/assets/weather/atmosphere/**`
- `public/weather-assets/**`
- `public/__local_weather_reference/**`

Weather remains reachable through `/weather`, and its frozen module stays the source of truth for real weather behavior.

## 9. Dependency Change

Only `gsap` was added. It is route-local in practice because the Landing route is lazy-loaded and the GSAP modules are imported dynamically from the Landing composable.

Build output confirms separate async chunks for GSAP and ScrollTrigger. The existing Vite large chunk warning for `lib` remains unrelated to this stage.

## 10. Verification Checklist

Required verification for Stage 4:

- `npm run build`
- Browser route checks for `/`, `/app`, `/weather`, `/weather/cities`, `/weather/15-day`, `/todos`, `/bookmarks`, `/tools`, `/settings`, `/settings/data-sources`, and an unknown route.
- Responsive checks at 375, 390, 768, 1024, 1280, 1440, and 1920 widths.
- Reduced-motion check for static Landing content.
- Console/runtime error check.
- Weather frozen-path diff check.
- Final git diff must show only allowed Stage 4 files.

## 11. Known Limits

This stage does not implement advanced media assets, pricing, customer stories, authentication, analytics, or application data migration. Those are outside the Stage 4 contract.
