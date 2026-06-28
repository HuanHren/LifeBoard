# Stage 31 Route and Information Architecture Audit

## Route Inventory

| Route | Purpose | Navigation status | Browser verified |
| --- | --- | --- | --- |
| `/` | Home dashboard and module entry | Primary nav | Yes |
| `/weather` | Current weather workspace | Primary nav | Yes |
| `/weather/cities` | Weather location management | In-page weather link | Yes |
| `/weather/15-day` | Long-range forecast | In-page weather link | Yes |
| `/todos` | Tasks and countdowns | Primary nav | Yes |
| `/tools` | Utility workspace | Primary nav | Yes |
| `/bookmarks` | Bookmark manager | Primary nav | Yes |
| `/settings` | App settings | Primary nav | Yes |
| `/settings/data-sources` | Weather data source transparency | In-page settings link | Yes |
| catch-all | NotFound recovery | Router fallback | Yes |

## Current IA

The app has a clear six-item primary navigation model: Home, Weather, Todos, Tools, Bookmarks, and Settings. Child routes exist for weather city management, weather long-range forecasts, and data source transparency, but these are only discoverable from their parent pages.

The current structure is functional but reads as a module directory rather than a product workflow. Home presents separate module summaries instead of a prioritized daily command center. Weather is the most mature product surface; Todos, Tools, Bookmarks, and Settings remain closer to utility panels.

## Findings

| ID | Area | Severity | Route | Viewport | Evidence | Current behavior | Why it is a problem | Recommended direction | Affected files | Dependencies | Suggested phase | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IA-01 | Information architecture | P1 | `/` | all | Home is a stack of module summaries with repeated module entry actions | Home gives equal weight to every module | A commercial app should emphasize the user's next best action and reduce scanning cost | Rebuild Home as a daily operating dashboard with weather, priorities, countdowns, and quick actions | `src/modules/home/*` | Design system updates | Stage 34 | Home has a ranked primary workflow, fewer repeated entry links, and actionable above-the-fold content |
| IA-02 | Information architecture | P2 | `/weather/cities`, `/weather/15-day`, `/settings/data-sources` | all | Child routes are absent from primary nav and depend on parent-page links | Secondary routes are reachable but not surfaced as a stable route hierarchy | Deep pages feel incidental and are harder to rediscover | Add contextual subnav or page-level route affordances without adding more primary nav items | `src/router/index.ts`, weather/settings page shells | App shell update | Stage 33 | Child routes are visible in the relevant module shell and retain active parent state |
| IA-03 | Mobile navigation | P2 | all primary routes | mobile | Mobile nav uses six items in a fixed two-row grid | Navigation is usable but consumes significant bottom viewport | Repeated mobile use has less content space and weak product hierarchy | Keep six-item model but make mobile nav more compact and icon-led | `src/components/layout/MobileNav.vue` | Icon/design token decision | Stage 33 | Mobile nav preserves touch targets while reducing vertical footprint |

## Preserved Strengths

The primary route set is small and understandable. Route-level lazy imports keep feature areas separated at the router boundary. The app shell already provides a skip link, stable `main`, route titles, and grouped active states for weather and settings child routes.
