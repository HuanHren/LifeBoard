# Stage 30 Limited P1 Non-Weather Visual Fixes

Date: 2026-07-09

Status: implemented and regression-validated.

## Baseline

- Branch: `main`.
- Initial working tree: clean.
- Local branch state: aligned with `origin/main`; no local-only commits before this stage.
- Starting point: `ccf0b7d` / `screenshot-design-review-stage-29`, after the Stage 29 screenshot design QA review.

## Skill Gate

The Stage 30 gate read the required skill files from `C:\Users\jingr\codex-skills`:

- `impeccable\SKILL.md`
- `gpt-taste\SKILL.md`
- `redesign-existing-projects\SKILL.md`
- `baseline-ui\SKILL.md`
- `vue-best-practices\SKILL.md`
- `fixing-accessibility\SKILL.md`
- `fixing-motion-performance\SKILL.md`
- `playwright-cli\SKILL.md`

Additional references read because the skill files required or routed to them:

- `impeccable\reference\polish.md`
- `impeccable\reference\layout.md`
- `impeccable\reference\adapt.md`
- `impeccable\reference\product.md`
- `vue-best-practices\references\reactivity.md`
- `vue-best-practices\references\sfc.md`
- `vue-best-practices\references\component-data-flow.md`
- `vue-best-practices\references\composables.md`
- `playwright-cli\references\running-code.md`
- `playwright-cli\references\playwright-tests.md`

## Scope

Only the four Stage 29 P1 non-Weather findings were targeted:

- `DQA-P1-001`: Settings Data Sources mobile/tablet hero and provider-status summary were too heavy.
- `DQA-P1-002`: Tools mobile hero stats and tool picker were too dense.
- `DQA-P1-003`: NotFound desktop had a strong outer focus frame plus an inner recovery card.
- `DQA-P1-004`: Settings mobile overview status cards were too heavy before the preference sections.

Weather stayed frozen. No Weather source, Weather assets, PixiJS runtime, package metadata, lockfile, CI workflow, or QA screenshot artifact files were intentionally changed.

## Changes

- `src/modules/settings/pages/DataSourcesPage.vue`
  - Replaced heavy hero `StatCard` usage with compact semantic `dl` facts.
  - Added mobile spacing reductions and tablet four-column fact layout.
  - Kept detailed active configuration cards unchanged below the hero.

- `src/modules/settings/components/SettingsWorkspace.vue`
  - Replaced mobile-heavy hero `StatCard` usage with compact semantic `dl` facts.
  - Reduced mobile hero spacing without changing settings data or actions.

- `src/modules/tools/components/ToolsWorkspace.vue`
  - Replaced hero stat cards with compact semantic facts.
  - Changed mobile facts from compressed three-column cards to a calmer two-plus-one layout.

- `src/modules/tools/components/ToolNavigation.vue`
  - Reduced mobile tab minimum width and index size so the tool picker reads as the primary control without crowding.
  - Kept tablist roles, roving focus, and selection behavior unchanged.

- `src/modules/not-found/NotFoundPage.vue`
  - Replaced nested `BaseEmpty` recovery card with a single `BaseSurface` recovery panel.
  - Preserved the `h1`, description, and two navigation actions.

- `src/app/layouts/MinimalLayout.vue`
  - Added a `minimal-main` class to the programmatically focused main landmark.

- `src/assets/styles/main.css`
  - Matched `MinimalLayout` focus handling to the app layout so route focus does not render a full-page outline in screenshots.

## Visual Verification

Reviewed the refreshed target screenshots:

- `.qa/route-screenshots/settings-data-sources__mobile__390x844.png`
  - Hero facts are compact; the next section is visible in the first viewport.

- `.qa/route-screenshots/settings-data-sources__tablet__768x1024.png`
  - Provider status is a single compact row; current configuration remains below as the detailed state.

- `.qa/route-screenshots/tools__mobile__390x844.png`
  - Hero facts are less dense; the tool selector is visible and reads as the next primary control.

- `.qa/route-screenshots/not-found__desktop__1440x900.png`
  - The large outer green focus frame is removed; the route now presents one recovery panel.

- `.qa/route-screenshots/settings__mobile__390x844.png`
  - Overview facts are lighter and preference content starts earlier.

## QA Results

Full Stage 30 QA matrix:

- `npx npm@11.18.0 ci --dry-run`: pass.
- `npm ci --dry-run`: pass.
- `npm run build`: pass.
- `npm run qa:a11y:routes`: pass, `29/29`, console errors `0`.
- `npm run qa:a11y:routes:ci`: pass, `29/29`, console errors `0`.
- `npm run qa:a11y:routes:json`: pass, status `PASS`.
- `npm run qa:a11y:routes:json:file`: pass, status `PASS`.
- `npm run qa`: pass.
- `npm run qa:screenshots`: pass, `29/29`.
- `npm run qa:screenshots:ci`: pass, `29/29`.
- `npm run qa:design`: pass.

Vite chunk size warnings remain non-blocking and pre-existing.

## Weather Freeze Boundary

Weather remains frozen. Stage 30 did not modify Weather store, services, runtime, PixiJS layer, assets, scenes, cache keys, or data-provider logic. Weather appears only in screenshot and QA route coverage as a regression boundary.

## Known Limitations

- P2 and deferred Stage 29 findings remain out of scope.
- Vite large chunk warnings remain non-blocking and are not addressed in this limited visual pass.
- Screenshot artifacts remain ignored local QA output; this stage does not add visual diff infrastructure or CI screenshot uploads.

## Stage 31 Recommendation

Stage 31 should be a post-fix regression closeout and P2 triage gate:

- Compare the refreshed Stage 30 screenshot set against the Stage 29 P1 issue list.
- Confirm the full QA matrix is repeatable after the commit.
- Decide whether P2 visual polish is worth a small follow-up batch.
- Keep Weather frozen and continue treating it only as a regression boundary.

Do not use Stage 31 to resume Weather animation work, Xiaomi Weather material analysis, dependency expansion, visual diff infrastructure, or broad architecture migration unless a separate stage explicitly authorizes it.
