# Stage 23 Remote CI Diagnostics and npm ci Result

Date: 2026-07-07

Status: diagnostic complete with remote log access limitation. No source, Weather, workflow, dependency, or lockfile changes were made in this stage.

## Baseline

- Branch: `main`.
- Stage 22 diagnostic commit pushed for remote validation: `06b11145e40c66b5bd7c7f55f426c28c064451b7`.
- Working tree before documentation updates: clean.
- `origin/main` was updated by pushing `06b1114 ci(qa): stabilize remote install diagnostics`.
- Weather remains frozen and out of scope except for regression verification.

## Skill Gate Summary

The Stage 23 gate read the required local skill files from `C:\Users\jingr\codex-skills` before project work:

- `impeccable\SKILL.md`
- `gpt-taste\SKILL.md`
- `redesign-existing-projects\SKILL.md`
- `baseline-ui\SKILL.md`
- `vue-best-practices\SKILL.md`
- `fixing-accessibility\SKILL.md`
- `fixing-motion-performance\SKILL.md`
- `playwright-cli\SKILL.md`

Additional references required by the selected skills were also read:

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
- `playwright-cli\references\running-code.md`
- `playwright-cli\references\playwright-tests.md`

## Scope

Stage 23 was limited to verifying the remote diagnostic run, classifying the install failure, validating local reproducibility, and documenting the next safe step.

Not changed:

- Weather source, store, services, assets, runtime, and animation behavior.
- App source code.
- QA route matrix.
- Playwright/axe coverage.
- GitHub Actions workflow.
- `package.json` or `package-lock.json`.
- Deployment, Pages, or release configuration.

## Remote Diagnostic Run Result

- Workflow: `QA`.
- Trigger: push to `main`.
- Run ID: `28876441465`.
- Job ID: `85652684929`.
- Commit: `06b11145e40c66b5bd7c7f55f426c28c064451b7`.
- Commit title: `ci(qa): stabilize remote install diagnostics`.
- Created: `2026-07-07T15:02:59Z`.
- URL: `https://github.com/HuanHren/LifeBoard/actions/runs/28876441465`.
- Conclusion: failure.

The run did use the Stage 22 diagnostic commit. It reached the diagnostic setup steps but stopped before dependency installation.

## Tool Versions / Lockfile Validation

Observed remote step states:

- `Set up job`: success.
- `Checkout`: success.
- `Setup Node`: success.
- `Print tool versions`: success.
- `Validate lockfile`: failure.
- `Install dependencies`: skipped.
- `Install Playwright Chromium`: skipped.
- `Build`: skipped.
- `Route accessibility QA`: skipped.
- `Write route accessibility summary`: skipped.
- `Upload route accessibility summary`: success, but no artifact was available.

The successful `Print tool versions` step proves that the diagnostic lines ran, but the actual Node, npm, and registry values were not readable from the available API/page access.

The `Validate lockfile` step failed with exit code 1. Because that step runs `npm ci --dry-run`, the remote run failed before the real `npm ci` install step.

## npm ci Failure Diagnosis

Current classification: unresolved remote lockfile validation failure.

The failure is not yet safely attributable to a specific package, registry, npm version, cache state, or lockfile mismatch because the remote `npm ci --dry-run` stderr was not accessible in this environment.

Evidence collected:

- Local `npm ci --dry-run` passed.
- Local `npm ci` passed.
- `package-lock.json` has lockfile version 3.
- Root dependency metadata matches the lockfile for Playwright:
  - `package.json`: `@playwright/test` `^1.61.1`
  - `package-lock.json`: `@playwright/test` `1.61.1`
  - `package-lock.json`: `playwright-core` `1.61.1`
- The workflow uses Node `22.18.0`.
- There is no `packageManager` or `engines` field in `package.json`.

Do not change dependencies, lockfile, Node version, npm pinning, or cache behavior until the remote stderr is visible.

## Logs Readability Limitation

GitHub job log retrieval through the available API returned:

- HTTP status: `403`
- Message: `Must have admin rights to Repository.`

Opening the job page showed a sign-in requirement for logs. Check-run annotations only exposed:

- A Node.js 20 deprecation warning for GitHub action runtime internals.
- `Validate lockfile` failed with exit code 1.

The Node.js 20 deprecation warning targets action runtime behavior for `actions/checkout`, `actions/setup-node`, and `actions/upload-artifact`. It is not evidence that `npm ci --dry-run` failed because of package installation state.

## Manual Log Retrieval Steps

To finish root-cause classification, retrieve the raw step output from the GitHub UI with an authenticated account that can view logs:

1. Open `https://github.com/HuanHren/LifeBoard/actions/runs/28876441465`.
2. Open the `Build and route accessibility QA` job.
3. Expand `Print tool versions`.
4. Copy the exact `node --version`, `npm --version`, and `npm config get registry` output.
5. Expand `Validate lockfile`.
6. Copy the full `npm ci --dry-run` stderr and exit context.
7. If a later rerun reaches installation, also expand `Install dependencies` and copy the full `npm ci` stderr.

## Workflow / Package Inspection

Current `.github/workflows/qa.yml` diagnostic structure:

- Uses `actions/setup-node@v4` with Node `22.18.0`.
- Enables npm cache.
- Prints Node, npm, and registry.
- Runs `npm ci --dry-run` in `Validate lockfile`.
- Runs `npm ci` in `Install dependencies`.
- Installs Chromium with `npx playwright install --with-deps chromium`.
- Uploads `.qa/route-a11y-summary.json` when available.

Current package state:

- `package-lock.json` exists.
- Lockfile version is 3.
- Root package dependencies and lock entries are locally consistent.
- No package or lockfile edit is justified by the available evidence.

## Workflow / Package Changes Made

None.

This stage intentionally avoided changing workflow, package metadata, lockfile, or CI scripts because the exact remote `npm ci --dry-run` stderr was not readable.

## Local Reproduction Result

Local validation on Windows passed:

- `npm ci --dry-run`: pass.
- `npm ci`: pass, 127 packages installed, 0 vulnerabilities.
- `npm run build`: pass.
- `npm run qa:a11y:routes`: pass, 27/27 route-viewports.
- `npm run qa:a11y:routes:ci`: pass, 27/27 route-viewports.
- `npm run qa:a11y:routes:json`: pass, 27/27 route-viewports, JSON status `PASS`.
- `npm run qa:a11y:routes:json:file`: pass on isolated rerun, 27/27 route-viewports, `.qa/route-a11y-summary.json` written.
- `npm run qa`: pass.

One concurrent local run of `npm run qa:a11y:routes:json:file` failed once with `/app` tablet returning 404 while `npm run qa` was running in parallel. The isolated rerun passed. Treat this as a local parallel preview contention signal, not an app regression.

## Build and QA Result

Build passed with non-blocking warnings:

- `PLUGIN_TIMINGS` reported build plugin time distribution.
- Vite/Rolldown reported chunks larger than 500 kB after minification.

These warnings are known P2 follow-up items and do not block Stage 23.

Route QA passed across mobile, tablet, and desktop after isolated rerun.

## Artifact Status

Remote artifact status:

- `route-a11y-summary` was not available because the remote run stopped at `Validate lockfile`.
- The upload step completed but had no generated `.qa/route-a11y-summary.json` to upload.

Local artifact status:

- `.qa/route-a11y-summary.json` was generated successfully by the isolated local JSON file run.
- `.qa/` remains ignored and was not staged.

## Weather Freeze Boundary

Weather remains frozen.

Allowed during this CI diagnostic track:

- Build and route QA smoke coverage that includes `/weather`.
- Documentation of CI results and Weather regression boundary.

Not allowed:

- Weather runtime rewrites.
- Weather store/service changes.
- Weather asset changes.
- New Weather scenes.
- Xiaomi Weather material analysis.
- PixiJS runtime changes.

## Known Limitations

- Remote raw logs were not readable from the available unauthenticated/API access.
- The exact remote Node/npm/registry values are unknown despite the step succeeding.
- The exact `npm ci --dry-run` stderr is unknown.
- Remote CI did not reach dependency installation, Chromium installation, build, route QA, JSON summary generation, or artifact creation.
- The local Windows environment cannot reproduce the remote `Validate lockfile` failure.

## Stage 24 Recommendation

Stage 24 should stay focused on remote install log capture and a minimal evidence-based fix.

Allowed:

- Retrieve authenticated/manual logs for `Print tool versions` and `Validate lockfile`.
- If logs prove package/lock mismatch, update only `package-lock.json` or package metadata required to restore `npm ci`.
- If logs prove npm version incompatibility, align npm or Node in the smallest workflow/package change.
- If logs prove registry/network/cache behavior, adjust only that CI concern.
- Rerun remote QA until the workflow reaches install, Chromium, build, route QA, JSON summary, and artifact upload.

Not allowed:

- Weather source changes.
- Weather asset/runtime changes.
- App visual redesign.
- New route QA matrix expansion.
- axe integration.
- Deployment/Page setup.
- Complex CI matrix work before the single baseline path is healthy.
