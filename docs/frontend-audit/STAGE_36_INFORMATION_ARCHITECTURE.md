# Stage 36 Information Architecture

## Target structure

- `TodosPage`
- `PageLayout`
- `TodosWorkspace`
- `TodosPageHeader`
- `TaskComposer`
- `TodoWorkspace`
- `TaskFilterBar`
- `TaskSummary`
- `TaskList`
- `CountdownSection`
- `TodoDataStatus`

## Reading order

The route should read as:

1. Page title and honest task summary.
2. Quick task capture.
3. Today and overdue work.
4. Upcoming work.
5. Completed or Deleted work when selected.
6. Important countdowns as a secondary date aid.
7. Persistence status and recovery action when needed.

## View rules

- Today: incomplete, not deleted, due today or earlier.
- Upcoming: incomplete, not deleted, due after today.
- All: not deleted, incomplete first, then completed.
- Completed: completed, not deleted.
- Deleted: soft deleted.

Tasks without a due date belong in All. They do not appear in Today or Upcoming because the current data model has no scheduling signal for them.

## Layout direction

Desktop uses a primary task column and a secondary countdown column. Tablet portrait and mobile collapse to a single column with tasks first. The first viewport should show the title, quick add, active task view context, and countdown presence without turning the route into a dashboard metrics page.

## Interaction direction

Task creation stays inline and compact. Detailed fields expand only when needed. Editing remains inline to avoid introducing a new modal system. Soft delete moves a task to Deleted; restore clears the soft-delete state; permanent delete requires explicit confirmation.
