# Stage 18 Accessibility Regression Baseline

Date: 2026-07-07

Status: completed. Stage 18 turns the Stage 17 route-level accessibility audit into a repeatable local QA baseline.

## 1. Baseline

- Branch: `main`.
- Starting workspace: clean.
- Starting commit: `3435e61 fix(a11y): audit route interactions and semantics`.
- Stage 17 tag present: `route-a11y-stage-17`.
- The baseline is after Stage 11 Weather freeze, Stage 12 audit, Stage 13 shell/tokens/primitives, Stage 14 Home/Todos/Tools primitive adoption, Stage 15 Bookmarks/Settings primitive adoption, Stage 16 state accessibility hardening, and Stage 17 route accessibility audit.

Weather remains frozen. This stage did not change Weather source, Weather store, Weather services, Weather runtime, PixiJS, Weather assets, scenes, or Xiaomi Weather analysis.

## 2. Skill Gate Summary

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
- `impeccable\reference\product.md`
- `impeccable\reference\harden.md`
- `impeccable\reference\interaction-design.md`
- `vue-best-practices\references\sfc.md`
- `vue-best-practices\references\component-data-flow.md`
- `vue-best-practices\references\component-slots.md`
- `vue-best-practices\references\component-fallthrough-attrs.md`
- `vue-best-practices\references\composables.md`
- `vue-best-practices\references\reactivity.md`

The project-local impeccable context script was not present at `.agents\skills\impeccable\scripts\context.mjs`, so task-relevant references were read directly.

## 3. Scope

Implemented:

- A repeatable route-level accessibility smoke script.
- Package scripts for route accessibility QA and full QA.
- Documentation for scope, dependency decisions, known limits, and Stage 19.

Not implemented:

- No source UI refactor.
- No business logic change.
- No Weather source change.
- No new dependency.
- No axe integration.

## 4. Dependency Decision

No dependency was added.

Decision:

- Use Playwright when available from the existing local runtime.
- Do not add `axe-core` or `@axe-core/playwright` in Stage 18.
- Do not introduce a new e2e framework.

Reason:

- Stage 17 already proved that the route-level smoke audit can run with the existing local Playwright runtime.
- The project does not currently list Playwright or axe in `package.json`.
- The Stage 18 goal is a repeatable baseline with minimal dependency churn.

## 5. QA Script Path

Script:

```powershell
scripts/qa-route-a11y.mjs
```

The script:

- Starts `npm run preview` automatically unless `QA_BASE_URL` is provided.
- Finds a free local port starting at `QA_PREVIEW_PORT` or `4173`.
- Runs headless Chromium through the existing Playwright runtime.
- Uses a fresh browser context for every route and viewport.
- Uses `prefers-reduced-motion: reduce`.
- Cleans up the preview process it starts.
- Emits clear PASS/FAIL output with route, viewport, check, and reason.

## 6. Package Scripts Added

Added:

```json
"qa:a11y:routes": "node scripts/qa-route-a11y.mjs",
"qa": "npm run build && npm run qa:a11y:routes"
```

Usage:

```powershell
npm run qa:a11y:routes
npm run qa
```

Optional environment:

```powershell
$env:QA_BASE_URL = "http://127.0.0.1:4173"
npm run qa:a11y:routes
```

When `QA_BASE_URL` is set, the script connects to an existing preview and does not start or stop one.

## 7. Routes Covered

- `/`
- `/app`
- `/weather`
- `/todos`
- `/tools`
- `/bookmarks`
- `/settings`
- `/settings/data-sources`
- `/missing-route-stage-18`

## 8. Viewports Covered

- `390x844`
- `768x1024`
- `1440x900`

Total route-viewports:

- 9 routes x 3 viewports = 27 checks.

## 9. Automated Checks

Common checks for every route and viewport:

- Page opens with HTTP status below 400.
- Page is not blank.
- Exactly one `main` landmark exists.
- `main` has `id="main-content"`.
- `main` is a focus target with `tabindex="-1"`.
- Exactly one visible `h1` exists.
- The visible `h1` has non-empty text.
- Skip link exists and targets `#main-content`.
- Skip link focus moves to `#main-content`.
- No horizontal overflow beyond a 1 px tolerance.
- Visible focusable controls have accessible names.
- Visible form controls have labels or equivalent names.
- Invalid controls have an error description.
- No obvious visible heading jumps.
- Tablist widgets have one selected tab and one tabbable tab.
- Visible dialogs have an accessible name.
- Custom `role="dialog"` elements are modal.
- App routes expose visible active navigation with `aria-current="page"`.
- Console errors and uncaught page exceptions fail the run.
- Browser context uses reduced motion.

## 10. Route-specific Checks

Home:

- Verifies visible main action links or buttons exist.

Weather:

- Verifies visible Weather controls exist.
- Verifies canvas elements do not receive pointer events.
- Verifies controls are not covered by decorative layers.
- Keeps Weather as a smoke-only frozen boundary.

Todos:

- Verifies the task title input exists and can receive focus.
- Verifies task filter buttons exist.
- Verifies exactly one filter uses `aria-pressed="true"`.

Tools:

- Verifies tool tablist exists.
- Verifies arrow-key navigation changes the active tab.
- Verifies only one tab has `tabindex="0"`.
- Verifies active workspace has `role="tabpanel"`.
- Verifies JSON formatting produces output.
- Verifies invalid timestamp input exposes `role="alert"`.

Bookmarks:

- Verifies bookmark search input exists.
- Verifies search input has a label or accessible name.
- Verifies category/filter controls exist.

Settings:

- Verifies Settings controls exist.
- Verifies file inputs have a label.

Settings data sources:

- Verifies visible data source links or labelled rows exist.
- Verifies labelled status/link elements exist.

NotFound:

- Verifies recovery links or buttons exist.

## 11. Data Isolation Strategy

- Each route and viewport runs in a fresh Playwright browser context.
- The script does not use a persistent browser profile.
- The script does not delete or rewrite real browser data.
- The script does not change storage keys.
- Route-specific interactions stay inside the isolated context.
- No screenshots, traces, videos, or large temporary artifacts are produced by default.

## 12. Console Error Policy

The script fails on:

- `pageerror`.
- Browser `console.error`.
- Route load failures.
- Blank page output.

The script does not fail on:

- Build-time Vite/Rolldown chunk warnings.
- Non-error console warnings.
- TCP `TIME_WAIT` entries after preview cleanup.

If future provider/network noise causes false positives, add an explicit documented filter for that known source rather than silently ignoring all console errors.

## 13. Axe Decision

Stage 18 does not integrate axe.

Reason:

- `axe-core` and `@axe-core/playwright` are not project dependencies.
- Adding them was explicitly deferred unless already available or separately approved.

Recommendation:

- Evaluate a dev-only axe integration in Stage 19 or a standalone QA stage.
- Keep any future axe check scoped and triaged so low-priority contrast noise does not block unrelated development.

## 14. Weather Freeze Boundary

Weather remains frozen.

No changes were made to:

- Weather store.
- Weather service.
- Weather runtime.
- PixiJS layer.
- Weather assets.
- Weather scene selection.
- Xiaomi Weather material analysis.

The Stage 18 QA script only verifies that the Weather route remains accessible, responsive, and not blocked by decorative layers.

## 15. Build Result

Baseline and final builds passed with:

```powershell
npm run build
```

Known non-blocking warning:

- Vite/Rolldown reports a chunk larger than 500 kB.
- This remains an accepted P2 follow-up and was not addressed in Stage 18.

## 16. QA Script Result

Command:

```powershell
npm run qa:a11y:routes
```

Result:

```text
PASS route accessibility regression baseline (27/27 route-viewports)
```

The script cleaned up its preview process. Only normal TCP `TIME_WAIT` entries remained after the run.

## 17. Known Limitations

- Playwright is consumed from the existing local runtime, not from `package.json`.
- No axe automation is included yet.
- Settings destructive dialog runtime coverage still depends on stable selectors or test hooks in a future stage.
- The script does not deeply validate every business workflow.
- Route-specific selectors are intentionally smoke-level and should stay stable unless corresponding UI contracts change.
- Vite large chunk warning remains P2.

## 18. Stage 19 Recommendation

Recommended Stage 19 scope:

- Decide whether to add a small dev-only Playwright dependency or document the required local runtime more formally.
- Evaluate dev-only `axe-core` / `@axe-core/playwright` integration.
- Add stable QA selectors only for hard-to-target localized dangerous actions or dialogs.
- Add optional CI-friendly output if this baseline will run outside the local desktop environment.
- Keep the route matrix and Weather frozen smoke boundary intact.

Stage 19 should not:

- Rewrite Weather internals.
- Resume Xiaomi Weather material analysis.
- Replace Weather assets.
- Add Weather scenes.
- Restart broad visual redesign.
- Migrate all modules into a new architecture.
- Change business persistence keys or store schemas for test convenience.
