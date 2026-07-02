# LifeBoard Commercial Upgrade Stage 1B Information Architecture

Decision date: 2026-07-02

Baseline commit: `ffb73b42b383f9ac22589ef8557355584bab451d`

Scope: documentation-only information architecture contract. This document authorizes no route, source, CSS, dependency, storage, or weather-core changes.

## Evidence Classes

This document uses the following classes:

- Fact: current repository behavior verified from files in this stage.
- Confirmed product decision: product direction fixed by the Stage 1B brief.
- Final architecture decision: contract future implementation stages must follow.
- Implementation guidance: how a later implementation should satisfy the contract.
- Needs later verification: item that must be checked when source implementation is authorized.

## Current Facts

| Area | Fact | Evidence |
| --- | --- | --- |
| Root route | `/` currently renders the workspace-like Home dashboard route named `home`. | `src/router/routes.ts`, `src/modules/home/HomePage.vue` |
| App route | `/app` does not currently exist. | `src/router/routes.ts` |
| Shell | Every route is currently wrapped by `AppShell` from `App.vue`. | `src/app/App.vue`, `src/components/layout/AppShell.vue` |
| Navigation | Current desktop shell is a sidebar, not a top navigation. | `src/components/layout/SidebarNav.vue` |
| Mobile navigation | Current mobile nav renders six items from one shared list. | `src/components/layout/MobileNav.vue`, `src/shared/constants/navigation.ts` |
| Not Found | Catch-all route exists and currently renders inside `AppShell`; it links back to route name `home`. | `src/router/routes.ts`, `src/modules/not-found/NotFoundPage.vue`, `src/app/App.vue` |
| Document title | Router meta currently uses `titleKey`; router after-hook updates `document.title`. | `src/router/index.ts`, `src/router/routes.ts` |
| Scroll | Router currently returns `{ top: 0 }` for every navigation and does not restore saved positions or hash offsets. | `src/router/index.ts` |
| Home data | Home initializes weather, todos, and bookmarks and aggregates tools/bookmarks/weather/todos summaries. | `src/modules/home/composables/useHomeDashboard.ts`, `src/modules/home/HomePage.vue` |
| Weather perimeter | Weather route renders `WeatherPage`, which wraps `WeatherWorkspace`; weather also has child-like top-level routes for cities and 15-day forecast. | `src/router/routes.ts`, `src/modules/weather/WeatherPage.vue`, `src/modules/weather/components/WeatherWorkspace.vue` |

## Confirmed Product Decisions

- LifeBoard is a personal life operating system with weather atmosphere, scroll narrative, and modern productivity interaction.
- `/` is the commercial introduction and product demonstration page.
- `/app` is the application workspace home.
- Primary app routes remain simple top-level routes: `/weather`, `/todos`, `/bookmarks`, `/tools`, `/settings`.
- Desktop app navigation is top navigation, not a permanent left sidebar.
- Desktop primary entries are Workspace, Weather, Todos, Bookmarks, and Tools.
- Settings remains `/settings` but is not a desktop primary navigation item.
- Mobile app bottom navigation has at most five items: Workspace, Weather, Todos, Bookmarks, More.
- Tools belongs inside More on mobile, not as a sixth bottom item.
- Weather core remains frozen. Only route metadata, navigation entry, and outer App Layout integration may be planned.

## Final Product Entry Model

Final architecture decision:

| Entry | Final responsibility | Why | Solves | Affected files in later stages | Stage | Weather touch | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Permanent LifeBoard Landing page. | Keeps a stable brand and share entry. | Removes ambiguity between marketing and workspace. | `src/router/routes.ts`, future landing module, future landing layout. | Stage 3/4 | None. | Direct load `/` shows Landing and does not auto-redirect. |
| `/app` | Permanent application workspace home, initially carrying current Home dashboard responsibility. | Preserves current dashboard behavior while freeing `/` for Landing. | Gives returning users a bookmarkable workspace URL. | `src/router/routes.ts`, `src/modules/home/**` only as routing target initially. | Stage 3/5 | Home may read weather store as today; no weather-core edit. | Direct load `/app` shows workspace and current Home functions still work. |
| `/weather` | Direct Weather module route in App Layout. | Keeps concise product-level URL. | Avoids nested route churn and preserves module links. | Route meta and shell wrapper only. | Stage 3 | Perimeter only. | Direct load `/weather` renders weather inside App Layout. |
| `/todos` | Direct Todos and countdown route in App Layout. | Keeps existing module address stable. | Preserves Home links and user bookmarks. | Route meta and shell wrapper only. | Stage 3/6 | None. | Direct load and Home links work. |
| `/bookmarks` | Direct Bookmarks route in App Layout. | Keeps existing module address stable. | Preserves Home links and user bookmarks. | Route meta and shell wrapper only. | Stage 3/6 | None. | Direct load and Home links work. |
| `/tools` | Direct Tools route in App Layout; desktop primary, mobile More child. | Keeps desktop efficiency without overloading mobile bottom nav. | Resolves six-item mobile nav problem. | Route meta, app nav registry, mobile More. | Stage 3/7 | None. | Desktop top nav highlights Tools; mobile More is active on `/tools`. |
| `/settings` | Secondary app route in App Layout. | Settings is utility/config, not a high-frequency primary workspace. | Keeps primary nav focused. | Route meta, user/more menu. | Stage 3/7 | Settings may contain weather provider preferences; no weather-core edit. | `/settings` loads directly and More/utility entry is active. |

## `/` And `/app`

Final architecture decision:

- `/` permanently means Landing.
- `/app` permanently means Workspace.
- `/` must never automatically redirect to `/app` based on local storage, visit count, route history, or device type.
- Returning users may bookmark `/app`, `/weather`, `/todos`, `/bookmarks`, `/tools`, or `/settings`.
- App routes must not depend on the user having visited Landing first.

Reasoning:

- Landing is the stable product and sharing entry.
- Workspace is the stable daily-use entry.
- Predictable URLs preserve browser history and external links.
- The current route table has no `/app`, so the migration is explicit and reviewable.

## Current Home Migration Strategy

Final architecture decision:

- Current route name `home` is retired during route implementation.
- Current `src/modules/home/HomePage.vue` becomes the initial `/app` workspace route target.
- The migration is a route responsibility migration, not a Stage 1B component move.
- Current Home business behavior, store initialization, links, and dashboard summaries must not be rebuilt before Stage 5.
- The target route name is `workspace`.

Facts supporting this decision:

- `src/modules/home/HomePage.vue` is already a workspace dashboard, not a Landing page.
- `src/modules/home/composables/useHomeDashboard.ts` initializes and reads weather, todos, and bookmarks stores.
- Home child components link to route names `weather`, `todos`, `bookmarks`, and `tools`.

Implementation guidance:

- Stage 3 should add the `/app` route and route meta while preserving current Home component behavior.
- Stage 5 may redesign the workspace content after the shell and route contract are stable.
- Stage 3 must update route-name references that point to `home` so they point to `landing` or `workspace` deliberately.

## Old Path Compatibility

Final architecture decision:

- Do not redirect `/` back to `/app`.
- Do not add hidden auto-skip behavior.
- Do not invent `/home` compatibility because no current route record or RouterLink uses a real `/home` route.
- If a later git-history or analytics review proves a real legacy route existed, only that proven legacy path may redirect to `/app` using `replace`.

Current real legacy paths:

| Legacy path | Current status | Compatibility decision |
| --- | --- | --- |
| `/` | Current workspace home. | Reassigned to Landing; not redirected. Landing first viewport must provide clear `/app` CTA. |
| `/home` | Not present in current router evidence. | No redirect. |
| `/app` | Not present in current router evidence. | Create as new workspace route in Stage 3. |

Why no `/` redirect:

- Redirecting `/` would make Landing unreachable at the canonical product URL.
- Auto-redirect would break share links and browser back behavior.
- Users who want the workspace first can bookmark `/app`.

## Landing And App Relationship

Final architecture decision:

- Landing and App are peer experiences under Root App.
- Landing does not load the full App Layout shell.
- App pages do not load Landing scroll animation runtime.
- Landing can link directly to `/app`, `/weather`, `/todos`, `/bookmarks`, and `/tools`.
- Landing internal anchors are page sections, not app routes.

Landing role:

- Product introduction.
- Scroll narrative and sticky sections.
- Reversible scroll-linked animation.
- Local real-component previews where useful.
- Fast product/module entry links.

App role:

- Daily workspace and productivity modules.
- Shared top navigation on desktop.
- Shared mobile header and bottom navigation on mobile.
- Direct refreshable routes.

## Page Entry Behavior

Final architecture decision:

| Scenario | Behavior |
| --- | --- |
| First visit to `/` | Always show Landing. |
| Returning visit to `/` | Show Landing again, without local-storage skip. |
| Direct visit to `/app` | Show Workspace directly. |
| Direct visit to `/weather`, `/todos`, `/bookmarks`, `/tools`, `/settings` | Show the requested app route directly. |
| Landing to app route | Use normal router `push` navigation. |
| Proven compatibility redirect | Use router redirect/`replace`, only for a real historical path. |
| Browser Back/Forward | Preserve native history semantics; do not lock or rewrite popstate. |

## Not Found Strategy

Final architecture decision:

- Keep the catch-all route.
- Use `minimal` layout for Not Found.
- Do not automatically redirect unknown URLs to `/`.
- Provide two explicit entries: return to Landing (`/`) and enter Workspace (`/app`).
- Do not show the full mobile bottom navigation on Not Found.
- Document title uses i18n key `notFound.routeTitle` or its Stage 3 successor.

Reasoning:

- Current Not Found inside `AppShell` is a side effect of `App.vue`, not a product requirement.
- Unknown URLs should remain visible to users and developers.
- Minimal layout avoids implying the missing route is an app module.

## Rejected Entry And Navigation Schemes

Final architecture decisions:

| Rejected scheme | Reason |
| --- | --- |
| Auto-redirect `/` to `/app` | Breaks Landing as stable product URL and makes browser history unpredictable. |
| LocalStorage-based skip Landing | Creates hidden state and makes shared links inconsistent. |
| Device-based redirect | Makes URL behavior non-deterministic and hard to test. |
| `/app/weather`, `/app/todos`, `/app/bookmarks`, `/app/tools` as primary URLs | Conflicts with confirmed top-level route decision and raises migration cost. |
| Page-owned global navigation | Duplicates active-state logic and makes shell changes risky. |
| Six mobile bottom navigation items | Violates the confirmed mobile contract and hurts touch ergonomics. |
| Not Found redirect to `/` | Hides broken URLs and prevents clear recovery. |

## Future Expansion Principles

Final architecture decision:

- Do not create `/calendar`, `/notes`, or `/habits` in Stage 1B.
- Future modules may use top-level routes only when they become real product pages.
- Desktop top navigation capacity is capped by priority. When capacity is exceeded, lower-frequency modules move to More.
- Mobile bottom navigation remains capped at five items.
- A typed shared navigation registry is appropriate in Stage 3, but a plugin system is not.
- Landing feature sections may later read from stable navigation/product configuration, but Stage 1B does not require that implementation.

Future primary-entry rule:

- Workspace, Weather, Todos, and Bookmarks remain high-priority.
- Tools is primary on desktop and More on mobile.
- Calendar, Notes, Habits, Settings, data tools, and about pages should enter More until product evidence proves daily primary use.

## Code Evidence

| File | Evidence used |
| --- | --- |
| `src/router/routes.ts` | Current route table, no `/app`, current `home` route at `/`, catch-all route, weather/settings secondary routes. |
| `src/router/index.ts` | Current title hook and simplified scroll behavior. |
| `src/app/App.vue` | Current global wrapping of all routes in `AppShell`. |
| `src/components/layout/AppShell.vue` | Current app shell, skip link, main content target, desktop/mobile nav slots. |
| `src/components/layout/SidebarNav.vue` | Current logo to route `home`, path-based active matching, sidebar evidence. |
| `src/components/layout/MobileNav.vue` | Current six-item mobile nav and path-based active matching. |
| `src/components/layout/Topbar.vue` | Current sticky topbar utilities, not primary navigation. |
| `src/shared/constants/navigation.ts` | Current single navigation item list including Settings as a full item. |
| `src/modules/home/HomePage.vue` | Current Home is a workspace dashboard. |
| `src/modules/home/composables/useHomeDashboard.ts` | Home aggregates weather, todos, bookmarks, and tools data. |
| `src/modules/not-found/NotFoundPage.vue` | Current Not Found recovery links only to `home`. |
| `src/i18n/keys.ts` | Existing navigation/title keys and lack of landing/workspace split keys. |
| `src/i18n/catalog.ts` | Current i18n catalog source. |
| `src/stores/theme.ts` | Theme state is global infrastructure. |
| `src/stores/language.ts` | Language state and document language are global infrastructure. |
| `src/modules/weather/WeatherPage.vue` | Weather route perimeter component. |
| `src/modules/weather/components/WeatherWorkspace.vue` | Weather internal workspace links and route entry points. |
| `src/modules/weather/pages/WeatherCityManagementPage.vue` | Weather route push with hash back to weather hero. |
| `src/modules/weather/pages/LongRangeForecastPage.vue` | Weather secondary page and focus-on-heading behavior. |

## Needs Later Verification

- Stage 3 must verify all `home` route-name references are intentionally migrated to `landing` or `workspace`.
- Stage 3 must verify no source route uses ad hoc `startsWith()` matching after the nav registry exists.
- Stage 3 must verify Not Found no longer inherits App Layout.
- Stage 4 must verify Landing scroll animation does not intercept browser Back/Forward or trap keyboard users.
- Stage 7 must verify mobile More active state for `/tools`, `/settings`, and `/settings/data-sources`.
