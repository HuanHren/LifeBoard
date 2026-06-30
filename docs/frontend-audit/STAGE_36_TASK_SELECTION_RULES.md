# Stage 36 Task Selection Rules

## Central selectors

Task selection now stays in `useTodosStore`. Home continues to consume the same store selectors through `useHomeDashboard`, so Home and Todos no longer need separate task classification rules.

## Views

- Today: incomplete, not deleted, and due today or earlier.
- Upcoming: incomplete, not deleted, and due after today.
- All: not deleted; incomplete tasks sort before completed tasks.
- Completed: completed and not deleted.
- Deleted: soft-deleted tasks.

Tasks with no due date are visible in All. They are not treated as Today or Upcoming because the data model has no schedule signal for them.

## Sorting

Today and Upcoming sort by due date ascending, then creation time ascending. Completed sorts by `completedAt` descending. Deleted sorts by `deletedAt` descending. All sorts incomplete before completed, dated before undated, then due date and creation time.

## Date boundary

Rules use the local date string from `useLocalToday`. The composable schedules a single rollover at the next local midnight and disposes its timer on scope disposal.
