# Stage 28 Route Screenshots / Design QA Baseline

Date: 2026-07-09

Status: complete. This stage adds a repeatable screenshot QA baseline and documentation only. It does not change Weather source, Weather assets, Weather runtime, app pages, shared UI primitives, or CI workflow behavior.

## 1. Baseline

- Branch: `main`.
- Baseline working tree before changes: clean.
- Local branch status before changes: up to date with `origin/main`.
- Current visible checkpoint before this stage: `7c73dd2 refactor(ui): polish non-weather page consistency`.
- Stage 27 tag present: `non-weather-visual-polish-stage-27`.
- Weather freeze and Weather overflow baseline remain in project history and are treated as regression boundaries.

## 2. Build Result

The required build command for this stage is:

```bash
npm run build
```

Expected result: pass. The existing Vite large chunk warning remains a non-blocking P2 follow-up and is not addressed by this stage.

## 3. Skill Gate Summary

The Stage 28 skill gate required reading these local skills before implementation:

- `C:\Users\jingr\codex-skills\impeccable\SKILL.md`
- `C:\Users\jingr\codex-skills\gpt-taste\SKILL.md`
- `C:\Users\jingr\codex-skills\redesign-existing-projects\SKILL.md`
- `C:\Users\jingr\codex-skills\baseline-ui\SKILL.md`
- `C:\Users\jingr\codex-skills\vue-best-practices\SKILL.md`
- `C:\Users\jingr\codex-skills\fixing-accessibility\SKILL.md`
- `C:\Users\jingr\codex-skills\fixing-motion-performance\SKILL.md`
- `C:\Users\jingr\codex-skills\playwright-cli\SKILL.md`

Additional references read because the selected skills required task-specific guidance:

- `impeccable\reference\audit.md`
- `impeccable\reference\polish.md`
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

## 4. Scope

Stage 28 adds route-level screenshot collection for design QA review. It is a baseline and evidence layer, not a visual diff engine and not a redesign stage.

Allowed in this stage:

- Add a Playwright screenshot QA script using the existing dependency.
- Add npm scripts for screenshot QA.
- Write ignored local QA artifacts under `.qa`.
- Document screenshot manifest and summary outputs.
- Document Stage 29 review scope.

Not allowed in this stage:

- Modify Weather source, store, service, runtime, assets, or cache semantics.
- Modify page or shared component source for visual polish.
- Add dependencies.
- Add axe automation.
- Commit generated screenshots.
- Change CI workflow unless a blocker proves it is required.

## 5. Routes And Viewports

Routes covered:

- `landing`: `/`
- `home`: `/app`
- `weather`: `/weather`
- `todos`: `/todos`
- `tools`: `/tools`
- `bookmarks`: `/bookmarks`
- `settings`: `/settings`
- `settings-data-sources`: `/settings/data-sources`
- `not-found`: `/missing-route-stage-18`

Default viewports:

- `mobile`: `390x844`
- `tablet`: `768x1024`
- `desktop`: `1440x900`

Weather-only extra viewports:

- `weather-wide`: `1600x900`
- `weather-fullhd`: `1920x1080`

Expected screenshot count:

- `9 routes * 3 default viewports + 2 Weather extra viewports = 29 screenshots`

## 6. Output Paths

Generated artifacts:

- `.qa/route-screenshots/`
- `.qa/route-screenshots/manifest.json`
- `.qa/route-screenshots-summary.json`

The `.qa/` directory is already ignored by git. PNG files are local QA artifacts and should not be committed.

## 7. Manifest And Summary Schema

The manifest records the full route matrix:

- `generatedAt`
- `mode`
- `baseUrl`
- `ownedPreview`
- `outputDir`
- `expectedScreenshots`
- `totalScreenshots`
- `passedScreenshots`
- `failedScreenshots`
- `routes`
- `viewports`
- `routeSpecificViewports`
- `screenshots`

Each screenshot record includes:

- `routeKey`
- `path`
- `viewportName`
- `width`
- `height`
- `screenshotPath`
- `htmlScrollWidth`
- `htmlClientWidth`
- `bodyScrollWidth`
- `bodyClientWidth`
- `h1Text`
- `title`
- `consoleErrorCount`
- `consoleErrors`
- `responseStatus`
- `status`
- `pass`
- `failReasons`

The summary records the CI-friendly aggregate:

- `status`
- `totalScreenshots`
- `expectedScreenshots`
- `passedScreenshots`
- `failedScreenshots`
- `failureCount`
- `consoleErrorCount`
- `outputDir`
- `manifestPath`
- `routes`
- `viewports`
- `routeSpecificViewports`
- `failures`
- `limitations`

## 8. Design QA Checklist

Reviewers should use the generated screenshots to classify visual findings by route and viewport:

- First viewport clearly communicates the page purpose.
- Primary action or primary content is visible without layout confusion.
- App shell and navigation remain stable across mobile, tablet, and desktop.
- Cards, buttons, inputs, section headers, status states, and empty states follow the shared visual direction.
- Page spacing is intentional and not cramped or overly sparse.
- Mobile views have no horizontal overflow.
- Text does not collide with controls or adjacent content.
- Focusable controls remain visible and tappable.
- Weather remains visually stable inside the frozen boundary.
- Dark mode and high-contrast risks should be reviewed manually where screenshots reveal weak contrast.

## 9. Commands Added

```bash
npm run qa:screenshots
npm run qa:screenshots:ci
npm run qa:design
```

Behavior:

- `qa:screenshots` starts a production preview unless `QA_BASE_URL` is set.
- `qa:screenshots:ci` uses the same baseline with CI mode enabled.
- `qa:design` runs `npm run build` and then `npm run qa:screenshots`.
- `QA_BASE_URL` can point the script at an already-running deployment or preview.
- The script forces reduced motion.
- The script fails on route console errors or horizontal overflow.

## 10. Validation Plan

Required validation commands for this stage:

```bash
npx npm@11.18.0 ci --dry-run
npm ci --dry-run
npm run build
npm run qa:a11y:routes
npm run qa:a11y:routes:ci
npm run qa:a11y:routes:json
npm run qa:a11y:routes:json:file
npm run qa
npm run qa:screenshots
npm run qa:screenshots:ci
npm run qa:design
```

Expected results:

- Existing route accessibility QA remains `29/29`.
- Screenshot QA generates exactly 29 PNG files.
- Screenshot manifest and summary are generated.
- Console error count is `0`.
- Horizontal overflow checks pass.

## 11. CI Decision

CI workflow is intentionally unchanged in Stage 28. The existing workflow continues to run build plus route accessibility QA and upload the route accessibility summary artifact. Screenshot QA is now available locally and can be considered for CI after Stage 29 reviews artifact size, runtime, and usefulness.

## 12. Weather Freeze Boundary

Weather remains frozen. Stage 28 uses seeded Weather local storage and a mocked air-quality response only inside the screenshot QA script to stabilize route capture. This does not modify Weather source behavior.

Allowed Weather activity after this stage:

- Regression fixes only.
- Outer-shell compatibility fixes only if a later App Shell change proves they are necessary.

Not allowed:

- Weather runtime rewrite.
- Weather store/service changes for design QA convenience.
- New Weather scenes.
- New Xiaomi Weather material integration.
- Weather asset replacement.
- Weather animation expansion.

## 13. Known Limitations

- Screenshot QA is a baseline capture and route smoke check, not pixel-diff automation.
- Manual review is still required to classify visual polish issues.
- Weather live-provider variance is not covered; Weather is seeded for deterministic route QA.
- CI artifact upload for screenshots is deferred until runtime and artifact-size tradeoffs are reviewed.
- The Vite large chunk warning remains a non-blocking P2 performance follow-up.

## 14. Stage 29 Recommendation

Stage 29 should review the generated screenshot matrix and create a prioritized design QA issue list before any new polish implementation.

Recommended Stage 29 scope:

- Review all 29 screenshots.
- Classify route-level visual findings as P0/P1/P2.
- Identify only the smallest non-Weather polish candidates.
- Decide whether screenshot artifacts should be uploaded in CI.
- Keep route accessibility QA as the current required CI gate.
- Keep Weather frozen and use `/weather` only as a regression boundary.

Stage 29 should not:

- Start another broad redesign.
- Modify Weather internals or assets.
- Add visual diff infrastructure before manual baseline usefulness is proven.
- Add new large dependencies.
