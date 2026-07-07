# Stage 19 QA Dependency and CI Output

Date: 2026-07-07

Status: completed. Stage 19 formalizes the Stage 18 route accessibility QA runner for repeatable local and CI use.

## 1. Baseline

- Branch: `main`.
- Starting workspace: clean.
- Starting commit: `2e85bd5 test(a11y): add route accessibility regression baseline`.
- Stage 18 tag present: `a11y-qa-baseline-stage-18`.
- Weather freeze tag present: `weather-freeze-stage-11`.
- The work is after Stage 11 through Stage 18 and keeps Weather frozen.

## 2. Build Baseline

Command:

```powershell
npm run build
```

Result: passed.

Known non-blocking warnings:

- Vite/Rolldown reports plugin timing details.
- Vite reports a chunk larger than 500 kB.

Both warnings are existing P2 follow-up items and were not handled in this QA formalization stage.

## 3. Dependency Decision

Playwright is now an explicit project dev dependency.

Reason:

- Stage 18 depended on a workstation-local Playwright runtime probe.
- CI and fresh machines need a declared dependency in `package.json`.
- The project already uses a Playwright script, so the dependency matches existing behavior rather than introducing a new framework.

Lockfile:

- `package-lock.json` is updated by `npm install -D playwright`.

Fresh machine note:

```powershell
npm install
npx playwright install chromium
```

Run the browser install only when Chromium is missing in the target environment.

## 4. Axe Decision

Axe is not added in Stage 19.

Reason:

- Stage 19 is a dependency and CI-output formalization stage, not a new accessibility-rule adoption stage.
- Adding `axe-core` or `@axe-core/playwright` would introduce another failure class and triage policy.
- The current runner already checks the route-level contracts created in Stages 17 and 18.

Recommended later evaluation:

- Add axe only in a dedicated QA stage.
- Start with report-only or clearly triaged severity thresholds.
- Keep route smoke checks separate from axe checks so one noisy rule does not hide route regressions.

## 5. QA Script Improvements

Script:

```powershell
scripts/qa-route-a11y.mjs
```

Changes:

- Uses project-installed `playwright` first.
- Keeps `PLAYWRIGHT_NODE_PATH` only as an explicit override for unusual local runtimes.
- Removes the hard-coded local npx cache path.
- Adds CI mode through `--ci` or `CI=true`.
- Adds JSON mode through `--json`.
- Prints one concise PASS/FAIL line per route and viewport in text mode.
- Emits final totals for route-viewports, failures, console errors, and duration.
- Emits structured JSON with status, route matrix, viewport matrix, checks, limitations, results, and failures.
- Keeps non-zero exit code on any route, console, semantic, or interaction failure.
- Keeps automatic preview start and owned-preview cleanup.
- Keeps `QA_BASE_URL` support for an externally managed preview.

## 6. Package Scripts

Available commands:

```powershell
npm run qa:a11y:routes
npm run qa:a11y:routes:ci
npm run qa:a11y:routes:json
npm run qa
```

`npm run qa` remains:

```powershell
npm run build && npm run qa:a11y:routes
```

## 7. Stable Selector and Test Hook Decision

Stable QA hooks were added only where semantic or localized selectors were unreliable:

- `data-qa="settings-clear-weather-button"`
- `data-qa="settings-clear-todos-button"`
- `data-qa="settings-clear-bookmarks-button"`
- `data-qa="settings-clear-all-button"`
- `data-qa="settings-confirmation-dialog"`
- `data-qa="settings-confirmation-acknowledgement"`
- `data-qa="settings-confirmation-cancel-button"`
- `data-qa="settings-confirmation-confirm-button"`

Reason:

- Stage 17 documented that Settings destructive dialog runtime opening was not reliable through localized text probing.
- These hooks are stable test contracts, not styling hooks.
- They do not change behavior, persistence, copy, layout, Weather state, or visual design.

## 8. Settings Dialog Coverage

The route QA script now verifies the Settings destructive confirmation path by using an isolated browser context:

- Seeds one local test bookmark in the route context.
- Reloads Settings so the existing store and UI read normal local storage.
- Opens the clear-all confirmation dialog.
- Verifies the dialog opens.
- Verifies `aria-labelledby` and `aria-describedby`.
- Verifies initial focus moves to the cancel button.
- Verifies the all-data dialog requires acknowledgement before confirm.
- Cancels the dialog.
- Verifies the dialog closes.
- Verifies focus returns to the triggering clear-all action.

The script does not confirm the destructive action.

## 9. Route Coverage

Routes remain unchanged from Stage 18:

- `/`
- `/app`
- `/weather`
- `/todos`
- `/tools`
- `/bookmarks`
- `/settings`
- `/settings/data-sources`
- `/missing-route-stage-18`

Viewports:

- `390x844`
- `768x1024`
- `1440x900`

Total:

- 27 route-viewports.

## 10. Regression Boundary

Weather remains frozen.

No changes were made to:

- Weather store.
- Weather service.
- Weather runtime.
- PixiJS layer.
- Weather scene logic.
- Weather assets.
- Xiaomi Weather material analysis.

Weather is still covered only as a frozen route smoke boundary: page opens, semantic shell remains valid, no overflow, no console/page errors, controls are present, and canvas layers do not block pointer interaction.

## 11. Known Limitations

- Axe is not integrated.
- Route QA is still smoke-level and does not prove every business workflow.
- Browser binaries may need `npx playwright install chromium` on a fresh CI image.
- JSON output is intended for CI parsing; it does not store screenshots, traces, or large artifacts.
- The Vite large chunk warning remains a P2 bundle follow-up.

## 12. Stage 20 Recommendation

Stage 20 should focus on CI documentation and optional repository workflow preparation, not new UI work.

Allowed:

- Add a lightweight CI workflow that runs `npm ci`, `npm run build`, and `npm run qa:a11y:routes:ci`.
- Document browser install/cache strategy for Playwright Chromium.
- Decide whether JSON output should be uploaded as an artifact.
- Evaluate axe in a separate report-only branch or stage.

Not allowed:

- Rewrite Weather internals.
- Change Weather store, assets, scenes, or PixiJS runtime.
- Resume Xiaomi Weather material analysis.
- Start another visual redesign under QA scope.
- Migrate all app modules or persistence schemas for test convenience.
