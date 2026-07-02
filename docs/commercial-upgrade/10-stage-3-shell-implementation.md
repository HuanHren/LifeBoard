# LifeBoard Commercial Upgrade Stage 3 Shell Implementation

Implementation date: 2026-07-02

Scope: first runtime implementation of the Stage 1B and Stage 2 contracts. This stage implements the route/layout shell, token foundation, top navigation, mobile navigation, minimal Landing placeholder, `/app` workspace route, scroll behavior, and focus behavior. It does not implement the Stage 4 scrolling narrative Landing page or redesign business pages.

## Gates

- Skill Gate completed before source inspection.
- Required architecture and design documents were read before source inspection.
- Branch: `main`.
- Initial worktree: clean.
- Baselines were present in history:
  - Stage 1A: `ffb73b4`
  - Stage 1B: `ff1e573`
  - Stage 2: `70b030f`
  - Weather freeze: `a54de16`
- Pre-change build passed with the existing large `lib` chunk warning.

## Implemented Route Contract

| Route | Name | Layout | Desktop nav | Mobile nav | Entry behavior |
| --- | --- | --- | --- | --- | --- |
| `/` | `landing` | `landing` | Landing nav | Landing menu | Product entry; no auto redirect. |
| `/app` | `workspace` | `app` | Workspace active | Workspace active | Current Home workspace moved by route responsibility. |
| `/weather` | `weather` | `app` | Weather active | Weather active | Direct application route. |
| `/weather/cities` | `weather-cities` | `app` | Weather active | Weather active | Weather child route preserved. |
| `/weather/15-day` | `weather-15-day` | `app` | Weather active | Weather active | Weather child route preserved. |
| `/todos` | `todos` | `app` | Todos active | Todos active | Direct application route. |
| `/bookmarks` | `bookmarks` | `app` | Bookmarks active | Bookmarks active | Direct application route. |
| `/tools` | `tools` | `app` | Tools active | More active | Direct application route. |
| `/settings` | `settings` | `app` | Secondary settings entry | More active | Utility route outside primary desktop nav. |
| `/settings/data-sources` | `settings-data-sources` | `app` | Settings context | More active | Settings child route preserved. |
| catch-all | `not-found` | `minimal` | none | none | No automatic redirect; provides Landing and Workspace exits. |

## Route Meta

`src/router/meta.ts` defines:

```ts
type LifeBoardLayoutKind = 'landing' | 'app' | 'minimal'
type NavigationKey = 'workspace' | 'weather' | 'todos' | 'bookmarks' | 'tools' | 'settings'
```

Each route now carries `layout` and `titleKey`; application routes also carry `navigationKey`. `requiresAuth`, breadcrumb, and animation fields were intentionally not added because the current product has no account system and visual motion remains layout/page responsibility.

## Layouts

- `src/app/layouts/LayoutResolver.vue` resolves `route.meta.layout` to Landing, App, or Minimal layout and focuses `#main-content` after route changes.
- `src/app/layouts/LandingLayout.vue` owns Landing navigation, Landing main content, and Landing footer.
- `src/app/layouts/AppLayout.vue` owns App top navigation, main content, mobile bottom navigation, and the future app overlay root.
- `src/app/layouts/MinimalLayout.vue` owns standalone error/recovery surfaces such as Not Found.
- `src/app/App.vue` now renders only `LayoutResolver`.
- `src/main.ts` remains the bootstrap owner for Pinia, router, language initialization, document title updates, and live theme dataset synchronization.

## Navigation

- `src/shared/constants/navigation.ts` now provides typed registries for app desktop navigation, Landing navigation, mobile primary navigation, and mobile More entries.
- `src/app/navigation/AppTopNavigation.vue` implements desktop app top navigation. Active state comes from route meta, not path string matching.
- `src/app/navigation/LandingNavigation.vue` implements Landing top navigation and mobile menu structure.
- `src/app/navigation/MobileBottomNavigation.vue` implements the five-item mobile bottom nav: Workspace, Weather, Todos, Bookmarks, More.
- Tools and Settings are exposed from Mobile More. More stays active for those route contexts.
- The old `src/components/layout/**` shell remains compiled but is no longer mounted by root App. Minimal compatibility edits removed the stale `home` route reference and path-prefix active matching.

## Tokens And Styles

Stage 3 adds shell-level token aliases only:

- `--top-nav-height`
- `--bottom-nav-height`
- semantic z-index aliases from sticky through drawer

The new CSS in `src/assets/styles/main.css` defines stable dimensions for top nav, bottom nav, mobile menus, Landing placeholder sections, safe-area clearance, and visible active states. It does not rewrite module-local business page styles.

## Scroll And Focus

- Vue Router now restores `savedPosition` for browser Back/Forward.
- Hash navigation uses native element targeting with a fixed-header offset.
- New route navigations default to top.
- Smooth hash scrolling is disabled when `prefers-reduced-motion: reduce` is active.
- Every layout provides a skip link to `#main-content`.
- LayoutResolver focuses `#main-content` after route changes without forcing scroll.
- Mobile menu dialogs trap Tab within the panel, close on Escape, close on overlay click, lock body scroll while open, and return focus to the trigger when closed.

## Weather Boundary

No Weather module, Weather asset, Weather Pixi, Weather cache, Weather store, or Weather data mapping file was modified. Weather integration in Stage 3 is limited to route metadata, app shell wrapping, navigation active state, and scroll/focus behavior around the page.

## Verification Targets

Stage 3 verification covers:

- Build before and after implementation.
- Route entry for `/`, `/app`, `/weather`, `/todos`, `/bookmarks`, `/tools`, `/settings`, and unknown route.
- Desktop app navigation active states.
- Mobile bottom navigation count and More behavior.
- Weather page render from the new shell without touching Weather internals.
- Reduced-motion scroll behavior remains non-hijacked.

## Known Limitations

- Landing remains a minimal placeholder and is not the Stage 4 scroll narrative.
- Existing Workspace, Todos, Bookmarks, Tools, Settings, and Weather page interiors are not redesigned.
- The old `src/components/layout/**` files remain for rollback safety but are no longer the root shell path.
