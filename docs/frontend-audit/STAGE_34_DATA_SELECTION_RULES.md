# Stage 34 Data Selection Rules

## Tasks

Home uses existing Todos store getters and applies display limits only.

Rules:

1. Today Focus uses incomplete tasks whose due date is today or earlier.
2. Overdue tasks naturally sort before today's later-created tasks through the existing due-date order.
3. Completed tasks leave Today Focus after completion.
4. Upcoming Tasks uses incomplete tasks with future due dates.
5. Today Focus and Upcoming Tasks do not repeat the same tasks.
6. Home shows at most five Today Focus tasks and four Upcoming Tasks.

## Countdowns

Rules:

1. Countdowns use the existing sorted countdown list.
2. Non-expired countdowns stay ahead of expired countdowns.
3. Expired countdowns are labeled as reached rather than displayed as negative days.
4. Home shows at most three countdowns.
5. Countdown display is day-based and does not require a per-second timer.

## Bookmarks

Rules:

1. Pinned bookmarks are preferred.
2. If no pinned bookmarks exist, the existing summary order is used.
3. Home shows at most four bookmarks.
4. Home displays host names instead of full URLs, avoiding query-string exposure in the UI.

## Tools

Rules:

1. Tool shortcuts use existing tool definitions.
2. Home links to `/tools?tool=...` without embedding tool UI.
3. The selected shortcuts are JSON, Timestamp, Whitespace, and Deduplicate.
