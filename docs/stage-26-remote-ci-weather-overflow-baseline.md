# Stage 26 Remote CI and Weather Overflow QA Baseline

Date: 2026-07-08

Status: in progress until the final Stage 26 QA cleanup commit is pushed and the latest remote `QA` workflow is verified.

## 1. Baseline

- Branch: `main`.
- Baseline working tree: clean.
- Baseline local HEAD: `775eac2f26fe7d3bf7d4cf8d3f16fd5ebe277a92`.
- Baseline `origin/main`: `775eac2f26fe7d3bf7d4cf8d3f16fd5ebe277a92`.
- Baseline local/remote relation: synchronized.
- Stage 25 Weather overflow commit present: `775eac2 fix(weather): prevent page horizontal overflow`.
- Package-lock CI fix commit present: `3234c38 chore(deps): sync lockfile for ci`.
- Weather freeze baseline remains after `weather-freeze-stage-11`.

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
- `vue-best-practices\references\reactivity.md`
- `vue-best-practices\references\sfc.md`
- `vue-best-practices\references\component-data-flow.md`
- `vue-best-practices\references\composables.md`
- `playwright-cli\references\running-code.md`
- `playwright-cli\references\playwright-tests.md`

The project-local impeccable context script was not present at `.agents\skills\impeccable\scripts\context.mjs`.

## 3. Pre-push State

- `package-lock.json` was not modified at baseline.
- Weather overflow source changes were not modified at baseline.
- `.qa/` remained ignored after local artifact generation.
- No LifeBoard preview process remained after local QA cleanup.
- `gh` CLI was not available, so GitHub REST API checks were used.

One local `npm ci` attempt initially failed on Windows with `EPERM` while unlinking `node_modules\lightningcss-win32-x64-msvc\lightningcss.win32-x64-msvc.node`. Two stale LifeBoard preview processes from a previous local preview were found on port `4185`; after stopping them, `npm ci` passed. This was a local file-lock issue, not a dependency resolution failure.

## 4. Package-lock CI Fix

`package-lock.json` contains the CI lockfile sync entries:

- `node_modules/@emnapi/core` version `1.11.2`.
- `node_modules/@emnapi/runtime` version `1.11.2`.

The fix was already committed before Stage 26:

- `3234c38 chore(deps): sync lockfile for ci`

No additional package-lock commit was needed in Stage 26.

## 5. Stage 25 Weather Overflow Fix

The Weather overflow fix was already committed before Stage 26:

- `775eac2 fix(weather): prevent page horizontal overflow`

The Stage 25 QA runner enhancement is present:

- Standard route matrix remains 9 routes x 3 viewports.
- Weather adds route-specific overflow viewports:
  - `weather-wide`: `1600x900`
  - `weather-full`: `1920x1080`
- Total route-viewports are now `29/29`.

No additional Weather source commit was needed in Stage 26.

## 6. Local Validation Results

Pre-push local validation:

- `npx npm@11.18.0 ci --dry-run`: PASS.
- `npm ci --dry-run`: PASS.
- `npm ci`: PASS after stopping stale local preview processes; 124 packages installed, 0 vulnerabilities.
- `npm run build`: PASS.
- `npm run qa:a11y:routes`: PASS, `29/29`, console errors `0`.
- `npm run qa:a11y:routes:ci`: PASS, `29/29`, console errors `0`.
- `npm run qa:a11y:routes:json`: PASS, `29/29`, console errors `0`.
- `npm run qa:a11y:routes:json:file`: PASS, `29/29`, console errors `0`, wrote `.qa/route-a11y-summary.json`.
- `npm run qa`: PASS, build plus route QA `29/29`, console errors `0`.

Build warnings:

- Vite/Rolldown plugin timing notice remains non-blocking.
- Vite large chunk warning remains accepted P2 and was not handled in Stage 26.

## 7. Push Result

Baseline local HEAD already matched `origin/main` at `775eac2f26fe7d3bf7d4cf8d3f16fd5ebe277a92`.

Stage 26 documentation commit was pushed as `9d80532 docs(qa): freeze weather overflow ci baseline`.

That run exposed a CI-only Route QA hang after build. A minimal QA runner cleanup fix is being applied so Linux/macOS preview child processes are terminated by process group instead of only signaling the npm parent process.

Final local HEAD: pending final QA cleanup commit.

Final remote `main`: pending final QA cleanup commit.

## 8. Remote QA Run

Before the Stage 26 documentation push, the latest remote `QA` run for `775eac2` was not usable as a passing baseline:

- Run ID: `28882378350`.
- Head SHA: `775eac2f26fe7d3bf7d4cf8d3f16fd5ebe277a92`.
- Event: `push`.
- Status: `completed`.
- Conclusion: `cancelled`.
- URL: `https://github.com/HuanHren/LifeBoard/actions/runs/28882378350`.

Because the latest `775eac2` run was cancelled, Stage 26 pushed a documentation commit to trigger a fresh run:

- Run ID: `28938924284`.
- Head SHA: `9d805320ac605bded71b030e584be1f1f43b4658`.
- Event: `push`.
- Status during inspection: `in_progress`.
- URL: `https://github.com/HuanHren/LifeBoard/actions/runs/28938924284`.

That run reached and passed dependency install, Chromium install, and build, then stayed in progress in `Route accessibility QA` far longer than the local 40 second baseline. The available unauthenticated API exposed step status but not logs after rate limiting. The likely CI-only cause is preview child-process cleanup on Linux, because the runner previously signaled only the npm preview parent process outside Windows.

Final remote QA run: pending.

## 9. Remote CI Step Results

Observed on run `28938924284` before the QA cleanup fix:

- `Print tool versions`: pass.
- `Validate lockfile`: pass.
- `Install dependencies`: pass.
- `Install Playwright Chromium`: pass.
- `Build`: pass.
- `Route accessibility QA`: in progress / hung during inspection.
- `Write route accessibility summary`: pending.
- `Upload route accessibility summary`: pending.

Required final pass criteria remain unchanged after the QA cleanup fix.

## 10. Artifact Status

Pending final remote run.

Expected artifact:

- Name: `route-a11y-summary`.
- Expected content: `.qa/route-a11y-summary.json`.
- Expected summary: `status` `PASS`, `totalRouteViewports` `29`, `consoleErrorCount` `0`.

## 11. Weather Overflow Baseline Status

Local baseline is green:

- `/weather` passed standard `390x844`, `768x1024`, and `1440x900` route viewports.
- `/weather` passed route-specific `1600x900` and `1920x1080` overflow viewports.
- No global page horizontal overflow was reported by route QA.
- Console errors remained `0`.

Remote baseline is pending final run verification after the QA cleanup fix.

## 12. Weather Freeze Boundary

Weather remains frozen.

Stage 26 did not modify:

- Weather store.
- Weather services.
- Weather cache.
- Weather runtime.
- PixiJS layer.
- Weather assets.
- Weather scenes.
- Xiaomi Weather material analysis.

Weather is only covered as a regression boundary in build and route QA.

Stage 26 did modify `scripts/qa-route-a11y.mjs` after remote CI exposed a Route QA hang. The change is limited to preview process cleanup for non-Windows CI runners:

- Spawn the preview process as a detached process group on non-Windows platforms.
- Stop the process group with `process.kill(-pid, 'SIGTERM')`.
- Keep the existing Windows `taskkill /T /F` cleanup path.

This does not change the route matrix, Weather checks, app source, or Weather behavior.

## 13. Known Limitations

- Vite large chunk warning remains accepted P2.
- Axe is not integrated.
- Playwright browser cache is not enabled.
- Route QA remains smoke-level and does not replace full visual review.
- The final remote CI result must be recorded after pushing the Stage 26 QA cleanup commit.

## 14. Stage 27 Recommendation

If the final Stage 26 remote `QA` run passes, Stage 27 can move to a small closeout or hardening stage focused on QA baseline stability and documentation cleanup.

If the final remote `QA` run fails, Stage 27 should only address the failed CI step with evidence from logs. Do not start new features or broad refactors.

Do not use Stage 27 to reopen Weather animation work, Xiaomi Weather material analysis, PixiJS rewrites, Weather asset replacement, new Weather scenes, deployment setup, axe integration, or complex CI matrix expansion unless a separate stage explicitly authorizes it.
