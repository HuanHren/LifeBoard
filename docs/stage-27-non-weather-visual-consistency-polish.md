# Stage 27 Non-Weather Visual Consistency Polish

Date: 2026-07-09

Status: complete. This stage is a closeout polish and audit pass for non-Weather routes. Weather remains frozen and was treated only as a regression boundary through the existing QA route suite.

## Skill Gate Summary

Read from `C:\Users\jingr\codex-skills`:

- `impeccable\SKILL.md`
- `gpt-taste\SKILL.md`
- `redesign-existing-projects\SKILL.md`
- `baseline-ui\SKILL.md`
- `vue-best-practices\SKILL.md`
- `fixing-accessibility\SKILL.md`
- `fixing-motion-performance\SKILL.md`
- `playwright-cli\SKILL.md`

Additional references read:

- `impeccable\reference\audit.md`
- `impeccable\reference\polish.md`
- `impeccable\reference\layout.md`
- `impeccable\reference\adapt.md`
- `impeccable\reference\harden.md`
- `impeccable\reference\product.md`
- `gpt-taste\references\visual-taste.md`
- `redesign-existing-projects\references\audit.md`
- `baseline-ui\references\baseline-ui.md`
- `vue-best-practices\references\reactivity.md`
- `vue-best-practices\references\sfc.md`
- `vue-best-practices\references\component-data-flow.md`
- `vue-best-practices\references\composables.md`
- `playwright-cli\references\running-code.md`
- `playwright-cli\references\playwright-tests.md`

The project-local impeccable context script was not present at `.agents\skills\impeccable\scripts\context.mjs`, so `PRODUCT.md`, `DESIGN.md`, the design tokens, and the existing shared primitives were read directly.

## Scope

Audited routes:

- `/`
- `/app`
- `/todos`
- `/tools`
- `/bookmarks`
- `/settings`
- `/settings/data-sources`
- `/missing-route-stage-18`

Audited viewports:

- `390x844`
- `768x1024`
- `1440x900`
- `1600x900`
- `1920x1080`

Explicitly out of scope:

- Weather page source changes.
- Weather store, service, assets, runtime, scenes, PixiJS layer, or animation expansion.
- Package, lockfile, CI workflow, or QA script changes.
- Broad visual redesign or architecture migration.

## Baseline

- Branch: `main`.
- Baseline working tree: clean.
- Local branch state at the final Stage 27 closeout pass: ahead of `origin/main` by one local Stage 27 commit.
- Stage 26 Weather overflow baseline is present in history and the Weather-only wide viewport route QA remains part of the existing regression contract.
- Stage 25 Weather overflow fix commit `775eac2` is present in history.
- Stage 26 remote CI cleanup commit `4d09e49` is present in history.

## Audit Result

The non-Weather route DOM audit passed across all required viewports:

- No horizontal overflow was detected.
- Each route had exactly one visible `h1`.
- Each route rendered exactly one `main` landmark.
- Console errors were not observed during the route smoke pass.
- Active navigation was present on app routes; NotFound intentionally has no active nav item.

The final closeout rerun covered 40 route-viewports: 8 non-Weather routes across 5 viewport sizes. All passed the overflow, `h1`, `main`, and console-error checks.

`/settings` and `/settings/data-sources` show two active navigation elements at mobile/tablet sizes because both responsive navigation surfaces can be present in the DOM. This is currently non-blocking because the standard route QA baseline still passes and desktop resolves to one visible active item.

## Applied Fixes

Problems found and fixed:

- Added a `page-shell__header-copy` wrapper class and `min-width: 0` guard so PageLayout header copy can shrink beside actions without text-driven overflow.
- Tokenized `BaseEmpty` and `BaseError` action cluster spacing through `--control-cluster-gap`.
- Added the shared `control-focus` class to NotFound recovery links.
- Fixed Settings Data Sources note sections so privacy and licence copy use the intended section heading and body styles; also aligned Data Sources links/buttons with shared focus and interactive states.

Problems intentionally deferred:

- A shared link-button primitive is still missing for RouterLink-style actions.
- Mobile/tablet Settings routes can expose two visible active navigation entries because multiple responsive navigation surfaces can be present in the DOM.
- Landing remains the most bespoke page visually; future consolidation should preserve its marketing role instead of forcing it into a generic card stack.

## Page Findings

### Landing

The landing route keeps its stronger marketing-style composition, but it now passes the route smoke matrix without overflow at mobile, tablet, desktop, 1600px, and 1920px widths. Motion-sensitive content remains covered by the existing reduced-motion audit path.

Remaining P2 debt: the landing route still has the most bespoke visual CSS in the app. Future work should consolidate only repeated primitives, not flatten the page into generic cards.

### Home

Home is visually stable after the earlier primitive adoption. The workspace hero, status rail, focus panel, Weather summary, and quick access grid hold their layout across the Stage 27 viewports.

Remaining P2 debt: Home still mixes several local hero/rail styles with shared primitives. Do not touch Weather summary behavior unless a regression is proven.

### Todos

Todos has stable hero metrics, task composer, filters, list, countdown side panel, and persistence error handling. The route has no measured overflow at the audited widths.

Remaining P2 debt: the hero and metric rail remain page-local. A later pass can reduce duplication with Bookmarks/Tools if it does not affect task logic.

### Tools

Tools keeps clear tablist semantics, a stable tool workspace, and responsive local utility panels. Route smoke did not find overflow or console errors.

Remaining P2 debt: tool panel internals still have their own CSS layer. That is acceptable until there is a dedicated utility-tool primitive pass.

### Bookmarks

Bookmarks has stable hero metrics, composer, controls, empty states, and bookmark sections. Shared empty/error components are now slightly closer to the tokenized spacing contract.

Remaining P2 debt: composer and controls remain page-specific because they carry business behavior.

### Settings

Settings remains the densest non-Weather route. The main settings page passes the audited viewports and keeps dialog, file input, local data, provider preferences, and clear-data workflows under the existing QA route baseline.

Remaining P2 debt: Settings still uses local button styles for RouterLink actions because `BaseButton` does not currently expose a link mode.

### Settings Data Sources

Data Sources was the only page with a clear visual consistency issue: privacy and licence note sections had stale selectors, so their headings/body copy did not receive the intended local section styling. Stage 27 fixed that and added shared focus/interactive classes to its navigation/action links.

Remaining P2 debt: the page still has verbose local CSS because the data-source row layout is specialized.

### NotFound

NotFound already had a compact recovery state through `BaseEmpty`. Stage 27 added shared focus styling to the two recovery links.

Remaining P2 debt: NotFound still uses manually styled RouterLinks because there is no shared link-button primitive yet.

### App Shell / Navigation

The App Shell baseline remains stable. The Stage 27 audit did not find route-level horizontal overflow. The PageLayout header copy now has a shrink guard for tighter action/header combinations.

Remaining P2 debt: mobile and desktop navigation both appear in DOM in some responsive states, which can produce multiple visible `aria-current` matches in a simple DOM audit. It is non-blocking because route QA passes, but Stage 28 should review the responsive navigation contract before adding broader visual changes.

## Visual Consistency Notes

Current product direction remains a calm personal command center with restrained surfaces, clay-green accents, compact utility workflows, and weather-rich context. Non-Weather routes are now consistent enough to move into a larger token/component refinement pass without blocking on obvious page polish.

Do not convert every route to the same card stack. The next pass should preserve useful differences between dashboard, utility, collection, and settings workflows while tightening token usage and link/button primitives.

## Accessibility Notes

Stage 27 kept the existing route accessibility baseline intact:

- Main landmark, skip-link target, h1 count, active navigation, form labels, tablist semantics, dialog behavior, and reduced-motion smoke remain covered by `npm run qa:a11y:routes`.
- NotFound recovery links now use the same focus-ring utility as other interactive controls.
- Data Sources links/buttons now use the same focus-ring utility and interactive transition class.

Known non-blocking item:

- Mobile/tablet Settings routes can expose two visible `aria-current="page"` matches because responsive navigation surfaces overlap in the DOM. No route QA failure is produced by the current script.

## Performance And Motion Notes

No new dependencies, animation systems, Weather effects, or runtime layers were added. Existing build output still reports Vite/Rolldown chunk size warnings. These remain P2 and should not be addressed by broad refactors in this closeout stage.

## Stage 28 Proposal

Stage 28 should be a small design-system follow-up, not a broad rewrite:

Allowed:

- Add or refine a shared link-button primitive if it can replace manual RouterLink button styles in Settings, Data Sources, NotFound, and Landing without changing route behavior.
- Review responsive navigation visibility and `aria-current` behavior.
- Continue token cleanup for repeated local hero/action/link styles.
- Preserve the current route QA baseline.

Not allowed:

- Modify Weather internals, store, services, assets, runtime, scenes, PixiJS layer, or animation plan.
- Resume Xiaomi Weather material analysis.
- Replace approved Weather assets.
- Introduce new large dependencies.
- Change package, lockfile, or CI workflow unless a verified P0/P1 regression appears.
- Start a full architecture migration or broad visual redesign.

## Validation

Required validation for Stage 27:

- `npx npm@11.18.0 ci --dry-run`
- `npm ci --dry-run`
- `npm run build`
- `npm run qa:a11y:routes`
- `npm run qa:a11y:routes:ci`
- `npm run qa:a11y:routes:json`
- `npm run qa:a11y:routes:json:file`
- `npm run qa`

The custom non-Weather viewport audit also covered the Stage 27 routes at `390x844`, `768x1024`, `1440x900`, `1600x900`, and `1920x1080`.
