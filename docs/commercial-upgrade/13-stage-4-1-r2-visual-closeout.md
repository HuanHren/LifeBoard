# LifeBoard Commercial Upgrade - Stage 4.1R2 Visual Closeout

## Scope

Stage 4.1R2 is a narrow Landing visual closeout pass after Stage 4.1 commit `aa867f6`.

This stage only adjusts the Landing product introduction surface and its i18n strings. It does not start Stage 5, does not refactor `/app`, and does not modify Weather internals, Weather assets, Router, App Layout, App Top Navigation, Mobile Bottom Navigation, package metadata, or lockfiles.

## Baseline

- Branch: `main`.
- Stage 4.1 baseline: `aa867f60e5dd63f925c6f95c3aa09bf54a8d67c9`.
- Initial worktree: clean.
- Pre-change build: passed.
- Existing warning: Vite large chunk warning for the `lib` chunk above 500 kB.
- Browser verification tool: Chrome Headless/CDP fallback, because `playwright-cli` and local Playwright packages were not available.

## Final Corrections

### 1. Hero Typography

Final decision:

- The Landing hero title is smaller on desktop and mobile.
- Desktop title max size is reduced from `5.65rem` to `3.65rem`.
- Mobile title max size is reduced from `3.35rem` to `2.65rem`.
- The title now uses two explicit i18n line keys so Chinese breaks at the intended phrase boundary instead of relying on browser CJK balancing.

Files:

- `src/modules/landing/LandingPage.vue`

Validation:

- Rebuilt successfully.
- Final screenshots include light and dark desktop/mobile hero states.

### 2. Mobile CTA Hierarchy

Final decision:

- Mobile keeps the primary workspace CTA as the only full-width high-emphasis action.
- The Weather CTA becomes a lower-weight text-like secondary action on the first screen.
- The narrow mobile Landing top navigation hides its duplicate Workspace CTA; Workspace remains available in the hero and mobile menu.
- Final section CTAs may remain full-width because they are outside the first-screen density problem.

Files:

- `src/assets/styles/main.css`
- `src/modules/landing/LandingPage.vue`

Validation:

- Mobile screenshot confirms the two hero CTAs are no longer equal weight.

### 3. Sticky Story Proportions

Final decision:

- Desktop Sticky Story now gives the product preview the dominant column.
- The explanatory copy column is narrower and the step height is reduced.
- The ScrollTrigger distance is reduced from `+=2200` to `+=1700`.
- The stage still uses one existing pinned scene and one existing ScrollTrigger timeline.

Files:

- `src/modules/landing/LandingPage.vue`
- `src/modules/landing/composables/useLandingScrollNarrative.ts`

Validation:

- Rebuilt successfully.
- Final screenshots include story weather and story tools scroll states.
- CDP checks confirm one pin spacer on desktop and no mobile pin spacer.

### 4. Skeleton Removal

Final decision:

- The Story workspace card no longer contains anonymous gray placeholder bars.
- The card now shows named product data: outside condition, focus, and tool context.
- Mobile static Story preview uses the same real card content.

Files:

- `src/modules/landing/LandingPage.vue`
- `src/i18n/keys.ts`
- `src/i18n/locales/en-US.ts`
- `src/i18n/locales/zh-CN.ts`

Validation:

- Static source check confirms the previous workspace `<i>` placeholders were removed.
- Mobile Story screenshot confirms no skeleton-like workspace bars remain.

### 5. Product Entrance Hierarchy

Final decision:

- The direct-entry grid keeps Workspace as the strongest item.
- Weather remains a strong secondary item.
- Todos, Bookmarks, and Tools remain compact entries.
- No new route, app page, or module is created.

Files:

- `src/modules/landing/LandingPage.vue`

Validation:

- Final screenshot includes the entrances section.

### 6. Demo Weather Hierarchy

Final decision:

- The demo Weather preview is no longer a schematic single temperature card.
- It now includes current condition, high/low, humidity, wind, and a four-point daily trend.
- The demo remains Landing-local illustrative content and does not call Weather services or stores.

Files:

- `src/modules/landing/LandingPage.vue`
- `src/i18n/keys.ts`
- `src/i18n/locales/en-US.ts`
- `src/i18n/locales/zh-CN.ts`

Validation:

- Rebuilt successfully.
- Final screenshot includes the demo Weather state.

## Motion And Accessibility

Final decision:

- No second animation runtime was added.
- No global wheel or history handling was added.
- Reduced-motion behavior remains static because the existing composable only initializes the ScrollTrigger timeline when `(prefers-reduced-motion: no-preference)` and desktop width both match.
- Demo Weather visual information is no longer hidden as a whole from assistive technology; only decorative sky shapes are `aria-hidden`.
- Existing tablist keyboard behavior for demo modules is preserved.

Files:

- `src/modules/landing/LandingPage.vue`
- `src/modules/landing/composables/useLandingScrollNarrative.ts`

## i18n

Final decision:

- New visible labels are registered in the typed translation key list.
- English and Simplified Chinese catalogs are both updated.
- No second language state or Landing-only locale system was introduced.

Files:

- `src/i18n/keys.ts`
- `src/i18n/locales/en-US.ts`
- `src/i18n/locales/zh-CN.ts`

## Weather Freeze Boundary

The Weather freeze boundary remains intact.

Untouched paths:

- `src/modules/weather/**`
- `src/assets/weather/atmosphere/**`
- `public/weather-assets/**`
- `public/__local_weather_reference/**`

The Landing demo Weather card is static product-preview content. It does not import Weather modules, modify Weather data, change PixiJS code, alter caches, or adjust Weather condition mapping.

## Route Regression Boundary

Untouched paths:

- `src/router/**`
- `src/app/layouts/AppLayout.vue`
- `src/app/navigation/AppTopNavigation.vue`
- `src/app/navigation/MobileBottomNavigation.vue`
- `src/modules/home/**`

The existing Landing route remains `/`. The existing app routes remain direct and refreshable.

## Verification Checklist

- `npm run build`: passed after changes.
- Existing build warning remains the Vite large chunk warning.
- Screenshot capture target: outside repository under `%TEMP%`.
- Required final screenshot set:
  - `01-r2-light-1440-hero.png`
  - `02-r2-light-1440-transition.png`
  - `03-r2-light-1440-story-weather.png`
  - `04-r2-light-1440-story-tools.png`
  - `05-r2-light-1440-entrances.png`
  - `06-r2-light-1440-demo-weather.png`
  - `07-r2-light-390-hero.png`
  - `08-r2-light-390-workspace-preview.png`
  - `09-r2-light-390-story.png`
  - `10-r2-dark-1440-hero.png`
  - `11-r2-dark-390-hero.png`
  - `12-r2-dark-390-workspace-preview.png`

## Known Limits

- This stage does not redesign the application workspace.
- This stage does not make Landing feature content data-driven from a shared navigation registry.
- This stage does not alter the Weather module's real application UI.
- Full Playwright was not available in the local dependency graph; Chrome Headless/CDP was used as the browser verification fallback.

## Next Stage

The next stage remains Stage 5: application workspace homepage implementation. Stage 4.1R2 does not start it.
