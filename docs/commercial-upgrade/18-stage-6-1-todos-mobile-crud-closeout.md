# LifeBoard Commercial Upgrade - Stage 6.1 Todos Mobile CRUD Closeout

## 1. Scope

Stage 6.1 closes the mobile density, empty-state, touch-action, and CRUD evidence gaps left after Stage 6.

This stage changes only the Todos workflow surface and supporting i18n keys:

- `src/modules/todos/components/TodosWorkspace.vue`
- `src/modules/todos/components/TaskFilterBar.vue`
- `src/modules/todos/components/TaskItem.vue`
- `src/modules/todos/components/CountdownItem.vue`
- `src/modules/todos/components/InlineDeleteConfirmation.vue`
- `src/i18n/locales/en-US-modules.ts`
- `src/i18n/locales/zh-CN-modules.ts`
- `src/i18n/moduleKeys.ts`

This stage does not change routing, global navigation, Landing, Workspace structure, Weather, Bookmarks, Tools, Settings, storage schema, package files, lockfiles, or app shell contracts.

## 2. Baseline

Stage 6 baseline commit:

```text
e6e9493 feat(todos): redesign task and countdown workflows
```

Pre-change build passed. The existing Vite large chunk warning remained present and was not introduced by Stage 6.1.

Pre-change 390px evidence showed the mobile status metrics occupying roughly `467.9px`, with the first task beginning around `1116.7px`. Empty mobile state showed four numeric zero cards:

```text
Today 0
Past due 0
This week 0
Countdowns 0
```

## 3. Mobile Density Decisions

Final decision:

- At 375px and 390px, the Todos status area is a compact 2x2 rail.
- Empty metric values use semantic copy instead of zero numerals.
- Mobile-only secondary metric descriptions are removed from the visible rail to keep the first task reachable in the first viewport.
- The task section description is hidden on mobile because the filter rail and first task are more important than repeated explanatory copy.
- The task composer remains present but stays visually after the task list on mobile, preserving Stage 6's task-first workflow.

Final measured evidence:

| Viewport | Metric rail height | First task top | Horizontal overflow |
| --- | ---: | ---: | ---: |
| 390x844 populated | `150.9px` | `682.4px` | `0px` |
| 375x812 populated | `150.9px` | `704.0px` | `0px` |
| 390x844 empty | `169.3px` | n/a | `0px` |

## 4. Empty State Copy

The empty status rail now uses semantic text:

| Metric | English | Chinese |
| --- | --- | --- |
| Today | `Today Clear` | `今天清爽` |
| Past due | `None overdue` | `没有逾期` |
| This week | `Nothing scheduled` | `本周无安排` |
| Countdowns | `No saved dates` | `没有保存日期` |

The detailed task-list and countdown empty states remain semantic and action-oriented:

- Today empty explains that due-today and overdue unfinished tasks appear there.
- Deleted empty explains soft-deleted tasks appear before permanent removal.
- Countdown empty keeps the existing add-countdown action.

## 5. Filter Rail

Final decision:

- The filter rail remains a horizontal scroll group on mobile.
- It adds a visible hint: `Swipe to review Completed and Deleted.`
- The active filter scrolls into view after filter changes.
- Active state continues to use `aria-current="page"`.
- The rail keeps a thin scrollbar and an edge fade to signal overflow without forcing five filters into cramped equal columns.

Verified filters:

- Today
- Upcoming
- All
- Completed
- Deleted

## 6. Touch Targets

Final decision:

- Task checkbox target is `44px`.
- Task row Edit/Delete/Restore/Delete forever buttons are locally raised to `44px` without changing shared `BaseButton` defaults.
- Countdown Edit/Delete buttons are locally raised to `44px`.
- Inline confirmation Cancel/Delete buttons are locally raised to `44px`.

Measured evidence recorded `minActionHeight: 44` for populated mobile task and countdown states.

## 7. CRUD Verification

CRUD was verified through rendered browser interactions against production preview:

### Tasks

- Add task with due date.
- Edit task title.
- Open delete confirmation.
- Confirm soft delete.
- Switch to Deleted filter.
- Restore task.
- Soft delete again.
- Confirm permanent delete.

### Countdowns

- Add countdown.
- Edit countdown title.
- Open delete confirmation.
- Confirm deletion.
- Verify single-day and plural-day countdown labels.

The storage envelope remains unchanged:

```ts
{
  version: 1,
  tasks: Task[],
  countdowns: Countdown[],
}
```

No storage key, schema, migration, or persistence behavior was changed.

## 8. Responsive, Theme, Locale, And Motion Evidence

Screenshots were generated outside the repository at:

```text
C:\Users\jingr\AppData\Local\Temp\lifeboard-stage61-final
```

Required screenshot filenames generated:

```text
01-stage61-light-390-populated-top.png
02-stage61-light-390-populated-task-first.png
03-stage61-light-390-empty-top.png
04-stage61-dark-390-populated.png
05-stage61-dark-390-empty.png
06-stage61-light-375-populated.png
07-stage61-light-768.png
08-stage61-light-1024.png
09-stage61-light-1280.png
10-stage61-light-1440.png
11-stage61-light-1920.png
12-stage61-english-390-single.png
13-stage61-english-390-plural.png
14-stage61-english-1440-single.png
15-stage61-english-1440-plural.png
16-stage61-filter-today.png
17-stage61-filter-upcoming.png
18-stage61-filter-all.png
19-stage61-filter-completed.png
20-stage61-filter-deleted.png
21-stage61-todo-add.png
22-stage61-todo-edit.png
23-stage61-todo-delete-confirmation.png
24-stage61-todo-restored.png
25-stage61-todo-permanent-delete.png
26-stage61-countdown-add.png
27-stage61-countdown-edit.png
28-stage61-countdown-delete-confirmation.png
29-stage61-countdown-single-day.png
30-stage61-countdown-plural-days.png
31-stage61-bottom-navigation-clearance.png
32-stage61-reduced-motion.png
33-stage61-workspace-single-item.png
34-stage61-workspace-plural-items.png
35-stage61-route-not-found.png
```

Evidence JSON:

```text
C:\Users\jingr\AppData\Local\Temp\lifeboard-stage61-final\stage61-evidence.json
```

Playwright CLI was not installed in this environment, so verification used the Chrome DevTools Protocol fallback without adding dependencies.

## 9. Route Regression

Production preview returned HTTP 200 for:

```text
/
/app
/weather
/weather/cities
/weather/15-day
/todos
/bookmarks
/tools
/settings
/settings/data-sources
/stage61-missing-route
```

The unknown route still resolves through the SPA fallback and renders the Not Found route client-side. No router files were changed.

## 10. Freeze And Boundary Checks

Weather freeze boundary:

- No `src/modules/weather/**` files changed.
- No weather assets changed.
- No PixiJS, weather cache, condition mapping, or weather data logic changed.

Navigation and shell boundary:

- No App Layout, top navigation, mobile bottom navigation, router, Landing, or Workspace shell files changed.
- Bottom navigation clearance was verified at 390px in `31-stage61-bottom-navigation-clearance.png`.

Dependency boundary:

- `package.json` unchanged.
- Lockfile unchanged.
- No dependency install was performed.

## 11. Verification Commands

Executed:

```powershell
npm run build
git status --short
git diff --stat
git diff -- src/modules/todos src/i18n docs/commercial-upgrade/18-stage-6-1-todos-mobile-crud-closeout.md
```

Build result:

```text
Passed
```

Known warning:

```text
Some chunks are larger than 500 kB after minification.
```

This warning existed at baseline and was not introduced by Stage 6.1.

## 12. Stage 6.1 Completion Decision

Stage 6.1 is complete when the final commit contains only:

- Todos mobile density and touch target fixes.
- Todos filter rail scroll affordance and active scroll behavior.
- Todos empty metric semantic i18n copy.
- This closeout document.

Stage 6.1 does not start Stage 7 and does not change the global mobile navigation contract.
