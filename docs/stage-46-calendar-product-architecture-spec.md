# Stage 46: Calendar Product / Architecture Spec

Date: 2026-07-13

Status: accepted specification. No Calendar implementation is authorized by this document.

Normative terms use MUST, MUST NOT, SHOULD, and MAY. Stage 47 and Stage 48 each require separate authorization.

## 1. Baseline

- Branch: `main`.
- Starting HEAD and `origin/main`: `9410e9c8e03f687c6a03bff6869e449baade81da` (`feat(data): finalize registry-driven reset flows`).
- Starting worktree: clean; local and remote histories were synchronized.
- Stage 45 tag `data-portability-closeout-stage-45` points to the starting HEAD.
- Stage 40 through Stage 45 foundations are present in history.
- The persistence registry contains 11 product keys; the Weather runtime debug key remains outside it.
- Stage 46 is documentation-only. No product, storage, route, test, dependency, workflow, QA, or visual behavior changes.

## 2. Stage 45 Remote CI Gate

- Gate result: PASS before Stage 46 audit work began.
- GitHub Actions run: `29250052800`, `https://github.com/HuanHren/LifeBoard/actions/runs/29250052800`.
- Run head SHA exactly matched `9410e9c8e03f687c6a03bff6869e449baade81da`.
- Workflow completed successfully: checkout, Node setup, lockfile validation, dependency install, unit tests, Playwright Chromium install, build, route accessibility QA, summary generation, and artifact upload.
- No remote failure was carried into the Calendar specification.

## 3. Skill Gate Summary

The following local skill files were verified readable and read in full:

- `C:\Users\jingr\codex-skills\impeccable\SKILL.md`
- `C:\Users\jingr\codex-skills\gpt-taste\SKILL.md`
- `C:\Users\jingr\codex-skills\redesign-existing-projects\SKILL.md`
- `C:\Users\jingr\codex-skills\baseline-ui\SKILL.md`
- `C:\Users\jingr\codex-skills\vue-best-practices\SKILL.md`
- `C:\Users\jingr\codex-skills\fixing-accessibility\SKILL.md`
- `C:\Users\jingr\codex-skills\fixing-motion-performance\SKILL.md`
- `C:\Users\jingr\codex-skills\playwright-cli\SKILL.md`

Additional references read: Impeccable `product`, `audit`, `harden`, `critique`, `shape`, and `adapt`; Vue `reactivity`, `sfc`, `component-data-flow`, `composables`, and `state-management`; Playwright `running-code` and `playwright-tests`. No required reference was missing. The optional project-local Impeccable context script was absent, so `PRODUCT.md` and `DESIGN.md` were read directly.

## 4. Stage 46 Scope

Stage 46 audits and freezes Calendar product positioning, information architecture, data semantics, integration boundaries, persistence evolution, accessibility, responsive behavior, performance, QA, risks, and the Stage 47/48 split. It creates no prototype or production code.

Only this document and `docs/next-upgrade-plan.md` may change. Calendar pages, routes, components, stores, services, helpers, storage keys, registry entries, backup schemas, reset plans, i18n catalogs, navigation, tests, assets, dependencies, workflows, and QA scripts are outside this stage.

## 5. Current Application Architecture

LifeBoard uses Vue 3, Pinia, Vue Router, Vite, strict TypeScript, and feature modules under `src/modules`. Routes are centralized and lazy-loaded. Typed route metadata selects landing, app, or minimal layouts and identifies navigation state. Shared navigation constants feed desktop and mobile shells. Base primitives and semantic design tokens provide the visual baseline.

Todos and Bookmarks own versioned LocalStorage envelopes and Pinia stores. Home is a cross-module read aggregator. Settings coordinates portable data and reset operations through the shared persistence foundation. The current architecture is suitable for an incremental Calendar module; a repository-wide migration or new state layer is not justified.

## 6. Current Todo Model

The canonical `Task` fields are `id`, `title`, nullable `dueDate`, nullable `label`, nullable `completedAt`, optional nullable `deletedAt`, `createdAt`, and `updatedAt`. `dueDate` is either `null` or a validated real date-only string in `YYYY-MM-DD` form. Creation/update/completion/deletion timestamps are ISO timestamps.

Calendar inclusion is read-only: valid dated tasks are included, undated and soft-deleted tasks are excluded, and completed tasks remain visible with explicit completed status. Overdue is derived when an active, non-deleted due date is before local today. Calendar MUST NOT mutate or duplicate a Task.

## 7. Current Countdown Model

The canonical `Countdown` fields are `id`, `title`, `targetDate`, `createdAt`, and `updatedAt`. Source audit corrects an assumption in the initial brief: `targetDate` is a validated date-only `YYYY-MM-DD`, not a UTC timestamp. Countdown has no completed or deleted field.

Every valid Countdown is included. A target before local today is presented as expired/reached; it is not removed or rewritten. The Calendar source route is the existing `/todos` page because Countdown currently lives within that module.

## 8. Current Date Handling

`todoDates.ts` validates date-only strings by extracting numeric parts and checking them with `Date.UTC`; it compares canonical date strings lexically, computes day differences from UTC-created numeric parts, formats with an explicit locale and `timeZone: 'UTC'`, and creates local today from local date parts. `useLocalToday` updates just after local midnight.

This prevents a date-only value from shifting across days. Stage 47 MUST share or extract a pure date-only contract rather than duplicate behavior. It MUST NOT bucket `YYYY-MM-DD` through uncontrolled `new Date('YYYY-MM-DD')`. ISO timestamps remain instant values; only future timed events require timezone conversion before local-day bucketing.

## 9. Current Route / Navigation Structure

The router currently has 11 records including the catch-all. App routes are lazy-loaded, use `layout: 'app'`, carry typed `navigationKey` and title keys, and receive main-content focus after navigation. Desktop navigation lists Workspace, Weather, Todos, Bookmarks, and Tools; Settings is a utility action. Mobile navigation exposes Workspace, Weather, Todos, and Bookmarks, with Tools and Settings under More.

`/todos` has no item-selection query or hash contract. Stage 47 source actions therefore navigate only to `{ name: 'todos' }`; deep selection is deferred and MUST NOT trigger a Todo refactor.

## 10. Product Problem

LifeBoard stores deadlines and important dates, but users must inspect the Todo workspace as a list. Calendar should provide a calm temporal index over existing planning data: what is due this month, what matters on a selected day, and where the source record can be managed. It complements, rather than replaces, Todos.

## 11. User Tasks

Users need to:

1. See Todo due dates and Countdown target dates in a month context.
2. Select a day and inspect complete titles and statuses in an agenda.
3. Move to previous/next months and return to today.
4. Distinguish Todo, Countdown, and later native Event sources without relying on color.
5. Open the owning module to manage a source record.
6. Later create independent all-day or timed Calendar Events without duplicating Todos.

## 12. Product Success Criteria

- `/calendar` makes existing dated planning data useful without new persistence in Stage 47.
- Local dates never shift because of UTC parsing, timezone, DST, or host locale.
- Month navigation, selection, source navigation, keyboard operation, and screen-reader output are predictable.
- The 390, 768, and 1440 viewport baselines remain overflow-free and usable.
- Stage 47 adds no storage, backup, reset, Home, Weather, or dependency changes.
- Stage 48 can add native events through a bounded, versioned contract without redesigning Stage 47.

## 13. Option A Assessment

Option A would combine aggregation UI, native event CRUD, a new store and storage key, registry 11-to-12 expansion, PortableBackupV2, legacy adapters, import transaction changes, reset 4-to-5/11-to-12 changes, and Home integration in one stage. It offers maximum surface area but crosses every frozen data contract at once, weakens rollback isolation, and makes date/UI/persistence failures difficult to classify. Option A is rejected for Stage 47.

## 14. Option B Assessment

Option B delivers a useful route from existing validated Todo and Countdown data. It isolates date, locale, grid, agenda, navigation, accessibility, responsive, and QA decisions while keeping storage and portability unchanged. Native event persistence remains a separately testable Stage 48. This matches the incremental feature-module architecture and freeze discipline.

## 15. Final Architecture Decision

**Accepted: Option B, Stage 47 Read-only Calendar Aggregation MVP.**

Stage 47 implements only `/calendar`, navigation, month view, selected-day agenda, derived Todo/Countdown entries, source navigation, i18n, accessibility, responsive behavior, and tests. Stage 48 owns native event CRUD and every persistence integration. No parallel recommendation is open.

## 16. Calendar Information Architecture

The page uses the existing app layout and wide page container. Its header contains one H1, the visible month heading, Today, previous month, and next month controls. The main area contains one month grid and one selected-day agenda.

At desktop width the month grid is primary and the agenda is a narrower right column. Mobile and tablet stack controls, grid, then agenda. No mini-calendar, sidebar, week view, hourly timeline, drag/drop, filter dashboard, or nested card composition is included.

## 17. Month Grid Contract

- The grid always has seven columns.
- It uses five rows when the locale-aligned month fits in 35 cells and six rows when 42 are required; row count is derived, not forced.
- Leading/trailing outside-month dates remain visible to complete weeks and are visually muted.
- Selecting an outside-month date changes both visible month and selected date to that date.
- Today and selected date have distinct semantic and visual states; both may apply to one cell.
- Cells show only date number plus compact Todo/Countdown counts or indicators. Full titles never appear in cells.
- There is no arbitrary visible-item cap because the cell presents aggregate counts, not item cards. Counts use localized compact text where space permits and an accessible full summary.
- Empty months still render a complete calendar grid. The selected-day agenda explains that no items exist.
- A month navigated away from today does not auto-select or scroll to today. Today returns visible month and selected date to local today.

## 18. Agenda Contract

The agenda heading is the fully formatted selected date. Entries form a semantic list. Each row exposes source type, title, status, and a clear action to open the source module. Date-only sources have no invented time label.

Ordering is deterministic: active/overdue Todos first, completed Todos second, Countdowns third; within a source/status group use `calendarDate`, source `createdAt`, then source ID. Because all Stage 47 entries for the agenda share a date, the latter fields are practical tie-breakers. Source labels and status text remain visible or screen-reader available; color and strike-through are supplementary only.

## 19. Week-start / Locale Contract

- `zh-CN`: Monday first.
- `en-US`: Sunday first.
- Week-start is an explicit locale map, never inferred from unstable host behavior.
- Weekday labels, visible month title, complete date labels, and agenda heading use the active LifeBoard locale.
- Locale changes reorder presentation columns but never alter canonical data dates.
- Tests inject locale and dates; they do not rely on the test machine's locale or timezone.

## 20. Local Date Semantics

Date-only strings represent local calendar labels, not instants. Parsing returns validated integer year/month/day parts. Arithmetic uses controlled calendar construction and canonical formatting. A Todo or Countdown dated `2026-07-13` always belongs to that date in every timezone.

Month boundaries and Today use the user's local calendar. Future timed event timestamps are real instants and are converted to the current local display timezone before assigning covered calendar dates. All-day events never use UTC midnight timestamps. DST changes cannot shorten or extend an all-day date range.

## 21. Aggregated Item Model

Stage 47 uses a transient discriminated presentation model:

```ts
type CalendarSourceType = 'todo' | 'countdown'

interface AggregatedCalendarItem {
  id: `todo:${string}` | `countdown:${string}`
  sourceType: CalendarSourceType
  sourceId: string
  title: string
  calendarDate: string
  status: 'active' | 'completed' | 'overdue' | 'expired'
  routeTarget: { name: 'todos' }
  sourceCreatedAt: string
}
```

This is a specification, not Stage 46 code. The model is computed from source stores, never saved, exported, imported, cleared, or synchronized. Namespaced IDs prevent Todo/Countdown collisions. Derivation must not mutate source arrays or records.

## 22. Todo Aggregation

- Include only Tasks with a valid `dueDate`.
- Exclude undated and soft-deleted Tasks.
- Include completed Tasks as `completed`.
- Active Tasks before local today are `overdue`; all other active Tasks are `active`.
- Calendar does not expose or invent a description field.
- Clicking/opening an item routes to `/todos` only. A future Todo deep-link contract may improve targeting, but Stage 47 cannot add it.
- Invalid records should already be rejected by the Todo storage boundary. Defensive derivation skips a malformed date and records only redacted diagnostics in development.

## 23. Countdown Aggregation

- Include every validated Countdown.
- Bucket `targetDate` directly as its date-only local calendar value.
- Use `expired` when `targetDate` is before local today and `active` otherwise; there is no completed state.
- Do not invent a time label because the current source has no time.
- Source navigation routes to `/todos`; no duplicate Countdown record or source mutation is permitted.

## 24. Native Event Future Model

Stage 48 should use a discriminated event time model:

```ts
type CalendarEventTime =
  | { kind: 'all-day'; startDate: string; endDateExclusive: string }
  | { kind: 'timed'; startAt: string; endAt: string; timeZone: string }

interface CalendarEvent {
  id: string
  title: string
  description?: string
  location?: string
  time: CalendarEventTime
  createdAt: string
  updatedAt: string
}
```

IDs are non-empty stable UUIDs for newly created records. Titles are trimmed, non-empty, and at most 120 characters. Suggested bounds are 2,000 characters for description and 240 for location. Timestamps must be canonical valid RFC3339 values; timezone must be a valid IANA identifier. End must be after start. Recurrence, reminders, attendees, organizer, conferencing, attachments, colors, collections, sharing, timezone-conversion UI, ICS, and external provider IDs are absent from schema v1.

## 25. All-day / Timed Semantics

All-day events use valid date-only `startDate` and exclusive `endDateExclusive`. A one-day event has the next calendar day as its exclusive end. The end must be later than start. Every date in `[startDate, endDateExclusive)` is covered.

Timed events use `startAt` and `endAt` as RFC3339 instants plus an IANA event timezone. `endAt` must be strictly later than `startAt`. Stage 48 v1 permits cross-day timed events. Month indicators appear on every local date covered in the current display timezone; agenda rows show localized start/end information. The event timezone preserves authoring context, while display follows the current user's locale/timezone.

## 26. Store / Data Flow

Stage 47 adds no persistent Calendar store. A route-owned composable initializes/reads the existing Todo store and derives a memoized date index. Component state contains only visible month and selected date. Neither is persisted.

```text
Todo store tasks/countdowns -> pure Calendar aggregation -> date index -> month grid/agenda
```

Stage 48 adds a Calendar-owned store and storage adapter for native events, then combines native and derived presentation items. The Calendar store MUST NOT copy Todo/Countdown records. Home integration consumes a bounded Calendar read model rather than another storage copy.

## 27. Route / Navigation

Stage 47 contract:

- Path `/calendar`, name `calendar`, lazy-loaded component, existing app layout.
- Add `calendar` to typed navigation metadata and both locale catalogs.
- Add a Calendar icon to the existing icon strategy; use the established icon library/component pattern rather than an ad hoc decorative SVG.
- Desktop order: Workspace, Calendar, Weather, Todos, Bookmarks, Tools. Settings remains utility navigation.
- Mobile primary navigation has limited capacity; Calendar replaces Bookmarks as a primary item, while Bookmarks moves to More. This preserves four primary destinations plus More and avoids shrinking touch targets.
- Route focus, scroll, title, NotFound, and app-shell behavior reuse existing contracts.
- Add Calendar to route accessibility and screenshot matrices at all three standard viewports.

## 28. Home Integration Boundary

Stage 47 does not change Home. Stage 48 may add a compact upcoming Calendar summary only after native events exist. It should show at most three to five upcoming native events/deadlines, distinguish source, and link to Calendar or source.

It MUST not duplicate the existing Today/Next Up Todo and Countdown content, render a month grid, increase first-screen height materially, read Weather, or create another storage copy. Before implementation, Stage 48 must decide whether existing Home deadline rows are replaced by the bounded Calendar read model rather than displayed twice.

## 29. Persistence Extension

Only Stage 48 may add `lifeboard.calendar` with owner `calendar`, category `durable-data`, sensitivity `personal-data`, portable namespace `calendar`, schema version 1, validation/migration required, and both content-clear and factory-reset enabled.

The product registry expands from 11 to 12 keys. The developer Weather debug key remains excluded. The key must join export, import, content clear, factory reset, registry invariants, unit tests, and browser QA. Prefix clearing and `localStorage.clear()` remain forbidden.

## 30. PortableBackupV2 Strategy

PortableBackupV1 strictly owns four namespaces and MUST NOT be silently extended. When native events land, production export switches to root `schemaVersion: 2` with `settings`, `weather`, `todos`, `bookmarks`, and `calendar` namespaces. Calendar module schema starts at 1; unchanged modules keep their existing module versions.

Import continues to accept PortableBackupV1, PortableBackupV2, legacy root v1, and legacy root v2. V1 and legacy inputs migrate in memory to canonical V2 with an empty valid Calendar module. V2 root/module validation remains strict. Replace-only, deterministic writes, exact read-back, reverse rollback, hydration verification, privacy exclusions, and legacy compatibility remain unchanged. Existing V1 files are never rewritten.

## 31. Clear / Reset Extension

Stage 48 content clear expands from four to five keys by adding Calendar. Factory reset expands from 11 to 12 product keys. Both remain registry-driven transactions with exact raw snapshots, deterministic mutation, per-key read-back, reverse rollback, rollback verification, runtime hydration, concurrency protection, and redacted errors.

Theme/Language and device-local preferences remain preserved by content clear. Factory reset removes Calendar with all other registered product keys. Debug and unregistered keys remain untouched. Stage 47 leaves the current 4/11 contracts unchanged.

## 32. i18n

Stage 47 adds typed bilingual keys for route/navigation labels and descriptions, page title/description, Today, previous/next month, selected date, empty month/day, Todo source, Countdown source, active/completed/overdue/expired, accessible date summaries, and Calendar errors. Stage 48 separately adds Event source, CRUD, validation, all-day/timed, and persistence messages.

Weekday/month/agenda display uses `Intl.DateTimeFormat` with explicit LifeBoard locale and controlled date construction. Week start uses the explicit locale map. Components do not hard-code user-facing text. Catalog parity and placeholder parity remain build-time requirements.

## 33. Accessibility

- Month controls are real buttons with localized names. The visible month is a heading; a restrained `aria-live="polite"` status announces deliberate month changes.
- The month uses semantic `role="grid"`, weekday headers, rows, and date buttons/gridcells with one roving tab stop.
- Arrow Left/Right moves one day; Arrow Up/Down moves seven days. Enter/Space selects. Page Up/Down moves one month while clamping the day. Home/End moves to locale week start/end.
- Keyboard movement across a displayed boundary updates visible month consistently. Selection remains explicit; focus movement alone does not rewrite source data.
- Today uses `aria-current="date"`; selection uses `aria-selected`. The accessible name includes full date, today/selected state, and Todo/Countdown counts.
- Agenda is a labelled list. Source and status are textual; links/actions have source-specific names.
- Focus indicators, contrast, 44px touch targets, skip link, route-main focus, and error announcements reuse existing baselines.
- Month switching uses no essential motion. Reduced motion disables non-essential transitions.

## 34. Responsive

- Mobile 390x844: stacked header/controls, seven equal minmax columns, compact cells, grid then agenda, no fixed wide child, no horizontal scroll, and 44px controls.
- Tablet 768x1024: stacked grid then agenda is the accepted default. It avoids a narrow two-column agenda and keeps keyboard/reading order identical to mobile.
- Desktop 1440x900: month grid is the flexible primary column and agenda is a bounded right column.
- Wide 1600/1920: existing PageLayout max width caps growth; cells do not stretch indefinitely.
- Responsive changes MUST NOT touch the frozen Weather wide-layout baseline.

## 35. Visual Direction

Calendar follows the calm personal command-center system: existing PageLayout, SectionHeader, BaseSurface, buttons, icon controls, spacing, typography, borders, status tokens, and light/dark themes. The grid is one functional surface, not 35/42 decorative cards. Source is communicated with icon/short label plus restrained tone.

No gradients for novelty, oversized hero, dense admin-console styling, arbitrary colors, nested cards, animated weather-like scene, or third-party calendar skin is allowed. Month cells remain visually quiet so the selected agenda carries detail.

## 36. Performance

- Lazy-load the Calendar route.
- Build one O(n) computed `Map<YYYY-MM-DD, AggregatedCalendarItem[]>`; cells use near-O(1) lookup.
- Recompute only when source arrays, local today, or locale-dependent presentation inputs change. Do not rebuild in render or broad `watchEffect` loops.
- Precompute the 35/42 grid dates and formatter instances per relevant locale/options.
- Month changes do not access network or Weather.
- Expected supported scale: up to 10,000 Tasks and 2,000 Countdowns, matching portable validation bounds. Stage 47 tests should stress at least 5,000 aggregate source records.
- Stage 48 should retain those source bounds and support at least 5,000 native events without per-cell full scans; any lower product limit must be an explicit validated contract.

## 37. Error / Empty States

The route is local-only. Before Todo hydration completes, show the existing lightweight loading primitive. A Todo persistence error produces a readable Calendar-level error with a route to Todos; it does not hide or repair the source value. An unexpected derivation failure shows a bounded error state and redacted diagnostics.

A malformed individual date is skipped rather than crashing the entire calendar, with no source write. Empty month and empty selected day are distinct messages. If a source is deleted while open, computed agenda updates automatically. Navigation failures remain router-level errors. Stage 48 separately defines CRUD, quota, validation, and rollback errors.

## 38. Dependency Decision

**Accepted: no new Calendar UI library and no new date library in Stage 47.** The current feature needs only validated date parts, deterministic calendar arithmetic, locale formatting, a 35/42-cell generator, and a date index. A third-party calendar would add styling, bundle, accessibility, maintenance, and API constraints without solving recurrence or timezone requirements that are explicitly deferred.

Stage 48 must reassess only if native timed-event requirements produce measured complexity beyond the approved helpers. No dependency is installed during Stage 46.

## 39. QA Architecture

Stage 47 unit tests cover real/invalid date parsing, no `YYYY-MM-DD` shift, local today, leap years, 28/29/30/31-day months, year/month boundaries, Monday/Sunday starts, 35/42 cells, outside-month selection, Todo/Countdown inclusion, soft-delete exclusion, completed/overdue/expired states, namespaced IDs, stable sorting, immutability, and large-index lookup.

Browser/component coverage includes route load, previous/next/Today, date selection, agenda updates, both source navigations, both locales/week starts, roving keyboard behavior, accessible names/states, loading/error/empty states, reduced motion, dark mode contrast smoke, zero console errors, and no overflow at 390x844, 768x1024, and 1440x900.

Calendar joins route accessibility and screenshot scripts, increasing each standard matrix from 27 standard captures/checks to 30; Weather keeps two extra wide checks, so the expected total rises from 29 to 32 route-viewports/screenshots. Existing persistence unit tests continue to cover JSON round-trip, reset, and text exports. Full build, route QA, screenshot/design QA, and frozen Weather routes remain required.

## 40. ADRs

| ADR | Status | Decision | Consequence |
| --- | --- | --- | --- |
| CAL-ADR-001 | Accepted | Calendar is a unified time view, not a replacement for Todo/Countdown | Source modules remain authoritative |
| CAL-ADR-002 | Accepted | Stage 47 is read-only aggregation | Persistence stays frozen |
| CAL-ADR-003 | Accepted | Stage 47 adds no storage key | Registry remains 11 keys |
| CAL-ADR-004 | Accepted | Todo/Countdown items are derived, non-portable data | No duplicate records |
| CAL-ADR-005 | Accepted | Stage 47 is Month plus selected-day agenda only | Week/hour/drag views deferred |
| CAL-ADR-006 | Accepted | Bucketing uses explicit local calendar semantics | Date-only values cannot UTC-shift |
| CAL-ADR-007 | Accepted | zh-CN starts Monday; en-US starts Sunday | Locale behavior is deterministic |
| CAL-ADR-008 | Accepted | Stage 47 adds no Calendar/date runtime dependency | Smaller risk and bundle |
| CAL-ADR-009 | Accepted | Native Calendar Events wait for Stage 48 | CRUD cannot expand Stage 47 |
| CAL-ADR-010 | Accepted | Native events use `lifeboard.calendar` | Calendar owns its durable data |
| CAL-ADR-011 | Accepted | Stage 48 expands registry 11 to 12 | Invariants and reset coverage must change together |
| CAL-ADR-012 | Accepted | Native events require PortableBackupV2; V1 remains importable | Root evolution is explicit |
| CAL-ADR-013 | Accepted | Stage 48 expands content clear 4 to 5 and factory reset 11 to 12 | Transactions remain complete |
| CAL-ADR-014 | Accepted | Recurrence, reminders, sync, ICS, and drag/drop are deferred | Event v1 stays minimal |

## 41. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner stage |
| --- | --- | --- | --- | --- | --- |
| CAL-R01 | Date-only value shifts through UTC parsing | Medium | High | Explicit parts parser; forbid implicit string Date parsing; timezone matrix tests | 47 |
| CAL-R02 | Brief assumes Countdown timestamp near midnight | High | Medium | Source truth records date-only semantics; no invented time conversion | 46-47 |
| CAL-R03 | DST changes all-day duration | Medium | High | Date-only exclusive ranges; never UTC midnight all-day events | 48 |
| CAL-R04 | Locale week-start drift | Medium | High | Explicit zh-CN/en-US map and injected-locale tests | 47 |
| CAL-R05 | Grid keyboard/screen-reader behavior is inconsistent | Medium | High | Semantic grid, roving tabindex, documented keys, browser QA | 47 |
| CAL-R06 | Month cells become content-heavy | Medium | Medium | Counts/indicators only; titles stay in agenda | 47 |
| CAL-R07 | 390px horizontal overflow | Medium | High | Seven minmax columns, compact labels, screenshot/overflow QA | 47 |
| CAL-R08 | Todo and Countdown IDs collide | Low | Medium | Namespaced derived IDs and uniqueness tests | 47 |
| CAL-R09 | Soft-deleted Todo leaks into Calendar | Medium | High | Explicit exclusion predicate and fixtures | 47 |
| CAL-R10 | Calendar duplicates Todo information/product role | Medium | Medium | Read-only temporal index; management stays in Todos | 47-48 |
| CAL-R11 | V2 root bump breaks old backups | Medium | High | Canonical V1/legacy-to-V2 adapters and strict compatibility fixtures | 48 |
| CAL-R12 | Registry 11-to-12 coverage regression | Medium | High | Add key and invariant expectations atomically | 48 |
| CAL-R13 | Clear/reset omits Calendar | Medium | High | Registry plans, 5/12 count contracts, failure injection | 48 |
| CAL-R14 | Home repeats existing Todo/Countdown summaries | High | Medium | No Home work in 47; replace/compose bounded read model in 48 | 48 |
| CAL-R15 | Third-party library increases bundle and style debt | Low | Medium | No dependency in 47; evidence-based ADR before any later addition | 47-48 |
| CAL-R16 | Calendar visual competes with Weather | Low | Medium | Quiet existing design system; no scene or decorative motion | 47 |
| CAL-R17 | Large collections cause per-cell scans | Medium | High | O(n) date map and large-fixture performance test | 47-48 |
| CAL-R18 | Cross-day/all-day native semantics diverge | Medium | High | Discriminated model, exclusive all-day end, covered-day tests | 48 |
| CAL-R19 | Recurrence needs force event v1 schema compromise | Medium | Medium | Do not add speculative recurrence fields; future version/migration | Post-48 |
| CAL-R20 | Stage 47 implements persistence by scope drift | Medium | High | Explicit forbidden list, docs-only Stage 46, diff gate | 47 |

## 42. Stage 47 Implementation Contract

**Name:** Stage 47: Read-only Calendar Aggregation MVP.

**Allowed:** Calendar feature folder and lazy route/page; month grid; selected-day agenda; pure date/grid helpers; route-owned aggregation composable/state; Todo/Countdown read-only aggregation; navigation/meta/icon/i18n integration; existing primitives/tokens; accessibility/responsive behavior; unit, browser, route, screenshot, design, and documentation updates.

**Forbidden:** Native Event CRUD; `lifeboard.calendar`; persistence registry changes; backup/import/reset changes; Home integration; recurrence; reminders; external sync; ICS; drag/drop; Weather changes; new dependencies; broad Todo refactor.

**Exit criteria:** production-ready `/calendar`; correct source derivation and local date behavior; deterministic locale week starts; accessible keyboard grid and agenda; no 390/768/1440 overflow; expected 32 route-viewports/screenshots pass; existing persistence and Weather baselines pass; no storage contract diff.

## 43. Stage 48 Implementation Contract

**Name:** Stage 48: Native Calendar Events / Persistence Integration and Closeout.

**Expected scope:** native event create/edit/delete and details; Calendar store/service and validated envelope; `lifeboard.calendar`; registry 12-key integration; PortableBackupV2 export/import and V1/legacy canonical adapters; Replace/read-back/rollback/hydration preservation; content clear 5-key and factory reset 12-key plans; bounded Home integration; Calendar text-export policy decision; event browser QA; full local and remote CI closeout.

**Still forbidden:** recurrence, reminders/notifications, external sync, ICS, sharing/teams, Merge import, Weather changes, broad UI redesign, or speculative event fields.

**Exit criteria:** native event CRUD and date semantics pass; storage/backup/import/reset transactions include Calendar without regression; V1/legacy files remain importable; Home has no duplicated summaries; full QA and exact remote CI are green.

## 44. Existing Behavior Preservation

Stage 46 changes no routes, navigation, Home, Todos, Countdowns, Bookmarks, Settings, Weather, registry, backup, import, clear/reset, CSV/Markdown export, i18n, tests, dependencies, workflow, QA scripts, or visual baseline. It creates no Calendar runtime artifact. The two documentation files are the complete authorized diff.

## 45. Weather Freeze Boundary

Weather remains regression-only. Calendar does not read Weather, reuse Weather assets, alter Weather routes/layout/runtime/store/services/cache/PixiJS, add scenes or motion, analyze Xiaomi Weather material, or affect the Weather wide screenshot/overflow checks. Only separately proven Weather regressions may reopen Weather files.

## 46. Known Limitations

- This is a code-grounded architecture specification, not user research or a rendered Calendar prototype.
- Stage 47 source navigation can open only `/todos`; item-level deep links are unavailable.
- Countdown is date-only, so Stage 47 cannot show a real time label.
- The proposed grid keyboard pattern still requires implementation-level browser and assistive-technology verification.
- Native timezone/event behavior, V2 migration, quota failures, and reset expansion are planned but unimplemented until Stage 48.
- Recurrence and external calendar interoperability remain intentionally unresolved.
- The known Vite chunk warning is unrelated and remains non-blocking.

## 47. Validation

The complete frozen matrix passed serially:

- `npm ls vitest`: PASS, `vitest@4.1.10`.
- `npx npm@11.18.0 ci --dry-run`: PASS.
- `npm ci --dry-run`: PASS.
- `npm run test:unit:ci`: PASS, 14 files / 189 tests, including JSON portability, reset, and text-export coverage.
- `npm run build`: PASS, 1,140 modules. The existing `lib` 513.51 kB chunk warning remains non-blocking.
- `npm run qa:a11y:routes:ci`: PASS, 29/29 route-viewports, zero console errors and overflow failures.
- `npm run qa`: PASS, including its build and local 29/29 route audit.
- `npm run qa:screenshots:ci`: PASS, 29/29 screenshots.
- `npm run qa:design`: PASS, including build and 29/29 screenshots.
- `.qa` remains ignored; ports 4173-4175 are free and no preview server remains.
- `package.json` and `package-lock.json` have no diff.
- Scope checks show only the two authorized documentation files.

## 48. Final Decision

**Calendar Product / Architecture Spec: PASS.**

The sole next stage is **Stage 47: Read-only Calendar Aggregation MVP**. It must not implement persistence, native Calendar Events, Home integration, Weather changes, or new dependencies. Stage 48 remains the only authorized future lane for native events and persistence integration.
