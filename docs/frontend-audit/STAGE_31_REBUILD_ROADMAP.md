# Stage 31 Rebuild Roadmap

## Stage 32: P0 global foundation and architecture fixes

- Goal: remove global architectural risk before visual rebuilds.
- Scope: token validity, app bootstrap ownership, route metadata, production verification scripts, and issue baselines.
- Non-scope: feature redesign, weather renderer changes, backend work.
- Files: `src/assets/styles/*`, `src/app/*`, `src/main.ts`, `src/router/*`, shared verification scripts.
- Technical tasks: fix undefined token references, centralize theme bootstrap, document route metadata contract.
- Visual tasks: normalize radius/shadow token usage.
- Responsive tasks: keep current layouts unchanged except token fixes.
- Accessibility tasks: preserve skip link, main landmark, focus-visible, and route titles.
- Performance tasks: record current chunk baseline and define budgets.
- Acceptance criteria: build passes, route matrix passes, no undefined token references.
- Regression: production preview all routes, light/dark, reduced motion.
- Commit message: `fix(frontend): stabilize global UI foundations`
- Dependencies: Stage 31 audit docs.
- Risk: accidentally changing weather visuals; keep diffs minimal.

## Stage 33: App shell, navigation and design system upgrade

- Goal: create a commercial-grade shell and reusable UI primitives.
- Scope: sidebar/mobile nav, topbar, base primitives, icons, form fields, dialog/popover/listbox patterns.
- Non-scope: module content redesign beyond adoption points.
- Files: `src/components/layout/*`, `src/components/base/*`, global CSS tokens.
- Technical tasks: add shared primitives without new production dependencies unless explicitly approved.
- Visual tasks: icon+label navigation, compact mobile shell, card variants, status variants.
- Responsive tasks: reduce mobile nav footprint while preserving touch targets.
- Accessibility tasks: documented keyboard behavior for dialog/search/listbox.
- Performance tasks: keep base layer small and tree-shakeable.
- Acceptance criteria: all modules can use shared controls; route matrix passes.
- Regression: keyboard nav, focus order, screen-reader name smoke checks.
- Commit message: `feat(frontend): upgrade app shell and design primitives`
- Dependencies: Stage 32 token cleanup.
- Risk: visual churn across all pages.

## Stage 34: Home commercialization refactor

- Goal: turn Home into a daily operating dashboard.
- Scope: weather summary, today's tasks, urgent countdowns, quick tools, recent bookmarks, product hierarchy.
- Non-scope: changing underlying module stores.
- Files: `src/modules/home/*`.
- Technical tasks: reuse existing stores with clean loading boundaries.
- Visual tasks: one primary first-viewport story, denser summaries, fewer repeated cards.
- Responsive tasks: mobile-first command center with prioritized sections.
- Accessibility tasks: maintain heading hierarchy and status announcements.
- Performance tasks: avoid triggering unnecessary weather/network work beyond current behavior.
- Acceptance criteria: Home has a clear primary workflow and passes desktop/mobile screenshots.
- Regression: Home with empty/full stores, geolocation unavailable, dark/en.
- Commit message: `feat(home): redesign dashboard workflow`
- Dependencies: Stage 33 primitives.
- Risk: overloading Home with too many module details.

## Stage 35: Weather page productization closeout

- Goal: close remaining weather architecture/product issues without changing authorized visual asset scope.
- Scope: long-range data path, provider/cache consistency, weather page density, city management polish.
- Non-scope: new weather assets, WMO changes, renderer rewrite.
- Files: `src/modules/weather/*`.
- Technical tasks: move long-range loading behind the store/provider boundary.
- Visual tasks: polish weather hierarchy and invalid token usage.
- Responsive tasks: verify city management and long-range on mobile/tablet.
- Accessibility tasks: search/listbox and live status smoke tests.
- Performance tasks: WebGL warning monitoring, canvas lifecycle, chunk baseline.
- Acceptance criteria: weather routes pass provider/cache regression and reduced-motion checks.
- Regression: forecast cache, city search, no-token states, vendor assets, reduced motion.
- Commit message: `fix(weather): align forecast routes with provider state`
- Dependencies: Stage 32 and Stage 33.
- Risk: regressing weather data behavior.

## Stage 36: Todos and Countdowns productization refactor

- Goal: improve repeated-task ergonomics and countdown visibility.
- Scope: task list density, composer, countdown section, edit/delete flows.
- Non-scope: backend sync or account features.
- Files: `src/modules/todos/*`.
- Technical tasks: adopt shared form and action primitives.
- Visual tasks: clearer active/completed grouping and countdown hierarchy.
- Responsive tasks: larger touch targets and mobile action placement.
- Accessibility tasks: checkbox hit areas, edit flow focus, delete confirmation.
- Performance tasks: preserve local-only store speed.
- Acceptance criteria: task workflows pass keyboard/mobile smoke tests.
- Regression: create/edit/delete tasks and countdowns, persistence.
- Commit message: `feat(todos): refine task and countdown workspace`
- Dependencies: Stage 33.
- Risk: changing persistence semantics; avoid schema changes unless required.

## Stage 37: Tools workspace refactor

- Goal: make Tools feel like a workspace, not a local tab panel.
- Scope: URL-addressable tools, active tool persistence, output/copy feedback, responsive tool layout.
- Non-scope: adding new tools.
- Files: `src/modules/tools/*`, router if needed.
- Technical tasks: route/query-sync active tool and optionally split heavy tools.
- Visual tasks: tool navigation, input/output panels, status feedback.
- Responsive tasks: mobile tool picker and output stacking.
- Accessibility tasks: labels, copy feedback announcements, keyboard switching.
- Performance tasks: keep route chunk within budget.
- Acceptance criteria: each tool is directly linkable and back/forward works.
- Regression: all tool transformations and clipboard feedback.
- Commit message: `feat(tools): add addressable utility workspace`
- Dependencies: Stage 33.
- Risk: route compatibility for existing `/tools`.

## Stage 38: Bookmarks productization refactor

- Goal: make bookmarks faster to retrieve, organize, and edit.
- Scope: list density, grouping, composer, edit/delete flows, filters/search.
- Non-scope: browser extension or cloud sync.
- Files: `src/modules/bookmarks/*`.
- Technical tasks: adopt shared form/list/action primitives.
- Visual tasks: richer list rows, pinned/recent affordances, clearer empty states.
- Responsive tasks: mobile action menus without cramped rows.
- Accessibility tasks: edit/delete focus management and form errors.
- Performance tasks: keep local filtering cheap.
- Acceptance criteria: common bookmark workflows are faster and keyboard accessible.
- Regression: add/edit/delete/filter/imported URL validation.
- Commit message: `feat(bookmarks): refine bookmark management workspace`
- Dependencies: Stage 33.
- Risk: breaking stored bookmark compatibility.

## Stage 39: Settings and data management refactor

- Goal: split settings into understandable domains and reduce page weight.
- Scope: appearance, language, weather services, location services, data sources, backups, exports, privacy, data clear.
- Non-scope: new data providers or backend management.
- Files: `src/modules/settings/*`.
- Technical tasks: extract domain containers and shared field/status patterns.
- Visual tasks: settings as forms and summaries, not equal-weight card stacks.
- Responsive tasks: compact tablet/mobile settings navigation.
- Accessibility tasks: dialogs, destructive actions, validation and status announcements.
- Performance tasks: lazy-load heavier data/export panels if useful.
- Acceptance criteria: settings routes are smaller, easier to scan, and behavior is unchanged.
- Regression: provider preferences, keys, backup/import/export, clear-data confirmation.
- Commit message: `feat(settings): reorganize settings workflows`
- Dependencies: Stage 33.
- Risk: destructive data actions; require careful manual regression.

## Stage 40: Full-site responsive, accessibility and interaction closeout

- Goal: finish cross-route quality gates.
- Scope: responsive matrix, keyboard flows, reduced motion, contrast, focus, empty/error/loading states.
- Non-scope: new features.
- Files: all frontend modules as needed.
- Technical tasks: formalize reusable Playwright checks.
- Visual tasks: final responsive polish.
- Responsive tasks: desktop, tablet, mobile, small mobile coverage.
- Accessibility tasks: route-by-route keyboard and naming checks.
- Performance tasks: no unexpected requests, no route leaks.
- Acceptance criteria: automated and manual matrix passes.
- Regression: all primary and child routes.
- Commit message: `test(frontend): add full-site quality regression`
- Dependencies: Stages 32-39.
- Risk: scope creep; only close regressions found by matrix.

## Stage 41: Performance, full regression and formal release

- Goal: final release readiness.
- Scope: build, preview, bundle review, network review, docs, GitHub/Vercel handoff.
- Non-scope: redesign.
- Files: docs, verification scripts, minimal source fixes only if blocking.
- Technical tasks: final production isolation and route regression.
- Visual tasks: final screenshot review.
- Responsive tasks: final device matrix.
- Accessibility tasks: final smoke checks.
- Performance tasks: chunk review, WebGL warning review, no local/private artifacts.
- Acceptance criteria: build and production preview pass; docs updated; release decision recorded.
- Regression: full site.
- Commit message: `docs(frontend): record release readiness verification`
- Dependencies: all previous stages.
- Risk: late fixes; defer nonblocking findings.
