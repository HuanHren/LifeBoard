# Next Upgrade Plan

Date: 2026-07-07

Status: planning only. No source implementation is authorized by this document.

## Sequence

1. Keep the current Weather module frozen.
2. Allow Weather changes only for regression fixes.
3. Start the next workstream with whole-site architecture upgrade and commercial-grade visual refactor.
4. Unify the global design system, route/page layout contracts, responsive behavior, and motion rules across Home, Todos, Tools, Bookmarks, Settings, Landing, and shared app shell.
5. After the whole-site upgrade is complete, schedule Weather follow-up animation work.
6. Resume Xiaomi Weather material analysis and any Weather effect rewrite only after the whole-site upgrade is complete.

## Weather Boundary

Do not continue Weather animation expansion during the whole-site upgrade. Do not add new Weather scenes, replace approved Weather assets, rewrite the Pixi runtime, or introduce a new Weather motion engine unless a separate Weather unfreeze decision is made.

## Upgrade Focus

- Whole-site architecture upgrade.
- Commercial-grade visual refactor.
- Global design token and component contract cleanup.
- Page-level visual consistency.
- Responsive layout and interaction consistency.
- Motion system consolidation with reduced-motion support.
- Weather regression preservation against `docs/weather-module-freeze-baseline.md`.

## Stage 13 Entry Scope

Start with the smallest global baseline that can safely support later page-level visual work:

- App Shell / layout contract cleanup.
- Design tokens baseline for color, spacing, typography, radius, shadow, motion, z-index, and semantic states.
- Shared primitives baseline for page shells, section headers, surfaces, empty/error/loading states, buttons, icon buttons, form fields, search input, stats, and module cards.
- Navigation and page container consistency across desktop and mobile.
- Weather outer-container compatibility only where required by the global shell.

Do not use Stage 13 to rewrite Weather internals, Weather store state, PixiJS runtime, Weather assets, page business logic, or all modules at once.

## Stage 14 Recommended Scope

After the shell, token, and primitive baseline is established, Stage 14 should start page-level adoption in a controlled order:

- Apply PageShell header/action slots, SectionHeader, and Surface primitives to Home, Todos, and Tools first.
- Convert only repeated hero, stat, panel, and form patterns that clearly benefit from shared primitives.
- Keep page business logic, stores, and service behavior unchanged.
- Keep Weather frozen; only maintain outer-shell compatibility and regression fixes.

Do not use Stage 14 for Weather runtime work, Xiaomi Weather material analysis, a full-page redesign of every module, or a one-shot source tree migration.

## Stage 15 Recommended Scope

After Home, Todos, and Tools adopt the primitive baseline, Stage 15 should continue the same controlled adoption pattern:

- Apply shared primitives to Bookmarks and Settings.
- Normalize shared empty, error, loading, search, and form states where they are already present.
- Keep page business logic and stores unchanged unless a P0/P1 regression is found.
- Smoke test Home, Weather, Todos, Tools, Bookmarks, Settings, and NotFound after the adoption pass.
- Keep Weather frozen; only outer shell compatibility or regression fixes are allowed.

Do not use Stage 15 to rewrite Weather internals, start Xiaomi Weather material analysis, migrate all business modules at once, or introduce a new app-wide state architecture.

## Stage 16 Recommended Scope

After Bookmarks and Settings adopt the primitive/status baseline, Stage 16 should be a focused hardening pass:

- Verify status component edge cases across Home, Todos, Tools, Bookmarks, Settings, and NotFound.
- Polish secondary route states, especially Settings data sources and NotFound, if they lag behind the main app surfaces.
- Check radio groups, file input, confirmation dialog, route focus, and live-region feedback for accessibility consistency.
- Run preview smoke at 390px, 768px, and 1440px.
- Keep Weather frozen and limited to regression fixes.

Do not use Stage 16 to rewrite Weather internals, resume Xiaomi Weather analysis, replace Weather assets, add Weather scenes, migrate all modules into a new source architecture, or introduce a new global state layer.

## Stage 17 Recommended Scope

After the Stage 16 state and accessibility hardening pass, Stage 17 should remain regression-led:

- Run a deeper route-level accessibility audit, ideally with axe or an equivalent tool if a small dev-only audit dependency is approved.
- Verify dialog, radio group, file input, toolbar, search, empty, error, loading, and notice semantics across all app routes.
- Simplify remaining Settings data source local CSS only where it reduces duplication without changing provider behavior.
- Keep preview smoke at 390px, 768px, and 1440px.
- Keep Weather frozen and smoke it only as a regression boundary.

Do not use Stage 17 to rewrite Weather internals, resume Xiaomi Weather analysis, add Weather scenes, replace Weather assets, migrate all modules into a new architecture, or redesign pages beyond verified accessibility and state edge-case fixes.

## Stage 18 Recommended Scope

After the Stage 17 route-level accessibility and interaction audit, Stage 18 should turn the verified manual audit into a repeatable regression baseline:

- Add or document a small accessibility audit runner only if a dev-only dependency is explicitly approved.
- Expand Playwright smoke coverage for route landmarks, headings, skip links, focus return, dialogs, mobile menus, tablists, filters, and form states.
- Add stable test hooks only where localized text makes important dangerous-action or dialog tests unreliable.
- Keep 390px, 768px, and 1440px coverage.
- Keep Weather frozen and smoke it only as a regression boundary.

Do not use Stage 18 to rewrite Weather internals, resume Xiaomi Weather analysis, replace Weather assets, add Weather scenes, restart broad visual redesign, or migrate all modules into a new architecture in one pass.

## Weather Follow-up Queue

- Weather regression fixes only during the whole-site upgrade.
- Weather animation rewrite planning after the whole-site upgrade.
- Xiaomi Weather material analysis after the whole-site upgrade.
