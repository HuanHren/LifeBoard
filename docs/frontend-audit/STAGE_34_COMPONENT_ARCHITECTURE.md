# Stage 34 Component Architecture

## Changed Home Components

- `HomePage.vue` now only initializes the dashboard data and composes the page layout.
- `HomeTodayHeader.vue` owns the top Today context.
- `TodayFocusPanel.vue` renders the primary task list and task completion interaction.
- `HomeNextUp.vue` renders upcoming tasks and countdowns.
- `HomeWeatherSummary.vue` renders the lightweight weather summary.
- `HomeQuickAccess.vue` renders pinned bookmarks and tool shortcuts.
- `useHomeDashboard.ts` centralizes Home data selection rules from existing stores.

## Store Boundaries

- Todos data stays in `useTodosStore`.
- Countdown data stays in `useTodosStore`.
- Bookmark data stays in `useBookmarksStore`.
- Weather data stays in `useWeatherStore`.
- Tool shortcuts use the existing `TOOL_DEFINITIONS`.

Home does not parse localStorage directly and does not create a Home-specific persistence layer.

## Primitive Reuse

Stage 33 primitives remain in use:

- `PageLayout`
- `BaseSurface`
- `BaseButton`
- `BaseIcon`
- `BaseSkeleton`
- `BaseError`

No new UI framework or production dependency was added.
