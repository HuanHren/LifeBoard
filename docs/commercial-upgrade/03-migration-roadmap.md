# LifeBoard Commercial Upgrade Migration Roadmap

This roadmap starts after Stage 1A. Do not begin any stage without a new explicit task.

## Stage 1B: Route And Information Architecture Design

Goal:

- Decide exact `/` and `/app` behavior before implementation.
- Define route metadata and compatibility policy.

Allowed scope:

- Documentation and route design artifacts.
- Optional prototype notes under `docs/commercial-upgrade/**`.

Forbidden scope:

- No route implementation.
- No page moves.
- No navigation changes.
- No source changes unless a separate Stage 1B implementation task explicitly allows them.

Prerequisites:

- Stage 1A docs committed.
- Baseline build passing.

Risks:

- Breaking current `/` Home behavior.
- Losing document title/i18n behavior.
- Breaking Home module links to Weather, Todos, Bookmarks, Tools.

Verification:

- Build if source changes are later approved.
- Route matrix review before implementation.

Completion criteria:

- Final route table.
- Compatibility decision for old `/`.
- Layout metadata design.
- List of source files expected to change in implementation.

Weather touch:

- No weather internals. Weather route metadata only if implementation is later approved.

Recommended commit granularity:

- One docs/design commit.

## Stage 2: Design Tokens And Visual Specification

Goal:

- Extend the visual system for commercial landing, top navigation, app layout, motion, and responsive rules.

Allowed scope:

- Design token/spec documentation.
- Later implementation may touch `src/assets/styles/tokens.css` and `src/assets/styles/main.css` only if explicitly scoped.

Forbidden scope:

- No page rebuild.
- No GSAP or new dependency install.
- No weather visual token rewrite.

Prerequisites:

- Stage 1B route/layout plan.

Risks:

- Overfitting tokens to landing visuals.
- Accidentally changing weather appearance through global tokens.

Verification:

- Token review against existing `DESIGN.md`.
- Build if CSS changes are later approved.
- Weather screenshot smoke if global tokens change.

Completion criteria:

- Token categories defined.
- Landing/app/mobile visual boundaries documented.
- Weather-safe token migration strategy documented.

Weather touch:

- No weather internals. Only global token impact checks if CSS changes occur.

Recommended commit granularity:

- Docs/spec commit, then optional token implementation commit.

## Stage 3: Desktop Top Navigation And App Shell

Goal:

- Introduce target App Layout and replace permanent desktop sidebar with top navigation for app routes.
- Preserve current route behavior.

Allowed scope:

- `src/app/**`
- `src/components/layout/**` or new app layout/navigation paths.
- `src/shared/constants/navigation.ts` if navigation model is revised.
- Minimal `src/router/**` metadata if Stage 1B defined it.
- Global CSS only for shell layout support.

Forbidden scope:

- No business page redesign.
- No weather internals.
- No storage changes.
- No dependency changes.

Prerequisites:

- Stage 1B route/layout decision.
- Stage 2 shell token decisions if CSS tokens are needed.

Risks:

- Breaking skip link/main landmarks.
- Dense mobile navigation.
- Route active-state regressions.
- Weather page layout regressions from container changes.

Verification:

- `npm run build`.
- Route smoke for all current routes.
- Responsive checks at 375, 390, 768, 1024, 1280, 1440.
- Accessibility check for landmarks, active nav, focus order, skip link.
- Weather route smoke.

Completion criteria:

- App routes use target shell.
- Landing route is not accidentally wrapped in app shell if already introduced.
- Navigation model separates primary app nav from settings/utility actions.

Weather touch:

- Outer route/shell only. No `src/modules/weather/**`.

Recommended commit granularity:

- Layout foundation commit.
- Navigation model commit.
- Responsive/accessibility polish commit.

## Stage 4: Scroll Narrative Landing Page

Goal:

- Build commercial introduction page at `/` with scroll narrative and local component interactions.

Allowed scope:

- Landing module/page.
- Landing layout.
- Landing-only styles and assets.
- Route mapping only as defined in Stage 1B.

Forbidden scope:

- No app workspace redesign.
- No weather renderer rewrite.
- No global animation dependency unless explicitly approved.
- No GSAP install unless separate dependency decision is made.

Prerequisites:

- `/` vs `/app` migration implemented safely.
- App Layout separated from Landing Layout.
- Reduced-motion and performance budget defined.

Risks:

- Scroll-linked animation polluting app runtime.
- Loading animation libraries on workspace routes.
- Landing copy bypassing i18n.

Verification:

- `npm run build`.
- Landing desktop/mobile responsive screenshots.
- Reduced-motion check.
- Bundle check for landing-only chunks.
- App route smoke to ensure landing code does not affect workspace.

Completion criteria:

- `/` is landing page.
- `/app` remains usable workspace home.
- Landing animation degrades safely.

Weather touch:

- No weather internals. Weather may be represented by existing public-facing component screenshots or controlled preview only if explicitly scoped.

Recommended commit granularity:

- Landing route/layout commit.
- Landing content sections commit.
- Motion/progressive enhancement commit.
- Responsive/accessibility polish commit.

## Stage 5: Workspace Home

Goal:

- Reposition current Home dashboard as `/app` workspace home and refine information hierarchy.

Allowed scope:

- `src/modules/home/**`
- Route links into `/app` if needed.
- App Layout container adjustments if scoped.

Forbidden scope:

- No weather internals.
- No todos/bookmarks/tools business logic rewrite.
- No storage changes.

Prerequisites:

- Stage 1B route decision implemented.
- Stage 3 App Layout stable.

Risks:

- Home currently aggregates weather/todos/bookmarks/tools state through `useHomeDashboard.ts`.
- Weather summary can trigger provider/location behavior if changed carelessly.

Verification:

- `npm run build`.
- `/app` route smoke.
- Home empty/data states.
- Links to Weather/Todos/Bookmarks/Tools.
- Mobile and desktop screenshots.

Completion criteria:

- Workspace home is clearly application-oriented.
- Landing complexity is not present in workspace route.

Weather touch:

- Only Home weather summary integration. No `src/modules/weather/**` changes unless separately approved.

Recommended commit granularity:

- Route/home ownership commit.
- Home layout/content commit.
- Regression polish commit.

## Stage 6A: Todos

Goal:

- Upgrade Todos page visual hierarchy and interaction polish within existing domain behavior.

Allowed scope:

- `src/modules/todos/**`
- Shared UI only if a repeated primitive is proven.

Forbidden scope:

- No storage key or envelope changes.
- No unrelated Home/Weather/Bookmarks/Tools changes.

Prerequisites:

- App Layout stable.
- Storage regression checklist ready.

Risks:

- Local data loss from storage shape changes.
- Delete/restore interaction regressions.

Verification:

- `npm run build`.
- Todos CRUD smoke.
- Countdown CRUD smoke.
- Legacy storage read smoke if data fixtures exist.
- Mobile keyboard/form checks.

Completion criteria:

- Existing todos/countdowns behavior preserved.
- Visual upgrade fits design system.

Weather touch:

- None.

Recommended commit granularity:

- Component layout commit.
- Interaction/state polish commit.

## Stage 6B: Bookmarks

Goal:

- Upgrade Bookmarks page while preserving local persistence and category/pin behavior.

Allowed scope:

- `src/modules/bookmarks/**`
- Shared UI only if repeated with Todos/Settings.

Forbidden scope:

- No storage key or envelope changes.
- No browser extension/cloud sync scope.

Prerequisites:

- App Layout stable.
- Bookmarks storage regression checklist.

Risks:

- URL/category validation regressions.
- Pin/filter behavior regressions.

Verification:

- `npm run build`.
- Add/edit/delete/pin/filter smoke.
- Storage recovery behavior smoke.

Completion criteria:

- Existing bookmark data remains compatible.
- Page states are complete.

Weather touch:

- None.

Recommended commit granularity:

- Layout commit.
- Interaction polish commit.

## Stage 6C: Tools

Goal:

- Upgrade tools workspace while keeping processing in memory and private.

Allowed scope:

- `src/modules/tools/**`
- Route query behavior if preserving selected tool.

Forbidden scope:

- No persistence for tool input.
- No external API calls.
- No new heavy parsing dependency without explicit approval.

Prerequisites:

- App Layout stable.

Risks:

- Breaking query-selected tool behavior in `ToolsWorkspace.vue`.
- Copy feedback/accessibility regressions.

Verification:

- `npm run build`.
- Tool switching route-query smoke.
- JSON/text/timestamp/copy smoke.
- Accessibility names/live region checks.

Completion criteria:

- Tools remain browser-local and unsaved.
- Inputs/outputs are clear on mobile and desktop.

Weather touch:

- None.

Recommended commit granularity:

- Workspace layout commit.
- Individual tool polish commit.

## Stage 6D: Settings

Goal:

- Upgrade Settings while preserving backup, restore, privacy, data-source, theme, and language behavior.

Allowed scope:

- `src/modules/settings/**`
- Global theme/language stores only if explicitly needed and regression-covered.

Forbidden scope:

- No storage key changes without migration plan.
- No weather provider behavior changes unless separately scoped.
- No credentials storage changes.

Prerequisites:

- App Layout stable.
- Storage transaction regression plan.

Risks:

- Backup/restore crosses todos, bookmarks, weather, and theme keys.
- Data source page links to weather long-range route.

Verification:

- `npm run build`.
- Theme/language switch smoke.
- Backup export/import validation smoke.
- Clear data transaction smoke.
- Weather provider settings smoke without touching weather internals.

Completion criteria:

- Settings remains the only owner of backup/restore UX.
- Local-first privacy model remains explicit.

Weather touch:

- Settings may touch weather provider preferences UI only if explicitly scoped. No weather renderer/data normalization/cache internals.

Recommended commit granularity:

- Settings page layout commit.
- Backup/restore verification commit.
- Data-source/preferences polish commit.

## Stage 6E: Weather Peripheral Adaptation

Goal:

- Adapt weather page to the new App Layout without modifying frozen weather core.

Allowed scope:

- Route shell/container around weather.
- Navigation/title metadata.
- Possibly weather page outer wrapper if explicitly approved.

Forbidden scope:

- No new weather types.
- No new weather animation.
- No Pixi renderer changes.
- No provider/cache/condition mapping changes.
- No weather asset changes.

Prerequisites:

- App Layout stable.
- Weather freeze regression scripts available.

Risks:

- Layout constraints can break weather hero or Pixi canvas framing.
- Reduced-motion behavior can regress through shell changes.

Verification:

- `npm run build`.
- Weather freeze validation script if compatible.
- `/weather`, `/weather/cities`, `/weather/15-day` smoke.
- Desktop/mobile weather screenshots.
- Reduced-motion weather smoke.

Completion criteria:

- Weather remains visually and behaviorally equivalent inside new shell.
- Frozen paths unchanged unless separately approved.

Weather touch:

- Peripheral only. Treat any `src/modules/weather/**` change as high risk and require explicit approval.

Recommended commit granularity:

- Container/metadata commit.
- Verification-only closeout commit if needed.

## Stage 7: Independent Mobile Adaptation

Goal:

- Refine mobile navigation, headers, touch targets, form ergonomics, and keyboard behavior independently from desktop.

Allowed scope:

- App mobile layout/navigation.
- Module responsive styles/components where needed.

Forbidden scope:

- No desktop visual rewrite under mobile stage.
- No weather internals unless Stage 6E identified a blocking shell issue.

Prerequisites:

- Stage 3 and Stage 6 page upgrades mostly stable.

Risks:

- Bottom nav crowding.
- Keyboard overlap on forms.
- Horizontal overflow in weather/tools/bookmarks.

Verification:

- `npm run build`.
- Viewports 375, 390, 768.
- Touch target audit.
- Keyboard/form smoke.
- Reduced-motion smoke.

Completion criteria:

- Mobile is designed as its own experience, not compressed desktop.
- Primary workflows remain reachable with one-hand-friendly navigation.

Weather touch:

- Shell/peripheral only unless explicitly approved.

Recommended commit granularity:

- Mobile shell commit.
- Module responsive commits by module.

## Stage 8: Performance, Accessibility, And Full-Site Regression

Goal:

- Harden the upgraded site, reduce regressions, and add repeatable verification where practical.

Allowed scope:

- Performance budgets.
- Accessibility fixes.
- Regression scripts.
- Bundle analysis.
- Small fixes discovered by audits.

Forbidden scope:

- No new feature work.
- No visual redesign expansion.
- No weather unfreeze without separate task.

Prerequisites:

- Main upgrade stages complete.

Risks:

- Attempting broad cleanup instead of targeted hardening.
- Accidentally committing screenshots/logs/generated artifacts.

Verification:

- `npm run build`.
- Full route smoke.
- Responsive matrix.
- Accessibility smoke.
- Weather freeze regression.
- Storage backup/restore smoke.
- Bundle warning review.

Completion criteria:

- Known P1 upgrade risks resolved or explicitly accepted.
- Repeatable checklist exists for future maintenance.
- Worktree contains only intentional source/docs changes.

Weather touch:

- Regression validation only unless a separate weather fix is explicitly scoped.

Recommended commit granularity:

- Test/verification infrastructure commit.
- Accessibility fixes commit.
- Performance fixes commit.
- Final regression docs commit.
