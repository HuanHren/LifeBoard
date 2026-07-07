# Stage 21 Remote CI First Run

Date: 2026-07-07

Status: remote CI first-run validation and small workflow adjustment. No application source, Weather source, Weather store, Weather services, Weather runtime, or Weather assets were changed.

## Baseline

- Branch: `main`
- Initial worktree: clean
- Remote: `origin https://github.com/HuanHren/LifeBoard.git`
- Initial sync state: `main` was up to date with `origin/main`
- Initial local commits ahead of `origin/main`: none
- Stage 20 baseline: `7e6f84e ci(qa): add accessibility regression workflow`
- Stage 20 tag present: `ci-qa-stage-20`
- Weather freeze tag present: `weather-freeze-stage-11`

## Skill Gate Summary

The Stage 21 gate read the required local skill files from `C:\Users\jingr\codex-skills` before project work:

- `impeccable\SKILL.md`
- `gpt-taste\SKILL.md`
- `redesign-existing-projects\SKILL.md`
- `baseline-ui\SKILL.md`
- `vue-best-practices\SKILL.md`
- `fixing-accessibility\SKILL.md`
- `fixing-motion-performance\SKILL.md`
- `playwright-cli\SKILL.md`

Additional required references read:

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

Stage 21 validated the remote GitHub Actions workflow introduced in Stage 20 and made only CI-focused adjustments required by first-run evidence.

Allowed in this stage:

- Inspect the remote QA workflow run.
- Verify workflow trigger, job, install, build, route accessibility QA, and artifact behavior.
- Make small `.github/workflows/qa.yml` adjustments if CI evidence justifies them.
- Run local build and QA commands.
- Record the findings and Stage 22 recommendation.

Not allowed in this stage:

- Weather source changes.
- Weather animation or asset work.
- Business logic changes.
- Page visual redesign.
- Full architecture migration.
- Broad dependency additions.

## Remote CI Result

Remote workflow lookup was performed through the GitHub REST API because `gh` is not installed in the local PowerShell environment.

Remote run inspected:

- Workflow: `QA`
- Run ID: `28873400553`
- Event: `push`
- Commit: `7e6f84e458513afab35f4863a4fa9c775629eb31`
- Display title: `ci(qa): add accessibility regression workflow`
- Status: `completed`
- Conclusion: `failure`
- URL: `https://github.com/HuanHren/LifeBoard/actions/runs/28873400553`

Job inspected:

- Job: `Build and route accessibility QA`
- Job ID: `85641896013`
- Conclusion: `failure`

Step result summary:

- `Checkout`: success
- `Setup Node`: success
- `Install dependencies`: failure
- `Install Playwright Chromium`: skipped
- `Build`: skipped
- `Route accessibility QA`: skipped
- `Write route accessibility summary`: failure
- `Upload route accessibility summary`: success

Artifact result:

- No `route-a11y-summary` artifact was present for this failed first run.
- This is expected because dependency installation failed before the JSON summary could be generated.

## Remote CI Read Limitation

The unauthenticated GitHub REST API exposed run, job, step, and artifact metadata, but log download returned `403 Must have admin rights to Repository`. Because of that limitation, the exact `npm ci` stderr from the remote runner could not be read locally.

The available metadata is still enough to classify the failure as an install-stage CI failure, not a build, browser, QA, artifact upload, Weather, or application regression failure.

## Workflow Inspected

Stage 20 workflow before adjustment:

- Triggered on `push` and `pull_request` to `main`.
- Used `actions/checkout@v4`.
- Used `actions/setup-node@v4` with Node `22.18.0` and npm cache.
- Installed dependencies with `npm ci`.
- Installed Chromium with `npx playwright install chromium`.
- Ran `npm run build`.
- Ran `npm run qa:a11y:routes:ci`.
- Wrote `.qa/route-a11y-summary.json` with `npm run qa:a11y:routes:json:file`.
- Uploaded `route-a11y-summary` with `actions/upload-artifact@v4`.

## Adjustments Made

The workflow was adjusted in three small ways:

1. Added `id: install-dependencies` to the dependency installation step.
2. Changed Chromium installation to `npx playwright install --with-deps chromium`.
3. Guarded the JSON summary step with `steps.install-dependencies.outcome == 'success'`.

Rationale:

- The first remote run failed before build and QA, so no application source change is justified.
- `--with-deps chromium` follows the safer Linux CI path for Playwright and avoids a likely next failure class once dependency installation succeeds.
- The summary step should still run after build or QA failures, but it should not run after dependency installation fails because the project scripts and local dependencies are not available.
- Artifact upload remains `if: always()` with `if-no-files-found: ignore`, so real QA summaries will still be uploaded when generated.

## Chromium Install Decision

Decision: use `npx playwright install --with-deps chromium` in CI.

Reason:

- It keeps the browser scope limited to Chromium.
- It avoids adding a custom apt package list.
- It is the official Playwright-friendly path for Ubuntu runner browser dependencies.
- It does not affect local development or application source.

## Cache Decision

Decision: keep the current `actions/setup-node` npm cache only.

Reason:

- The first run did not reach browser install or route QA, so Playwright browser cache performance cannot be evaluated yet.
- Browser cache keys should be added only after at least one successful or browser-install-reaching run establishes the runner behavior.
- A future browser cache key should include OS, `package-lock.json`, and Playwright version.

## Artifact Decision

Decision: keep a single `route-a11y-summary` artifact generated from `.qa/route-a11y-summary.json`.

Reason:

- Local JSON file generation works.
- Upload behavior succeeded even when the file was absent.
- Keeping one machine-readable summary is enough for Stage 21.
- Richer reports or axe output should remain a later explicit stage.

## Local Validation Result

Commands run locally:

- `npm run build`: pass
- `npm run qa:a11y:routes`: pass on rerun
- `npm run qa:a11y:routes:ci`: pass
- `npm run qa:a11y:routes:json`: pass
- `npm run qa:a11y:routes:json:file`: pass and generated `.qa/route-a11y-summary.json`
- `npm run qa`: pass
- `npm ci --dry-run`: pass

Notes:

- One initial local `npm run qa:a11y:routes` attempt produced a mobile `/settings` 404, then the same command passed on rerun and the full `npm run qa` pass also covered `/settings`.
- The transient result did not reproduce and is recorded as non-blocking unless it reappears.
- `.qa/` remains ignored by git, so generated QA artifacts do not pollute the worktree.

## Build Warning

`npm run build` still reports the existing Vite chunk-size warning for large chunks, including the large shared `lib` chunk.

Decision:

- Non-blocking P2.
- Do not address in Stage 21.
- Keep as a later bundle splitting or performance follow-up.

## Weather Freeze Boundary

Weather remains frozen.

This stage did not change:

- Weather pages.
- Weather store.
- Weather services.
- Weather components.
- Weather assets.
- PixiJS runtime.
- Weather scenes or animation behavior.

Future Weather changes remain limited to regression fixes until a separate Weather unfreeze decision is made after the broader upgrade path.

## Known Limitations

- Remote job logs could not be downloaded through the unauthenticated API, so exact `npm ci` stderr is not available in this local report.
- The adjusted workflow needs one new remote run to verify whether dependency installation now proceeds and whether build, QA, JSON generation, and artifact upload complete.
- Playwright browser caching remains intentionally deferred until a run reaches the browser install or QA stage.
- The route QA baseline is still smoke-level and does not include axe.

## Stage 22 Recommendation

Stage 22 should be a remote CI re-run verification stage after this workflow adjustment is pushed.

Recommended Stage 22 scope:

- Verify the next `QA` workflow run on `main`.
- Confirm `npm ci` passes or capture the exact install error if it still fails.
- Confirm `npx playwright install --with-deps chromium` succeeds.
- Confirm `npm run build` passes with only the existing chunk-size warning.
- Confirm `npm run qa:a11y:routes:ci` passes.
- Confirm `.qa/route-a11y-summary.json` is generated and uploaded as `route-a11y-summary`.
- Decide whether Playwright Chromium cache is warranted based on actual remote runtime.

Stage 22 should not:

- Modify Weather internals.
- Add Weather effects or assets.
- Start source architecture migration.
- Redesign pages.
- Add axe unless a separate report-only axe stage is explicitly approved.
