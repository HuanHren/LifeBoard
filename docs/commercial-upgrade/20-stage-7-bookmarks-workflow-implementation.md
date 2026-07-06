# LifeBoard Commercial Upgrade - Stage 7

## Baseline

- Stage baseline commit: `90e1a2310ea34810e958d2c54c08557d0eb475d6` (`fix(todos): refine semantic metric states`)
- Required ancestors verified: `90e1a23`, `6d25924`, and `a54de16`
- Branch: `main`

## Scope

Stage 7 redesigns the `/bookmarks` resource library workflow only. The work keeps the existing route, navigation shell, bookmark store, storage key, schema, validation limits, and `/app` pinned-bookmark contract intact.

## Skill Gate

All required local skill files were read before editing, including `impeccable`, `gpt-taste`, `baseline-ui`, `vue-best-practices` plus its requested references, `fixing-accessibility`, `fixing-motion-performance`, `playwright-cli`, `audit`, and `harden`.

The optional impeccable helper script `C:\Users\jingr\codex-skills\impeccable\scripts\context.mjs` was checked and is not present. That was treated as non-blocking per the stage brief. `impeccable\reference\product.md` was read.

`gpt-taste` was applied only for visual audit discipline. Its GSAP/AIDA direction was not used because Stage 7 explicitly forbids GSAP, ScrollTrigger, new dependencies, and route-shell animation work.

## Existing Contract Audit

The existing bookmark persistence contract remains:

- Storage key: `lifeboard.bookmarks`
- Version: `1`
- Envelope: `{ version: 1, bookmarks: Bookmark[] }`
- Bookmark fields: `id`, `title`, `url`, `category`, `note`, `pinned`, `createdAt`, `updatedAt`
- Current limits preserved: title `120`, category `40`, note `280`, URL `2048`
- Existing id generation preserved through `crypto.randomUUID()`
- Existing sort contract preserved: pinned summary data first where already used, and updated-time/title sorting from the store helpers

The `/app` dashboard still reads pinned bookmarks from `useHomeDashboard()` and falls back to summary bookmarks when no pinned items exist.

## Information Architecture

`/bookmarks` now opens on a library workspace rather than a generic page header plus form/list stack. The first viewport contains:

- A single page `h1`
- A compact hero with saved, pinned, category, and visible-match status
- Primary actions for adding a bookmark and returning to all results
- Search, category chips, and a pinned-only workflow before the collection content

On mobile, the composer moves after the library content so users can immediately scan pinned or saved references. The hero and filters were tightened so populated 390px screens show the pinned section beginning in the first viewport.

## Component Changes

- `BookmarksPage.vue` now delegates the page heading to the bookmarks workspace and avoids a duplicate heading stack.
- `BookmarksWorkspace.vue` owns the new hero, metrics, responsive ordering, pinned-only UI state, empty states, and add-focus action.
- `BookmarkControls.vue` replaces the native category select with accessible filter chips for all, pinned-only, uncategorized, and each category.
- `BookmarkComposer.vue` is a compact side panel; the optional note is collapsed behind native `details`.
- `BookmarkSection.vue`, `BookmarkList.vue`, and `BookmarkItem.vue` provide the denser commercial library list with safe wrapping for long titles, notes, categories, and URLs.
- `BookmarkEditForm.vue` and `BookmarkDeleteConfirmation.vue` keep their flows but receive minimum touch target sizing on action buttons.

## Accessibility

The redesign keeps semantic document structure:

- One `h1` on `/bookmarks`
- `section` regions with labels for hero, controls, composer, pinned, and saved groups
- Real button controls for filters with `aria-pressed`
- Named item actions for open, pin, unpin, edit, and delete
- Existing keyboard confirmation behavior for delete cancel via Escape remains available
- External links remain normal anchors with `_blank` and `noopener noreferrer`

## i18n

English and Chinese module dictionaries were updated for the new hero, metrics, filter chips, composer panel label, optional-note disclosure, pinned empty state, and item action labels.

The existing storage-unavailable localization mismatch was corrected by mapping the actual service message: `Local storage is unavailable. Bookmark changes cannot be saved in this browser.`

## Responsive And Theme Verification

Production-preview screenshots were generated in:

`C:\Users\jingr\AppData\Local\Temp\lifeboard-stage7-bookmarks-final`

The set includes empty, populated, search, edit, delete confirmation, no-results, long-URL overflow, bottom-nav clearance, `/app` pinned regression, reduced-motion, English, Chinese, light, and dark states across `390`, `768`, `1024`, `1280`, `1440`, and `1920` widths.

DOM audit evidence in `stage7-evidence.json` reports:

- `19` screenshots
- No invalid H1/main/overflow states
- No console errors
- External bookmark link attributes verified
- `/app` pinned bookmark regression verified

## CRUD Smoke

Production-preview CRUD smoke in `stage7-crud-evidence.json` passed:

- Add
- Refresh/body persistence check
- Pin
- Unpin
- Search by title
- Category filter
- Edit
- Delete cancel
- Delete confirm
- Delete persistence check

The smoke also verified the storage schema keys remain `bookmarks` and `version`.

## Build Result

Baseline and final `npm run build` passed.

Final Bookmarks build artifacts:

- `BookmarksPage-Cx6C5lT3.css`: `9.57 kB`, gzip `1.63 kB`
- `BookmarksPage-DDkbs_N5.js`: `25.08 kB`, gzip `6.05 kB`

The existing Vite/Rolldown warning remains for the shared `lib` chunk over `500 kB`. This stage did not add dependencies or introduce new shared synchronous imports.

## Weather Freeze Verification

No files under the weather freeze paths were modified:

- `src/modules/weather`
- `src/assets/weather/atmosphere`
- `public/weather-assets`
- `public/__local_weather_reference`

The weather freeze diff is empty.

## Known Limitations

`playwright-cli` is not available in this project and `npx --no-install playwright-cli --help` cannot resolve an executable. Verification therefore used installed Chrome Headless through the Chrome DevTools Protocol without adding dependencies.

The existing large shared `lib` chunk warning remains from the baseline build.

## Recommended Next Stage

Do not start the next stage from this closeout. A later stage should begin from the committed Stage 7 checkpoint with a new scope and separate verification plan.
