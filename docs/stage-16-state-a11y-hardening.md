# Stage 16 State and Accessibility Hardening

Date: 2026-07-07

Status: implemented with scoped state-component and accessibility hardening.

## 1. Baseline

- Branch: `main`.
- Starting commit: `9562a06 refactor(pages): adopt primitives for bookmarks settings`.
- Starting workspace: clean.
- Remote status: up to date with `origin/main`.
- Stage 11 Weather freeze tag is present: `weather-freeze-stage-11`.
- Stage 12 audit tag is present: `architecture-audit-stage-12`.
- Stage 13 shell/token tag is present: `app-shell-tokens-stage-13`.
- Stage 15 tag is present: `bookmarks-settings-stage-15`.

Weather remains frozen. This stage did not modify Weather source, Weather runtime, Weather store, Weather services, Weather scenes, or Weather assets.

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

Additional references read for this stage:

- `vue-best-practices\references\sfc.md`
- `vue-best-practices\references\component-data-flow.md`
- `vue-best-practices\references\component-slots.md`
- `vue-best-practices\references\component-fallthrough-attrs.md`
- `vue-best-practices\references\composables.md`
- `vue-best-practices\references\reactivity.md`
- `impeccable\reference\audit.md`
- `impeccable\reference\product.md`
- `impeccable\reference\harden.md`
- `impeccable\reference\interaction-design.md`

The impeccable context script classified LifeBoard as product UI, so this pass favored reliable task surfaces, focus states, readable status messaging, and restrained motion.

## 3. Scope

Allowed scope used:

- `src/components/base` status and form primitives.
- NotFound route state.
- Settings data source presentation components.
- Documentation and next-stage planning.

Explicitly out of scope:

- Weather internals.
- Weather PixiJS runtime.
- Weather assets and scene catalog.
- Xiaomi Weather material analysis.
- Business logic changes for Todos, Tools, Bookmarks, Settings, or Weather.
- Global architecture migration.

## 4. Files Changed

- `src/components/base/BaseEmpty.vue`
- `src/components/base/BaseError.vue`
- `src/components/base/BaseSkeleton.vue`
- `src/components/base/BaseNotice.vue`
- `src/components/base/BaseInput.vue`
- `src/components/base/FormField.vue`
- `src/modules/home/HomePage.vue`
- `src/modules/not-found/NotFoundPage.vue`
- `src/modules/settings/components/DataSourceRow.vue`
- `src/modules/settings/components/SettingsWorkspace.vue`
- `src/modules/settings/pages/DataSourcesPage.vue`
- `docs/stage-16-state-a11y-hardening.md`
- `docs/next-upgrade-plan.md`

## 5. State Components Audited and Changed

- `BaseEmpty`: added heading-level control and action slot support while preserving the existing `actionLabel` API.
- `BaseError`: added action slot support while preserving the existing `actionLabel` API.
- `BaseSkeleton`: marks skeleton bars as decorative and announces loading politely from the wrapper.
- `BaseNotice`: added optional title/message props, action slot support, safer long-text wrapping, and live-region defaults for status and alert roles.
- `BaseInput`: added `ariaLabel`, `inputmode`, and `required` pass-through props for search/form edge cases.
- `FormField`: passes `required` to scoped slots and makes inline errors non-color-only for assistive technology.

No state machine, new dependency, or visual system rewrite was introduced.

## 6. NotFound Changes

The NotFound route now uses `BaseEmpty` inside the existing page shell:

- Keeps route behavior unchanged.
- Keeps the page `h1` through the new `titleAs` option.
- Keeps both recovery actions: landing and workspace.
- Aligns empty-state spacing, dashed surface, text wrapping, and action grouping with the rest of the product.

## 7. Settings Data Sources Changes

The Settings data source page was normalized without changing Weather/provider behavior:

- Hero and sections use `BaseSurface` where practical.
- Section headings use `SectionHeader`.
- Hero facts use `StatCard`.
- `DataSourceRow` uses `BaseSurface`, preserves all action links, and improves long value wrapping.
- Provider status pills keep visible text and now expose a contextual accessible label.

No source metadata, provider selection, credentials, backup snapshot loading, or Weather store behavior changed.

## 8. Accessibility Hardening

Improvements:

- Empty/error components support richer action composition without losing semantic state roles.
- Skeleton loading state exposes one concise live status and hides decorative bars from assistive tech.
- Notice status and alert messages are announced with appropriate live-region defaults.
- Base input can now receive an accessible name when a visible label is not structurally available.
- Form errors retain visible inline text and add a screen-reader error prefix.
- NotFound keeps a real page heading and keyboard-accessible recovery links.
- Data source status text is no longer only visual context; it has a provider-specific accessible label.
- Home and Settings no longer render nested `main` landmarks inside the App Shell `main`.

Existing checked patterns retained:

- Skip link and main focus target.
- `aria-current` on active navigation.
- Labeled Settings provider radio cards and credential fields.
- Dialog focus return behavior in Settings confirmation flows.
- Search and filter controls remain keyboard reachable.

## 9. Responsive Hardening

- Data source rows now use `min-width: 0` in the text column and `break-words` for long detail values.
- NotFound actions wrap naturally on narrow screens.
- Existing mobile bottom-nav clearance remains unchanged.
- Existing horizontal filter scrollers in Todos and Bookmarks remain constrained to their containers.

## 10. Motion and Performance Notes

- No new animation system was added.
- No runtime loops or timers were added.
- Existing global `prefers-reduced-motion` rule remains active.
- The accepted Vite large chunk warning remains a non-blocking P2 follow-up.

## 11. Weather Freeze Boundary

Weather smoke is required after this stage, but Weather source remains untouched:

- No Weather store changes.
- No Weather service changes.
- No Weather runtime changes.
- No PixiJS changes.
- No Weather asset changes.
- No new scenes.
- No Xiaomi Weather analysis.

## 12. Build and Smoke Result

Build:

```powershell
npm run build
```

Result: passed before and after changes.

Known non-blocking warnings:

- Vite/Rolldown plugin timing notice.
- Vite chunk warning for a chunk larger than 500 kB.

Both warnings are accepted P2 follow-up items from earlier stages and are not blockers for Stage 16.

Preview smoke:

- `/`
- `/app`
- `/weather`
- `/todos`
- `/tools`
- `/bookmarks`
- `/settings`
- `/settings/data-sources`
- a missing route

Viewports checked:

- 390 px
- 768 px
- 1440 px

Result:

- All routes returned 200 in Vite preview.
- Each route rendered exactly one `main` landmark after the nested-main fix.
- No horizontal overflow was detected at 390 px, 768 px, or 1440 px.
- Weather opened successfully and remained within the frozen smoke boundary.
- No unhandled page errors were reported by the preview smoke.

## 13. Manual Checks

Manual or automated smoke confirmed:

- Todos add/filter flow remains usable. A no-date task is visible under the All filter, matching existing behavior.
- Tools JSON and timestamp error states expose `role="alert"`.
- Bookmarks add/search flow remains usable with a long URL.
- Settings backup file input, confirmation dialog, and action buttons remain reachable.
- Settings data source rows expose status text and external links.
- Keyboard focus is reachable after tabbing into app routes.
- Weather opens under the frozen boundary.

## 14. Known Non-blocking Issues

- Vite large chunk warning remains P2.
- No `npm run lint` or `npm run test` scripts exist in `package.json`.
- Settings data source page still has some local scoped CSS, but it now sits on shared primitives and can be further simplified later.
- A full axe-style automated audit remains a later-stage recommendation.

## 15. Stage 17 Recommendation

Recommended Stage 17 scope:

- Run a full route-level accessibility audit with axe or an equivalent checker if adding a small dev-only audit tool is approved.
- Continue hardening dialog, radio group, file input, and toolbar semantics where real issues are found.
- Tighten remaining local CSS in Settings data sources only if it reduces duplication without changing behavior.
- Preserve Weather freeze and smoke it only as a regression boundary.

Stage 17 should not:

- Rewrite Weather internals.
- Resume Xiaomi Weather material analysis.
- Replace Weather assets or add Weather scenes.
- Start a whole-source directory migration.
- Introduce a new global state architecture.
- Redesign pages beyond verified accessibility or state edge-case fixes.
