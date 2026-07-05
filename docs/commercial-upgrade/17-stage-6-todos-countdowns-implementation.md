# Stage 6 Todos And Countdowns Implementation

## Scope

Stage 6 upgrades the `/todos` task and countdown workflows to the commercial visual system established in Stages 2 through 5. The implementation stays inside the Todos surface and directly related i18n/home pluralization paths.

Changed areas:

- `src/modules/todos/components/*`
- `src/i18n/moduleKeys.ts`
- `src/i18n/locales/en-US-modules.ts`
- `src/i18n/locales/zh-CN-modules.ts`
- Minimal Home pluralization call sites in `src/modules/home/*`

Unchanged areas:

- Router and route meta.
- App shell navigation.
- Weather module, weather assets, PixiJS, weather cache, and weather data.
- Todos Pinia store, localStorage key, storage envelope version, task schema, countdown schema, and validation rules.
- Package files, lockfile, dependencies, and build configuration.

## Product Decisions

`/todos` remains the top-level app route for daily tasks and saved dates. The page now presents planning status first, then the operational task flow, then countdown context. Desktop keeps quick capture near the top because there is room to scan status and act in one view. Mobile prioritizes task scanning before the quick-add composer so returning users see active work before entering another item.

The task filters remain:

- Today.
- Upcoming.
- All.
- Completed.
- Deleted.

Today still includes active tasks due today and active overdue tasks. Completed and Deleted remain recoverable workflows; the stage does not alter soft-delete or permanent-delete behavior.

## Visual Implementation

The page header became a commercial planning hero with:

- Product eyebrow.
- Strong page title.
- Local-first description.
- Primary "New task" action.
- Four status metrics: Today, Past due, This week, Countdowns.

The task area became a framed workflow panel with:

- Task-flow heading.
- Active filter summary.
- Horizontally scrollable filter rail on narrow screens.
- Dense task rows with stronger labels, overdue emphasis, completed/deleted states, and inline actions.

The quick-add composer now uses a more compact surface and keeps optional date/label fields collapsed by default. On mobile, CSS ordering places the task panel before the composer.

The countdown rail now has:

- Date-focused eyebrow.
- Featured nearest countdown.
- Compact secondary countdown rows.
- Inline create/edit/delete forms and confirmations using the existing storage flow.

## Data And Persistence

No storage schema changed.

Verified unchanged contracts:

- Storage key: `lifeboard.todos`.
- Storage envelope: `{ version: 1, tasks, countdowns }`.
- Task fields: `id`, `title`, `dueDate`, `label`, `completedAt`, `deletedAt`, `createdAt`, `updatedAt`.
- Countdown fields: `id`, `title`, `targetDate`, `createdAt`, `updatedAt`.

The browser CRUD check confirmed that adding a task writes to the same localStorage envelope and toggling completion updates `completedAt` through the existing store.

## i18n And Pluralization

English pluralization now uses explicit singular and plural keys for the user-requested strings:

- `1 item needs attention today.`
- `2 items need attention today.`
- `1 task is due today or overdue.`
- `2 tasks are due today or overdue.`
- `1 day`
- `2 days`

Todos status copy also uses singular/plural keys for Today, Past due, This week, visible filter counts, active task counts, and saved countdown counts. Visible text remains routed through the existing i18n catalog; no second language state was introduced.

## Accessibility

The page keeps the existing shell skip link, route focus behavior, semantic headings, form labels, and live announcements. The filter rail continues to expose `aria-current` for the active filter. Delete and permanent-delete confirmations keep keyboard focus on the cancel action and support Escape cancellation through the existing confirmation component.

No scroll-linked animation, global wheel handling, or reduced-motion-sensitive animation was added.

## Responsive Behavior

Desktop:

- Hero status metrics span the page.
- Quick capture and task workflow share the main column.
- Countdown and planning status sit in the side rail.

Mobile:

- Metrics stack to one column on very narrow screens.
- Task workflow appears before quick capture.
- Filter rail scrolls horizontally rather than forcing six navigation items into view.
- Explicit `min-width: 0` containment prevents grid and form intrinsic sizing from creating horizontal overflow.

## Weather Freeze Boundary

Stage 6 did not read or modify weather internals beyond verification that Todos imports do not reference weather rendering, PixiJS, GSAP, or ScrollTrigger. The Weather route, weather assets, weather store, cache, and renderer remain untouched.

## Verification

Build:

- `npm run build` passed after implementation.
- Existing Vite large chunk warning remains: `lib-*.js` is larger than 500 kB after minification.

Browser evidence:

- Production preview at `http://127.0.0.1:4177/todos`.
- Chrome DevTools Protocol fallback was used because `playwright-cli` and `npx --no-install playwright-cli` were unavailable.
- Screenshots saved under `C:\Users\jingr\AppData\Local\Temp\lifeboard-stage6-final`.
- Checked 1440 light populated, 390 light populated, 390 dark populated, 1440 light empty Chinese, and 390 light empty Chinese.
- All captured states reported no horizontal overflow.
- CRUD evidence saved as `stage6-crud-result.json`.

## Known Limitations

The existing Chinese locale file already contains mojibake in many pre-existing entries. Stage 6 added the required new Chinese keys with readable UTF-8 text where key-based mechanical replacement was needed, but it did not attempt a full locale repair because that would exceed the Todos/Countdowns stage scope.

Full-page screenshots include the fixed mobile bottom navigation at its viewport position. That is a capture artifact of `captureBeyondViewport`, not a route or shell change.
