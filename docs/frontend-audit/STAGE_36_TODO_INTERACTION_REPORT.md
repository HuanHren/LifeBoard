# Stage 36 Todo Interaction Report

## Quick add

The task composer now prioritizes the title field. Date and label are available behind a compact disclosure action. Enter on the title submits only when the key event is not in IME composition, protecting Chinese input.

The form still writes only the existing task fields: `title`, `dueDate`, and `label`.

## Editing

Editing remains inline to avoid introducing a new modal dependency. The edit form preserves existing fields, validates title/date/label, and emits save or cancel.

## Completion and restore

Completion toggles `completedAt` and immediately updates the active selector. In Completed, toggling the checkbox restores the task to its correct active selector.

Deleted tasks use a dedicated Restore action that clears `deletedAt` without changing the task title, due date, label, completion time, or ID.

## Delete behavior

Normal delete is now soft delete. It sets `deletedAt` and moves the item to Deleted. Permanent delete is only available from Deleted and removes the task after an explicit destructive confirmation.
