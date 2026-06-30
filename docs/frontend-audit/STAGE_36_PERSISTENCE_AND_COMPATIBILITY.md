# Stage 36 Persistence and Compatibility

## Storage boundary

The localStorage key remains `lifeboard.todos`. Components do not read or write localStorage directly; persistence remains in `todosStorage.ts`.

## Soft-delete compatibility

Tasks now support optional `deletedAt`. The field is optional so old version 1 tasks without `deletedAt` remain valid. New tasks write `deletedAt: null`; soft-deleted tasks write an ISO timestamp.

The storage envelope version remains `1` because old data remains readable and the key is unchanged. The validator accepts missing, null, or ISO `deletedAt`.

## ID and field preservation

Soft delete and restore preserve task IDs and existing task fields. Permanent delete is the only path that removes a task from the array.

## Recovery behavior

Invalid JSON or invalid envelope shape is still left untouched and reported as a persistence error. Retry uses the existing store persistence path.
