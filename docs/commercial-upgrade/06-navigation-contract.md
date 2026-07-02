# LifeBoard Commercial Upgrade Stage 1B Navigation Contract

Decision date: 2026-07-02

Baseline commit: `ffb73b42b383f9ac22589ef8557355584bab451d`

Scope: desktop, mobile, active state, accessibility, and future expansion navigation contract. This document does not implement navigation changes.

## Evidence Classes

- Fact: verified from current source during Stage 1B.
- Confirmed product decision: fixed by product direction or Stage 1B brief.
- Final architecture decision: mandatory for later implementation stages.
- Implementation guidance: preferred implementation detail for later source work.
- Needs later verification: validation required when implementation begins.

## Current Facts

| Area | Fact | Evidence |
| --- | --- | --- |
| Shared nav list | Current `navigationItems` contains Home, Weather, Todos, Tools, Bookmarks, Settings. | `src/shared/constants/navigation.ts` |
| Desktop nav | Current desktop global navigation is a sidebar. | `src/components/layout/SidebarNav.vue` |
| Mobile nav | Current mobile bottom nav renders all six shared items. | `src/components/layout/MobileNav.vue` |
| Active state | Current active state uses duplicated path checks for Weather and Settings children. | `src/components/layout/SidebarNav.vue`, `src/components/layout/MobileNav.vue` |
| Logo | Current logo points to route name `home`. | `src/components/layout/SidebarNav.vue` |
| Topbar | Current `Topbar` provides date/theme/timer utilities, not primary navigation. | `src/components/layout/Topbar.vue` |
| Accessibility | Current shell has a skip link and `main-content` target. | `src/components/layout/AppShell.vue` |

## Final Navigation Model

Final architecture decision:

- Landing and App do not share one global navigation component.
- Landing has a product-entry navigation.
- App has an application navigation.
- Desktop app navigation is provided by App Layout as top navigation.
- Mobile app bottom navigation is provided by App Layout.
- Pages must not implement a second global navigation system.
- Active state is derived from route meta `navigationKey`, not repeated `startsWith()` checks.

## Landing Desktop Navigation

Final architecture decision:

| Item | Target | Role | Primary? | Notes |
| --- | --- | --- | --- | --- |
| LifeBoard logo | `/` top | Brand/home | Yes | On Landing, returns to top of Landing. |
| Workspace | `/app` | App entry | Yes | Also appears as primary CTA. |
| Weather | `/weather` | Direct module entry | Yes | User need not enter `/app` first. |
| Todos | `/todos` | Direct module entry | Yes | Label may be "Todos" or localized "待办". |
| Bookmarks | `/bookmarks` | Direct module entry | Yes | Direct module entry. |
| Tools | `/tools` | Direct module entry | Yes | Direct module entry. |
| Enter Workspace CTA | `/app` | Primary action | Yes | Allowed even though Workspace also appears as a text entry. Visual hierarchy must make CTA the primary action. |

Landing section anchors:

- Landing internal anchors are optional and not required as top-level nav items.
- If used, anchor IDs must describe Landing sections, for example `#landing-story`, `#landing-workspace-preview`, or `#landing-weather-preview`.
- App routes must never be represented as hash anchors.
- "Explore" or similar in-page controls may drive scroll narrative without replacing direct app links.

Scroll behavior:

- Landing navigation may become sticky, but its available app-entry links must remain consistent after scroll.
- Sticky behavior must not trap focus or block browser Back/Forward.

Rejected:

- Do not create SaaS-style primary columns such as Pricing, Customers, Enterprise, or Case Studies unless a later product brief adds those surfaces.
- Do not force users to complete the narrative scroll before entering the app.

## App Desktop Top Navigation

Final architecture decision:

| Item | Path | Primary entry | Active key | Notes |
| --- | --- | --- | --- | --- |
| LifeBoard logo | `/` | Brand exit | none | Always returns to Landing, not Workspace. |
| Workspace | `/app` | Yes | `workspace` | Replaces current `home` nav meaning. |
| Weather | `/weather` | Yes | `weather` | Also active for `/weather/cities` and `/weather/15-day`. |
| Todos | `/todos` | Yes | `todos` | Todos and countdowns. |
| Bookmarks | `/bookmarks` | Yes | `bookmarks` | Bookmark manager. |
| Tools | `/tools` | Yes | `tools` | Desktop primary because tools are efficient direct actions. |
| Settings | `/settings` | No | `settings` | Utility menu, user menu, or More; not a primary desktop tab. |

Utility area:

- Search may be global or page-scoped in later stages.
- New action is contextual. It must not pretend every route supports the same creation action.
- More/user menu may contain Settings, appearance/language, data management, and about.

Fixed/sticky behavior:

- App desktop top navigation belongs to App Layout and should remain available during vertical scrolling.
- Final visual details belong to Stage 2/3, but pages must not decide whether the global nav exists.

Weather variant:

- A transparent or atmospheric nav variant may be allowed for `/weather` only as an App Layout visual variant or token.
- Weather modules must not modify global navigation logic or render a second global nav.

## Landing Mobile Navigation

Final architecture decision:

Mobile Landing header structure:

```text
LifeBoard Logo
Quick entry or search slot
Menu button
```

Menu content:

| Item | Target |
| --- | --- |
| Enter Workspace | `/app` |
| Weather | `/weather` |
| Todos | `/todos` |
| Bookmarks | `/bookmarks` |
| Tools | `/tools` |
| Settings | `/settings` |

Implementation guidance:

- Drawer, sheet, or full-screen menu is a Stage 4/7 visual decision.
- The information structure above is fixed.
- Menu open moves focus into the menu.
- Escape closes the menu where supported.
- Browser Back may close the menu if implemented with history state; otherwise it must not break route history.
- Overlay click/tap closes the menu.
- Closing returns focus to the menu trigger.
- Background scroll is locked while the menu is open.
- Reduced motion must avoid mandatory menu animation.

## App Mobile Bottom Navigation

Final architecture decision:

Bottom navigation belongs to App Layout and contains exactly:

| Item | Path / behavior | Active key | Notes |
| --- | --- | --- | --- |
| Workspace | `/app` | `workspace` | First item. |
| Weather | `/weather` | `weather` | Active for weather secondary routes. |
| Todos | `/todos` | `todos` | Todos and countdowns. |
| Bookmarks | `/bookmarks` | `bookmarks` | Bookmark manager. |
| More | opens More area | `more` | Active for Tools, Settings, data management, appearance/language, about. |

More contains:

- Tools -> `/tools`
- Settings -> `/settings`
- Appearance and language -> future location, likely Settings section
- Data management -> current settings data functions
- About -> future informational surface

Tools strategy:

- Tools remains a desktop primary entry.
- Tools does not occupy a sixth mobile bottom-nav slot.
- When `/tools` is active, More is the active bottom item.

Settings strategy:

- Settings remains directly addressable at `/settings`.
- Settings does not occupy a desktop primary tab or mobile bottom item.
- When `/settings` or `/settings/data-sources` is active, More is the active bottom item.

Safe area and keyboard:

- Bottom navigation must include safe-area padding using `env(safe-area-inset-bottom)`.
- App page content must reserve bottom padding so content and controls are not hidden behind bottom navigation.
- Virtual keyboard behavior is Stage 7 verification: input-heavy pages should avoid trapping active fields behind the nav.

Rejected:

- Do not place six or more items in the mobile bottom navigation.
- Weather pages must not create their own second bottom nav.

## Active State Contract

Final architecture decision:

- Active state is based on `route.meta.navigationKey`.
- Current repeated `startsWith('/weather/')` and `startsWith('/settings/')` checks are implementation debt to remove in Stage 3.
- Route name may seed `navigationKey`, but nav code must consume the stable key.
- `aria-current="page"` is applied to the active link for direct navigational links.
- For More, active state is expressed on the More trigger when the active route is inside More.

Mapping:

| Route name | Navigation key |
| --- | --- |
| `landing` | none |
| `workspace` | `workspace` |
| `weather` | `weather` |
| `weather-cities` | `weather` |
| `weather-15-day` | `weather` |
| `todos` | `todos` |
| `bookmarks` | `bookmarks` |
| `tools` | `tools` on desktop, `more` on mobile presentation |
| `settings` | `settings` on desktop utility area, `more` on mobile presentation |
| `settings-data-sources` | `settings` on desktop utility area, `more` on mobile presentation |
| `not-found` | none |

Implementation guidance:

- A typed navigation registry should expose primary desktop items, mobile bottom items, and More items.
- The registry can map a route key to route name/path and i18n label key.
- Do not build multiple independent navigation arrays with divergent labels.

## Keyboard And Accessibility Contract

Final architecture decision:

- Desktop top navigation uses a `nav` landmark with a localized accessible label.
- Landing navigation uses a separate `nav` landmark with a localized accessible label.
- Mobile bottom navigation uses a `nav` landmark with a localized accessible label.
- Current page links expose `aria-current="page"`.
- Menu buttons expose expanded state and controlled menu relationship.
- Focus order follows visual order.
- Skip link remains available and points to the current layout main content target.
- Route changes move focus to main content or the first heading after render.
- Mobile menu traps focus only while open and releases focus on close.
- Reduced-motion users must not be required to watch navigation or Landing animations.
- Sticky navigation must not cover hash-anchor headings; router scroll offset must account for it.

## Labels And i18n

Final architecture decision:

| Key concept | Chinese | English | Route / behavior |
| --- | --- | --- | --- |
| Landing | 产品介绍 | Product | `/` |
| Workspace | 工作台 | Workspace | `/app` |
| Weather | 天气 | Weather | `/weather` |
| Todos | 待办 | Todos | `/todos` |
| Bookmarks | 书签 | Bookmarks | `/bookmarks` |
| Tools | 工具 | Tools | `/tools` |
| Settings | 设置 | Settings | `/settings` |
| More | 更多 | More | Mobile bottom trigger and utility grouping |
| Appearance and language | 外观与语言 | Appearance & Language | More/settings utility |
| Data management | 数据管理 | Data Management | More/settings utility |
| About | 关于 | About | More utility |
| Not Found | 页面未找到 | Not Found | catch-all |

Implementation guidance:

- Labels must be i18n keys.
- Router records must not hard-code visible labels.
- Landing does not create a second locale state.
- Existing language and document-title flows remain global.

## Logo Behavior

Final architecture decision:

- Landing logo points to `/` and returns to the top of Landing.
- App logo points to `/`, exiting to Landing.
- Minimal layout logo points to `/`.
- Workspace is reached through the Workspace nav item or CTA, not by logo.

Reasoning:

- Logo consistently represents the LifeBoard product/home entry.
- Workspace remains explicit and bookmarkable at `/app`.

## Page Scroll Navigation Behavior

Final architecture decision:

- App navigation does not depend on page scroll position for correctness.
- Landing navigation may change visual treatment on scroll, but its links remain the same.
- Browser Back/Forward semantics must remain native.
- Route navigation uses `push` for user navigation.
- Only proven legacy redirects use redirect/replace semantics.

## Future Expansion Rules

Final architecture decision:

- Do not create future module routes in Stage 1B.
- Future `/calendar`, `/notes`, and `/habits` may be added only when real pages exist.
- Desktop primary navigation should not grow without a priority review.
- Mobile bottom navigation remains capped at five items.
- Lower-frequency modules enter More.
- Shared navigation data should be type-safe but not a plugin system.

Capacity rule:

| Surface | Capacity rule |
| --- | --- |
| Landing desktop | Product/module entry links may include the stable core modules. More marketing sections are not primary nav by default. |
| App desktop top nav | Keep high-frequency pages visible; move overflow to More/user menu. |
| App mobile bottom nav | Always max five: Workspace, Weather, Todos, Bookmarks, More. |
| More | Holds Tools on mobile, Settings, appearance/language, data management, about, and future lower-frequency modules. |

## Code Evidence

| File | Evidence used |
| --- | --- |
| `src/shared/constants/navigation.ts` | Current shared six-item navigation list. |
| `src/components/layout/SidebarNav.vue` | Current desktop sidebar, logo route, path-based active matching, `aria-current`. |
| `src/components/layout/MobileNav.vue` | Current mobile six-item bottom nav, path-based active matching, `aria-current`. |
| `src/components/layout/Topbar.vue` | Current utility topbar behavior. |
| `src/components/layout/AppShell.vue` | Current skip link, main content target, shell composition. |
| `src/router/routes.ts` | Current route names and secondary routes. |
| `src/router/index.ts` | Current title and scroll behavior. |
| `src/modules/home/HomePage.vue` | Current workspace content that becomes `/app`. |
| `src/modules/home/HomeQuickAccess.vue` | Home links to bookmarks/tools evidence. |
| `src/modules/home/HomeWeatherSummary.vue` | Home link to weather and weather store perimeter evidence. |
| `src/modules/home/TodayFocusPanel.vue` | Home link to todos evidence. |
| `src/modules/not-found/NotFoundPage.vue` | Current Not Found recovery target. |
| `src/modules/tools/components/ToolsWorkspace.vue` | Tools route uses query `replace` for in-page state; navigation contract must not confuse it with global redirects. |
| `src/modules/weather/WeatherPage.vue` | Weather route perimeter. |
| `src/modules/weather/components/WeatherWorkspace.vue` | Weather app route actions and links to weather secondary pages. |
| `src/modules/weather/pages/WeatherCityManagementPage.vue` | Weather city route returns to weather with hash. |
| `src/modules/weather/pages/LongRangeForecastPage.vue` | Weather secondary route and focus evidence. |

## Needs Later Verification

- Stage 3 must verify the new top navigation replaces, rather than duplicates, the old sidebar on desktop.
- Stage 3 must verify `navigationKey` active state covers weather and settings secondary routes.
- Stage 7 must verify mobile More remains active on `/tools`, `/settings`, and `/settings/data-sources`.
- Stage 7 must verify bottom navigation safe-area padding and content bottom spacing on mobile devices.
- Stage 4 must verify Landing menu focus, scroll lock, Escape/overlay close, and reduced-motion behavior.
