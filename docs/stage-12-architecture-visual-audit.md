# Stage 12 Architecture and Visual Audit

Date: 2026-07-07

Status: preparation audit only. No source implementation is authorized by this document.

## 1. Baseline

- Branch: `main`
- Baseline status before edits: clean working tree.
- Remote status: branch was up to date with `origin/main`.
- Local commits ahead of `origin/main`: none.
- Weather freeze baseline: `2719cce chore(weather): finalize regression freeze prep`.
- Weather freeze tag: `weather-freeze-stage-11`.

Stage 12 starts after the Weather freeze commit. Weather remains frozen and should only receive regression fixes.

## 2. Build Result

Command:

```powershell
npm run build
```

Result: passed.

Observed warnings:

- Vite/Rolldown reported significant plugin time in Vue and CSS/Tailwind build plugins.
- Vite reported one large chunk: `dist/assets/lib-B_dxYj3W.js` at about 513 kB minified.

These are non-blocking P2 follow-up items. They do not justify architecture or UI changes in Stage 12.

## 3. Current Architecture Summary

The current LifeBoard architecture is suitable for continued expansion if the next phase is kept incremental. It already has a workable module-oriented shape:

- App shell and layout are under `src/app`.
- Feature modules live under `src/modules`.
- Router metadata is centralized in `src/router`.
- Base UI primitives exist under `src/components/base`.
- Theme, spacing, typography, motion, and surface tokens exist in `src/assets/styles/tokens.css`.
- Weather is already isolated under `src/modules/weather` and should remain frozen.

Audit answers:

- A. The architecture can continue expanding, but only if Stage 13 first standardizes shell, page containers, tokens, and shared primitives.
- B. Pages, components, stores, and services are mostly clear. Weather, Settings, Landing, and some workspace components are the largest risk areas.
- C. Page-heavy components remain: `LandingPage.vue`, `WeatherAtmosphere.vue`, `weather.ts`, `SettingsWorkspace.vue`, and `DataSourcesPage.vue` exceed the comfortable size for routine product iteration.
- D. A full one-step feature-based migration is not recommended. The safer path is lightweight layering first, then gradual module migration.
- E. Route meta, layouts, and page containers already exist, but the contracts should be formalized and old layout components should be retired or documented.
- F. Empty, error, and loading states exist as primitives, but pages still mix custom section and panel patterns.
- G. Mobile layout is broadly stable, but spacing, bottom-nav clearance, sticky regions, and touch density need standard rules.
- H. Design tokens exist, but the next phase should promote them into explicit component contracts rather than direct per-module styling.
- I. The main blockers for commercial-grade visual work are not missing frameworks; they are uneven component composition, duplicated surface/card patterns, large scoped CSS blocks, and inconsistent page hero/section systems.

## 4. Page-by-Page Audit

### Home

Current strengths:

- Clear product value as a daily command center.
- Good use of dashboard sections: focus, next-up, weather summary, and quick access.
- Uses modular home components rather than one monolithic page.

Current issues:

- Several home panels use page-specific visual grammar that should be aligned with future shared primitives.
- Home weather summary depends on frozen Weather data boundaries and must stay defensive.
- Dashboard rhythm is good but still reads closer to an internal utility than a premium product surface.

Refactor recommendation: P1. In Stage 13, adapt Home to the new App Shell/PageShell spacing and shared section/header patterns without changing its business logic.

### Weather

Current freeze status:

- Weather is frozen at `2719cce` and tagged `weather-freeze-stage-11`.
- Current implementation includes city selection, current weather, hourly and daily forecasts, provider notices, air quality, precipitation, responsive assets, and PixiJS atmosphere runtime.

Do not change:

- Weather store behavior.
- Weather runtime or PixiJS renderer.
- Approved Weather assets.
- Weather scene catalog.
- Weather motion direction.
- Xiaomi Weather material analysis.

Allowed after freeze:

- Regression fixes.
- Build/type fixes.
- Asset path fixes.
- Crash prevention.
- Accessibility fixes.
- Outer container adaptation if Stage 13 App Shell changes require it.

Boundary with visual upgrade:

- Stage 13 may adapt only the Weather page outer shell spacing to the global layout contract.
- Weather internal UI, runtime, assets, and weather effects remain frozen.

Priority: P0 boundary protection, P2 visual alignment only through shell-level changes.

### Todos

Current strengths:

- Strong local-first task utility.
- Store and component boundaries are understandable.
- Empty and error states are present.

Current issues:

- `TodosWorkspace.vue` is still a large orchestration component.
- Hero, metrics, composer, and list sections would benefit from shared SectionHeader, SurfaceCard, and form primitives.
- The page has useful density but needs a more intentional premium workspace hierarchy.

Refactor recommendation: P1 after shell/tokens. Do not migrate business state in Stage 13.

### Tools

Current strengths:

- Tools are split by utility with a central workspace.
- Query-driven active tool selection is straightforward.
- Reduced-motion behavior is respected for smooth scroll.

Current issues:

- Tool panel styling uses module-local CSS and should be folded into shared panel/form/output primitives over time.
- The utility switcher and guide are functional but visually closer to a generic dashboard module.
- Tool output, text areas, and fieldsets should become reusable component contracts.

Refactor recommendation: P1 for shared form/output primitives after Stage 13 shell baseline.

### Bookmarks

Current strengths:

- Clear composer, controls, sections, and store separation.
- Pinned and filtered states are understandable.
- Empty states are defensive.

Current issues:

- Page-level hero metrics repeat patterns already seen in Tools and Settings.
- Composer/sidebar sticky behavior should follow a global responsive rule.
- Card/surface treatment should align with a shared ModuleCard and SurfaceCard contract.

Refactor recommendation: P2. Align visually after shared primitives exist.

### Settings

Current strengths:

- Good local-first data model coverage: preferences, exports, backup, clear-data, privacy, and Weather data source settings.
- Confirmation flows and data import/export boundaries are explicit.
- Settings is already split into many supporting components.

Current issues:

- `SettingsWorkspace.vue` is still a high-blast-radius component at about 741 lines.
- Settings contains many custom button, panel, radio, input, and status styles that should become primitives.
- Data source and Weather preference panels touch frozen Weather state and need extra regression care.

Refactor recommendation: P1 for visual primitive adoption; P0 caution around Weather-related settings behavior.

### NotFound

Current strengths:

- Simple, stable, accessible route fallback.
- Provides recovery paths.

Current issues:

- Visually underpowered compared with the rest of the product.
- It should eventually use the same PageShell, EmptyState, and action hierarchy as other states.

Refactor recommendation: P3 after shell and primitives.

### App Shell and Navigation

Current strengths:

- Current shell uses route metadata, skip link, main focus management, top navigation, theme control, and mobile bottom navigation.
- Browser audit found no horizontal overflow at 390px or 1440px across major routes.
- Mobile bottom navigation has a dialog-style More panel and body scroll lock.

Current issues:

- `src/app/layouts` and `src/app/navigation` are the active shell path, while `src/components/layout` still contains older shell components. This creates ownership ambiguity.
- `DESIGN.md` still describes a fixed desktop sidebar, while the current implementation uses top navigation plus mobile bottom navigation.
- Navigation, page spacing, safe-area clearance, and shell surfaces should be formalized before page redesign.

Refactor recommendation: P0 for Stage 13 baseline. This is the correct next implementation area.

## 5. Component and Design System Debt

Existing strengths:

- Tokens exist for color, spacing, typography, radius, motion, focus, z-index, shadows, and surfaces.
- Base primitives exist: `BaseButton`, `BaseCard`, `BaseEmpty`, `BaseError`, `BaseInput`, `BaseSection`, `BaseSkeleton`, `BaseSurface`, `FormField`, `IconButton`, `PageHeader`, and `PageLayout`.
- Route-level layout metadata already exists.

Debt:

- Multiple modules still define their own hero, metric, panel, section, and button-like styles.
- Surface hierarchy is inconsistent across Home, Tools, Bookmarks, Settings, and Weather.
- Typography roles exist as tokens, but page components still compose type treatment ad hoc.
- Form controls are partly primitive-based and partly custom per feature.
- Status, badge, alert, and helper-message patterns need a semantic component layer.
- Old layout components should be deprecated or migrated after the active shell contract is finalized.

Recommended primitive direction:

- `AppShell`
- `PageShell`
- `SectionHeader`
- `SurfaceCard`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `PrimaryButton`
- `IconButton`
- `FormField`
- `SearchInput`
- `StatCard`
- `ModuleCard`
- `ResponsiveNavigation`

## 6. Accessibility and Responsive Audit

Browser smoke audit:

- Routes checked: `/`, `/app`, `/weather`, `/todos`, `/tools`, `/bookmarks`, `/settings`, and a not-found route.
- Viewports checked: 390 x 844 and 1440 x 900.
- Result: all routes returned 200 through Vite preview.
- Result: no horizontal overflow detected.
- Result: no browser console warnings or errors detected.
- Result: every route rendered a `main` element.

Accessibility observations:

- The app has a skip link, route-change focus management, visible focus styles, labels/aria in many controls, and alert/status regions in key states.
- Automated focusable-name heuristics flagged some radio, file, password, and checkbox inputs, but targeted review showed most are label-associated form controls. A full axe-style pass should be part of the implementation stages.
- Mobile bottom navigation and More panel need continued keyboard and screen-reader verification because manual focus trapping is fragile by nature.
- Touch targets are generally reasonable, but Stage 13 should enforce shared minimum target size and spacing rules.

## 7. Performance and Motion Audit

Strengths:

- Reduced motion is considered globally and in tools scrolling.
- Weather includes frozen runtime boundaries and degradation behavior from Stage 11.
- Vite build passes.

Debt:

- The large shared library chunk is a P2 performance follow-up.
- Landing, Weather, and Pixi-related files are large and should be protected from accidental cross-stage churn.
- Motion should be centralized as tokens and utility contracts before adding any new motion layer.
- Stage 13 should not attempt bundle splitting unless the App Shell work directly exposes a P0 issue.

## 8. Recommended Architecture Direction

Recommended direction: lightweight layered architecture first, gradual feature migration later.

Target structure over time:

- `src/app`: app bootstrap, shell, layouts, route-level providers.
- `src/pages`: thin route pages if the team chooses to separate page entries from feature modules.
- `src/features`: feature workflows where reuse crosses route boundaries.
- `src/entities`: stable domain models if shared domain objects grow.
- `src/shared`: UI primitives, layout primitives, shared utilities, constants, and types.
- `src/services`: external/service adapters.
- `src/composables`: shared Vue composables.
- `src/styles`: tokens, themes, motion, reset, and utility contracts.
- `src/i18n`: translation contracts and locale modules.
- `src/assets`: static visual assets.

Do not migrate everything at once. Current `src/modules` is serviceable and should remain the active feature container until shell and shared primitives are stable.

First migration candidates:

- Shared shell/layout primitives.
- Page container and section/header primitives.
- Repeated hero/stat/surface patterns.
- Form/search/control primitives.

Temporary freeze:

- Weather internals.
- Weather assets.
- Weather runtime.
- Large landing animation work unless it directly blocks shell consistency.

## 9. Recommended Visual Direction

Options:

1. Calm personal command center.
2. Premium utility workspace.
3. Weather-rich lifestyle dashboard.

Recommended direction: Premium utility workspace with calm personal command center warmth.

Why this fits LifeBoard:

- LifeBoard is a local-first daily workspace, not a marketing site.
- The product needs repeat-use density, confidence, and clarity more than decorative spectacle.
- Weather can remain the richest visual module while the rest of the app becomes cleaner, more structured, and more commercially credible.

How to avoid a generic template:

- Keep the clay green identity but reduce one-note surfaces.
- Build memorable utility patterns around daily focus, local data confidence, and command-center navigation.
- Use restrained weather richness as a contextual accent rather than letting all pages become animated lifestyle panels.
- Standardize spacing, typography, and component states before adding new visual flourishes.

## 10. Risk List

- Large refactors can cause Weather regression.
- Visual upgrades can break mobile spacing and bottom-nav clearance.
- Over-abstracted primitives can slow product work.
- Introducing complex architecture too early can create migration churn.
- Tokens that are not enforced through components will cause repeated styling work.
- Excess motion can hurt performance and accessibility.
- Chasing visual polish can weaken utility workflows.
- Continuing Weather animation expansion before the whole-site upgrade will delay the main product baseline.

## 11. Stage 13 Proposal

Stage 13 should focus on App Shell, design tokens, and shared primitives baseline.

Allowed:

- Add or organize shared UI primitives.
- Add or refine design token files.
- Unify App Shell and route/page container contracts.
- Unify page spacing and responsive shell behavior.
- Lightly improve navigation layout and interaction.
- Touch Weather only at the outer container level if required by the new shell.

Not allowed:

- Rewrite Weather runtime.
- Change Weather store behavior.
- Change Weather assets.
- Add Weather scenes.
- Introduce complex state-management restructuring.
- Migrate all page business logic in one pass.
- Rework Home, Todos, Tools, Bookmarks, Settings, or Weather internals before shell and tokens are stable.

Recommended Stage 13 acceptance criteria:

- One active App Shell path with documented ownership.
- One PageShell/PageLayout contract used by main app routes.
- Design tokens mapped to component primitives, not just raw CSS variables.
- Mobile 390px route smoke test remains overflow-free.
- Weather page still opens and remains visually stable inside the new shell.

## 12. Freeze Boundary for Weather

Weather remains frozen after Stage 11. During Stage 13 and the whole-site upgrade:

- Only regression fixes are allowed.
- No new Weather animation work is allowed.
- No Xiaomi Weather material analysis or rewrite is allowed.
- No PixiJS runtime rewrite is allowed.
- No approved Weather asset replacement is allowed.

Weather follow-up animation work and Xiaomi Weather analysis should resume only after the whole-site architecture and commercial visual upgrade is complete.

## 13. Allowed Changes From This Audit

This audit authorizes documentation and planning only:

- Add this Stage 12 audit document.
- Update the next upgrade plan with Stage 13 boundaries.
- Update README, PRODUCT, or DESIGN only if a future pass needs to correct clearly outdated plan text.

No source code changes were required by this audit.
