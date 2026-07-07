# Stage 14 Home Todos Tools Primitive Adoption

Date: 2026-07-07

Status: implemented and ready for regression review.

## Baseline

- Branch: `main`.
- Stage 11 Weather freeze tag is present: `weather-freeze-stage-11`.
- Stage 12 audit tag is present: `architecture-audit-stage-12`.
- Stage 13 shell and token baseline tag is present: `app-shell-tokens-stage-13`.
- Pre-change workspace was clean and up to date with `origin/main`.

## Scope

Stage 14 adopts the Stage 13 primitive baseline in Home, Todos, and Tools only.

Allowed changes were limited to:

- Home page and Home page-level components.
- Todos page-level workspace and task presentation components.
- Tools page-level workspace and tool presentation components.
- Directly related shared/base primitives.
- Documentation and next-stage planning notes.

Explicitly out of scope:

- Weather internals, store, service, runtime, PixiJS layer, scenes, and assets.
- Xiaomi Weather material analysis.
- Todos store, CRUD behavior, filters, persistence, and data model.
- Tools algorithms, copy behavior, and input/output conversion behavior.
- Bookmarks, Settings, Landing, NotFound, and global architecture rewrites.

## Changes

- Added `StatCard` as a small shared primitive for repeated metric cards.
- Extended `BaseSurface` to support `as="header"` for semantic page hero surfaces.
- Adopted `BaseSurface`, `SectionHeader`, and `StatCard` in Home hero and Home sections.
- Adopted `BaseSurface`, `SectionHeader`, and `StatCard` in Todos hero, overview metrics, and task list section heading.
- Reused global `surface-card` styling in Todos composer and task list presentation.
- Adopted `BaseSurface`, `SectionHeader`, and `StatCard` in Tools hero, navigation panel, active tool panel, and guide panel.
- Replaced Tools text-area error side stripe with a full alert surface.
- Replaced Tools navigation active side stripe with a full focus-style ring.

## Regression Notes

Home:

- Dashboard shell, today focus, next-up, quick access, and Home weather summary retain their existing data flow.
- Home weather summary still imports and uses the Weather store exactly as before; only the outer section title primitive changed.

Todos:

- Task creation, task validation, expansion of optional fields, filter switching, list rendering, countdown rendering, and persistence error retry flow are unchanged at the store and utility level.
- The page-level hero, overview metrics, composer surface, and task list surface now share baseline primitives.

Tools:

- Tool selection, URL query sync, keep-alive tool workspace, JSON formatting, text utilities, timestamp utility, copy, and clear behavior remain unchanged.
- Presentation surfaces and status states now align with the shared primitive baseline.

Weather:

- No Weather source files were changed.
- Weather remains frozen and only eligible for regression fixes.

## Build Result

`npm run build` passed after the implementation.

Known non-blocking warning:

- Vite reports a chunk larger than 500 kB after minification. This warning existed before Stage 14 and remains a P2 bundle-splitting follow-up, not a blocker for this stage.

## Responsive And Accessibility Review

- Home, Todos, and Tools continue to use responsive grid collapse rules at mobile breakpoints.
- Section titles now use a shared `SectionHeader` primitive, improving heading consistency.
- Todos composer retains labels, descriptions, validation errors, `aria-invalid`, and live announcements.
- Tools text areas retain labels, helper text, `aria-describedby`, and alert errors.
- Tools active navigation no longer relies on a side stripe and uses full border/background/ring state.
- No animation-heavy or new motion system was introduced.

## Known Non-Blocking Issues

- Vite large chunk warning should be handled in a later performance/bundle pass.
- Bookmarks and Settings still need page-level primitive adoption in a later stage.
- Some older module copy and spacing patterns remain outside Home/Todos/Tools and were intentionally not touched.

## Stage 15 Recommendation

Stage 15 should continue controlled primitive adoption rather than start a full rewrite.

Recommended Stage 15 scope:

- Bookmarks page primitive adoption.
- Settings page primitive adoption.
- Shared empty/error/loading state consistency pass.
- Form and search primitive consistency pass.
- Light responsive verification across all routes.
- Preserve Weather freeze boundary.

Stage 15 should not:

- Rewrite Weather runtime, store, service, or assets.
- Start Xiaomi Weather material analysis.
- Migrate the full source tree at once.
- Introduce a new state architecture.
- Replace all page visuals in a single pass.
