# Next Upgrade Plan

Date: 2026-07-08

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

## Stage 19 Recommended Scope

After the Stage 18 QA baseline is in place, Stage 19 should decide how far to formalize accessibility QA:

- Evaluate whether Playwright should become an explicit dev dependency or remain a documented local runtime requirement.
- Evaluate a small dev-only `axe-core` / `@axe-core/playwright` integration.
- Add stable QA selectors only for localized dialogs, dangerous actions, or workflows that cannot be targeted reliably through semantic selectors.
- Consider machine-readable QA output for CI if this baseline will run outside the desktop environment.
- Keep the Stage 18 route matrix and reduced-motion smoke path intact.
- Keep Weather frozen and smoke it only as a regression boundary.

Do not use Stage 19 to rewrite Weather internals, resume Xiaomi Weather analysis, replace Weather assets, add Weather scenes, restart broad visual redesign, migrate all modules into a new architecture, or change persistence keys for test convenience.

## Stage 20 Recommended Scope

After the Stage 19 QA dependency and CI-output formalization, Stage 20 should decide how to run the baseline in repository automation:

- Add or document a lightweight CI path for `npm ci`, `npm run build`, and `npm run qa:a11y:routes:ci`.
- Define the Playwright Chromium install/cache strategy for CI.
- Decide whether `npm run qa:a11y:routes:json` should be uploaded as a CI artifact.
- Keep axe evaluation separate unless a dedicated report-only stage is approved.
- Keep route QA focused on regression signals instead of expanding into broad product workflow testing.

Do not use Stage 20 to rewrite Weather internals, change Weather store/services/assets/scenes, resume Xiaomi Weather material analysis, start another visual redesign, migrate the whole architecture, or change persistence schemas for test convenience.

## Stage 21 Recommended Scope

After the Stage 20 CI workflow and artifact path are in place, Stage 21 should validate the first remote CI run and only tune the workflow if real CI evidence requires it:

- Confirm the GitHub Actions build and route accessibility QA job runs on push or pull request to `main`.
- Confirm the `route-a11y-summary` artifact is uploaded when the JSON summary exists.
- If Chromium fails because Ubuntu dependencies are missing, switch the install step to `npx playwright install --with-deps chromium`.
- If repeated CI runs are too slow, evaluate Playwright browser caching with keys tied to OS, `package-lock.json`, and Playwright version.
- Keep axe as a separate report-only evaluation unless a dedicated stage approves it.

Do not use Stage 21 to rewrite Weather internals, change Weather store/services/assets/scenes, resume Xiaomi Weather material analysis, start page visual redesign, migrate app architecture, or add broad business workflow tests under the CI-tuning scope.

## Stage 22 Recommended Scope

After the Stage 21 remote CI first-run validation and workflow tuning, Stage 22 should verify the next remote run before expanding QA scope:

- Confirm the adjusted `QA` workflow reaches dependency install, Playwright Chromium install, build, route accessibility QA, JSON summary generation, and artifact upload.
- If install still fails, capture the exact remote error before changing dependencies or scripts.
- If browser install is the new bottleneck, decide whether Playwright browser caching is warranted using OS, `package-lock.json`, and Playwright version as cache key inputs.
- Keep `route-a11y-summary` as the only CI artifact unless a separate reporting stage approves richer output.
- Keep axe evaluation separate and report-only unless explicitly approved.
- Keep Weather frozen and smoke it only as a regression boundary.

Do not use Stage 22 to rewrite Weather internals, change Weather store/services/assets/scenes, resume Xiaomi Weather material analysis, redesign pages, migrate app architecture, or add broad business workflow tests under the CI-verification scope.

## Stage 23 Recommended Scope

After the Stage 22 remote install diagnostics are in place, Stage 23 should use the next remote `QA` run to classify the install failure before changing dependencies or source code:

- Verify `Print tool versions` output for Node, npm, and registry.
- Verify whether `npm ci --dry-run` passes in the `Validate lockfile` step.
- If lockfile validation fails, fix only the package/lock/npm-version issue that the log proves.
- If lockfile validation passes but `npm ci` fails, inspect the exact install stderr before touching cache or dependencies.
- If install passes, continue to Chromium install, build, route QA, JSON summary, and artifact upload verification.
- Keep Playwright browser cache deferred until CI reaches the browser install or QA stage and shows a measured need.
- Keep Weather frozen and smoke it only as a regression boundary.

Do not use Stage 23 to modify Weather internals, resume Xiaomi Weather material analysis, redesign pages, migrate app architecture, add axe, add deployment, or introduce a complex CI matrix under the install-diagnostics scope.

## Stage 24 Recommended Scope

After the Stage 23 diagnostic run confirms the remote workflow stops at `npm ci --dry-run`, Stage 24 should retrieve the missing remote stderr and apply only the smallest proven fix:

- Capture authenticated/manual GitHub Actions logs for `Print tool versions` and `Validate lockfile`.
- Record the exact remote Node, npm, registry, and `npm ci --dry-run` error output.
- If the log proves package/lock mismatch, update only the package metadata or lockfile required by `npm ci`.
- If the log proves npm or Node incompatibility, align the CI runtime or package metadata with the smallest targeted change.
- If the log proves registry, network, or cache behavior, adjust only that CI concern.
- Rerun the remote `QA` workflow until it reaches dependency install, Chromium install, build, route QA, JSON summary generation, and artifact upload.
- Keep Playwright browser cache, axe integration, deployment, and CI matrix expansion deferred until the single baseline workflow passes.
- Keep Weather frozen and smoke it only as a regression boundary.

Do not use Stage 24 to modify Weather internals, resume Xiaomi Weather material analysis, redesign pages, migrate app architecture, expand route QA coverage, add axe, add deployment, or introduce a complex CI matrix before the install failure is resolved.

## Stage 26 Recommended Scope

After the Stage 25 Weather horizontal overflow regression fix, Stage 26 should verify the next remote `QA` workflow run and confirm the expanded Weather route overflow checks stay green:

- Confirm dependency install, Chromium install, build, route QA, JSON summary generation, and artifact upload complete remotely.
- Confirm the Weather route passes the loaded-state overflow checks at the standard route viewports plus the Weather-only 1600px and 1920px viewports.
- If remote CI fails, classify the exact failing step from logs before changing dependencies, workflows, or source.
- Keep the Stage 25 layout fix intact and avoid broad shell or Weather refactors unless the logs prove a regression.

Do not use Stage 26 to modify Weather internals, rewrite PixiJS, replace Weather assets, resume Xiaomi Weather analysis, add new Weather scenes, expand Weather animation, or start a visual redesign.

## Stage 27 Recommended Scope

After the Stage 26 remote CI and Weather overflow baseline is green, Stage 27 should stay small and closeout-focused:

- Preserve the `29/29` route QA baseline as the current regression contract.
- Review whether the remote artifact and local `.qa/route-a11y-summary.json` are sufficient for routine CI diagnosis.
- Document any recurring CI timing, cancellation, or artifact limitations without changing source code.
- Keep Vite large chunk warnings, axe integration, Playwright browser cache, and deployment work as separate future decisions unless there is new measured evidence.
- Keep Weather frozen and treat `/weather` only as a regression boundary.

If the Stage 26 remote CI is not green, Stage 27 should only address the exact failed CI step using logs and should not start new feature, visual, or architecture work.

Do not use Stage 27 to modify Weather internals, rewrite PixiJS, replace Weather assets, resume Xiaomi Weather material analysis, add new Weather scenes, expand Weather animation, add axe, add deployment, or introduce a complex CI matrix.

## Stage 28 Recommended Scope

After the Stage 27 non-Weather visual consistency closeout, Stage 28 should establish a route-level screenshot and design QA evidence baseline before more polish work:

- Add a repeatable Playwright route screenshot script that captures Landing, Home, Weather, Todos, Tools, Bookmarks, Settings, Settings data sources, and NotFound.
- Preserve the current route accessibility QA baseline and use screenshots only as design QA evidence.
- Generate ignored local artifacts under `.qa/route-screenshots/`, including a manifest and summary.
- Keep CI unchanged until screenshot artifact usefulness, runtime, and size are reviewed.
- Keep Weather frozen and treat `/weather` only as a regression boundary.

Do not use Stage 28 to modify Weather internals, rewrite PixiJS, replace Weather assets, resume Xiaomi Weather material analysis, add new Weather scenes, expand Weather animation, start another visual redesign, or start a full architecture migration.

## Stage 29 Recommended Scope

After the Stage 28 screenshot baseline is available, Stage 29 should review the generated visual evidence before making more UI changes:

- Review all 29 route screenshots across mobile, tablet, desktop, and Weather extra-wide viewports.
- Classify visual findings as P0/P1/P2 by route and viewport.
- Identify the smallest non-Weather polish candidates that are backed by screenshot evidence.
- Decide whether screenshot artifacts should be added to CI uploads or kept as local QA output.
- Re-check route accessibility QA before and after any approved polish.
- Keep Weather frozen and use `/weather` only as a regression boundary.

Do not use Stage 29 to modify Weather internals, rewrite PixiJS, replace Weather assets, resume Xiaomi Weather material analysis, add new Weather scenes, expand Weather animation, introduce visual diff infrastructure before manual baseline usefulness is proven, or start a broad redesign without a prioritized issue list.

## Stage 30 Recommended Scope

After the Stage 29 screenshot review, Stage 30 should make the first limited non-Weather visual fixes backed by the issue list:

- Fix `DQA-P1-001`: compress the Settings Data Sources mobile/tablet hero and provider-status summary.
- Fix `DQA-P1-002`: simplify the Tools mobile hero/status strip and make the current tool selector the primary mobile control.
- Fix `DQA-P1-003`: remove the NotFound desktop nested-frame look and keep one clear recovery surface.
- Fix `DQA-P1-004`: reduce Settings mobile overview density before the preference sections.
- Rerun `npm run qa:screenshots:ci` and `npm run qa:a11y:routes:ci` after the changes.
- Keep P2 polish as a later batch unless no P1 work remains.
- Keep Weather frozen and use `/weather` only as a regression boundary.

Do not use Stage 30 to modify Weather internals, Weather store/services/cache/runtime, PixiJS, Weather assets, Xiaomi Weather material analysis, package files, CI workflow, visual diff infrastructure, or a broad all-route redesign.

## Stage 31 Recommended Scope

After the Stage 30 limited P1 visual fixes, Stage 31 should close the loop before any broader polish:

- Re-review the refreshed screenshots for the four Stage 29 P1 issues only.
- Confirm the full local QA matrix remains green after the Stage 30 commit.
- Decide whether remaining P2 screenshot findings should be batched, deferred, or left as accepted limitations.
- Keep `.qa` screenshots as local QA evidence unless a separate CI artifact stage approves uploading them.
- Keep Weather frozen and treat `/weather` only as a regression boundary.

Do not use Stage 31 to modify Weather internals, resume Xiaomi Weather material analysis, add new dependencies, add visual diff infrastructure, change package metadata, migrate architecture, or start a broad all-route redesign.

## Stage 32 Recommended Scope

After Stage 31 closes all four Stage 29 P1 issues, Stage 32 may handle a small P2 batch:

- `DQA-P2-002`: reduce Home desktop empty-state surface weight.
- `DQA-P2-003`: clarify Todos desktop surface hierarchy.
- `DQA-P2-004`: rebalance Bookmarks desktop search/filter priority against the empty content state.
- Keep the batch capped at these three items unless a new P0/P1 regression appears.
- Rerun route screenshot QA and route accessibility QA after the changes.
- Keep Weather frozen and use `/weather` only as a regression boundary.

Do not use Stage 32 to modify Weather internals, resume Xiaomi Weather material analysis, address Vite chunk warnings, add axe, add visual diff infrastructure, change package files, modify CI workflows, or start broad architecture migration.

## Stage 33 Recommended Scope

After the Stage 32 limited P2 polish batch, Stage 33 should close the loop before any new visual or architecture work:

- Re-review regenerated screenshots for `DQA-P2-002`, `DQA-P2-003`, and `DQA-P2-004`.
- Confirm Home desktop empty-state weight, Todos desktop surface hierarchy, and Bookmarks desktop search/filter priority are improved.
- Run the existing build, route accessibility, and screenshot QA matrix without adding dependencies or workflows.
- Keep `.qa` screenshots as ignored local evidence unless a separate artifact stage approves committing or uploading them.
- Keep Weather frozen and use `/weather` only as a regression boundary, including the wide overflow screenshots.

Do not use Stage 33 to modify Weather internals, resume Xiaomi Weather analysis, expand the Weather scene system, change package files, tune CI, address Landing or Settings P2 items, or begin a broad app architecture migration.

## Stage 34 Recommended Scope

After Stage 33 closes the Stage 32 P2 screenshot review, Stage 34 should choose one narrow path:

- Preferred: freeze the current screenshot/design QA baseline in documentation without more UI changes.
- Alternative: address at most the two remaining non-Weather P2 candidates, `DQA-P2-001` Landing tablet preview height and `DQA-P2-005` Settings desktop first-screen density.

Keep `DQA-P2-006` Weather wide as a frozen Weather regression baseline, not a visual refactor target.

Do not use Stage 34 to modify Weather internals, resume Xiaomi Weather analysis, expand Weather animation, change package files, modify CI workflows, add axe, add pixel diff infrastructure, expand dark-mode screenshots, split Vite chunks, or begin broad architecture migration.

## Stage 34 Freeze Result

Stage 34 freezes the current screenshot/design QA baseline in `docs/stage-34-screenshot-design-baseline-freeze.md`.

- Screenshot QA remains green at 29/29.
- Route accessibility QA remains green at 29/29.
- `npm run build`, `npm run qa:design`, and `npm run qa` pass locally.
- The Vite large chunk warning remains an accepted non-blocking P2.
- `.qa` screenshots, manifest, summary, and contact sheet remain local ignored artifacts.
- P0: 0 open.
- P1: all four Stage 29 P1 items remain closed.
- P2: `DQA-P2-002`, `DQA-P2-003`, and `DQA-P2-004` remain closed; `DQA-P2-001` and `DQA-P2-005` are deferred non-blocking items.
- `DQA-P2-006` remains a Weather freeze note, not a visual refactor target.

## Stage 35 Recommended Scope

After the Stage 34 screenshot/design baseline freeze, Stage 35 should prefer repository synchronization over more UI work:

- Push the Stage 34 freeze commit.
- Verify the remote `QA` workflow.
- Add a baseline tag after remote CI is green, for example `screenshot-design-baseline-freeze-stage-34`.

If the user explicitly chooses to continue UI work instead, keep Stage 35 limited to the two remaining non-Weather P2 candidates:

- `DQA-P2-001`: Landing tablet preview height.
- `DQA-P2-005`: Settings desktop first-screen density.

Do not use Stage 35 to modify Weather internals, Weather assets, Weather runtime, Weather store or services, Xiaomi weather analysis, PixiJS, package files, CI workflows, axe, pixel diff, dark mode screenshot expansion, Vite chunk splitting, or broad architecture migration.

## Stage 36 Result

Stage 36 closed the two remaining non-Weather P2 visual polish candidates:

- `DQA-P2-001`: Landing tablet preview height at `768x1024`.
- `DQA-P2-005`: Settings desktop first-screen density at `1440x900`.

Weather remained frozen and was used only as a route QA and screenshot regression boundary. `DQA-P2-006` remains a Weather freeze note, not a visual refactor target.

## Stage 37 Recommended Scope

After the Stage 36 limited polish pass, Stage 37 should close the loop before any new visual or architecture work:

- Re-review the regenerated screenshots for `DQA-P2-001` and `DQA-P2-005`.
- Confirm `npm run build`, route accessibility QA, screenshot QA, and design QA remain green.
- Freeze the current non-Weather visual baseline if no new P0/P1 issue appears.
- Keep `.qa` screenshots as ignored local evidence unless a separate artifact stage approves uploading them.
- Keep Weather frozen and use `/weather` only as a regression boundary.

Do not use Stage 37 to modify Weather internals, resume Xiaomi Weather analysis, add new dependencies, add pixel-diff infrastructure, expand dark-mode screenshots, split Vite chunks, change package or workflow files, or begin broad architecture migration.

## Stage 37 Final Freeze Result

Stage 37 freezes the current non-Weather visual baseline after re-reviewing the refreshed 29-route screenshot matrix.

- `DQA-P2-001` is closed.
- `DQA-P2-005` is closed.
- P0 open count remains 0.
- Stage 30 P1 items remain closed.
- Stage 32 P2 items remain closed.
- Screenshot QA remains 29/29.
- Route accessibility QA remains 29/29.
- Weather remains frozen and `DQA-P2-006` remains a freeze note, not a visual refactor target.

## Stage 38 Recommended Scope

Preferred Stage 38 is repository synchronization and remote confidence for the final non-Weather visual freeze:

- Push the Stage 37 freeze commit if it is not already remote.
- Add a final freeze tag after push, for example `non-weather-visual-freeze-stage-37`.
- Verify the remote `QA` workflow after synchronization.

Alternative Stage 38 only if the user explicitly changes direction:

- Return to product feature work or architecture planning.

Do not use Stage 38 for more UI small fixes, Weather visual refactor, Weather animation expansion, Xiaomi weather material analysis, Vite chunk splitting, axe integration, dark-mode screenshot expansion, pixel-diff infrastructure, package changes, workflow changes, or broad architecture migration unless the user explicitly opens that scope.

## Stage 38 Remote Sync Result

Stage 38 verifies the final non-Weather visual freeze against remote repository evidence:

- Local `main`, `origin/main`, and GitHub API `main` resolve to Stage 37 commit `b59018d`.
- `non-weather-visual-freeze-stage-37` exists locally and remotely as a lightweight tag targeting `b59018d`; it was not moved or recreated.
- GitHub Actions run `29035725355` exactly targets `b59018d` and completed successfully.
- Lockfile validation, dependency install, Playwright Chromium install, build, route QA, summary generation, and artifact upload all passed.
- The downloaded remote summary reports 29/29 route-viewports, zero failures, and zero console errors.
- Local build, route QA, and screenshot QA also pass; `.qa` artifacts remain ignored and uncommitted.
- No source, Weather, package, workflow, or QA script file changed.

The Stage 38 documentation-only commit is pushed after this record is written. Its exact remote QA run is verified in the final Stage 38 handoff without amending the documentation and creating a self-referential run loop.

## Stage 39 Recommended Scope

After the Stage 38 documentation commit is confirmed green remotely:

- End the continuous non-Weather UI polish sequence.
- Return to an explicitly approved product feature or architecture workstream.
- Use the frozen route, accessibility, and screenshot baselines as regression contracts.
- Keep Weather regression-only.

Do not automatically open Weather visual work, Xiaomi weather material analysis, Vite chunk splitting, axe integration, dark-mode screenshot expansion, or pixel-diff infrastructure. Each requires a separate scope decision.

## Stage 39 Audit Result

Stage 39 completes the post-visual-freeze product and architecture audit in `docs/stage-39-post-visual-freeze-product-architecture-roadmap.md`.

- The current route/module architecture is suitable for incremental feature growth; a repository-wide migration is not recommended.
- Local persistence, JSON backup/restore, and portable exports already work, but ownership, export classifications, schema versions, migrations, and corrupt-data recovery are not unified.
- Existing Todo/Bookmark CSV and Markdown exports should be hardened and tested, not reimplemented.
- Calendar is the first recommended new product module after data portability closes. Notes follows; Habits waits for proven date/rollover semantics.
- Command registry/palette waits until new module routes stabilize. Backend/account/sync remains trigger-based and deferred.
- The only recommended Stage 40 is **Data Portability Architecture Audit and Contract**. It is a specification stage, not feature or UI implementation.

## Stage 40-48 Roadmap Overview

- Stage 40: Data Portability Architecture Audit and Contract.
- Stage 41: Persistence Registry / Schema Version Foundation.
- Stage 42: JSON Backup Export Hardening.
- Stage 43: Validated JSON Import and Rollback Hardening.
- Stage 44: Portable Todo / Bookmark CSV and Markdown Export Closeout.
- Stage 45: Data Portability Closeout and QA.
- Stage 46: Calendar Product / Architecture Spec.
- Stage 47: Calendar MVP.
- Stage 48: Calendar Integration / Closeout.

Each stage requires separate authorization. Weather remains regression-only and excluded from persistence migration, visual work, animation expansion, runtime rewrite, asset changes, and Xiaomi Weather material analysis.

## Stage 40 Contract Result

Stage 40 freezes the data-portability architecture contract in `docs/stage-40-data-portability-architecture-audit-contract.md`.

Accepted decisions:

- `DP-ADR-001` through `DP-ADR-010` establish one typed product persistence registry, a discriminated portable root schema with independent module versions, explicit legacy adapters, strict validation, Language portability, Weather cache/credential exclusions, Replace-only import, in-memory rollback, distinct content/factory-reset policies, and human-readable CSV/Markdown exports that are not restore formats.
- The inventory contains 11 product LocalStorage keys plus one developer-only Weather debug flag. The product registry covers the 11 product keys; the debug flag remains outside portability/reset/sync.
- Portable backup format v1 includes Theme, Language, selected/favorite Weather locations, Todos/Countdowns, and Bookmarks. Provider/device preferences, credentials, caches, runtime state, and QA data remain excluded.
- Current legacy backup root versions 1 and 2 remain import candidates through explicit adapters. Unknown or future versions are rejected before writes.
- Merge, persistent rollback journals, backend sync, encryption/signatures, and new Weather work remain deferred.

## Stage 41-45 Contract Overview

- Stage 41: Persistence Registry / Schema Version Foundation. Add typed registry/schema/validator/migration contracts and the minimal unit fixture harness while preserving behavior.
- Stage 42: JSON Backup Export Hardening. Emit the new portable format and include Language without changing import.
- Stage 43: Validated JSON Import and Rollback Hardening. Support current plus legacy formats through Replace, read-back verification, and rollback; no Merge.
- Stage 44: CSV / Markdown Export Contract and Test Closeout. Harden existing formats; do not rebuild them.
- Stage 45: Data Portability Closeout and QA. Align registry-driven factory reset, Language coverage, store synchronization, and the support matrix.

## Stage 41 Foundation Result

Stage 41 is implemented and documented in `docs/stage-41-persistence-registry-schema-version-foundation.md`.

- A pure TypeScript registry classifies exactly 11 product LocalStorage keys; the Weather runtime debug flag remains excluded.
- Root/module portable schema constants, envelope types, validation/migration/serializer/storage interfaces, readonly selectors, metadata-only plans, and registry integrity checks are established.
- Vitest `4.1.10` is the only new dev dependency. The Node-only suite passes 45/45 tests, and the existing build, route accessibility, and screenshot QA baselines remain green.
- No current export, import, clear, store, service, UI, router, workflow, QA script, or Weather production path is wired to the foundation.

The only recommended next stage is **Stage 42: JSON Backup Export Hardening**, under a separate authorization. Stage 42 may emit the approved portable format from validated serializers, but must not implement import writes, rollback, Merge, clear/reset rewiring, CSV/Markdown changes, or Weather internal changes.

## Stage 42 Export Hardening Result

Stage 42 is implemented and documented in `docs/stage-42-json-backup-export-hardening.md`.

- A pure TypeScript, registry-driven `PortableBackupV1` exporter, strict DTO validation, deterministic UTF-8 serialization, fixed filename/MIME metadata, a 1 MiB limit, and redacted structured errors are ready.
- Language is included in the portable foundation. Weather remains limited to selected and favorite locations; caches, credentials, provider/device preferences, runtime state, debug data, assets, and rendering code remain excluded.
- The current production importer accepts only legacy backup roots v1/v2 and rejects the new portable envelope. A compatibility-gate test proves this boundary.
- The new exporter is therefore not wired into Settings. Production download remains legacy v2 until the same release can restore `PortableBackupV1`.
- The persistence unit suite passes 76/76 tests, and existing build, route accessibility, and screenshot QA baselines remain green.

## Stage 43 Import Hardening Result

Stage 43 is implemented and documented in `docs/stage-43-validated-json-import-rollback-hardening.md`.

- Production Settings export and import now share the validated `PortableBackupV1` contract.
- Strict current-format import and explicit legacy v1/v2 adapters feed one canonical Replace-only transaction.
- Exact raw snapshots, deterministic writes, per-key read-back, reverse rollback, rollback verification, and public store synchronization are covered by the persistence suite.
- Clear-all, CSV/Markdown exports, non-portable Weather data, Weather internals, dependencies, workflows, and QA scripts remain unchanged.
- Unit, build, accessibility, screenshot, design, and targeted browser QA baselines are green; the existing Vite chunk warning remains non-blocking.

## Stage 44 Text Export Closeout Result

Stage 44 is implemented and documented in `docs/stage-44-csv-markdown-export-contract-test-closeout.md`.

- Todo exports include active/completed non-deleted tasks plus all Countdowns; soft-deleted tasks remain JSON-backup-only. Bookmark exports include all saved fields, categories, notes, and pin state.
- CSV is frozen as UTF-8 with BOM, CRLF, stable English columns, deterministic order, RFC-style quoting, and formula-injection protection for user text.
- Markdown is frozen as UTF-8 without BOM, LF, localized stable sections, safe HTTP/HTTPS links, Markdown escaping, and raw HTML neutralization.
- Summary Markdown retains Todo/Countdown/Bookmark content but no longer reads or exports Weather data.
- Unit tests pass 168/168. Production download, bilingual, empty-data, mobile keyboard, route, screenshot, and design QA remain green.

The only recommended next stage is **Stage 45: Factory Reset / Language Coverage / Data Portability Closeout and QA**, under separate authorization. Stage 45 may align registry-driven reset coverage and Language handling, but must not add Merge, reopen CSV/Markdown features, change JSON schemas, redesign Settings, or modify Weather internals.

## Stage 45 Data Portability Closeout Result

Stage 45 is implemented and documented in `docs/stage-45-factory-reset-language-data-portability-closeout.md`.

- `Clear user content` is a registry-driven four-key transaction that removes saved user content while preserving Theme, Language, Weather cache/provider/credentials, and auto-location.
- `Factory reset` is a registry-driven 11-key transaction that removes every registered product key and synchronizes runtime stores to browser defaults.
- Both paths use exact raw snapshots, deterministic remove plans, immediate absence verification, reverse rollback, rollback verification, store hydration verification, and a shared concurrency guard.
- Developer debug and unregistered storage remain excluded; `localStorage.clear()` is never used.
- Bilingual previews and confirmations state counts, preference impact, and that no automatic backup is created.
- The Node-only persistence unit suite is promoted into the QA workflow before Playwright installation, with no package or lockfile change.
- Weather internals, JSON/CSV/Markdown contracts, routes, QA scripts, dependencies, and the frozen visual baseline remain unchanged.

After the Stage 45 validation matrix is green, data portability is closed and becomes regression-only. The only recommended next stage is **Stage 46: Calendar Product / Architecture Spec**, under separate authorization. Stage 46 must remain specification-only and must not reopen portability or Weather scope.

## Weather Follow-up Queue

- Weather regression fixes only during the whole-site upgrade.
- Weather animation rewrite planning after the whole-site upgrade.
- Xiaomi Weather material analysis after the whole-site upgrade.

## Stage 46 Calendar Architecture Result

Stage 45 Data Portability is frozen and regression-only. Stage 46 accepts **Option B: Read-only Calendar Aggregation MVP** and records the complete product/data contract in `docs/stage-46-calendar-product-architecture-spec.md`.

- The only next stage is **Stage 47: Read-only Calendar Aggregation MVP**.
- Stage 47 adds no storage key and does not change the persistence registry, PortableBackup, import, clear/reset, Home, or Weather.
- Stage 47 derives Calendar entries from existing Todo due dates and Countdown target dates; source records remain authoritative.
- Native Calendar Events, `lifeboard.calendar`, registry 11-to-12 expansion, PortableBackupV2, clear/reset expansion, and bounded Home integration are deferred to Stage 48.
- Weather remains frozen and regression-only.
