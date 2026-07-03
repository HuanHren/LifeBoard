# LifeBoard Commercial Upgrade - Stage 5.1R2 Workspace Responsive Closeout

## 1. Scope

Stage 5.1R2 closes the Workspace auxiliary-area regression found after Stage 5.1. The change is limited to the `/app` Workspace home layout and its quick-access module.

No router, app shell, navigation contract, store, dependency, weather core, Landing page, or business page implementation is changed in this stage.

## 2. Baseline

- Branch: `main`
- Stage 5.1R2 baseline: `50a4d2318e338f16860c31e1294ec2038638a4e7`
- Required history baselines verified as ancestors: Stage 1A, Stage 1B, Stage 2, Stage 3, Stage 4, Stage 4.1, Stage 4.1R2, Stage 5, Stage 5.1, and the weather freeze baseline.
- Initial worktree: clean.
- Pre-change build: passed.
- Existing build warning: Vite reported the known large chunk warning for `dist/assets/lib-BhG2s7iA.js`.

## 3. Root Cause

The Stage 5.1 Workspace layout collapsed the main dashboard grid to one column at `max-width: 1180px`, but kept the auxiliary side rail as two equal columns in the same viewport range.

At `768x1024`, this made `HomeWeatherSummary` and `HomeQuickAccess` each about half of the content width. `HomeQuickAccess` then split pinned bookmarks and quick tools into two more columns, and quick tools split into two tool columns again. The final text column for labels such as `Timestamp`, `Whitespace`, and `Deduplicate` became too narrow to read.

At `1024x768`, the same nested split remained visible: the page was no longer mobile, but the auxiliary area was still compressed enough for quick-tool labels to truncate or wrap poorly.

## 4. Final Layout Decision

The Workspace auxiliary area now uses one column throughout the compact and tablet breakpoint range handled by `HomePage.vue`.

`HomeQuickAccess.vue` now uses container queries for its own internal layout:

- It stays single-column when mounted in a narrow parent.
- It switches pinned bookmarks and quick tools to two columns only when the component itself has enough inline width.
- It switches quick tools to multiple columns only when each tool receives a usable minimum width.
- Quick-tool titles no longer use forced truncation, so English labels stay readable instead of becoming vertical text.

This keeps the 390px mobile closeout intact, fixes 768px tablet, fixes 1024px compact desktop, and avoids making the 1280px+ desktop side rail depend on viewport-only assumptions.

## 5. 768px Contract

At `768x1024`:

- The Workspace main content remains single-column.
- The auxiliary area stacks Weather above Quick Access.
- Quick Access may present Pinned Bookmarks and Quick Tools side by side because the component has full content width.
- Quick Tools labels must remain readable.
- Mobile bottom navigation remains available because the app shell breakpoint still treats 768px as mobile/tablet.

## 6. 1024px Contract

At `1024x768`:

- The Workspace main content remains single-column under the existing `1180px` dashboard breakpoint.
- The auxiliary area stacks Weather above Quick Access instead of splitting Weather and Quick Access into cramped halves.
- Desktop top navigation is used.
- Mobile bottom navigation is hidden by the existing app-shell media query.
- Quick Tools labels remain readable in English and Chinese.

## 7. Bottom Navigation Clearance

No app-shell padding change was required. The existing `AppLayout.vue` and `main.css` contract still provides mobile bottom navigation clearance through `--mobile-nav-clearance` and safe-area padding.

Stage 5.1R2 only verifies that Workspace content does not visually collide with the fixed bottom navigation.

## 8. Weather Freeze Boundary

Weather remains frozen in this stage. The change does not touch:

- `src/modules/weather/**`
- `src/assets/weather/atmosphere/**`
- `public/weather-assets/**`
- `public/__local_weather_reference/**`
- PixiJS renderer code
- weather stores, data adapters, cache, or condition mapping

The Workspace weather summary is only affected by the parent grid width.

## 9. Accessibility

The existing section landmarks, link semantics, and router links are preserved. The quick-tool title change improves readable text flow without changing focus order or keyboard behavior.

The responsive fix does not add motion and does not depend on hover-only behavior. Reduced-motion users receive the same layout.

## 10. Verification Targets

The stage verification covers:

- `375x812`
- `390x844`
- `768x1024`
- `1024x768`
- `1280x800`
- `1440x900`
- `1920x1080`
- light mode
- dark mode
- reduced motion
- English locale
- empty-state and populated-state visual checks where local data allows
- direct route checks for Landing, Workspace, Weather, Todos, Bookmarks, Tools, Settings, and Not Found

## 11. Verification Results

Production-preview verification generated 16 screenshots in:

```text
C:\Users\jingr\AppData\Local\Temp\lifeboard-stage51r2-final
```

Key measured results:

- `768x1024`: no horizontal overflow; auxiliary side width `731px`; Quick Tools minimum title width `110px`; mobile bottom navigation visible.
- `1024x768`: no horizontal overflow; auxiliary side width `960px`; Quick Tools minimum title width `167px`; mobile bottom navigation hidden.
- `390x844` bottom clearance: page-end gap between the last tool item and bottom navigation was `28px`.
- `/app` direct resource check did not load GSAP, ScrollTrigger, Pixi renderer chunks, or the Weather page chunk.
- Direct route checks passed for `/`, `/app`, `/weather`, `/weather/cities`, `/weather/15-day`, `/todos`, `/bookmarks`, `/tools`, `/settings`, `/settings/data-sources`, and an unknown route.

## 12. Files Changed

- `src/modules/home/HomePage.vue`
- `src/modules/home/HomeQuickAccess.vue`
- `docs/commercial-upgrade/16-stage-5-1-r2-workspace-responsive-closeout.md`

No source outside the Workspace module is changed.
