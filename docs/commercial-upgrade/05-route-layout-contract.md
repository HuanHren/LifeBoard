# LifeBoard Commercial Upgrade Stage 1B Route And Layout Contract

Decision date: 2026-07-02

Baseline commit: `ffb73b42b383f9ac22589ef8557355584bab451d`

Scope: route, layout, route meta, scroll, focus, i18n, and weather perimeter contract. This document does not implement router or layout changes.

## Evidence Classes

- Fact: verified from current source during Stage 1B.
- Confirmed product decision: fixed by product direction or Stage 1B brief.
- Final architecture decision: mandatory for later implementation stages.
- Implementation guidance: preferred implementation detail for later source work.
- Needs later verification: validation required when implementation begins.

## Current Facts

- `src/router/routes.ts` defines top-level routes only; there is no nested layout route and no `/app`.
- `src/router/index.ts` creates Vue Router with `createWebHistory()` and a `scrollBehavior()` that always returns `{ top: 0 }`.
- Current route meta only uses `titleKey`.
- `src/app/App.vue` renders one `AppShell` around all route content.
- `src/components/layout/AppShell.vue` owns the current skip link, sidebar, topbar, main content, and mobile navigation.
- Current document title behavior is tied to `route.meta.titleKey`, `translate()`, and language watchers in `src/router/index.ts` and `src/main.ts`.

## Final Route Table

Final architecture decision:

| Route | Name | Layout | Desktop nav | Mobile nav | Entry behavior |
| --- | --- | --- | --- | --- | --- |
| `/` | `landing` | `landing` | Landing nav, no App top nav | Landing mobile header/menu | Direct Landing entry; never auto-redirect. |
| `/app` | `workspace` | `app` | Primary: Workspace | Bottom item: Workspace | Direct workspace entry; initial target is current Home dashboard responsibility. |
| `/weather` | `weather` | `app` | Primary: Weather | Bottom item: Weather | Direct module entry; no required `/app` hop. |
| `/weather/cities` | `weather-cities` | `app` | Active: Weather | Active: Weather | Direct weather secondary page; app shell only. |
| `/weather/15-day` | `weather-15-day` | `app` | Active: Weather | Active: Weather | Direct weather secondary page; app shell only. |
| `/todos` | `todos` | `app` | Primary: Todos | Bottom item: Todos | Direct module entry. |
| `/bookmarks` | `bookmarks` | `app` | Primary: Bookmarks | Bottom item: Bookmarks | Direct module entry. |
| `/tools` | `tools` | `app` | Primary: Tools | More active; item inside More | Direct module entry. |
| `/settings` | `settings` | `app` | Utility/More, not primary | More active; item inside More | Direct settings entry. |
| `/settings/data-sources` | `settings-data-sources` | `app` | Utility/More, not primary | More active; item inside More | Direct settings secondary page. |
| `/:pathMatch(.*)*` | `not-found` | `minimal` | None | None | Show recovery page; do not redirect. |

Route names are stable English identifiers. Visible labels must come from i18n keys, not from route records.

## Route Meta Minimal Contract

Final architecture decision:

```ts
type LifeBoardLayoutKind = 'landing' | 'app' | 'minimal'

type LifeBoardNavigationKey =
  | 'workspace'
  | 'weather'
  | 'todos'
  | 'bookmarks'
  | 'tools'
  | 'more'
  | 'settings'

interface LifeBoardRouteMeta {
  layout: LifeBoardLayoutKind
  titleKey: TranslationKey
  navigationKey?: LifeBoardNavigationKey
  restoreScroll?: boolean
}
```

Required fields:

- `layout`: required for every route. It drives layout selection and derived navigation visibility.
- `titleKey`: required for every route. It preserves the current document title/i18n model.

Optional fields:

- `navigationKey`: required only when the active navigation item cannot be inferred safely from the route name or when child routes map to a parent nav item. Weather secondary routes use `weather`; settings secondary routes use `settings` or `more` depending on component needs.
- `restoreScroll`: optional route-level hint. It defaults to `false`; browser `savedPosition` still wins. Landing may set it to `true` if Stage 4 needs explicit non-popstate restoration.

Rejected fields:

| Field | Decision |
| --- | --- |
| `documentTitleKey` | Not needed now; `titleKey` already drives document titles. Add only if visible page title and document title diverge in a proven way. |
| `descriptionKey` | Keep descriptions in page content or SEO layer; current app has no SEO meta system. |
| `showDesktopNavigation` / `showMobileNavigation` | Derived from `layout`; explicit booleans would drift. |
| `requiresAuth` | No account/auth system exists. Do not pre-design unused auth gates. |
| animation meta | Do not put visual animation parameters in route meta. Landing animation belongs to Landing Layout/page implementation. |
| breadcrumb meta | Current structure is mostly first-level; child pages can use local back links. Add breadcrumbs only after a real multi-level pattern exists. |

Implementation guidance:

- Stage 3 should add Vue Router type augmentation for `RouteMeta`.
- `navigationKey` should be an independent union, not raw route names, because child routes and mobile More need grouping.
- Route records should hold i18n keys only. They must not hold visible Chinese or English labels.

## i18n And Naming Contract

Final architecture decision:

| Route name | Path | Chinese label | English label | Layout | Title key target |
| --- | --- | --- | --- | --- | --- |
| `landing` | `/` | 产品介绍 | Product | `landing` | `navigation.landing.label` |
| `workspace` | `/app` | 工作台 | Workspace | `app` | `navigation.workspace.label` |
| `weather` | `/weather` | 天气 | Weather | `app` | existing weather key successor |
| `weather-cities` | `/weather/cities` | 城市管理 | Cities | `app` | existing weather city key successor |
| `weather-15-day` | `/weather/15-day` | 15日趋势 | 15-day Forecast | `app` | existing long-range key successor |
| `todos` | `/todos` | 待办 | Todos | `app` | existing todos key |
| `bookmarks` | `/bookmarks` | 书签 | Bookmarks | `app` | existing bookmarks key |
| `tools` | `/tools` | 工具 | Tools | `app` | existing tools key |
| `settings` | `/settings` | 设置 | Settings | `app` | existing settings key |
| `settings-data-sources` | `/settings/data-sources` | 数据源 | Data Sources | `app` | existing data-source key |
| `not-found` | catch-all | 页面未找到 | Not Found | `minimal` | `notFound.routeTitle` |

Implementation guidance:

- Current `navigation.home.label` should split into Landing and Workspace keys in Stage 3.
- Date, greeting, and formatting text must continue using the existing locale system.
- Do not create a second Landing-only language store or listener.
- `src/main.ts` remains the language initialization point.

## Layout Responsibilities

### Root App

Final architecture decision:

Root App keeps only global infrastructure:

- Router view or layout resolver.
- Pinia provider installed in `main.ts`.
- i18n and document-title integration.
- Theme initialization and document theme state.
- Global error boundary when introduced.
- Global accessibility foundations such as skip-link target coordination.
- Future overlay portal mount point.

Root App must not:

- Render desktop sidebar/top navigation directly.
- Assume every route is an app workspace route.
- Own Landing scroll logic.
- Own Weather initialization.
- Branch heavily on raw `pathname`.

### Landing Layout

Final architecture decision:

Landing Layout is used for `/` only. It owns:

- Landing top navigation.
- Landing mobile header/menu.
- Landing page content slot.
- Landing footer.
- Landing-only scroll and animation runtime boundary.
- Landing anchor offset handling in coordination with router scroll behavior.

It must not load the full App Layout shell or app bottom navigation.

### App Layout

Final architecture decision:

App Layout is used for `/app`, `/weather`, `/weather/cities`, `/weather/15-day`, `/todos`, `/bookmarks`, `/tools`, `/settings`, and `/settings/data-sources`. It owns:

- Desktop top app navigation.
- Mobile page header.
- Main content container with stable `id="main-content"`.
- Mobile bottom navigation.
- App-level utility/action layer mount point.
- Active navigation state via route meta.

Business pages must not create their own second global navigation.

### Minimal Layout

Final architecture decision:

Minimal Layout is used for Not Found and future independent recovery pages. It owns:

- A small brand/recovery surface.
- Main content focus target.
- Recovery links to Landing and Workspace.

It must not show the app bottom navigation by default.

## Layout Implementation Strategy

Final architecture decision: choose Scheme A, route-meta layout resolution from `App.vue`.

### Scheme A: `App.vue` layout resolver

Shape:

```text
App.vue
└── LayoutResolver by route.meta.layout
    ├── LandingLayout
    ├── AppLayout
    └── MinimalLayout
```

Decision:

- Adopt as the primary implementation path in Stage 3.

Why:

- Lowest migration cost from current `App.vue` plus `AppShell`.
- Preserves simple top-level URLs without empty parent routes.
- Keeps route meta type-safe and central.
- Isolates Landing animation from App pages.
- Lets Weather remain a normal page wrapped by App Layout perimeter.
- Makes Not Found minimal without changing every page.
- Easy to test by route table and screenshots.

### Scheme B: Vue Router nested layout routes

Decision:

- Do not use as the primary Stage 3 path.

Reasoning:

- It can work, but preserving top-level URLs for several app pages requires layout parent records with empty paths or multiple siblings.
- It adds nested `RouterView` behavior where the current app has none.
- It increases migration churn for no clear benefit in this codebase.
- It raises Weather Freeze risk by changing route shape around weather pages.

### Scheme C: each page owns layout/navigation

Decision:

- Reject.

Reasoning:

- Duplicates global navigation and active-state logic.
- Makes desktop/mobile shell changes repeat across pages.
- Makes accessibility landmarks inconsistent.
- Increases the risk of Weather creating a second shell.
- Blocks future app-wide actions, overlays, and mobile More behavior.

## Scroll Behavior Contract

Final architecture decision:

- Browser Back/Forward must prefer `savedPosition`.
- Hash navigation must target anchors and account for fixed/sticky navigation offset.
- Normal push navigation to a new route scrolls to top.
- App page to app page navigation scrolls to top unless browser `savedPosition` applies.
- Returning to Landing through browser Back/Forward should restore the previous Landing scroll via `savedPosition`.
- No large custom scroll-position store is allowed for Stage 3.
- No global wheel hijacking in Root App.
- Smooth scrolling must respect `prefers-reduced-motion`.
- Complex scroll-linked animation is Landing-only.

Future structure:

```ts
scrollBehavior(to, _from, savedPosition) {
  if (savedPosition) return savedPosition

  if (to.hash) {
    return {
      el: to.hash,
      top: fixedHeaderOffsetFor(to),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    }
  }

  return { top: 0 }
}
```

Implementation guidance:

- `fixedHeaderOffsetFor()` belongs with layout constants or router utilities, not page internals.
- Landing ScrollTrigger or equivalent animation must refresh after native route scroll has completed.
- Do not override all navigation with `replace`; use `push` for normal user navigation.
- Proven legacy redirects may use redirect/replace semantics.

## Focus Management Contract

Final architecture decision:

- Each layout provides a stable main target, preferably `#main-content`.
- Route changes move focus to the main target or first page `h1` after render.
- A skip link remains available for keyboard users.
- Top navigation uses a `nav` landmark with a clear accessible label.
- Bottom navigation uses a `nav` landmark with a clear accessible label.
- Current page links use `aria-current="page"`.
- Mobile menu opening moves focus into the menu.
- Mobile menu closing returns focus to the trigger.
- Escape, Back, and overlay close behavior must be supported where the platform allows.
- Menu-open state locks background scroll.
- Landing sections must maintain sensible heading order.
- Scroll animation cannot be the only way to access content.
- Reduced motion must expose all Landing content without requiring animation.
- Keyboard users must not be trapped in sticky sections.
- Hash anchors must account for fixed navigation offset.

Implementation guidance:

- Existing `AppShell` already has a skip link and `main id="main-content" tabindex="-1"`; Stage 3 should preserve that behavior in App Layout and replicate the pattern in Landing/Minimal as needed.
- Weather secondary pages already demonstrate heading focus patterns; preserve them without modifying weather core.

## Document Title Contract

Final architecture decision:

- Preserve the current `titleKey`-driven document title model.
- Route records hold i18n keys; the router resolves localized document title.
- Language changes update the current route title.
- Not Found has its own title key.
- Landing visible headings and copy are page/i18n content, not hard-coded router strings.

Needs later verification:

- Stage 3 must verify title updates still work after `home` splits into `landing` and `workspace`.

## Weather Perimeter Contract

Final architecture decision:

- Weather route records may receive `layout`, `titleKey`, and `navigationKey` meta.
- App Layout may wrap Weather pages as route content.
- Desktop and mobile navigation may link to Weather.
- Weather child-like routes map to `navigationKey: 'weather'`.
- Weather page may request a visual nav variant through layout-level tokens only if Stage 3 needs it.

Forbidden:

- No modifications to weather store, services, condition mappings, cache, Pixi runtime, assets, or weather internal layout for Stage 3 shell work.
- Weather must not implement its own global bottom navigation.
- Weather must not mutate global navigation logic.

Evidence:

- `src/modules/weather/WeatherPage.vue` is already a route perimeter.
- `src/modules/weather/components/WeatherWorkspace.vue` owns weather content and route actions.
- `src/modules/weather/pages/WeatherCityManagementPage.vue` and `src/modules/weather/pages/LongRangeForecastPage.vue` are secondary weather pages.

## Stage 3 Implementation Boundary

Stage 3 may:

- Add `/app` and route meta.
- Rename route name `home` to `landing`/`workspace` as required by the contract.
- Introduce layout resolver and three layout components.
- Replace current sidebar shell with App Layout top navigation and mobile bottom navigation.
- Move current `AppShell` responsibilities into the new App Layout.
- Update navigation registry and active-state mapping.
- Update Not Found to Minimal Layout.

Stage 3 must not:

- Rebuild Home dashboard content.
- Create the final Landing narrative page beyond the minimum route/layout placeholder approved for that stage.
- Change weather internals.
- Add GSAP or other animation dependencies.
- Change storage formats.

## Code Evidence

| File | Evidence used |
| --- | --- |
| `src/router/routes.ts` | Current route names, paths, catch-all, and absence of `/app` and layout meta. |
| `src/router/index.ts` | Current document title hook and scroll behavior. |
| `src/app/App.vue` | Current global AppShell wrapper. |
| `src/main.ts` | Pinia, router, theme, and language initialization. |
| `src/components/layout/AppShell.vue` | Current shell, skip link, main content target. |
| `src/components/layout/SidebarNav.vue` | Current route-name and path-based active state. |
| `src/components/layout/MobileNav.vue` | Current six-item bottom nav and active matching. |
| `src/shared/constants/navigation.ts` | Current single navigation list. |
| `src/i18n/keys.ts` | Current title/navigation i18n keys. |
| `src/i18n/catalog.ts` | Current translation catalog pattern. |
| `src/stores/theme.ts` | Global theme responsibility. |
| `src/stores/language.ts` | Global language responsibility. |
| `src/modules/home/HomePage.vue` | Current workspace target for `/app`. |
| `src/modules/not-found/NotFoundPage.vue` | Current recovery behavior to `home`. |
| `src/modules/weather/WeatherPage.vue` | Weather route perimeter. |
| `src/modules/weather/components/WeatherWorkspace.vue` | Weather route actions and content boundary. |
| `src/modules/weather/pages/WeatherCityManagementPage.vue` | Weather hash/focus behavior evidence. |
| `src/modules/weather/pages/LongRangeForecastPage.vue` | Weather secondary page focus behavior evidence. |

## Needs Later Verification

- Route meta type augmentation compiles with Vue Router.
- All current `RouterLink` references to route name `home` are migrated intentionally.
- Browser Back/Forward restores saved positions.
- Hash navigation offsets correctly under sticky top navigation.
- `aria-current="page"` appears on active desktop and mobile navigation links.
- Not Found has no app bottom navigation.
- Weather still builds and renders without internal source changes.
