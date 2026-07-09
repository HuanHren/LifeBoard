# Stage 32 Limited P2 Non-Weather Visual Polish

Date: 2026-07-09

Status: implementation and regression verification stage.

## 1. Scope

Stage 32 is limited to three Stage 31 P2 findings:

- `DQA-P2-002`: `/app` desktop Home empty-state surface weight is too heavy.
- `DQA-P2-003`: `/todos` desktop surface hierarchy is too flat across the main and side panels.
- `DQA-P2-004`: `/bookmarks` desktop search/filter area has higher visual priority than the empty content state.

Explicitly out of scope:

- `DQA-P2-001`: Landing tablet preview height.
- `DQA-P2-005`: Settings desktop density.
- `DQA-P2-006`: Weather wide empty-state baseline.
- Deferred screenshot findings, Weather runtime, Weather assets, Settings, Landing, package files, workflow files, dependencies, and CI strategy.

## 2. Baseline

- Branch: `main`.
- Initial working tree: clean.
- Local/remote relation at baseline: `main` was up to date with `origin/main`.
- Stage 25 baseline present: `775eac2 fix(weather): prevent page horizontal overflow`.
- Stage 26 baseline present: `4d09e49 fix(qa): clean up preview process group in ci`.
- Stage 27 baseline present: `7c73dd2 refactor(ui): polish non-weather page consistency`.
- Stage 28 baseline present: `baf52d8 test(qa): add route screenshot design baseline`.
- Stage 29 baseline present: `ccf0b7d docs(qa): review route screenshot design baseline`.
- Stage 30 baseline present: `453a9e2 fix(ui): resolve limited p1 visual issues`.
- Stage 31 baseline present: `0af4cc7 docs(qa): close out stage 30 screenshot review`.

No push authentication blocker was present at baseline because the checkout was synchronized with `origin/main`.

## 3. Changes

### `DQA-P2-002` Home

- Updated `src/modules/home/TodayFocusPanel.vue`.
- The empty focus panel now uses a lighter dashed surface treatment instead of the same heavy muted card weight as primary content.
- No task data, links, store behavior, or Home weather summary logic changed.

### `DQA-P2-003` Todos

- Updated `src/modules/todos/components/TodosWorkspace.vue`.
- The task list panel now carries a slightly stronger primary surface treatment.
- The side status card is visually demoted with a lighter dashed background.
- Updated `src/modules/todos/components/CountdownSection.vue` so the countdown side surface recedes from the primary task flow.
- No todo store, persistence, filtering, task composer behavior, countdown behavior, or form validation changed.

### `DQA-P2-004` Bookmarks

- Updated `src/modules/bookmarks/components/BookmarkControls.vue`.
- The search/filter block now reads more like a supporting toolbar: lower padding, lighter background, smaller heading, and reduced internal spacing.
- No bookmark store, persistence, search, pinned filter, category filter, composer behavior, or validation changed.

## 4. Visual Verification

Required screenshot verification after the changes:

- `/app` desktop and mobile.
- `/todos` desktop and mobile.
- `/bookmarks` desktop and mobile.
- `/weather` extra-wide regression screenshots at 1600px and 1920px.

Expected outcome:

- Home empty state is quieter than the hero and primary content.
- Todos desktop has a clearer primary task area and a less competing side rail.
- Bookmarks desktop gives the empty content/create path more prominence than the search/filter utility block.
- No new horizontal overflow, console errors, focus regressions, or P0/P1 visual regressions.

## 5. Validation Contract

Run and record:

- `npx npm@11.18.0 ci --dry-run`
- `npm ci --dry-run`
- `npm run build`
- `npm run qa:a11y:routes`
- `npm run qa:a11y:routes:ci`
- `npm run qa:a11y:routes:json`
- `npm run qa:a11y:routes:json:file`
- `npm run qa`
- `npm run qa:screenshots`
- `npm run qa:screenshots:ci`
- `npm run qa:design`

The screenshot baseline remains local QA evidence under ignored `.qa/` output.

## 6. Weather Boundary

Weather remains frozen. Stage 32 does not modify Weather source, store, services, runtime, PixiJS layer, assets, scenes, cache behavior, or motion behavior.

Weather screenshots are used only as regression guards, including the wide overflow checks introduced after Stage 25.

## 7. Known Limitations

- This stage does not implement visual diff automation.
- Dark-mode screenshot capture remains outside the current screenshot matrix.
- Vite large chunk warning remains a known non-blocking P2 and is not addressed here.
- The remaining P2 and deferred items are intentionally left for later scoped stages.

## 8. Stage 33 Recommendation

Stage 33 should be a closeout review for this limited P2 batch:

- Regenerate and review the full route screenshot set.
- Confirm the three Stage 32 P2 items are closed or document residual P2 debt.
- Reconfirm Weather remains a regression boundary only.
- Avoid starting Landing, Settings, Weather, CI, dependency, or broad architecture work unless a new P0/P1 regression is found.
