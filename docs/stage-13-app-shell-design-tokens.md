# Stage 13 App Shell, Design Tokens, and Shared Primitives

Date: 2026-07-07

Status: baseline upgrade complete.

## 1. Baseline

- Branch: `main`.
- Starting commit: `b727816 docs(audit): prepare architecture visual upgrade`.
- Weather freeze commit remains behind the baseline: `2719cce chore(weather): finalize regression freeze prep`.
- Weather freeze tag: `weather-freeze-stage-11`.
- Stage 12 tag: `architecture-audit-stage-12`.
- Starting working tree: clean.

Stage 13 was based on the Stage 11 Weather freeze and Stage 12 architecture/visual audit. The work intentionally stayed in the global foundation layer.

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
- `vue-best-practices\references\composables.md`
- `impeccable\reference\product.md`
- `impeccable\reference\audit.md`

The project-local impeccable context script was not present at `.agents\skills\impeccable\scripts\context.mjs`, so the skill's product/audit references were used directly.

## 3. Design Tokens Added or Normalized

Updated `src/assets/styles/tokens.css` with semantic aliases for the next visual workstream:

- App/page background: `--color-app-background`, `--color-page-background`.
- Surface roles: `--color-surface-solid`, `--color-surface-card`, `--color-surface-card-muted`, `--color-surface-card-elevated`, `--color-surface-card-interactive`.
- Status roles: `--color-info`, `--color-info-soft`, alongside existing success/warning/danger.
- Radius remains the existing `sm`, `md`, `lg`, `xl`, `pill` scale.
- Shadow roles: `--shadow-card`, `--shadow-panel`, `--shadow-floating`.
- Spacing roles: `--page-shell-inline`, `--page-shell-block`, `--page-shell-gap`, `--page-shell-gap-compact`, `--card-gap`, `--control-cluster-gap`.
- Typography roles continue through page, section, card, body, label, caption, and numeric tokens.
- Motion aliases: `--motion-duration-fast`, `--motion-duration-normal`, `--motion-duration-slow`, `--motion-ease-standard`.
- Z-index aliases: dropdown, modal, toast, tooltip, and weather background safety.
- Surface blur: `--surface-blur`.

Dark mode remains supported with matching semantic aliases. The clay green identity remains the primary accent and was not replaced.

## 4. App Shell Changes

Active shell ownership is now clear:

- Active application shell lives in `src/app/layouts`.
- Active navigation lives in `src/app/navigation`.
- `src/components/layout` remains legacy code and should not be used for new Stage 14 work unless explicitly migrated later.

Implementation changes:

- `AppLayout.vue` now uses the semantic `app-shell` class and app/page shell tokens.
- `LandingLayout.vue` and `MinimalLayout.vue` use `--color-app-background`.
- Main app padding now reads from `--page-shell-inline` and `--page-shell-block`.
- Sticky navigation blur now reads from `--surface-blur`.

Navigation behavior was not rewritten. Active route state continues to use router meta `navigationKey`.

## 5. Shared Primitives Added or Normalized

Updated or added primitives:

- `PageLayout.vue`: normalized into the PageShell contract while preserving existing props. It now supports title, description, eyebrow, header slot, and actions slot.
- `SectionHeader.vue`: added as a focused primitive for section title, description, and action areas.
- `BaseSection.vue`: now uses `SectionHeader` instead of duplicating section header markup.
- `BaseSurface.vue`: normalized around global `surface-card` classes and added an `info` variant.
- `BaseCard.vue`: now uses the shared surface-card treatment.
- `BaseEmpty.vue`, `BaseError.vue`, `BaseSkeleton.vue`: normalized to shared surface state classes.

The component APIs remain intentionally small. No broad UI framework or complex abstraction was introduced.

## 6. Page Adoption Scope

Already adopted through existing page wrappers:

- Home uses `PageLayout`.
- Weather uses `PageLayout`.
- Todos uses `PageLayout`.
- Tools uses `PageLayout`.
- Bookmarks uses `PageLayout`.
- Settings uses `PageLayout`.
- Weather city management and long-range Weather pages use `PageLayout`.
- Settings data sources uses `PageLayout`.

Stage 13 source adoption was intentionally minimal:

- NotFound now uses `BaseSurface` for its outer state container.
- Weather kept the existing outer `PageLayout` only. No Weather internals were modified.

Page business logic was not rewritten.

## 7. Weather Freeze Boundary

No changes were made to:

- Weather store.
- Weather service/API behavior.
- Weather renderer runtime.
- PixiJS layer internals.
- Weather assets.
- Weather scene selection logic.
- Xiaomi Weather material analysis.

Weather remains frozen. Future Weather changes are limited to regression fixes or outer-shell compatibility only.

## 8. Accessibility Notes

Maintained:

- Skip link.
- Main landmark focus management.
- Route navigation `aria-current`.
- Icon-only settings and close buttons with accessible labels.
- Empty/error/loading states with status or alert semantics.
- Visible focus via existing focus-ring tokens.

Added/normalized:

- Shared page/section/header classes support consistent semantic heading and action layout.
- Surface state components keep readable text and non-color-only borders/backgrounds.

No new keyboard traps, custom widgets, or animated navigation containers were introduced.

## 9. Responsive Notes

The PageShell contract centralizes max width and vertical rhythm:

- Default width: `--content-max-width`.
- Wide width: `--content-wide-max-width`.
- Narrow width: `64rem`.
- Compact gap: `--page-shell-gap-compact`.
- Regular gap: `--page-shell-gap`.

Mobile bottom navigation behavior was not rewritten. The existing mobile clearance remains in `AppLayout` and route pages.

## 10. Performance and Motion Notes

- No new dependencies were added.
- No heavy animation system was added.
- Existing reduced-motion global rule remains in place.
- Surface and page shell changes are CSS/class-level and do not add runtime loops.
- The accepted Vite large chunk warning remains a non-blocking P2.

## 11. Known Non-blocking Issues

- Vite still reports a large shared library chunk.
- `src/components/layout` still contains legacy shell components and should be retired or migrated in a later controlled pass.
- Many feature modules still use local hero, metric, panel, and form styles.
- Full page-level commercial visual refactor is intentionally incomplete.
- A full axe-style accessibility audit is still recommended for later stages.

## 12. Stage 14 Recommendation

Recommended Stage 14 scope:

- Start page-level adoption of `PageLayout` header/actions slots, `SectionHeader`, and `BaseSurface` in Home, Todos, and Tools first.
- Convert repeated hero/stat/surface patterns into small shared primitives only where duplication is already clear.
- Keep business stores and feature data logic untouched.
- Keep Weather frozen; only preserve shell compatibility.

Stage 14 should not:

- Rewrite Weather runtime/store/assets.
- Resume Xiaomi Weather material analysis.
- Redesign every page in one pass.
- Introduce a large UI framework.
- Migrate the entire source tree into a new architecture all at once.
