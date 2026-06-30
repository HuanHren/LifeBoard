# Stage 36 Countdown Report

## Architecture

Countdowns remain in the Todos store and preserve the existing data model: `id`, `title`, `targetDate`, `createdAt`, and `updatedAt`.

## Display hierarchy

The section is secondary to tasks. It highlights one primary countdown, preferring the next non-expired date, and renders the rest as a compact list.

## Time rules

Countdown status continues to use day-based local date comparison. Today displays as today. Future dates display remaining days. Reached dates display elapsed days and never show negative numbers.

## Add, edit, delete

The existing `CountdownForm` is reused for creation and editing. Countdown deletion remains permanent after inline confirmation because the current countdown model has no soft-delete field and the Stage 36 recovery requirement is task-focused.
