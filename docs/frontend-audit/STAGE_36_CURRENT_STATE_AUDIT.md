# Stage 36 Current State Audit

## Component tree

Current route structure before production edits:

- `TodosPage`
- `PageLayout`
- `PageHeader`
- `TodosWorkspace`
- `TaskComposer`
- `BaseError`
- `TaskFilterBar`
- `TaskList`
- `TaskItem`
- `TaskEditForm`
- `InlineDeleteConfirmation`
- `CountdownSection`
- `CountdownForm`
- `CountdownList`
- `CountdownItem`

## Data model

Task fields are `id`, `title`, `dueDate`, `label`, `completedAt`, `createdAt`, and `updatedAt`. `dueDate`, `label`, and `completedAt` may be `null`. Countdown fields are `id`, `title`, `targetDate`, `createdAt`, and `updatedAt`.

The storage envelope has `version: 1`, `tasks`, and `countdowns`.

## Persistence

The localStorage key is `lifeboard.todos`. Storage is owned by `src/modules/todos/services/todosStorage.ts`; components do not directly read or write localStorage.

Load behavior validates JSON, envelope version, task fields, countdown fields, ISO timestamps, and date-only strings. Invalid JSON or invalid schema leaves the stored value unchanged and exposes a recoverable persistence error. Save behavior writes the full envelope and reports quota or unavailable-storage failures.

## Current selectors

`todayTasks` includes incomplete tasks with a due date today or earlier. `upcomingTasks` includes incomplete tasks with a future due date. `completedTasks` includes every task with `completedAt`. `allTasks` includes every task and sorts incomplete tasks before completed tasks.

Home already consumes store selectors through `useHomeDashboard`, but it adds display limits and some local sorting for the Home panels.

## Date boundaries

Task and countdown rules use `useLocalToday`, which computes a local date string and schedules one rollover timer at the next local midnight. Date-only formatting uses UTC when rendering date-only strings, avoiding timezone shifts.

## Current interactions

Task creation is an always-visible full form with title, due date, label, and submit. Task editing is inline per row and reuses the same persisted fields but has separate markup from creation. Task completion toggles `completedAt`. Current deletion permanently removes a task from storage; there is no Deleted view, restore action, or soft-delete state.

Countdown creation and editing use `CountdownForm`. Countdown deletion permanently removes the countdown after inline confirmation.

## Current UI issues

- The page starts with a generic `PageHeader`, then a full task form.
- Filters are a compact row but only cover Today, Upcoming, Completed, and All.
- There is no Deleted view even though Stage 36 requires soft delete, restore, and permanent delete.
- The task checkbox is visually small for repeated mobile use.
- Deletion is close to edit and permanently removes tasks, increasing recovery risk.
- Countdown is a secondary module but currently uses a card-like section with every countdown at similar weight.
- Task and countdown forms are functional but not clearly progressive.

## Compatibility constraints

Stage 36 must preserve the `lifeboard.todos` key and existing IDs. Old tasks without any future soft-delete field must continue to load. Any new soft-delete field must be optional and normalized safely in behavior without rejecting existing version 1 data.
