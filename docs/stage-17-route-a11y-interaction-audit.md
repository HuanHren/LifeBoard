# Stage 17 Route Accessibility and Interaction Audit

Date: 2026-07-07

Status: completed. This stage was limited to route-level accessibility, interaction semantics, and regression verification. Weather remains frozen and was smoke-tested only.

## Baseline

- Branch: `main`
- Baseline status before edits: clean working tree, up to date with `origin/main`.
- Current HEAD before this stage: `d614250 fix(a11y): harden states and form interactions`, tagged `state-a11y-stage-16`.
- Prior freeze and upgrade markers present: `weather-freeze-stage-11`, `architecture-audit-stage-12`, `app-shell-tokens-stage-13`, `bookmarks-settings-stage-15`, `state-a11y-stage-16`.
- Stage 14 primitive adoption commit is present in history: `cb812ac refactor(pages): adopt primitives for home todos tools`; no Stage 14 tag was present.

## Scope

Audited routes:

- `/`
- `/app`
- `/weather`
- `/todos`
- `/tools`
- `/bookmarks`
- `/settings`
- `/settings/data-sources`
- unknown route fallback

Audited viewports:

- 1440 x 900
- 768 x 1024
- 390 x 844

Weather boundary:

- No Weather source, store, runtime, scene, asset, or motion implementation was changed.
- Weather was checked as a frozen regression boundary only.

## Build Result

`npm run build` passed after the fixes.

Non-blocking warning:

- Vite/Rolldown still reports one chunk above 500 kB: the large `lib-*.js` vendor chunk.
- This warning is known from prior stages and remains a P2 follow-up for later bundling work.

The project currently defines no `lint` or `test` script in `package.json`.

## Audit Method

Because `axe-core` was not available locally and no new audit dependency was authorized for this stage, the audit used Playwright with DOM and keyboard checks against the production preview.

Checks covered:

- HTTP 200 route load.
- Single visible `main` landmark per route.
- Single visible `h1` per route.
- Skip link presence and focus transfer to `#main-content`.
- Visible heading order without level jumps.
- Visible focusable controls with accessible names.
- Visible form controls with labels or equivalent names.
- Active route and state semantics.
- Dialog naming and modal semantics.
- Tablist selected and roving-tabindex semantics.
- 390 px horizontal overflow.
- Console/page errors.
- Reduced-motion preview context.

## Route Results

All 27 route and viewport combinations passed after fixes:

- 9 routes x 3 viewports.
- No missing main landmark.
- No duplicate or missing visible `h1`.
- No skip-link focus failure.
- No visible unnamed focusable controls.
- No visible unlabeled form controls.
- No heading-level jumps.
- No horizontal overflow at 390 px.
- No page or console errors during smoke.

## Fixes Applied

### App Shell and Navigation

- `LayoutResolver` now restores focus to `main` only when `route.path` changes.
- This prevents same-page query changes, such as Tools tab changes, from stealing focus away from the active control.
- Mobile More navigation trigger now declares `aria-haspopup="dialog"` to match the modal panel it opens.

### Landing

- The landing product preview tablist now uses roving tabindex.
- Only the active demo tab is in the normal Tab order.

### Tools

- Tool navigation now supports roving tabindex and arrow-key tab switching.
- `ArrowRight` / `ArrowDown`, `ArrowLeft` / `ArrowUp`, `Home`, and `End` move selection and focus.
- The active tool workspace is now a `tabpanel` labelled by the active tool tab.

### Todos

- Task filters now use `aria-pressed` instead of `aria-current="page"`.
- The filter buttons represent an in-page toggle state, not navigation to a new page.

### Settings

- The confirmation dialog now has `aria-labelledby` and `aria-describedby`.
- The existing focus trap, cancel handling, acknowledgement checkbox, and focus return behavior were kept.

## Interaction Regression

Targeted Playwright checks passed:

- Tools: arrow-key tab switch moves selection to `tool-tab-timestamp`, keeps focus on the selected tab, and leaves exactly one tab with `tabindex="0"`.
- Mobile app navigation: More opens a `role="dialog"` panel, moves focus into the panel, closes on Escape, and returns focus to the More button.
- Weather: mobile smoke confirmed one `main`, one `h1`, no horizontal overflow, and no console errors.

Settings destructive dialog runtime opening was not triggered by the English-label probe in the current localized UI, so the dialog component was verified by DOM/source audit and build.

## Known Non-blocking Issues

- No local axe dependency is available. A formal axe pass should wait until a small dev-only audit dependency is approved.
- The known Vite/Rolldown chunk-size warning remains a P2 performance follow-up.
- Settings destructive dialog should be included in a future localized interaction script with stable test hooks or route-specific selectors.

## Stage 18 Recommendation

Stage 18 should continue from this stable accessibility baseline rather than starting a new visual or architecture rewrite.

Allowed:

- Add a small, project-approved accessibility audit script if a dev-only dependency such as `axe-core` is accepted.
- Add stable test hooks only where they improve audit reliability without changing UX.
- Expand Playwright smoke coverage for dialogs, menus, filters, tablists, search, import/export, and dangerous actions.
- Keep verifying 390 px, 768 px, and 1440 px viewports.
- Keep Weather smoke-only unless a regression is found.

Not allowed:

- Do not rewrite Weather internals.
- Do not change Weather store, assets, PixiJS runtime, scenes, or motion system.
- Do not resume Xiaomi Weather material analysis.
- Do not start another broad visual redesign under the name of accessibility testing.
- Do not migrate all modules into a new architecture in one pass.

Weather remains frozen. Only regression fixes are allowed.
