# Stage 36 Remaining Non-Weather P2 Visual Polish

Date: 2026-07-09

Status: complete. This stage only addressed the two remaining non-Weather P2 visual polish items from the screenshot/design QA queue.

## Baseline

- Branch: `main`.
- Baseline worktree: clean before edits.
- Baseline remote state: `main` was up to date with `origin/main`.
- Baseline HEAD: `f1ecc1d docs(qa): freeze screenshot design baseline`.
- Stage 34 screenshot/design baseline tag was present: `screenshot-design-baseline-freeze-stage-34`.
- Weather freeze boundary remained active and was treated only as a regression boundary.

## Skill Gate

The Stage 36 skill gate verified and fully read:

- `C:\Users\jingr\codex-skills\impeccable\SKILL.md`
- `C:\Users\jingr\codex-skills\gpt-taste\SKILL.md`
- `C:\Users\jingr\codex-skills\redesign-existing-projects\SKILL.md`
- `C:\Users\jingr\codex-skills\baseline-ui\SKILL.md`
- `C:\Users\jingr\codex-skills\vue-best-practices\SKILL.md`
- `C:\Users\jingr\codex-skills\fixing-accessibility\SKILL.md`
- `C:\Users\jingr\codex-skills\fixing-motion-performance\SKILL.md`
- `C:\Users\jingr\codex-skills\playwright-cli\SKILL.md`

Additional references read because the selected skills required or directly linked them:

- `C:\Users\jingr\codex-skills\impeccable\reference\product.md`
- `C:\Users\jingr\codex-skills\impeccable\reference\audit.md`
- `C:\Users\jingr\codex-skills\impeccable\reference\adapt.md`
- `C:\Users\jingr\codex-skills\impeccable\reference\polish.md`
- `C:\Users\jingr\codex-skills\vue-best-practices\references\reactivity.md`
- `C:\Users\jingr\codex-skills\vue-best-practices\references\sfc.md`
- `C:\Users\jingr\codex-skills\vue-best-practices\references\component-data-flow.md`
- `C:\Users\jingr\codex-skills\vue-best-practices\references\composables.md`
- `C:\Users\jingr\codex-skills\playwright-cli\references\running-code.md`
- `C:\Users\jingr\codex-skills\playwright-cli\references\playwright-tests.md`

## Scope

Allowed and used:

- `src/modules/landing/LandingPage.vue`
- `src/modules/settings/components/SettingsWorkspace.vue`
- `docs/stage-36-remaining-non-weather-p2-visual-polish.md`
- `docs/next-upgrade-plan.md`

Explicitly not changed:

- Weather source, store, services, cache, runtime, Pixi layer, and assets.
- `DQA-P2-006` Weather wide note.
- Package, lockfile, workflow, script, CI, axe, pixel-diff, and dark-mode screenshot infrastructure.
- `.qa/**/*.png` artifacts.
- Business logic and persistence keys.

## Targeted Remaining P2 Items

### `DQA-P2-001` Landing tablet preview height

Before: the `768x1024` Landing screenshot stacked the weather and workspace preview in a tall tablet presentation, making the first viewport feel heavier than the desktop and mobile baselines.

After: a tablet-only layout compresses the visual preview into a bounded layered composition. The hero copy and actions remain primary, while the preview still communicates the product without consuming excessive vertical space.

### `DQA-P2-005` Settings desktop first-screen density

Before: the `1440x900` Settings page presented the hero facts and first settings surfaces with similar card weight, producing a dense first-screen read.

After: a desktop-only spacing pass reduces hero surface pressure, lowers the fact tile weight, and slightly rebalances the main/sidebar grid so the first screen scans more calmly.

## Deferred Issues

- `DQA-P2-006` remains a Weather freeze note and was not treated as a visual polish target.
- Vite large chunk warnings remain accepted non-blocking P2 follow-up work.
- Axe, pixel-diff automation, dark-mode screenshot expansion, screenshot CI artifact uploads, and package/workflow changes remain deferred.

## Files Changed

- `src/modules/landing/LandingPage.vue`: added a narrow tablet-only media query for the Landing hero preview so the `768x1024` route screenshot no longer carries a tall stacked preview.
- `src/modules/settings/components/SettingsWorkspace.vue`: tuned desktop-only Settings spacing, hero facts, and grid balance to reduce first-screen density without changing Settings behavior.
- `docs/stage-36-remaining-non-weather-p2-visual-polish.md`: records the Stage 36 scope, validation, visual assessment, and Weather boundary.
- `docs/next-upgrade-plan.md`: adds the Stage 36 result and Stage 37 recommendation.

## Visual Before/After Assessment

- Landing tablet `768x1024`: improved. The preview is shorter and contained; no horizontal overflow or first-screen crowding was observed.
- Landing mobile `390x844`: acceptable defensive regression check; the mobile stack remained intact.
- Landing desktop `1440x900`: acceptable defensive regression check; desktop hero composition remained stable.
- Settings desktop `1440x900`: improved. The hero facts read less like competing cards, and the first screen has clearer hierarchy.
- Settings mobile `390x844`: acceptable defensive regression check; mobile layout remained stable.
- Settings data sources mobile `390x844`: acceptable defensive regression check.
- Weather wide `1600x900` and full HD `1920x1080`: acceptable regression boundary; no Weather source or asset changes were made.

## Screenshot Verification

The route screenshot matrix passed after building the updated production bundle:

- `npm run qa:screenshots`: PASS, 29/29 route-viewports.
- `npm run qa:screenshots:ci`: PASS, 29/29 route-viewports.
- `npm run qa:design`: PASS, 29/29 route-viewports after build.

Reviewed target and defensive screenshots:

- `.qa/route-screenshots/landing__tablet__768x1024.png`
- `.qa/route-screenshots/landing__mobile__390x844.png`
- `.qa/route-screenshots/landing__desktop__1440x900.png`
- `.qa/route-screenshots/settings__desktop__1440x900.png`
- `.qa/route-screenshots/settings__mobile__390x844.png`
- `.qa/route-screenshots/settings-data-sources__mobile__390x844.png`
- `.qa/route-screenshots/weather__weather-wide__1600x900.png`
- `.qa/route-screenshots/weather__weather-fullhd__1920x1080.png`

The `.qa` outputs remain local ignored QA artifacts.

## QA Results

- `npx npm@11.18.0 ci --dry-run`: PASS.
- `npm ci --dry-run`: PASS.
- `npm run build`: PASS with the known non-blocking Vite large chunk warning.
- `npm run qa:a11y:routes`: PASS, 29/29 route-viewports, 0 console errors.
- `npm run qa:a11y:routes:ci`: PASS, 29/29 route-viewports, 0 console errors.
- `npm run qa:a11y:routes:json`: PASS, 29/29 route-viewports, 0 console errors.
- `npm run qa:a11y:routes:json:file`: PASS, 29/29 route-viewports, 0 console errors.
- `npm run qa`: PASS.
- `npm run qa:screenshots`: PASS, 29/29 route-viewports.
- `npm run qa:screenshots:ci`: PASS, 29/29 route-viewports.
- `npm run qa:design`: PASS.

## Weather Freeze Boundary

Weather remained frozen throughout Stage 36. No Weather internals, store/service/cache files, Pixi runtime files, weather assets, Weather scenes, Xiaomi Weather materials, or Weather route behavior were changed.

The Weather route was validated only as part of the existing route accessibility and screenshot regression matrix, including the Weather-only `1600x900` and `1920x1080` overflow viewports.

## Known Limitations

- The Vite large chunk warning remains accepted and non-blocking.
- Screenshot QA is still evidence-based and does not include pixel-diff thresholds.
- Axe remains intentionally outside this stage.
- Dark-mode screenshot expansion remains deferred.
- CI screenshot artifact upload remains deferred.

## Stage 37 Recommendation

Stage 37 should be a screenshot closeout and non-Weather visual freeze review:

- Re-review the regenerated screenshots for `DQA-P2-001` and `DQA-P2-005`.
- Confirm the full build, route accessibility, screenshot, and design QA matrix stays green.
- Freeze the non-Weather visual baseline if no new P0/P1 issue appears.
- Keep `.qa` screenshots ignored unless a later CI artifact stage explicitly approves uploading them.
- Keep Weather frozen and use `/weather` only as a regression boundary.

Stage 37 should not modify Weather internals, resume Xiaomi Weather analysis, add dependencies, introduce pixel-diff infrastructure, expand dark-mode screenshots, split Vite chunks, or start broad architecture migration.
