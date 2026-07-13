# Stage 47 Read-only Calendar Aggregation MVP

Date: 2026-07-13

## 1. Baseline

Implementation started on `main` at `c12a6c9a3cc851220bb5c8f18d73210be68316c0` with a clean worktree. The starting commit was also `origin/main`.

## 2. Stage 46 Sync Status

The Stage 46 Calendar architecture specification commit and tag were present locally and remotely. Stage 47 follows accepted Option B: a read-only aggregation MVP.

## 3. Skill Gate Summary

The eight required skills and their required references were verified and read before source changes. The unavailable project-local Impeccable context script was replaced by direct reads of `PRODUCT.md` and `DESIGN.md` as instructed by the skill.

## 4. Stage 47 Scope

Stage 47 adds `/calendar`, navigation, local date helpers, Todo/Countdown aggregation, a month grid, selected-day agenda, bilingual copy, unit coverage, and route/screenshot QA coverage. It does not implement Calendar-owned data.

## 5. Source Model Audit

`useTodosStore` remains the only source of Todo and Countdown state. Calendar calls `initializeTodos()` and consumes readonly projections of `tasks`, `countdowns`, `localToday`, and the existing persistence error.

## 6. Todo Date Contract

Only non-deleted Todos with a valid non-null `dueDate` appear. Active, overdue, and completed status is derived without modifying the Todo. Undated and soft-deleted Todos are excluded.

## 7. Countdown Date Contract

Every Countdown with a valid `targetDate` appears. Upcoming, today, and elapsed status is derived against the existing local-today value.

## 8. Local Date Utilities

Calendar date-only values use strict `YYYY-MM-DD` parsing. Arithmetic uses UTC calendar components internally and never converts a local date through `toISOString()`, avoiding timezone and DST drift.

## 9. Week-start Implementation

`zh-CN` uses Monday as the first day of the week. `en-US` uses Sunday. The same rule drives grid generation and Home/End keyboard behavior.

## 10. Month Grid Generation

The visible month generates five or six complete weeks, including adjacent-month days. Item counts are projected from one date index and do not trigger repeated full-source scans.

## 11. Calendar Page State

Page-local refs own visible month, focused date, and selected date. Selecting an outside-month day moves the visible month. Today and adjacent-month controls keep dates clamped to valid month days.

## 12. Aggregated Item Model

The discriminated item model records source, source item, local date, created timestamp, title, and derived status. It is a projection only and has no persistence identity beyond the source ID.

## 13. Todo Aggregation

Todo items are grouped by valid due date. Active/overdue items precede completed items for the same day.

## 14. Countdown Aggregation

Countdown items are grouped by valid target date and follow Todo groups in the selected-day agenda.

## 15. Invalid Source-date Policy

Malformed source dates are skipped and counted by source. The UI shows only redacted counts; it does not log titles, mutate source data, or fail the route.

## 16. Date Index and Performance

One `Map<LocalDateString, readonly AggregatedCalendarItem[]>` is built from source arrays. Unit coverage exercises 10,000 Todos plus 2,000 Countdowns without a brittle timing threshold.

## 17. Deterministic Sorting

Same-day ordering is active/overdue Todo, completed Todo, then Countdown. Within each group, source `createdAt` and source ID provide deterministic tie-breaking without locale-sensitive title sorting.

## 18. Route Integration

`/calendar` is a lazy-loaded app-layout route with a Calendar navigation key and localized document title.

## 19. Navigation Integration

Desktop order is Workspace, Calendar, Weather, Todos, Bookmarks, Tools. Mobile primary navigation is Workspace, Calendar, Weather, Todos; Bookmarks moves to More alongside Tools and Settings.

## 20. Information Architecture

The page presents a clear read-only boundary, month controls, month grid, and selected-day agenda. Source management remains in Todos.

## 21. Month Header

Previous, Today, and Next use the existing button primitive and keep month navigation explicit at all supported widths.

## 22. Semantic Grid

The calendar uses `grid`, `row`, `columnheader`, and `gridcell` semantics. Each date is a native button with a full accessible name, selected state, counts, and `aria-current="date"` for today.

## 23. Keyboard Interaction

Arrow keys move by one day or one week. Home/End move to locale week boundaries. PageUp/PageDown move by month. Enter and Space select the focused date. Roving tabindex leaves exactly one date in the tab order.

## 24. Agenda

The agenda shows source and status labels and links each item to the authoritative Todos route. Empty dates use the shared empty-state primitive.

## 25. i18n

Navigation, page copy, controls, accessible names, statuses, empty state, invalid-date notice, and source errors are covered in `zh-CN` and `en-US` with catalog parity.

## 26. Responsive Behavior

Desktop uses a month/agenda split. Tablet and mobile use one column. The seven-column grid remains bounded at 390px with compact day cells and no horizontal overflow.

## 27. Visual Direction

Calendar reuses the frozen LifeBoard tokens and shared surfaces. It adds no new visual system, decorative scene, nested card pattern, or marketing composition.

## 28. Reduced Motion

Calendar adds no animation or timer-driven visual effect. Existing reduced-motion route QA therefore covers the new route without a separate motion implementation.

## 29. Accessibility

Native controls, visible focus, roving tabindex, semantic grid roles, localized labels, minimum control sizes, source/status text, and no click-blocking layer are included.

## 30. Unit Tests

Calendar tests cover strict dates, leap years, month/year boundaries, locale week starts, month grids, item counts, aggregation exclusions, invalid dates, deterministic ordering, keyboard mapping, source immutability, and the 12,000-item data set.

## 31. Browser QA

Route QA seeds the production Todo storage envelope, confirms three selected-day aggregate items, verifies roving focus and Enter selection, and reloads both supported locales to verify week starts.

## 32. Route and Screenshot QA

The baseline expands to 32 route-viewports/screenshots. Calendar is included at 390x844, 768x1024, and 1440x900. Weather retains its two extra-wide checks.

## 33. Screenshot Visual Review

The three Calendar screenshots were manually inspected. No P0/P1 overflow, overlap, clipping, low-contrast, hierarchy, or interaction-density issue was found.

## 34. Persistence Non-change Proof

There is no Calendar store, service, storage key, registry entry, migration, validator, or persistence write. `lifeboard.todos` remains the sole persisted source contract consumed by Calendar.

## 35. Data Portability Regression

PortableBackupV1, current and legacy import, Replace/rollback, four-key content clear, 11-key factory reset, CSV, Markdown, Language, and Theme contracts remain unchanged and covered by the existing persistence suite.

## 36. Weather Freeze Boundary

No Weather source, store, service, runtime, asset, scene, or visual file changed. Weather remains regression-only.

## 37. Existing Behavior Preservation

Home, Todos business behavior, Bookmarks, Tools, Settings, NotFound, and existing route behavior remain unchanged. Navigation inventory and QA coverage are the only cross-app integration changes.

## 38. Known Limitations

Calendar is read-only, has no native events, no source deep link, no recurrence, no reminders, no notifications, no external sync, and no ICS support. Invalid individual dates cannot normally enter through validated production Todo persistence; malformed-input behavior is covered at the pure aggregation boundary.

## 39. Stage 48 Contract

Only Stage 48 may add Native Calendar Event CRUD, `lifeboard.calendar`, a Calendar store/service, registry 11-to-12, clear/reset expansion, PortableBackupV2, V1-to-V2 adaptation, Home upcoming integration, and remote closeout. Recurrence, reminders, notifications, external sync, ICS, Google Calendar, CalDAV, sharing, Merge import, Weather changes, and whole-site redesign remain excluded.

## 40. Validation

Vitest remains `4.1.10`; package/lock diffs are empty; npm 11.18.0 and local npm dry runs pass. The suite passes 201/201 tests. Build, every route QA output mode, combined QA, screenshot QA, and design QA pass. The route and screenshot baselines are 32/32 with zero failures, zero console errors, and zero overflow failures. `.qa` remains ignored and no preview process remains. The existing 513.51 kB Vite chunk warning remains non-blocking.

## 41. Final Decision

Stage 47 passes its implementation and validation gates. The explicit scope audit is clean, and the exact Stage 47 commit may be created without push. No Stage 48 work is included.
