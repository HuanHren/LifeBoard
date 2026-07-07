# Stage 20 CI QA Artifact and Playwright Cache Strategy

Date: 2026-07-07

Status: completed. Stage 20 adds the minimum CI path for the Stage 19 route accessibility QA baseline.

## 1. Baseline

- Branch: `main`.
- Starting workspace: clean.
- Starting commit: `40b52b9 chore(qa): formalize accessibility regression tooling`.
- Stage 19 tag present: `qa-tooling-stage-19`.
- Current baseline is after Stage 11 Weather freeze, Stage 12 architecture audit, Stage 13 shell/tokens/primitives, Stage 14 Home/Todos/Tools adoption, Stage 15 Bookmarks/Settings adoption, Stage 16 state a11y hardening, Stage 17 route a11y audit, Stage 18 QA baseline, and Stage 19 QA tooling formalization.

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
- `playwright-cli\references\running-code.md`
- `playwright-cli\references\playwright-tests.md`

The project-local impeccable context script was not present at `.agents\skills\impeccable\scripts\context.mjs`.

## 3. Scope

Implemented:

- Minimal GitHub Actions workflow for build and route accessibility QA.
- Optional JSON file output from the existing QA runner.
- Package script for writing the JSON summary to the CI artifact path.
- `.qa/` ignore rule for local artifact output.
- README and roadmap documentation.

Not implemented:

- No Weather source changes.
- No business logic changes.
- No visual refactor.
- No axe integration.
- No Playwright browser cache.
- No deployment workflow.

## 4. CI Workflow Decision

Workflow path:

```text
.github/workflows/qa.yml
```

Triggers:

- `push` to `main`.
- `pull_request` targeting `main`.

Job:

- `route-a11y` on `ubuntu-latest`.
- Checkout.
- Setup Node with npm cache.
- `npm ci`.
- `npx playwright install chromium`.
- `npm run build`.
- `npm run qa:a11y:routes:ci`.
- `npm run qa:a11y:routes:json:file`.
- Upload `.qa/route-a11y-summary.json` as an artifact when present.

No deployment, secrets, matrix, custom services, or third-party non-official actions were added.

## 5. Node Version Decision

CI uses:

```yaml
node-version: 22.18.0
```

Reason:

- The project has no package `engines`, `.nvmrc`, or `.node-version`.
- The lockfile contains transitive packages with Node engine ranges that include `^22.18.0`.
- Node 22 is an active LTS line and avoids the older Node 20 path for this Vite 8 / modern toolchain baseline.

Local validation in this stage ran on Node `v24.12.0`; CI intentionally uses Node 22.18.0 for a conservative LTS runner baseline.

## 6. npm Install Strategy

CI uses:

```powershell
npm ci
```

Reason:

- Uses the committed `package-lock.json`.
- Produces deterministic installs in CI.
- Does not mutate dependency files.

The workflow uses `actions/setup-node` with `cache: npm`. No hand-written npm cache key is added.

## 7. Playwright Chromium Install Strategy

CI uses:

```powershell
npx playwright install chromium
```

Reason:

- Playwright is already a dev dependency from Stage 19.
- The route QA uses Chromium only.
- The simpler Chromium install is faster than `--with-deps`.

If GitHub hosted Ubuntu later reports missing system libraries, switch to:

```powershell
npx playwright install --with-deps chromium
```

That fallback is slower but more compatible. It is not used by default in Stage 20.

## 8. Cache Decision

npm cache:

- Enabled through `actions/setup-node` with `cache: npm`.

Playwright browser cache:

- Not enabled in Stage 20.

Reason:

- The initial workflow should stay small and maintainable.
- Browser cache keys need OS, lockfile, and Playwright version coupling.
- Add browser caching only if CI duration becomes a measured problem.

## 9. QA Artifact Decision

Artifact output:

```text
.qa/route-a11y-summary.json
```

Artifact name:

```text
route-a11y-summary
```

Reason:

- Stage 19 JSON already contains route, viewport, check, reason, totals, and limitations.
- A single JSON file is enough for CI diagnosis without screenshots, traces, or large artifacts.
- The summary contains no user data or provider payloads.

`.qa/` is ignored so local artifact generation does not dirty normal worktrees.

## 10. QA Script Changes

`scripts/qa-route-a11y.mjs` now supports:

```powershell
--output <path>
--output=<path>
```

Behavior:

- Writes the same summary object used by `--json`.
- Creates the output directory when needed.
- Preserves stdout JSON behavior for `--json`.
- Preserves text output for local and CI modes.
- Preserves non-zero exit code on failures.
- Preserves preview cleanup.
- Preserves `QA_BASE_URL`.
- Uses cross-platform `path.resolve` and `fs.mkdirSync`.

## 11. Package Scripts

Existing scripts remain:

```powershell
npm run qa:a11y:routes
npm run qa:a11y:routes:ci
npm run qa:a11y:routes:json
npm run qa
```

Added:

```powershell
npm run qa:a11y:routes:json:file
```

The new script writes:

```text
.qa/route-a11y-summary.json
```

## 12. Weather Freeze Boundary

Weather remains frozen.

No changes were made to:

- Weather store.
- Weather service.
- Weather runtime.
- PixiJS layer.
- Weather scenes.
- Weather assets.
- Xiaomi Weather material analysis.

CI keeps Weather as a route-level smoke boundary only.

## 13. Build Result

Baseline build before changes:

```powershell
npm run build
```

Result: passed.

Final build after changes:

```powershell
npm run build
```

Result: passed.

Known non-blocking warnings:

- Vite/Rolldown plugin timing notice.
- Vite large chunk warning.

These remain P2 follow-up items and are not handled in Stage 20.

## 14. QA Local Result

Commands required for this stage:

```powershell
npm run qa:a11y:routes
npm run qa:a11y:routes:ci
npm run qa:a11y:routes:json
npm run qa:a11y:routes:json:file
npm run qa
```

Expected result:

- 27/27 route-viewports pass.
- 0 console errors.
- Preview process cleaned up.
- `.qa/route-a11y-summary.json` remains ignored.

## 15. CI Expectations

On push or pull request to `main`, GitHub Actions should:

- Install dependencies with `npm ci`.
- Install Chromium with `npx playwright install chromium`.
- Build the app.
- Run route accessibility QA in CI text mode.
- Write a JSON summary.
- Upload `route-a11y-summary` when available.

Failure logs should show:

- route
- viewport
- check
- reason
- optional selector

The first remote run may need a follow-up if Ubuntu requires Playwright system dependencies. In that case, change the install step to `npx playwright install --with-deps chromium`.

## 16. Known Limitations

- GitHub Actions has not been remotely executed in this local stage.
- Playwright browser cache is intentionally not enabled.
- Axe is not integrated.
- The Vite large chunk warning remains.
- Route QA remains smoke-level and does not replace deeper workflow tests.
- CI duration may need later optimization if Chromium install time is too high.

## 17. Stage 21 Recommendation

Recommended next stage:

- Observe the first GitHub Actions run after push.
- If it passes, tag the CI baseline and keep the workflow stable.
- If Chromium install fails due missing system dependencies, switch to `npx playwright install --with-deps chromium`.
- If runtime is too slow across repeated runs, add a measured Playwright browser cache with OS, lockfile, and Playwright version in the key.

Do not use Stage 21 to:

- Rewrite Weather internals.
- Resume Xiaomi Weather analysis.
- Add Weather scenes or assets.
- Start a visual redesign.
- Add axe as a blocking dependency without a dedicated evaluation stage.
