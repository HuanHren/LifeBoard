# LifeBoard Commercial Upgrade Target Architecture

This is a planning document for gradual migration. It is not an implementation instruction for Stage 1A.

## Target Page Hierarchy

Target routes:

| Route | Purpose | Layout |
| --- | --- | --- |
| `/` | Commercial introduction and product demonstration page | Landing Layout |
| `/app` | Application workspace home | App Layout |
| `/weather` | Weather module | App Layout |
| `/todos` | Todos and countdowns | App Layout |
| `/bookmarks` | Bookmarks | App Layout |
| `/tools` | Browser tools | App Layout |
| `/settings` | Settings | App Layout, secondary nav entry |

Route compatibility principle: current `/` must not be replaced abruptly. Stage 1B must decide whether current Home moves to `/app`, whether `/` temporarily redirects, and whether old bookmarks need compatibility.

## Target Route Structure

Recommended conceptual route shape:

```text
/
  landing route
/app
  workspace home route, initially current HomePage behavior
/weather
/weather/cities
/weather/15-day
/todos
/bookmarks
/tools
/settings
/settings/data-sources
/:pathMatch(.*)*
```

Recommended route metadata:

- `titleKey`: keep current document title update model.
- `layout`: `landing` or `app`.
- `navGroup`: optional active navigation grouping for child routes.
- `requiresAppShell`: boolean equivalent only if `layout` is not used.

Do not add route metadata until Stage 1B. The current router has no layout metadata and all route components are lazy loaded in `src/router/routes.ts`.

## Target Layout Relationship

Recommended target:

```text
Root App
├─ App Providers
│  ├─ Pinia
│  ├─ Router
│  ├─ Theme
│  └─ Language
├─ Landing Layout
│  └─ Landing Page
└─ App Layout
   ├─ Desktop Top Navigation
   ├─ Mobile Header
   ├─ Main Content
   └─ Mobile Bottom Navigation
```

How this maps from today:

- `src/main.ts` should remain the app bootstrap and provider install point.
- `src/app/App.vue` should remain a thin route layout switcher, not a business page.
- Current `src/components/layout/AppShell.vue` is the predecessor to target App Layout.
- Current `src/components/layout/SidebarNav.vue`, `Topbar.vue`, and `MobileNav.vue` are shell pieces to replace gradually in Stage 3.
- Landing Layout should be independent so scroll-linked animation does not affect application routes.

## Desktop Navigation

Target:

- Top global navigation, not permanent left sidebar.
- Primary entries: Workspace, Weather, Todos, Bookmarks, Tools.
- Settings may be accessible through account/settings action area, not necessarily primary nav.
- Logo points to `/`.
- Command/search can be added later, potentially with `Ctrl/Cmd+K`.

Current constraints:

- `src/shared/constants/navigation.ts` includes Settings as a primary nav item.
- `SidebarNav.vue` and `MobileNav.vue` consume the same six-item list.
- Active matching for weather/settings child routes is duplicated in both components.

Recommended boundary:

- Create one navigation model in app/navigation when Stage 3 starts.
- Split "primary app nav" from "utility/settings nav".
- Keep route names stable where possible to limit Home/module link churn.

## Mobile Navigation

Target:

- Landing page: top logo, search/command or menu, and landing-specific menu.
- App pages: mobile page title/header plus bottom primary navigation.
- Do not compress desktop top navigation directly into mobile.

Current constraints:

- `MobileNav.vue` uses six equal columns, including Settings.
- `AppShell.vue` applies fixed bottom clearance through global `.app-main`.

Recommended boundary:

- Mobile App Layout owns bottom nav and page header.
- Landing Layout owns any landing mobile menu.
- Weather page internals should not know whether mobile nav is top or bottom.

## Target Module Boundaries

Recommended structure over time:

```text
src/
├─ app/
│  ├─ router/
│  ├─ layouts/
│  ├─ navigation/
│  └─ providers/
├─ modules/
│  ├─ landing/
│  ├─ home/
│  ├─ weather/
│  ├─ todos/
│  ├─ bookmarks/
│  ├─ tools/
│  └─ settings/
├─ shared/
│  ├─ components/
│  ├─ composables/
│  ├─ services/
│  ├─ storage/
│  ├─ types/
│  └─ utils/
├─ styles/
└─ assets/
```

Adopt now as planning vocabulary only. Do not bulk move files.

Worth adopting:

- `app/layouts`: current shell should eventually move from `src/components/layout`.
- `app/navigation`: current `src/shared/constants/navigation.ts` and active matching should become app infrastructure.
- `app/providers`: only if theme/language initialization is simplified into one clear root provider boundary.
- `modules/landing`: for future commercial page.
- Existing `modules/*`: already useful and should be preserved.
- `shared/storage`: later, after storage compatibility design.

Not suitable yet:

- Moving every base component to `shared/components` immediately. Current `src/components/base` is stable and readable.
- Moving all utilities into `shared/utils`. Most utilities are module-specific and should stay in modules.
- Moving weather internals. Weather is frozen.
- Introducing `features`, `entities`, or a large domain architecture taxonomy. The app is small enough that this would add ceremony.

## Target Store Responsibilities

Global stores:

- Theme store: theme mode and system preference only.
- Language store: locale and document language only.
- App shell store: only transient shell UI state if needed.

Module stores:

- Todos store: task/countdown domain state and commands.
- Bookmarks store: bookmark domain state and commands.
- Weather store: keep current behavior frozen until a dedicated weather-unfreeze stage.
- Settings should orchestrate settings workflows but not become the owner of other modules' domain data.

Future service split candidates:

- Weather provider/cache orchestration is already service-backed in places, but store remains broad. Do not refactor during commercial shell stages.
- Todos/bookmarks persistence can later use a storage adapter without changing public store APIs.

## Target Persistence Boundary

Principles:

- Storage key names and data envelopes are contracts.
- Storage migration must be designed before changing key names or payload shape.
- Backup/restore must remain transaction-like because `settingsBackup.ts` currently snapshots and restores owned keys.

Target layers:

```text
Module store
└─ Module repository/service
   └─ Storage adapter
      └─ localStorage today, backend later
```

Stage guidance:

- Do not introduce the adapter in Stage 1B or Stage 3 unless route/shell work demands it.
- Introduce only when a module is being upgraded and has regression coverage.
- Weather storage keys stay frozen unless an explicit weather storage migration is scoped.

## Target Shared Boundary

Shared is allowed for:

- Small app-wide UI primitives used in more than one module.
- Type-safe storage helpers after a migration plan exists.
- Pure, domain-neutral utilities.
- App shell/navigation infrastructure under `src/app`, not generic `shared`.

Shared is not allowed for:

- Weather-specific normalizers, scene definitions, provider logic, or Pixi runtime.
- Page-private components used by one module.
- Business copy for landing or settings.
- Large "misc" helper collections.

Rule: a module-private component stays module-private until at least two modules need the same contract, not just a similar visual style.

## Target Design System Boundary

Current tokens are app-oriented and semantic. Stage 2 should extend, not replace, `src/assets/styles/tokens.css`.

Needed token categories for commercial upgrade:

- Landing section spacing and max widths.
- Narrative media dimensions.
- Scroll progress and sticky section timing.
- Top navigation dimensions.
- Mobile app header dimensions.
- Motion tiers for landing-only effects.
- Elevation/overlay tokens for command/search and future dialogs.

Do not force weather scene colors or image assets through generic tokens. Weather visuals should remain visually stable.

## Target Test Boundary

Minimum validation by stage:

- Build/typecheck: `npm run build`.
- Route smoke: all primary routes, 404, child routes.
- Responsive smoke: 375, 390, 768, 1024, 1280, 1440.
- Accessibility smoke: landmarks, navigation active state, focus, labels, reduced motion.
- Weather regression: `/weather`, `/weather/cities`, `/weather/15-day`, reduced motion, frozen asset/runtime checks.
- Storage regression: todos/bookmarks/settings backup only when touching those modules or storage boundaries.

Longer-term quality scripts should be added only in a dedicated quality stage or when a stage requires them.

## Weather Freeze Boundary As Long-Term Constraint

Weather remains a module with special protection:

- App shell may wrap weather differently.
- Navigation may point to weather differently.
- Route metadata may classify weather differently.
- Page container outside weather may change.

Weather internals remain frozen:

- `src/modules/weather/**`
- `src/assets/weather/atmosphere/**`
- `public/weather-assets/**`
- `public/__local_weather_reference/**`
- Pixi dependency and runtime behavior.
- Weather condition mapping, cache strategy, provider data normalization, visual assets.

Any future change inside these paths requires a separate weather task, explicit unfreeze scope, and weather regression proof.

## Rejected Architecture Options

1. Big-bang rewrite.
   - Rejected because current local data, weather freeze, route behavior, and module boundaries are functional.

2. React migration.
   - Rejected because product is already Vue 3 with Pinia/Vue Router and project docs require stability.

3. Nuxt migration now.
   - Rejected because the app is local-first, client-oriented, and the commercial upgrade does not require SSR at this stage.

4. Single shared component dump.
   - Rejected because `src/shared` becoming unbounded would reduce clarity.

5. Move all files to target folders before visual work.
   - Rejected because it destroys git history readability and increases regression risk.

6. Put landing animation dependencies in the global app bundle.
   - Rejected because app workspace routes must remain fast, stable, and long-use friendly.

7. Weather visual rewrite as part of commercial upgrade.
   - Rejected because weather is frozen at baseline `a54de16`.

## Migration Control Rules

- Each stage must have a small allowed path list.
- Each stage must build independently.
- Route/shell changes must not include visual page redesign unless explicitly scoped.
- Storage changes must include compatibility notes and backup/restore checks.
- Weather touching must be declared in the stage plan before work starts.
- Commits should separate route architecture, shell architecture, visual tokens, page implementations, and regression fixes.
