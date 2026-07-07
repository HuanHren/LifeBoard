# Stage 15 Bookmarks Settings Status Consistency

Date: 2026-07-07

Status: implemented and ready for regression review.

## 1. Baseline

- Branch: `main`.
- Pre-change workspace: clean.
- Baseline commit: `cb812ac refactor(pages): adopt primitives for home todos tools`.
- Stage 11 Weather freeze tag is present: `weather-freeze-stage-11`.
- Stage 12 audit tag is present: `architecture-audit-stage-12`.
- Stage 13 shell/tokens/primitives tag is present: `app-shell-tokens-stage-13`.
- Stage 14 commit is present at the baseline.
- Stage 14 tag `pages-primitives-stage-14` was not present at implementation time.

## 2. Skill Gate Summary

Skill files read from `C:\Users\jingr\codex-skills`:

- `impeccable\SKILL.md`
- `gpt-taste\SKILL.md`
- `redesign-existing-projects\SKILL.md`
- `baseline-ui\SKILL.md`
- `vue-best-practices\SKILL.md`
- `fixing-accessibility\SKILL.md`
- `fixing-motion-performance\SKILL.md`
- `playwright-cli\SKILL.md`

Additional references read:

- `vue-best-practices\references\reactivity.md`
- `vue-best-practices\references\sfc.md`
- `vue-best-practices\references\component-data-flow.md`
- `vue-best-practices\references\component-slots.md`
- `vue-best-practices\references\component-fallthrough-attrs.md`
- `vue-best-practices\references\composables.md`
- `vue-best-practices\references\perf-avoid-component-abstraction-in-lists.md`
- `vue-best-practices\references\perf-virtualize-large-lists.md`
- `impeccable\reference\product.md`
- `impeccable\reference\audit.md`

The project-local impeccable context script was not present at `.agents\skills\impeccable\scripts\context.mjs`.

## 3. Scope

Stage 15 continues the Stage 13 and Stage 14 primitive adoption path for Bookmarks and Settings.

Allowed scope used:

- Bookmarks page-level workspace, controls, composer, and sections.
- Settings page-level workspace and local presentation panels.
- Directly related shared/base primitives.
- Documentation and next-stage planning.

Explicitly out of scope:

- Weather internals, store, service, runtime, PixiJS layer, scenes, and assets.
- Xiaomi Weather material analysis.
- Bookmarks store, persistence schema, validation rules, search/filter logic, pin/delete/edit behavior.
- Settings data model, persistence schema, theme/language initialization, import/export format, Weather provider behavior.
- Whole-site directory migration or full visual replacement.

## 4. Files Changed

- `src/components/base/BaseInput.vue`
- `src/components/base/BaseNotice.vue`
- `src/modules/bookmarks/components/BookmarksWorkspace.vue`
- `src/modules/bookmarks/components/BookmarkControls.vue`
- `src/modules/bookmarks/components/BookmarkComposer.vue`
- `src/modules/bookmarks/components/BookmarkSection.vue`
- `src/modules/settings/components/SettingsWorkspace.vue`
- `src/modules/settings/components/BackupPanel.vue`
- `src/modules/settings/components/DataClearPanel.vue`
- `src/modules/settings/components/LanguageControl.vue`
- `src/modules/settings/components/LocalDataStatus.vue`
- `src/modules/settings/components/PortableExportsPanel.vue`
- `src/modules/settings/components/ThemeModeControl.vue`
- `src/modules/settings/components/TranslationExportPanel.vue`
- `src/modules/settings/components/WeatherLocationServices.vue`
- `src/modules/settings/components/WeatherProviderPreferences.vue`
- `docs/stage-15-bookmarks-settings-status-consistency.md`
- `docs/next-upgrade-plan.md`

## 5. Bookmarks Changes

- Bookmarks hero now uses `BaseSurface`.
- Bookmarks hero metrics now use `StatCard`.
- Search and filter controls now use `BaseSurface`, `SectionHeader`, and `BaseInput`.
- Bookmark composer now uses `BaseSurface`, `SectionHeader`, `FormField`, `BaseInput`, and `BaseNotice`.
- Bookmark sections now use `BaseSurface` and `SectionHeader`.

Preserved behavior:

- Add bookmark.
- Edit bookmark.
- Delete bookmark.
- Pin and unpin.
- Search query updates.
- Category filter updates.
- Pinned-only filter.
- Clear filters.
- Validation and persistence calls.

## 6. Settings Changes

- Settings hero now uses `BaseSurface`.
- Settings hero facts now use `StatCard`.
- Settings local panels now reuse `BaseSurface` where the page had custom panel surfaces.
- Backup, portable export, translation export, local data, Weather provider, and location services feedback now use `BaseNotice`.
- Theme and language persistence errors now use `BaseNotice`.
- Existing link-style Settings actions gained the shared focus treatment.

Preserved behavior:

- Theme switching.
- Language switching.
- Backup export.
- Backup import review flow.
- Portable exports.
- Translation export.
- Clear data confirmation flow.
- Weather provider preference changes.
- Caiyun token save/clear.
- AMap key save/clear.
- Home auto-location preference.

## 7. Status Component Consistency Changes

- Empty state: Bookmarks continues to use `BaseEmpty`.
- Error state: Settings local status and form persistence errors use `BaseNotice` or `BaseError`.
- Loading state: Bookmarks initialization continues to use `BaseSkeleton`.
- Search: Bookmarks search now uses `BaseInput` with a visible label.
- Form: Bookmarks composer now uses `FormField` and `BaseInput` for primary fields.
- Toolbar/filter: Bookmarks filter toolbar now uses `BaseSurface` and `SectionHeader`.

No complex status state machine was added.

## 8. Shared Primitives Adjusted

- Added `BaseNotice` for low-coupling info, success, danger, and warning notices.
- Extended `BaseInput` with native input pass-through props: `autocomplete`, `name`, and `maxlength`.
- Extended `BaseInput` with an exposed `focus()` method so existing imperative focus behavior remains intact.

The primitives remain generic and do not contain Bookmarks or Settings business concepts.

## 9. Weather Freeze Boundary

No Weather files were changed.

Weather remains frozen:

- No Weather store change.
- No Weather service change.
- No Weather runtime or PixiJS change.
- No Weather asset change.
- No Weather scene change.
- No Xiaomi Weather material analysis.

## 10. Accessibility Notes

- Search input keeps a visible label.
- Bookmark composer fields keep labels, descriptions, `aria-describedby`, and `aria-invalid`.
- Error/success feedback uses semantic `role="alert"` or polite live regions where appropriate.
- Link-style Settings actions now use the shared focus ring treatment.
- No icon-only button without label was introduced.
- No keyboard trap or custom modal behavior was added.

## 11. Responsive Notes

- Bookmarks keeps mobile-first stacking for composer, controls, sections, and cards.
- Bookmark filters remain horizontally scrollable on narrow screens.
- Bookmark titles, notes, categories, and URLs continue to use truncation or `overflow-wrap` where needed.
- Settings keeps the existing desktop/two-column and mobile/single-column layout.
- Settings dangerous actions remain stacked and readable on mobile.

## 12. Motion and Performance Notes

- No new dependency was added.
- No new heavy animation or runtime loop was added.
- Existing hover/focus transitions remain token-based and restrained.
- The accepted Vite large chunk warning remains a non-blocking P2.
- Bookmarks list remains mostly flat DOM and avoids deep component nesting inside each list item.

## 13. Build and Smoke Result

Modification-time build:

```powershell
npm run build
```

Result: passed.

Known non-blocking warning:

- Vite reports a chunk larger than 500 kB after minification. This is an accepted P2 follow-up.

Preview smoke result is recorded in the final Stage 15 closeout response.

## 14. Known Non-blocking Issues

- Vite large chunk warning remains.
- Bookmark edit form still uses local inline field layout; it is behaviorally stable and can be normalized further in a smaller future pass if needed.
- Settings data source subpage remains outside this stage except for smoke coverage.
- Some Settings radio/card controls still use local Tailwind class composition, but now sit inside the shared surface/status system.

## 15. Stage 16 Recommendation

Recommended next scope:

- Status component edge-case hardening across all routes.
- NotFound and secondary route state polish.
- Settings data source subpage primitive adoption if it remains visually behind.
- Light accessibility pass for radio groups, file input, confirmation dialog, and route focus.
- Route-wide preview smoke at 390px, 768px, and 1440px.

Do not use Stage 16 to:

- Rewrite Weather internals.
- Resume Xiaomi Weather analysis.
- Replace Weather assets or add Weather scenes.
- Migrate all modules into a new directory architecture.
- Introduce a new global state architecture.
