# Stage 22 Remote CI Rerun Install Failure

Date: 2026-07-07

Status: remote CI rerun inspected. Install still fails remotely at dependency installation, but remote logs are not readable through the current unauthenticated API access. This stage adds only minimal install diagnostics and documentation.

## Baseline

- Branch: `main`
- Initial worktree: clean
- Local branch state: up to date with `origin/main`
- Local ahead/behind: none
- Stage 21 commit present locally and remotely: `5e795cc ci(qa): validate remote accessibility workflow`
- Stage 21 tag present: `remote-ci-first-run-stage-21`
- Stage 20 tag present: `ci-qa-stage-20`
- Weather freeze tag present: `weather-freeze-stage-11`

The baseline is after Stage 21. The Stage 21 workflow adjustment had already been pushed to `origin/main`, so a new remote run was expected and found.

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

The project-local impeccable context script was not present at `.agents\skills\impeccable\scripts\context.mjs`.

## Scope

Stage 22 is limited to remote CI rerun verification, install failure localization, local install reproduction, and documentation.

Allowed:

- Inspect GitHub Actions metadata.
- Try to read install logs.
- Validate package and lockfile state.
- Run local install, build, and QA commands.
- Add small workflow diagnostics if the install cause is still unknown.
- Record Stage 23 recommendations.

Not allowed:

- Weather internals.
- Weather store, service, runtime, PixiJS layer, assets, scenes, or Xiaomi Weather analysis.
- Source page changes under `src/**`.
- Business logic or persistence key changes.
- Axe integration.
- CI matrix expansion.
- Deployment workflow.

## Remote CI Rerun Result

Remote workflow lookup used the GitHub REST API because `gh` is not installed locally.

Latest `QA` run:

- Run ID: `28874264283`
- Event: `push`
- Commit: `5e795cc0be7e382d3d33a1a4b07a4447f5d3c98f`
- Display title: `ci(qa): validate remote accessibility workflow`
- Status: `completed`
- Conclusion: `failure`
- URL: `https://github.com/HuanHren/LifeBoard/actions/runs/28874264283`

This run did use the Stage 21 commit, so the remote rerun is current for Stage 22.

Job:

- Job ID: `85644952461`
- Job name: `Build and route accessibility QA`
- Conclusion: `failure`

Step result summary:

- `Checkout`: success
- `Setup Node`: success
- `Install dependencies`: failure
- `Install Playwright Chromium`: skipped
- `Build`: skipped
- `Route accessibility QA`: skipped
- `Write route accessibility summary`: skipped
- `Upload route accessibility summary`: success

Stage 21's summary guard worked: after dependency installation failed, `Write route accessibility summary` was skipped instead of creating a second failure.

## Install Failure Status

Remote `npm ci` still fails.

Current classification:

- Confirmed category: install-stage failure.
- Not confirmed: package-lock mismatch, Node/npm mismatch, network/download issue, cache corruption, lifecycle script failure, or Playwright package resolution.
- Reason: remote job logs are not readable through the current local access.

The failure cannot be honestly classified more narrowly without the `Install dependencies` stderr.

## Remote Log Limitation

Attempting to download job logs through the GitHub REST API returned:

```text
403 Must have admin rights to Repository.
```

Manual log retrieval steps:

1. Open `https://github.com/HuanHren/LifeBoard/actions`.
2. Open the `QA` workflow.
3. Open run `28874264283`.
4. Open `Build and route accessibility QA`.
5. Expand `Install dependencies`.
6. Copy the `npm ci` stderr.

After this Stage 22 commit is pushed, also inspect the new diagnostic steps:

1. Expand `Print tool versions`.
2. Expand `Validate lockfile`.
3. Expand `Install dependencies`.

Those three steps should identify whether the failure happens before install, during lockfile validation, or only during the actual dependency installation.

## Package And Lockfile Inspection

Package and lockfile state:

- `package.json` and root `package-lock.json` metadata match.
- `package-lock.json` lockfileVersion: `3`
- `packageManager`: not declared.
- `engines`: not declared.
- Playwright is declared in `devDependencies` as `^1.61.1`.
- `package-lock.json` contains `node_modules/playwright` version `1.61.1`.
- `package-lock.json` contains `node_modules/playwright-core` version `1.61.1`.
- Local Node: `v24.12.0`
- Local npm: `11.6.2`
- Local npm registry: `https://registry.npmjs.org/`

Workflow install strategy:

- Node version: `22.18.0`
- Install command: `npm ci`
- npm cache: `actions/setup-node` with `cache: npm`
- Chromium install: `npx playwright install --with-deps chromium`
- Artifact: `.qa/route-a11y-summary.json` uploaded as `route-a11y-summary`

No package-lock change is justified by local inspection.

## Local Install Reproduction

Commands:

- `npm ci --dry-run`: pass.
- First `npm ci`: failed locally with Windows `EPERM unlink` on `node_modules\lightningcss-win32-x64-msvc\lightningcss.win32-x64-msvc.node`.
- LifeBoard preview processes were found still using `D:\LifeBoard\node_modules`.
- Only the LifeBoard Vite preview child processes were stopped.
- Second `npm ci`: pass, `127` packages installed, `0` vulnerabilities.

Interpretation:

- The initial local `npm ci` failure was a Windows file-lock issue, not a package/lock mismatch.
- It does not explain the remote Ubuntu failure.
- The successful rerun confirms the committed package and lockfile can install locally after clearing stale preview locks.

## Workflow Changes Made

Two diagnostic steps were added before dependency installation:

```yaml
- name: Print tool versions
  run: |
    node --version
    npm --version
    npm config get registry

- name: Validate lockfile
  run: npm ci --dry-run
```

No Node version, npm cache strategy, package scripts, package dependencies, or source files were changed.

Rationale:

- The remote failure remains in `npm ci`, but logs are unreadable locally.
- `Print tool versions` exposes the exact remote Node/npm/registry context in the visible job log.
- `Validate lockfile` separates lockfile/package mismatch from full install behavior.
- This is intentionally smaller than changing cache strategy or package files without evidence.

## Build And QA Result

Local validation after reinstall:

- `npm run build`: pass.
- `npm run qa:a11y:routes`: pass, 27/27 route-viewports.
- `npm run qa:a11y:routes:ci`: pass, 27/27 route-viewports.
- `npm run qa:a11y:routes:json`: pass, JSON status `PASS`.
- `npm run qa:a11y:routes:json:file`: pass, writes `.qa/route-a11y-summary.json`.
- `npm run qa`: pass.

Known non-blocking warning:

- Vite still reports the existing large chunk warning. It remains a P2 follow-up and was not handled in Stage 22.

## Artifact Status

Remote:

- No `route-a11y-summary` artifact exists for run `28874264283`.
- Reason: dependency installation failed before the JSON summary could be generated.

Local:

- `.qa/route-a11y-summary.json` was generated successfully.
- `.qa/` remains ignored and does not pollute `git status`.

## Preview Cleanup

Before the successful local reinstall, stale LifeBoard preview processes were found and stopped. After local QA, no LifeBoard preview process remained and port `4173` had no listener or connection.

The stale processes explain the local Windows `EPERM` during the first full `npm ci`; they do not classify the remote Linux failure.

## Weather Freeze Boundary

Weather remains frozen.

This stage did not change:

- Weather pages.
- Weather store.
- Weather services.
- Weather runtime.
- PixiJS layer.
- Weather assets.
- Weather scenes.
- Xiaomi Weather material analysis.

Weather remains a route-level smoke boundary only.

## Known Limitations

- Remote install logs are still not readable through the current local API access.
- The exact remote `npm ci` stderr still requires manual GitHub Actions log access or an authenticated CLI/API session with sufficient permissions.
- The diagnostic workflow change needs a new push and remote run before it can provide additional evidence.
- Axe is still not integrated.
- Vite large chunk warning remains.
- Playwright browser caching is still deferred because the remote run has not reached the Chromium install stage.

## Stage 23 Recommendation

Stage 23 should verify the next remote CI run after this diagnostics commit is pushed.

Allowed:

- Confirm `Print tool versions` output.
- Confirm whether `Validate lockfile` passes.
- If `Validate lockfile` fails, classify as lockfile/package/npm version issue and fix only that.
- If `Validate lockfile` passes but `Install dependencies` fails, inspect exact `npm ci` stderr before changing cache or dependencies.
- If install passes, continue to Chromium install, build, route QA, JSON summary, and artifact upload verification.
- Keep any workflow changes small and evidence-driven.

Not allowed:

- Weather internals.
- Weather animation or asset expansion.
- Xiaomi Weather material analysis.
- Page redesign.
- Business logic changes.
- Axe integration without a dedicated stage.
- Complex CI matrix or deployment setup.
