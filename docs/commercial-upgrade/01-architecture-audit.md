# LifeBoard Commercial Upgrade Stage 1A Architecture Audit

Audit date: 2026-07-02

Baseline commit: `a54de1674ea79f3cd5ef98e8ec605ee2c223b189`

Scope: read-only architecture audit for the commercial upgrade. This document records current structure and risks only. It does not authorize source, route, dependency, storage, or weather-core changes.

## Gates And Baseline

- Required product documents were read: `PRODUCT.md`, `DESIGN.md`.
- Required skill files were read before project audit:
  - `C:\Users\jingr\codex-skills\vue-best-practices\SKILL.md`
  - `C:\Users\jingr\codex-skills\vue-best-practices\references\reactivity.md`
  - `C:\Users\jingr\codex-skills\vue-best-practices\references\sfc.md`
  - `C:\Users\jingr\codex-skills\vue-best-practices\references\component-data-flow.md`
  - `C:\Users\jingr\codex-skills\vue-best-practices\references\composables.md`
  - `C:\Users\jingr\codex-skills\audit\SKILL.md`
  - `C:\Users\jingr\codex-skills\harden\SKILL.md`
  - `C:\Users\jingr\codex-skills\fixing-accessibility\SKILL.md`
  - `C:\Users\jingr\codex-skills\fixing-motion-performance\SKILL.md`
  - `C:\Users\jingr\codex-skills\playwright-cli\SKILL.md`
- Branch at audit start: `main`.
- Initial worktree: clean.
- Weather freeze baseline check: `git merge-base --is-ancestor a54de16 HEAD` returned `0`.
- Baseline build: `npm run build` passed.
- Existing build warnings: Rolldown plugin timing report and chunk warning for `dist/assets/lib-Bro25hgE.js` at `513.51 kB` minified. These are baseline warnings.

## Current Technology Stack

- Runtime framework: Vue 3, Composition API, SFCs. Evidence: `package.json`, `src/main.ts`, `.vue` files under `src/modules`.
- State: Pinia. Evidence: `package.json`, `src/main.ts`, `src/stores/theme.ts`, `src/modules/weather/stores/weather.ts`.
- Routing: Vue Router with history mode and lazy route components. Evidence: `src/router/index.ts`, `src/router/routes.ts`.
- Build: Vite 8 with `@vitejs/plugin-vue` and `@tailwindcss/vite`. Evidence: `vite.config.ts`, `package.json`.
- Type checking: `vue-tsc -b` inside the only build script. Evidence: `package.json`.
- Styling: Tailwind CSS v4 plus semantic CSS variables. Evidence: `src/assets/styles/main.css`, `src/assets/styles/tokens.css`.
- Weather rendering: frozen local assets plus PixiJS 8.19.0 dynamic runtime. Evidence: `package.json`, `src/modules/weather/renderers/pixi/**`, `src/assets/weather/atmosphere/**`.
- Serverless proxies: Vercel functions for AMap and Caiyun. Evidence: `api/amap-geocode.js`, `api/amap-reverse-geocode.js`, `api/caiyun-weather.js`, `vercel.json`.

Missing engineering scripts:

- No separate `typecheck`, `lint`, `format`, `test`, `unit`, `e2e`, or `bundle` script exists in `package.json`.
- No committed Playwright config exists at project root. Historical audit configs exist under `docs/frontend-audit-local/**`, but they are not project-wide quality gates.

## Current Directory Structure

Top-level relevant paths:

- `api/`: Vercel serverless weather provider proxies.
- `docs/`: prior audits, weather freeze notes, screenshots, and skill audit docs.
- `public/`: favicon plus vendor/local weather reference assets.
- `scripts/`: weather validation scripts.
- `src/`: application source.

`src/` structure:

- `src/main.ts`: app bootstrap, Pinia, router, global styles, theme/language initialization.
- `src/app/App.vue`: root composition surface around `AppShell` and `RouterView`.
- `src/router/index.ts`, `src/router/routes.ts`: router creation and records.
- `src/components/base/**`: shared UI primitives such as `BaseButton`, `BaseInput`, `PageLayout`, `IconButton`.
- `src/components/layout/**`: current shell pieces: `AppShell`, `SidebarNav`, `Topbar`, `MobileNav`.
- `src/modules/home/**`: current overview page and cross-module dashboard summaries.
- `src/modules/weather/**`: weather pages, store, services, visual runtime, Pixi runtime, assets and normalization.
- `src/modules/todos/**`: tasks/countdowns page, store, storage, validation.
- `src/modules/bookmarks/**`: bookmarks page, store, storage, validation.
- `src/modules/tools/**`: browser-only utility tools.
- `src/modules/settings/**`: settings workspace, backup/restore, data sources, exports, weather provider preferences.
- `src/i18n/**`: translation catalog, keys, locale modules, formatting hooks.
- `src/shared/**`: currently small shared constants/types layer.
- `src/stores/**`: global app shell, language, and theme stores.

Organization verdict: the app is mostly module-oriented under `src/modules`, with shared UI in `src/components` and global stores in `src/stores`. The main boundary gap is that layout/navigation lives in `src/components/layout` instead of an app-level shell namespace, while `src/app/App.vue` already exists.

## Current Route Table

Router creation uses `createRouter({ history: createWebHistory(), routes })` in `src/router/index.ts`.

Current route records from `src/router/routes.ts`:

| Path | Name | Component | Meta |
| --- | --- | --- | --- |
| `/` | `home` | `@/modules/home/HomePage.vue` | `navigation.home.label` |
| `/weather` | `weather` | `@/modules/weather/WeatherPage.vue` | `navigation.weather.label` |
| `/weather/cities` | `weather-cities` | `@/modules/weather/pages/WeatherCityManagementPage.vue` | `weather.cities.title` |
| `/weather/15-day` | `weather-15-day` | `@/modules/weather/pages/LongRangeForecastPage.vue` | `weather.longRange.title` |
| `/todos` | `todos` | `@/modules/todos/TodosPage.vue` | `navigation.todos.label` |
| `/tools` | `tools` | `@/modules/tools/ToolsPage.vue` | `navigation.tools.label` |
| `/bookmarks` | `bookmarks` | `@/modules/bookmarks/BookmarksPage.vue` | `navigation.bookmarks.label` |
| `/settings` | `settings` | `@/modules/settings/SettingsPage.vue` | `navigation.settings.label` |
| `/settings/data-sources` | `settings-data-sources` | `@/modules/settings/pages/DataSourcesPage.vue` | `settings.dataSources.pageTitle` |
| `/:pathMatch(.*)*` | `not-found` | `@/modules/not-found/NotFoundPage.vue` | `notFound.routeTitle` |

Route dependencies:

- Navigation items are centralized in `src/shared/constants/navigation.ts`, mapped by route name.
- `SidebarNav.vue` and `MobileNav.vue` duplicate active-route matching for weather/settings child routes.
- Home summary components hard-link to module routes through `RouterLink`, for example `src/modules/home/HomeWeatherSummary.vue`, `HomeTodosSummary.vue`, `HomeBookmarksSummary.vue`, and `HomeToolsSummary.vue`.
- Weather page internals navigate to weather child routes through `src/modules/weather/components/WeatherWorkspace.vue` and `src/modules/weather/pages/WeatherCityManagementPage.vue`.
- Tools reads and writes query-state through `src/modules/tools/components/ToolsWorkspace.vue`.

No redirect is currently defined. The current homepage is the authenticated/application-style home overview at `/`, not a commercial landing page.

## Current App Shell

Current shell stack:

```text
src/main.ts
└─ src/app/App.vue
   └─ src/components/layout/AppShell.vue
      ├─ src/components/layout/SidebarNav.vue
      ├─ src/components/layout/Topbar.vue
      ├─ <main id="main-content">
      │  └─ RouterView slot content
      └─ src/components/layout/MobileNav.vue
```

Facts:

- `src/app/App.vue` initializes theme again and updates `document.documentElement.dataset.theme`; `src/main.ts` also initializes theme and language.
- `AppShell.vue` is the only `RouterView` wrapper and includes skip link, sidebar, topbar, main content, and mobile nav.
- Desktop layout uses fixed left sidebar with `min-[56.25rem]` and `xl` width changes.
- Mobile navigation is fixed bottom navigation with six columns, including Settings.
- Topbar is sticky, includes the current date and theme toggle, and owns a midnight rollover timer.
- There is no separate Landing Layout or App Layout today.
- There is no route-level layout metadata today.

## Module Inventory And Boundaries

Home:

- Files: `src/modules/home/**`.
- Role: current `/` dashboard, composed from module summaries and quick access.
- Coupling: imports multiple module stores through `src/modules/home/composables/useHomeDashboard.ts`; route links are embedded in Home components.
- Risk: it is both the current homepage and a cross-module application dashboard, so it conflicts with the target plan where `/` becomes a commercial landing page and `/app` becomes the workspace.

Weather:

- Files: `src/modules/weather/**`, `src/assets/weather/atmosphere/**`, `public/weather-assets/**`, `public/__local_weather_reference/**`.
- Role: weather page, city management, long-range forecast, provider preferences, cache, visual rendering, Pixi layer.
- Coupling: depends on app shell route names, settings data-source pages, global i18n, local storage, public assets, and Vercel API functions.
- Risk: high regression cost. Keep internals frozen.

Todos:

- Files: `src/modules/todos/**`.
- Role: task and countdown workspace.
- Boundary: strong module-owned store, storage service, validation, utilities.
- Risk: storage format changes are user-data sensitive.

Bookmarks:

- Files: `src/modules/bookmarks/**`.
- Role: local bookmark management.
- Boundary: strong module-owned store, storage service, validation, utilities.
- Risk: storage format changes are user-data sensitive.

Tools:

- Files: `src/modules/tools/**`.
- Role: in-browser text/data utilities.
- Boundary: mostly local component state and pure utility functions.
- Coupling: `ToolsWorkspace.vue` reads/writes route query for selected tool.

Settings:

- Files: `src/modules/settings/**`.
- Role: theme/language controls, backup/restore, privacy, data sources, weather provider preferences.
- Coupling: intentionally crosses module storage and store synchronization boundaries.
- Risk: `SettingsWorkspace.vue` and `DataSourcesPage.vue` are large; backup/restore touches many storage keys.

Shared:

- Files: `src/components/base/**`, `src/shared/**`, `src/i18n/**`, `src/stores/**`.
- Role: UI primitives, route navigation constants, global settings, translation system.
- Risk: `src/shared` is still small and should not become a dumping ground during migration.

## Store Inventory

Global stores:

- `src/stores/theme.ts`: `useThemeStore`, owns `lifeboard-theme`, system media query listener, theme mode/resolved theme.
- `src/stores/language.ts`: `useLanguageStore`, owns `lifeboard.language`, browser locale fallback, `document.documentElement.lang`.
- `src/stores/appShell.ts`: `useAppShellStore`, owns mobile nav open state; currently not observed as active in layout components.

Module stores:

- `src/modules/weather/stores/weather.ts`: `useWeatherStore`, owns selected location, search results, forecast status, weather snapshot, air quality, favorites, provider preferences, AMap preferences, cache state, long-range forecast. It performs service orchestration and direct selected-location localStorage writes.
- `src/modules/todos/stores/todos.ts`: `useTodosStore`, owns tasks, countdowns, active filter, local today, persistence errors, CRUD and restore/permanent delete behavior.
- `src/modules/bookmarks/stores/bookmarks.ts`: `useBookmarksStore`, owns bookmarks, search query, active category, pinned/filter derivations, CRUD and pinned behavior.

Store risks:

- Weather store is a broad orchestration store. It coordinates network requests, abort controllers, storage, cache, provider credentials, favorites, and UI-facing status. Evidence: `src/modules/weather/stores/weather.ts`.
- Settings crosses module boundaries by design. Evidence: `src/modules/settings/services/settingsBackup.ts` imports todos, bookmarks, weather constants/services and global theme store key.
- Theme initialization is duplicated between `src/main.ts` and `src/app/App.vue`; this is not currently breaking but should be simplified before shell redesign.

## Persistence And Storage Keys

Current storage keys:

| Key | Owner | Evidence |
| --- | --- | --- |
| `lifeboard-theme` | global theme | `src/stores/theme.ts` |
| `lifeboard.language` | global language | `src/stores/language.ts` |
| `lifeboard-weather-location` | weather selected location | `src/modules/weather/constants/weather.ts`, `src/modules/weather/stores/weather.ts` |
| `lifeboard.weather.forecastCache.v1` | weather forecast cache | `src/modules/weather/constants/weather.ts`, `src/modules/weather/services/weatherForecastCache.ts` |
| `lifeboard-weather-favorite-cities` | weather favorites | `src/modules/weather/constants/weather.ts`, `src/modules/weather/services/weatherFavoritesStorage.ts` |
| `lifeboard.weather.provider` | weather provider choice | `src/modules/weather/constants/weather.ts`, `src/modules/weather/services/weatherProviderStorage.ts` |
| `lifeboard.weather.caiyunToken` | Caiyun token | `src/modules/weather/constants/weather.ts`, `src/modules/weather/services/weatherProviderStorage.ts` |
| `lifeboard.weather.amapKey` | AMap key | `src/modules/weather/constants/weather.ts`, `src/modules/weather/services/weatherAmapStorage.ts` |
| `lifeboard.weather.autoLocationOnHome` | home auto-location preference | `src/modules/weather/constants/weather.ts`, `src/modules/weather/services/weatherAmapStorage.ts` |
| `lifeboard.todos` | todos/countdowns | `src/modules/todos/constants/todos.ts`, `src/modules/todos/services/todosStorage.ts` |
| `lifeboard.bookmarks` | bookmarks | `src/modules/bookmarks/constants/bookmarks.ts`, `src/modules/bookmarks/services/bookmarksStorage.ts` |

Data boundary verdict:

- Todos and bookmarks have module-owned storage envelopes with version `1`.
- Weather has several separate storage keys and cache/favorites/provider credential boundaries.
- Settings backup treats a subset as owned storage keys in `src/modules/settings/services/settingsBackup.ts`.
- There is no generic storage adapter today. Introducing one later is appropriate, but only after an explicit storage compatibility plan.

## Services, Composables, And Utilities

Network:

- Open-Meteo direct fetches: `src/modules/weather/services/openMeteoService.ts`, `openMeteoAirQualityService.ts`.
- Weather request wrapper with timeout/retry: `src/modules/weather/services/weatherRequest.ts`.
- Provider adapter: `src/modules/weather/services/weatherForecastProvider.ts`.
- Vercel proxy API: `api/amap-geocode.js`, `api/amap-reverse-geocode.js`, `api/caiyun-weather.js`.

Persistence:

- Todos: `src/modules/todos/services/todosStorage.ts`.
- Bookmarks: `src/modules/bookmarks/services/bookmarksStorage.ts`.
- Weather: `src/modules/weather/services/weatherForecastCache.ts`, `weatherFavoritesStorage.ts`, `weatherProviderStorage.ts`, `weatherAmapStorage.ts`.
- Settings backup/export: `src/modules/settings/services/settingsBackup.ts`, `settingsPortableExports.ts`.

Composables:

- Home dashboard aggregation: `src/modules/home/composables/useHomeDashboard.ts`.
- Todos date rollover: `src/modules/todos/composables/useLocalToday.ts`.
- Weather visual transitions and solar phase: `src/modules/weather/composables/useWeatherSnapshotTransition.ts`, `useWeatherSolarPhase.ts`.
- Tools clipboard feedback: `src/modules/tools/composables/useClipboardFeedback.ts`.

Risk: shared utility extraction should be conservative. Module-owned utility files are currently clear; moving them too early would increase cross-module dependencies without functional benefit.

## UI Components And State Completeness

Shared primitives:

- Buttons/inputs/icons: `BaseButton.vue`, `BaseInput.vue`, `IconButton.vue`, `BaseIcon.vue`.
- Surfaces/layout helpers: `BaseCard.vue`, `BaseSurface.vue`, `BaseSection.vue`, `PageHeader.vue`, `PageLayout.vue`.
- States: `BaseEmpty.vue`, `BaseError.vue`, `BaseSkeleton.vue`.
- Theme control: `ThemeToggle.vue`.

Missing or non-centralized primitives:

- No app-wide toast host was found.
- No app-wide modal/drawer/bottom-sheet primitive was found.
- Confirm/delete interactions are module-specific: `src/modules/todos/components/InlineDeleteConfirmation.vue`, `src/modules/bookmarks/components/BookmarkDeleteConfirmation.vue`, `src/modules/settings/components/SettingsConfirmationDialog.vue`.
- Page headers and empty/error/loading states exist, but page-level usage remains module-specific.

Verdict: base UI is useful but still narrow. Do not force page-private components into shared UI until repeated patterns are visible in Stage 6 page upgrades.

## Design Token And Style State

Token source: `src/assets/styles/tokens.css`.

Current token categories:

- Typography: `--font-size-*`, `--font-weight-*`, `--line-height-*`, `--font-sans`.
- Spacing/layout: `--space-*`, `--page-inline`, `--page-block`, `--section-gap`, `--content-max-width`, `--content-wide-max-width`, sidebar widths.
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-pill`.
- Motion: `--motion-fast`, `--motion-base`, `--motion-standard`, `--motion-slow`, `--motion-ease`.
- Shadows: `--shadow-*`.
- Color: semantic OKLCH background, surface, border, text, accent, success, warning, danger, overlay.
- Theme mode: `:root[data-theme="dark"]` overrides semantic tokens.

Global utilities: `src/assets/styles/main.css`.

Notable style facts:

- Reduced motion is globally handled with a broad media query that forces animation/transition durations down.
- `PageLayout.vue` uses `!max-w-4xl` for narrow variant, so one `!important`-style Tailwind override exists.
- The shell uses `min-h-dvh`, safe-area helpers, and bottom nav clearance.

Token risks:

- Current token set supports app surfaces but not a scroll narrative landing page. Stage 2 should add landing-specific section, media, narrative, and scroll-state tokens before Stage 4.
- Weather visuals should keep local atmospheric palette and image assets isolated; do not force weather renderer colors through general commercial tokens.

## Responsive And Mobile State

Current app shell behavior:

- Desktop sidebar appears at `min-[56.25rem]`; compact width then expands at `xl`.
- Mobile bottom nav is fixed with six items.
- Topbar is sticky on all sizes.
- Main content uses `px-[var(--page-inline)]`, `pt-[var(--page-block)]`, and bottom clearance for mobile nav.

Risk by target viewport:

- 375/390: six bottom-nav items may be dense; future target says Settings may not occupy primary nav, so Stage 3/7 should reduce primary mobile nav load.
- 768/1024: current breakpoint at 900px can leave tablet-sized layouts in mobile-nav mode longer than expected.
- 1280/1440: sidebar consumes permanent horizontal space; target desktop top navigation removes this assumption.

No Playwright screenshots were generated for this Stage 1A audit. Prior project audit artifacts exist under `docs/frontend-audit-local/**`, but this document uses current source/build evidence unless explicitly noted.

## Accessibility State

Current positives:

- App shell has skip link and main content target in `src/components/layout/AppShell.vue`.
- Navigation uses semantic `nav`, `aria-label`, and `aria-current` in `SidebarNav.vue` and `MobileNav.vue`.
- Base error/empty/loading states use `role="alert"` or `role="status"` where applicable.
- Forms commonly use labels and `aria-describedby`, for example todos, bookmarks, settings, and weather forms.
- Global focus visible styling exists in `src/assets/styles/main.css`.

Risks:

- `SidebarNav.vue` hardcodes `aria-label="LifeBoard"` on the logo link and should later be i18n-aware.
- There is no app-wide dialog/focus-management primitive; settings has a page-specific confirmation dialog.
- Future scroll-linked landing animations must be reduced-motion aware and must not poll scroll position.

## Performance And Motion State

Current performance facts:

- Routes are lazy loaded in `src/router/routes.ts`.
- Pixi runtime is code-split into async chunks by dependency behavior.
- Build warns that one chunk is larger than 500 kB after minification: `lib-Bro25hgE.js` at `513.51 kB`.
- Weather contains the heaviest runtime surfaces: `WeatherAtmosphere.vue`, `WeatherPixiLayer.vue`, weather store, weather normalizers, and visual assets.
- `vite.config.ts` removes `dist/__local_weather_reference` after bundle creation.

Motion facts:

- Global reduced-motion media query exists.
- Weather checks `prefers-reduced-motion` in `WeatherAtmosphere.vue` and the weather snapshot transition composable.
- Pixi layer has `ResizeObserver` and runtime cleanup concerns in `src/modules/weather/renderers/pixi/WeatherPixiLayer.vue`.

Future landing risk:

- GSAP/ScrollTrigger, sticky sections, parallax, and weather-scene transformations must be landing-only, route-lazy, and reduced-motion gated. They must not load on app workspace routes.

## i18n State

Current i18n files:

- `src/i18n/catalog.ts`, `keys.ts`, `moduleKeys.ts`, `types.ts`, `useI18n.ts`, `formatters.ts`.
- Locale payloads: `src/i18n/locales/en-US.ts`, `zh-CN.ts`, `en-US-modules.ts`, `zh-CN-modules.ts`.

Facts:

- Language initializes in `src/main.ts` and `src/stores/language.ts`.
- Document title is updated by route meta in `src/router/index.ts`.
- `document.documentElement.lang` is written from the language store.
- Navigation labels use translation keys through `src/shared/constants/navigation.ts`.

Risk:

- Landing copy should enter i18n as a separate landing namespace, not as hardcoded text in a large landing component.
- Route titles for `/` and `/app` must be revised in Stage 1B without breaking current title update flow.

## Testing And Quality Baseline

Current verified capability:

- `npm run build` performs type checking and production build.
- Weather-specific validation scripts exist in `scripts/lb-*.mjs`, especially freeze/stability scripts.
- Historical Playwright-style audit artifacts exist under `docs/frontend-audit-local/**`.

Missing capability:

- No dedicated root scripts for lint, format, unit tests, e2e tests, accessibility tests, visual regression, or bundle analysis.
- No CI configuration was found during this audit.
- No root Playwright config was found.

Minimum future gates:

- Every stage: `npm run build`, `git diff --stat`, and source scope check.
- Stages touching routes/shell: route smoke checks for `/`, `/app`, `/weather`, `/todos`, `/bookmarks`, `/tools`, `/settings`, 404.
- Weather-adjacent stages: weather freeze regression scripts plus build.
- Visual stages: responsive screenshots at 375, 390, 768, 1024, 1280, 1440, but keep generated artifacts out of commits unless explicitly scoped.

## Weather Freeze Boundary

Frozen directories/files:

- `src/modules/weather/**`
- `src/assets/weather/atmosphere/**`
- `public/weather-assets/**`
- `public/__local_weather_reference/**`
- Weather validation scripts under `scripts/lb-*weather*.mjs`
- Weather docs that define freeze state, including `docs/weather-module-freeze-baseline.md` and `docs/lb-3d-weather-freeze-verification.md`

Allowed future peripheral touchpoints:

- App shell container around the weather route.
- Navigation links pointing to weather routes.
- Route metadata/layout metadata around weather pages.
- Page container constraints outside weather internals.
- Settings route links that expose weather provider/data source pages, if Stage 1B/3 explicitly scopes them.

Forbidden changes without a dedicated weather-unfreeze decision:

- New weather types, animations, condition mappings, renderer engines, Pixi core implementation changes, data source replacement, cache strategy changes, Pixi version upgrade, weather visual assets, weather core information layout, or cleanup of weather internals under the commercial upgrade label.

Mandatory weather regression for future shell/route work:

- `npm run build`.
- Existing weather freeze validation scripts, especially `scripts/lb-3d-validate-weather-freeze.mjs` if still compatible.
- Route smoke for `/weather`, `/weather/cities`, `/weather/15-day`.
- Reduced-motion weather smoke.
- Mobile and desktop weather viewport checks.

## Findings By Priority

### P0

No P0 blocker was found in Stage 1A. The build passes, current branch is `main`, the worktree was clean at start, and the weather freeze baseline is present.

### P1

1. Current `/` is the app dashboard, but target `/` is a commercial landing page. Evidence: `src/router/routes.ts` maps `/` to `src/modules/home/HomePage.vue`; product target requires `/app` as workspace. Risk: route migration can break Home cross-module dashboard links and browser bookmarks unless compatibility is designed before implementation.

2. Current shell is a single app shell wrapped around every route. Evidence: `src/app/App.vue` always renders `src/components/layout/AppShell.vue`, which always includes sidebar, topbar, main content, and mobile nav. Risk: a landing page cannot be introduced cleanly without route layout separation.

3. Navigation is tightly coupled to current route names and sidebar/bottom-nav assumptions. Evidence: `src/shared/constants/navigation.ts`, `src/components/layout/SidebarNav.vue`, `src/components/layout/MobileNav.vue`. Risk: desktop top navigation and mobile split navigation will affect shared navigation constants and active-route logic.

4. Weather store is high-blast-radius orchestration. Evidence: `src/modules/weather/stores/weather.ts` coordinates provider selection, credentials, search, cache, forecast loading, air quality, favorites, long-range forecast, and selected-location storage. Risk: any broad store cleanup during commercial upgrade could regress weather.

5. Storage formats are user-data-sensitive and lack a shared adapter. Evidence: storage keys and versioned envelopes in `src/modules/todos/services/todosStorage.ts`, `src/modules/bookmarks/services/bookmarksStorage.ts`, `src/modules/weather/services/*.ts`, and `src/modules/settings/services/settingsBackup.ts`. Risk: moving persistence before migration planning can damage local data.

6. Quality gates are too thin for route/shell redesign. Evidence: `package.json` has only `dev`, `build`, and `preview`. Risk: Stage 3+ shell work needs repeatable route, responsive, accessibility, and weather regression checks.

### P2

1. Theme initialization is duplicated. Evidence: `src/main.ts` initializes theme before mount; `src/app/App.vue` initializes theme again and disposes the listener on unmount. Risk: small now, but should be simplified when provider boundaries are clarified.

2. `src/components/layout` is app-shell infrastructure but sits beside reusable base components. Evidence: `src/components/layout/AppShell.vue`, `SidebarNav.vue`, `Topbar.vue`, `MobileNav.vue`; `src/app/App.vue` already exists. Risk: ownership is less clear than target `src/app/layouts` or `src/app/navigation`.

3. Active route matching is duplicated between `SidebarNav.vue` and `MobileNav.vue`. Risk: target route hierarchy will require one navigation model and one active matching helper.

4. Some large files should be watched for later split, not split now. Evidence: `src/modules/weather/components/WeatherAtmosphere.vue`, `src/modules/weather/stores/weather.ts`, `src/modules/settings/pages/DataSourcesPage.vue`, `src/modules/settings/components/SettingsWorkspace.vue`, large i18n locale files. Risk: large files complicate review, but weather files are frozen.

5. Project root contains historical log files and local audit artifacts. Evidence: `.audit-vite-out.log`, `.vite-*.log`, `docs/frontend-audit-local/**`. Risk: not blocking, but future stage commits must avoid accidental inclusion.

6. Shared UI lacks app-wide overlay primitives. Evidence: no shared modal/drawer/toast host found; confirmations are module-specific. Risk: future command/search/dialog work may duplicate interaction logic.

## File Path Evidence Index

- Bootstrap/providers: `src/main.ts`, `src/app/App.vue`.
- Router: `src/router/index.ts`, `src/router/routes.ts`.
- Shell/navigation: `src/components/layout/AppShell.vue`, `SidebarNav.vue`, `Topbar.vue`, `MobileNav.vue`, `src/shared/constants/navigation.ts`.
- Base UI: `src/components/base/**`.
- Global stores: `src/stores/theme.ts`, `src/stores/language.ts`, `src/stores/appShell.ts`.
- Modules: `src/modules/home/**`, `weather/**`, `todos/**`, `bookmarks/**`, `tools/**`, `settings/**`.
- Persistence: `src/modules/*/services/*Storage.ts`, `src/modules/settings/services/settingsBackup.ts`.
- Styles/tokens: `src/assets/styles/tokens.css`, `src/assets/styles/main.css`.
- Weather assets/runtime: `src/assets/weather/atmosphere/**`, `public/weather-assets/**`, `src/modules/weather/renderers/pixi/**`.
- Build/config: `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`, `vercel.json`, `api/*.js`.
