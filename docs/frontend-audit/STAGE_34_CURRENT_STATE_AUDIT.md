# Stage 34 Current Home Audit

## Baseline

- Branch: `main`
- Baseline commit: `1c8de5fd6a6d30c8628cab7efc633a118a7bcdf1`
- Build: pass with the existing Vite `lib` chunk warning.
- Baseline chunks: Home route `22.96 kB`, main entry `293.53 kB`, main CSS `59.44 kB`, `lib` `513.51 kB`, WeatherPage `88.27 kB`.

## Current Home Modules

The current Home route renders:

1. A large intro panel with product copy.
2. Weather summary.
3. Todos and countdown summary.
4. Tools summary.
5. Bookmarks summary.
6. Settings entry.

This makes Home a module index with summaries rather than a daily operating workspace.

## Data Sources

- Weather summary uses `useWeatherStore`, `initializeWeather`, `loadForecast`, `selectCurrentCoordinates`, and the shared weather snapshot.
- Todos and countdown summary uses `useTodosStore`, including `todayTasks`, `upcomingTasks`, `sortedCountdowns`, `nextActiveTask`, and `nextCountdown`.
- Bookmarks summary uses `useBookmarksStore`, especially `summaryBookmarks`.
- Tools summary reads `TOOL_DEFINITIONS` and localized tool copy.
- Settings entry is static navigation metadata.

## Request and Runtime Behavior

- Home uses the same weather store as the Weather route.
- Home calls `initializeWeather` and can restore cached weather from storage.
- Baseline isolated Home network sampling showed no vendor manifest request.
- Home does not create a Pixi canvas.
- Home currently imports weather summary code and weather formatting/i18n utilities, but does not mount `WeatherAtmosphere` or `WeatherPixiLayer`.

## Repeated Logic

- Home duplicates some selection and presentation logic already present in module pages, especially task/countdown summaries and weather advice formatting.
- Sorting remains store-owned for todos/countdowns/bookmarks; this should be preserved.
- Date and relative countdown formatting should reuse existing utilities and composables.

## Static vs State Content

- Static entry content: intro panel, tools capability text, settings entry.
- Real state summaries: weather snapshot, tasks, countdowns, bookmarks.
- Current tools section displays all tools as descriptive capabilities, not usage state.

## Empty Space and Card Repetition

- Empty states for weather, todos, and bookmarks are large dashed panels.
- The page uses repeated rounded bordered sections with similar visual weight.
- Baseline local evidence recorded 6 sections and 4 articles in the main area.
- Baseline page height: desktop `2081px`, tablet `2262px`, mobile `3043px`.

## Preserve

- Store boundaries and persistence behavior.
- Weather cache restore behavior.
- Existing route names and lazy loading.
- Existing local-only tools and bookmarks behavior.
- Stage 33 `PageLayout`, base buttons, icons, surfaces, and semantic tokens.

## Merge or Demote

- Merge todos and countdowns into a clearer `Next Up` rhythm.
- Demote settings from a Home content module to shell/navigation only.
- Demote tools from full descriptive grid to compact shortcuts.
- Demote bookmarks from a large module block to compact pinned/recent rows.

## Quick Actions

- Weather: open Weather or connect city/current location.
- Todos: open Todos and complete/reopen visible today tasks.
- Countdowns: manage through Todos.
- Bookmarks: open pinned/recent external links and open Bookmarks.
- Tools: open Tools with a tool query for JSON, timestamp, whitespace, or deduplicate.

## Business Logic Boundaries

- Do not reimplement weather provider, cache, WMO, Pixi, or vendor selection.
- Do not create a Home-specific persistence layer.
- Do not duplicate task or bookmark storage parsing in child components.
- Do not add fake completion rates, trends, or charts.
- Do not add new routes for tool deep links; use the existing `/tools?tool=` query support.
