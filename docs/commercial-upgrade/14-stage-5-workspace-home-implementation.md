# LifeBoard Commercial Upgrade - Stage 5 Workspace Home Implementation

## Scope

Stage 5 redesigns only the `/app` application workspace home surface.

Allowed source surface:

- `src/modules/home/**`
- `src/i18n/moduleKeys.ts`
- `src/i18n/locales/en-US-modules.ts`
- `src/i18n/locales/zh-CN-modules.ts`

The stage does not modify Router, App Layout, Landing Layout, Minimal Layout, App Top Navigation, Mobile Bottom Navigation, Weather internals, other business pages, storage formats, package metadata, lockfiles, or configuration.

## Baseline

- Branch: `main`.
- Stage 5 baseline commit: `7bc45c917732606bd3581728c730f6f0db2f5384`.
- Initial worktree: clean.
- Baseline build: passed.
- Existing build warning: Vite large chunk warning for the `lib` chunk above 500 kB.
- Browser verification fallback: Chrome Headless/CDP, because `playwright-cli` and local Playwright packages were unavailable.

## Data And Persistence Audit

The workspace continues to use the existing aggregation composable:

- `src/modules/home/composables/useHomeDashboard.ts`

Existing data sources remain unchanged:

- Todos and countdowns: `src/modules/todos/stores/todos.ts`, persisted under `lifeboard.todos`.
- Bookmarks: `src/modules/bookmarks/stores/bookmarks.ts`, persisted under `lifeboard.bookmarks`.
- Weather: `src/modules/weather/stores/weather.ts`, selected city and cache keys defined in `src/modules/weather/constants/weather.ts`.
- Tools: `src/modules/tools/constants/tools.ts`, no persisted input on Home.
- Theme and language: `src/stores/theme.ts`, `src/stores/language.ts`.

No new workspace store, localStorage key, data envelope, migration, or persistence adapter was introduced.

## Final Workspace Information Architecture

The `/app` home now presents the application workspace in this order:

1. Workspace header with date, direct Todos and Weather actions, and a compact status rail.
2. Today Focus, sourced from active due or overdue tasks.
3. Upcoming and Countdown, sourced from existing task and countdown selectors.
4. Weather Context, sourced from existing Weather store entry points.
5. Pinned Bookmarks and Quick Tools, sourced from existing bookmark and tool data.

Desktop uses an asymmetric two-column layout:

- Main column: Today Focus and Upcoming.
- Side column: Weather Context, Pinned Bookmarks, and Quick Tools.

Mobile uses a single-column sequence with the header and status rail first, then task planning, weather, bookmarks, and tools. The App Layout mobile bottom navigation remains the only global mobile navigation.

## Implementation Decisions

### Workspace Header

`src/modules/home/HomePage.vue` now wraps the existing header in a workspace hero surface and adds a route-linked status rail.

The rail summarizes:

- Today focus count.
- Saved countdown count.
- Weather connection state.
- Quick reference count.

All values are derived from `useHomeDashboard`; no fake metrics or static source defaults were added.

### Today Focus

`src/modules/home/TodayFocusPanel.vue` remains the task interaction surface. It preserves:

- Existing task toggle behavior.
- Existing due-date sorting.
- Existing persistence error behavior.
- Existing empty state and Todos routing.

### Upcoming And Countdown

`src/modules/home/HomeNextUp.vue` remains the source for upcoming task and countdown rows. It preserves existing date calculation through `differenceInCalendarDays` and existing localized date formatting.

### Weather Context

`src/modules/home/HomeWeatherSummary.vue` continues to read Weather store state and call existing Weather store actions only:

- `initializeWeather`
- `loadForecast`
- `selectCurrentCoordinates`

The only Stage 5 adjustment in this file removes a forced card `min-height: 100%` that caused desktop side-column overlap after the new workspace layout. Weather internals, services, assets, Pixi runtime, cache, and condition mapping remain untouched.

### Pinned Bookmarks And Quick Tools

`src/modules/home/HomeQuickAccess.vue` remains responsible for displaying bookmark and tool shortcuts from the existing dashboard data:

- Bookmarks prefer pinned bookmarks and fall back to summary bookmarks through `useHomeDashboard`.
- Tool shortcuts remain the existing JSON, timestamp, whitespace, and deduplicate entries.

No bookmark CRUD behavior, validation, storage format, or tool implementation changed.

## i18n

Stage 5 adds only the new workspace rail keys:

- `home.workspace.railLabel`
- `home.workspace.todayTasks`
- `home.workspace.savedDates`
- `home.workspace.weatherContext`
- `home.workspace.quickReferences`

Both English and Simplified Chinese catalogs were updated. No second language store or workspace-specific locale system was introduced.

## Accessibility

The workspace keeps the Stage 3 layout contract:

- `AppLayout` provides the skip link, `main#main-content`, desktop top navigation, and mobile bottom navigation.
- Page focus remains handled by `LayoutResolver`.
- The workspace hero uses `aria-labelledby="home-title"`.
- The status rail has an explicit localized `aria-label`.
- Rail items are real links to their owning modules.
- Existing task checkboxes, error states, skeleton states, and external bookmark links keep their semantics.

Reduced motion remains governed by global CSS and no `/app` animation runtime was introduced.

## Route And Navigation Boundary

Routes and navigation were not modified.

The implementation relies on the existing Stage 3/Stage 1B contract:

- `/app` route name: `workspace`.
- `/app` layout: `app`.
- Desktop top navigation comes from `src/app/navigation/AppTopNavigation.vue`.
- Mobile bottom navigation comes from `src/app/navigation/MobileBottomNavigation.vue`.
- Active state remains based on `route.meta.navigationKey`.

The workspace does not import Landing GSAP/ScrollTrigger code and does not implement a second global navigation.

## Weather Freeze Boundary

No files under these frozen paths were modified:

- `src/modules/weather/**`
- `src/assets/weather/atmosphere/**`
- `public/weather-assets/**`
- `public/__local_weather_reference/**`

Browser regression confirmed `/app` does not request GSAP/ScrollTrigger chunks and does not request Pixi-related chunks on direct `/app` load.

## Verification

Required verification for this stage:

- `npm run build` before changes.
- Baseline `/app` screenshots from the pre-change production build.
- `npm run build` after implementation.
- Browser screenshots at desktop, tablet, and mobile sizes in light, dark, English, empty, populated, and weather-unavailable states.
- Route smoke checks for `/`, `/app`, Weather routes, Todos, Bookmarks, Tools, Settings, Settings data sources, and Not Found.
- Browser back/forward check between `/` and `/app`.
- `/app` chunk request check for no GSAP/ScrollTrigger and no Pixi runtime.
- Frozen Weather path diff check.
- `git diff --check`.
- Final clean working tree after commit.

## Screenshot Output

Final screenshots were generated outside the repository under:

```text
%TEMP%\lifeboard-stage5-final
```

Required files:

- `01-stage5-light-1440-populated-top.png`
- `02-stage5-light-1440-populated-full.png`
- `03-stage5-light-1440-empty.png`
- `04-stage5-dark-1440-populated.png`
- `05-stage5-light-1024.png`
- `06-stage5-light-768.png`
- `07-stage5-light-390-top.png`
- `08-stage5-light-390-content.png`
- `09-stage5-light-390-empty.png`
- `10-stage5-dark-390-top.png`
- `11-stage5-english-1440.png`
- `12-stage5-weather-error-or-unavailable.png`

Screenshots are not committed.

## Known Limits

- Stage 5 does not redesign the Todos page, Bookmarks page, Tools page, Settings page, or Weather page interiors.
- Weather on `/app` remains a compact context summary; full weather interaction stays in `/weather`.
- The workspace still uses the existing Home subcomponents rather than introducing a new dashboard component registry.

## Next Stage

The next stage should be Stage 6: Todos and Countdown workflow commercial visual redesign. Stage 5 does not start it.
