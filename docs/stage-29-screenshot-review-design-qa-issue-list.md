# Stage 29 Screenshot Review / Design QA Issue List

Date: 2026-07-09

Status: complete. This stage reviews the Stage 28 route screenshot baseline and produces an issue list for Stage 30. It does not change source UI, Weather code, package files, workflow files, or committed screenshot assets.

## 1. Baseline

- Branch: `main`.
- Baseline working tree before changes: clean.
- Baseline local/remote state: `main` was up to date with `origin/main`.
- Stage 25 Weather overflow fix is present: `775eac2 fix(weather): prevent page horizontal overflow`.
- Stage 26 remote CI cleanup baseline is present: `4d09e49 fix(qa): clean up preview process group in ci`.
- Stage 27 non-Weather visual polish is present: `7c73dd2 refactor(ui): polish non-weather page consistency`.
- Stage 28 screenshot baseline is present: `baf52d8 test(qa): add route screenshot design baseline`.
- Stage 28 tag is present: `route-screenshots-design-baseline-stage-28`.
- Current repository state shows Stage 28 already synchronized with `origin/main`; no local ahead state was observed at baseline.

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
- `impeccable\reference\critique.md`
- `impeccable\reference\polish.md`
- `impeccable\reference\product.md`
- `vue-best-practices\references\reactivity.md`
- `vue-best-practices\references\sfc.md`
- `vue-best-practices\references\component-data-flow.md`
- `vue-best-practices\references\composables.md`
- `playwright-cli\references\running-code.md`
- `playwright-cli\references\playwright-tests.md`

The current `gpt-taste`, `redesign-existing-projects`, and `baseline-ui` skill directories contain only `SKILL.md`; no additional reference files exist there in this checkout.

The project-local impeccable context script was not present at `.agents\skills\impeccable\scripts\context.mjs`, so `PRODUCT.md`, `DESIGN.md`, current QA docs, and route screenshots were used as project context.

## 3. Scope

Reviewed:

- Stage 28 screenshot matrix under `.qa/route-screenshots/`.
- `.qa/route-screenshots/manifest.json`.
- `.qa/route-screenshots-summary.json`.
- Prior Weather freeze and QA baseline docs.
- Current product and design system docs.

Not changed:

- `src/**`.
- Weather page, store, service, cache, runtime, PixiJS layer, assets, scenes, or animation behavior.
- `package.json`.
- `package-lock.json`.
- `.github/workflows/**`.
- `.qa/**/*.png`.

## 4. Screenshot Inventory

Stage 28 artifacts exist:

- Manifest: `.qa/route-screenshots/manifest.json`.
- Summary: `.qa/route-screenshots-summary.json`.
- Screenshot count: 29 PNG files.
- Summary status: `pass`.
- Screenshot QA: `29/29`.
- Console errors: `0`.
- Overflow failures: `0`.
- Missing screenshot files: `0`.
- `.qa/` is ignored by `.gitignore`.

Routes:

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

Note: PowerShell `ConvertFrom-Json` can misread the manifest when the console encoding corrupts Chinese strings. Node `JSON.parse` successfully parses both manifest and summary, so the artifact itself is valid.

## 5. Review Method

Actual visual review was performed using:

- A generated local contact sheet at `.qa/route-screenshots/review-contact-sheet.jpg`.
- Full-size image inspection for representative and risk-heavy screenshots:
  - `settings-data-sources__mobile__390x844.png`
  - `settings-data-sources__tablet__768x1024.png`
  - `settings__mobile__390x844.png`
  - `tools__mobile__390x844.png`
  - `not-found__desktop__1440x900.png`
  - `home__desktop__1440x900.png`
  - `bookmarks__desktop__1440x900.png`
  - `todos__desktop__1440x900.png`
  - `landing__tablet__768x1024.png`
  - `weather__weather-fullhd__1920x1080.png`

All 29 screenshots were reviewed in the contact sheet. The contact sheet is a local `.qa` artifact and is not committed.

Assessment dimensions:

- Layout completeness and width discipline.
- Visual hierarchy.
- Surface/card nesting and weight.
- Control affordance.
- Responsive quality.
- Product polish and commercial finish.
- Weather freeze boundary.

## 6. P0 Issues

No P0 issues were found.

There were no screenshots showing an unusable route, hidden primary content, global horizontal overflow, console errors, missing main route content, or inaccessible primary actions.

## 7. P1 Issues

### DQA-P1-001

- Severity: P1
- Route: `/settings/data-sources`
- Viewport: `390x844`, also visible at `768x1024`
- Screenshot: `.qa/route-screenshots/settings-data-sources__mobile__390x844.png`
- Symptom: The hero/status overview consumes almost the entire mobile first viewport, and four status cards carry similar weight to the page's primary actions.
- Evidence: The first screen shows the title, two actions, and four large provider/status cards before the user reaches the actual source-status content.
- Likely cause: Data source status summary is implemented as large nested surfaces inside the hero rather than a compact summary row or lower-priority status list.
- Suggested fix direction: In Stage 30, reduce the status card weight on mobile, keep the primary page title and action pair clear, and move provider status into a tighter responsive summary pattern.
- Risk: Low to medium. Local to Settings data sources; must not change provider configuration behavior.
- Stage 30: Yes.

### DQA-P1-002

- Severity: P1
- Route: `/tools`
- Viewport: `390x844`
- Screenshot: `.qa/route-screenshots/tools__mobile__390x844.png`
- Symptom: The mobile hero contains dense metric cards with multiline labels, then immediately repeats another heavy tool selector section.
- Evidence: The first screen shows three compact cards with wrapped text plus a segmented selector and current tool panel; the visual hierarchy is crowded for a utility-first page.
- Likely cause: Desktop-oriented hero metrics and tool selector were compressed into mobile without reducing secondary content.
- Suggested fix direction: In Stage 30, simplify mobile hero metrics into a slimmer trust/status strip and make the current tool selector the primary first-screen control.
- Risk: Medium. Route-local visual CSS and primitive composition only; tool processing logic must remain untouched.
- Stage 30: Yes.

### DQA-P1-003

- Severity: P1
- Route: `/missing-route-stage-18`
- Viewport: `1440x900`
- Screenshot: `.qa/route-screenshots/not-found__desktop__1440x900.png`
- Symptom: The desktop not-found route renders a large outer framed region with an inner card, creating an unfinished nested-frame look.
- Evidence: The error content is visually trapped inside a huge bordered rectangle while the actual message card is much smaller, leaving a large empty framed area.
- Likely cause: NotFound combines a page-level frame and `BaseEmpty` surface with similar visual roles.
- Suggested fix direction: In Stage 30, remove the oversized outer frame or convert it into a proper PageShell band; keep one clear recovery surface and align it with the app shell spacing.
- Risk: Low. NotFound route only.
- Stage 30: Yes.

### DQA-P1-004

- Severity: P1
- Route: `/settings`
- Viewport: `390x844`
- Screenshot: `.qa/route-screenshots/settings__mobile__390x844.png`
- Symptom: Settings mobile places multiple large status rows inside the hero, making the page feel heavier than the task warrants.
- Evidence: The first viewport is dominated by the hero card and four full-width local status cards before the user reaches actual preferences.
- Likely cause: Settings overview uses the same large surface rhythm as dashboard pages even though mobile settings benefits from denser, clearer navigation groups.
- Suggested fix direction: In Stage 30, compress the mobile status overview and use a clearer settings-list rhythm for local data, theme, language, and backup summaries.
- Risk: Medium. Settings route only; backup/restore and preference behavior must not change.
- Stage 30: Yes.

## 8. P2 Issues

### DQA-P2-001

- Severity: P2
- Route: `/`
- Viewport: `768x1024`
- Screenshot: `.qa/route-screenshots/landing__tablet__768x1024.png`
- Symptom: The tablet landing hero preview is large enough that the product story below starts late.
- Evidence: The weather preview and mock workspace occupy most of the first viewport after the headline.
- Likely cause: Marketing composition keeps desktop-scale preview media on tablet.
- Suggested fix direction: Later polish can reduce preview height or reveal more of the next section while preserving the landing page's bespoke role.
- Risk: Low.
- Stage 30: No.

### DQA-P2-002

- Severity: P2
- Route: `/app`
- Viewport: `1440x900`
- Screenshot: `.qa/route-screenshots/home__desktop__1440x900.png`
- Symptom: Empty-state cards have similar visual weight to active dashboard cards.
- Evidence: "Today has no due tasks" and Weather connect panels read as large primary surfaces even when they are empty guidance.
- Likely cause: Shared surface styles do not yet distinguish active content, empty guidance, and secondary shortcuts strongly enough.
- Suggested fix direction: Later polish can tune empty-state surface weight and icon/heading density.
- Risk: Low.
- Stage 30: No.

### DQA-P2-003

- Severity: P2
- Route: `/todos`
- Viewport: `1440x900`
- Screenshot: `.qa/route-screenshots/todos__desktop__1440x900.png`
- Symptom: Composer, status, tasks, and countdown sections are all framed with similar strength.
- Evidence: The page is usable, but the right rail and empty task area compete with the main add-task workflow.
- Likely cause: Page-local task surfaces and shared primitives are visually close in weight.
- Suggested fix direction: Later polish can make the composer the dominant workflow and reduce secondary right-rail surface strength.
- Risk: Medium.
- Stage 30: No.

### DQA-P2-004

- Severity: P2
- Route: `/bookmarks`
- Viewport: `1440x900`
- Screenshot: `.qa/route-screenshots/bookmarks__desktop__1440x900.png`
- Symptom: The search/filter panel is visually heavier than the empty bookmark result state.
- Evidence: The grey search surface dominates the central column while the "start building" state below is less prominent.
- Likely cause: Search/filter surface uses strong fill and large spacing even when there are no bookmarks.
- Suggested fix direction: Later polish can reduce filter-panel fill weight or make the empty library state the stronger first-run affordance.
- Risk: Low.
- Stage 30: No.

### DQA-P2-005

- Severity: P2
- Route: `/settings`
- Viewport: `1440x900`
- Screenshot: `.qa/route-screenshots/settings__desktop__1440x900.png`
- Symptom: Settings desktop is functional but visually dense, with many similarly weighted blocks in the first screen.
- Evidence: Hero stats, preference controls, local data, and backup panels all appear with close surface strength.
- Likely cause: Settings still carries page-local specialized layouts instead of a mature settings-list primitive.
- Suggested fix direction: Later polish can introduce a settings row/group primitive after Stage 30 validates the smaller mobile cleanup.
- Risk: Medium.
- Stage 30: No.

### DQA-P2-006

- Severity: P2
- Route: `/weather`
- Viewport: `1920x1080`
- Screenshot: `.qa/route-screenshots/weather__weather-fullhd__1920x1080.png`
- Symptom: The screenshot baseline captures the unselected-city Weather state, which is visually sparse on very wide screens.
- Evidence: The route has no overflow and remains functional, but the content occupies a narrow upper region with large empty space below.
- Likely cause: Weather screenshot QA intentionally stabilizes the route boundary rather than exercising the rich loaded Weather state.
- Suggested fix direction: Do not change Weather in Stage 30. Treat this as a QA baseline limitation unless a Weather regression is proven.
- Risk: High if treated as a redesign task, because Weather is frozen.
- Stage 30: No.

## 9. Deferred Issues

### DQA-D-001

- Severity: Deferred
- Route: all routes
- Viewport: dark mode matrix not captured
- Screenshot: N/A
- Symptom: Stage 28 captures only the current route screenshot baseline and does not create a dark-mode matrix.
- Evidence: Manifest contains 29 light/current-theme screenshots only.
- Likely cause: Stage 28 intentionally kept scope small.
- Suggested fix direction: Add dark-mode screenshots only in a dedicated QA expansion stage.
- Risk: Medium artifact volume increase.
- Stage 30: No.

### DQA-D-002

- Severity: Deferred
- Route: all routes
- Viewport: all
- Screenshot: N/A
- Symptom: There is no pixel-diff threshold or screenshot artifact upload in CI.
- Evidence: Screenshot QA is local and `.qa` is ignored.
- Likely cause: Stage 28 deferred CI artifact decisions until usefulness and runtime are reviewed.
- Suggested fix direction: Keep local for now; revisit after Stage 30 fixes prove screenshot review value.
- Risk: Medium CI artifact/runtime cost.
- Stage 30: No.

### DQA-D-003

- Severity: Deferred
- Route: `/weather`
- Viewport: all Weather screenshots
- Screenshot: `.qa/route-screenshots/weather__desktop__1440x900.png`
- Symptom: Weather visual richness is intentionally not judged for redesign in this stage.
- Evidence: Weather remains frozen and is included only as a regression boundary.
- Likely cause: Product strategy requires whole-site upgrades before Weather animation or visual expansion resumes.
- Suggested fix direction: Keep Weather unchanged except regression fixes.
- Risk: High if reopened prematurely.
- Stage 30: No.

### DQA-D-004

- Severity: Deferred
- Route: all routes
- Viewport: all
- Screenshot: N/A
- Symptom: Axe automation is not integrated.
- Evidence: Existing QA route baseline uses Playwright semantic smoke checks only.
- Likely cause: Axe was explicitly out of Stage 28/29 scope.
- Suggested fix direction: Evaluate axe in a separate approved QA stage.
- Risk: Low to medium dependency and false-positive triage cost.
- Stage 30: No.

### DQA-D-005

- Severity: Deferred
- Route: all routes
- Viewport: N/A
- Screenshot: N/A
- Symptom: Vite large chunk warning remains.
- Evidence: `npm run build` reports a chunk over 500 kB.
- Likely cause: Existing app/vendor and Weather/Pixi bundle structure.
- Suggested fix direction: Defer bundle splitting to a measured performance stage.
- Risk: Medium if handled through broad refactor.
- Stage 30: No.

## 10. Stage 30 Recommended Batch

Stage 30 should fix only the first batch of P1 non-Weather issues:

1. `DQA-P1-001` - Settings Data Sources mobile/tablet hero/status compression.
2. `DQA-P1-002` - Tools mobile hero/selector density cleanup.
3. `DQA-P1-003` - NotFound desktop nested-frame cleanup.
4. `DQA-P1-004` - Settings mobile overview density cleanup.

Recommended boundaries:

- Routes: `/settings/data-sources`, `/tools`, `/missing-route-stage-18`, `/settings`.
- Components/pages likely involved: Settings/Data Sources page-level layout, Tools page hero/selector composition, NotFound page shell usage, existing shared surfaces/buttons only where the local fix clearly benefits.
- Base primitives: allowed only for small surface/list/link-button adjustments that reduce duplication and do not force a broad migration.
- Screenshot QA rerun: required after changes.
- Route a11y QA rerun: required after changes.
- Risk: low to medium if changes stay page-local and avoid Weather.

Do not include P2 items in Stage 30 unless no P1 work remains after implementation review. Do not modify Weather.

## 11. Validation Results

Commands run:

```bash
npm run qa:screenshots:ci
npm run build
npm run qa:a11y:routes:ci
```

Results:

- `npm run qa:screenshots:ci`: PASS, `29/29`, console errors `0`.
- `npm run build`: PASS.
- `npm run qa:a11y:routes:ci`: PASS on sequential rerun, `29/29`, console errors `0`.

Validation note:

- An initial route QA run was started in parallel with `npm run build` and produced a temporary `/settings/data-sources` 404 while `dist` was being rewritten. The sequential rerun after build completed passed `29/29`; no source or QA script change was made.

Build warning:

- Existing Vite large chunk warning remains non-blocking P2 and was not addressed.

Preview cleanup:

- QA-owned preview processes were cleaned by the runners.
- No persistent `.qa` screenshot files are committed.

## 12. Weather Freeze Boundary

Weather remains frozen. Stage 29 reviewed Weather screenshots only to confirm the route remains a regression boundary with no overflow or console-error failures.

Allowed future Weather changes:

- Verified regression fixes.
- Provider breakage fixes.
- Browser compatibility fixes.
- Confirmed accessibility fixes.
- Measured performance regressions.

Not allowed in Stage 30:

- Weather visual refactor.
- Weather runtime rewrite.
- PixiJS changes.
- Weather asset replacement.
- New Weather scenes.
- Weather animation expansion.
- Xiaomi Weather material analysis.

## 13. Known Limitations

- This is manual/rule-based design QA, not pixel diff.
- Dark mode screenshots are not part of the Stage 28 matrix.
- Axe is not integrated.
- PNG screenshots remain ignored and uncommitted.
- Weather remains frozen and is not a Stage 30 visual target.
- Vite large chunk warning remains deferred.

## 14. Stage 30 Recommendation

Stage 30 should be the first limited visual-fix batch, not a broad redesign. It should target the four P1 non-Weather issues listed above, keep business logic untouched, rerun screenshot QA and route a11y QA, and leave Weather unchanged except for regression fixes.

If GitHub push authentication fails in the user's environment, fix authentication outside this repo workflow. Do not embed tokens in remotes or documentation.
