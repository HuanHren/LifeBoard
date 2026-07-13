# Stage 45: Factory Reset, Language, and Data Portability Closeout

## Baseline

- Branch: `main`.
- Starting commit: `3181566` (`fix(data): close out csv markdown exports`), the Stage 44 closeout.
- `main` and `origin/main` were aligned and the worktree was clean before Stage 45.
- Stage 41 through Stage 44 foundations are present in history; Stage 37 remains the non-Weather visual freeze baseline.
- The product persistence registry contains exactly 11 LocalStorage keys. The developer-only `__lifeboard_weather_runtime_debug` key remains outside the registry.

## Existing Behavior Audit

Before Stage 45, Settings exposed selective Weather, Todos, and Bookmarks clears plus one hard-coded global clear. The global path targeted 10 keys, omitted `lifeboard.language`, had no per-remove read-back, and did not verify rollback or Language runtime synchronization. It already avoided `localStorage.clear()` and normally preserved unrelated keys, but its coverage and failure guarantees did not match the Stage 40 contract.

## Frozen Clear Contracts

### Clear user content

The registry generates this deterministic four-key remove plan:

1. `lifeboard.todos`
2. `lifeboard.bookmarks`
3. `lifeboard-weather-favorite-cities`
4. `lifeboard-weather-location`

Theme, Language, Weather forecast cache, provider choice, Caiyun token, AMap key, auto-location preference, developer debug data, and unregistered storage are preserved. Runtime Todos, Countdowns, Bookmarks, selected location, and favorite cities are synchronized to empty state after storage verification.

### Factory reset

The registry generates this deterministic 11-key remove plan:

1. Todos
2. Bookmarks
3. Weather favorite cities
4. Weather selected location
5. Weather forecast cache
6. Weather provider
7. Caiyun token
8. AMap key
9. Weather auto-location preference
10. Theme
11. Language

The developer debug key and all unregistered storage remain untouched. Runtime state resets to empty user content, System theme, browser-derived Language, Open-Meteo provider, no Weather credentials, and auto-location off. The operation is repeatable even when all target keys are already absent.

Neither operation uses `localStorage.clear()`.

## Transaction and Failure Safety

Both global operations use one pure registry-driven transaction:

1. Validate exact plan coverage and unique registered keys.
2. Capture exact raw target values without parsing or logging them.
3. Remove keys in deterministic order.
4. Read each key back immediately and require absence.
5. Hydrate public Pinia store APIs and verify the expected runtime state.
6. On failure, restore the exact raw snapshot in reverse order and verify every restored value.
7. Restore and verify the previous in-memory state after a hydration failure.

A coordinator rejects concurrent clear/reset execution. Structured errors contain operation metadata only and never include raw values, tokens, API keys, Todo text, Bookmark URLs, or location details. Closing or cancelling the confirmation dialog performs zero storage writes.

## Confirmation and Accessibility

- `Clear user content` and `Factory reset` are separate, explicitly named actions.
- Each confirmation shows count-only data, target-key count, preference impact, and the fact that no backup is created automatically.
- Both require an acknowledgement checkbox before confirmation.
- The existing native dialog focus trap, Escape/cancel behavior, initial Cancel focus, and trigger focus restoration remain in place.
- Busy state disables dialog actions and clear controls; the transaction coordinator is the final concurrency guard.
- English and Simplified Chinese catalogs cover action labels, previews, confirmations, outcomes, and failure states.

## Data Portability Support Matrix

| Capability | Production status | Restore format | Stage 45 change |
| --- | --- | --- | --- |
| JSON backup export | Supported, `PortableBackupV1` | Yes | Unchanged |
| JSON Replace import | Current format plus legacy v1/v2 adapters | Yes | Unchanged |
| Import verification and rollback | Exact snapshot, read-back, reverse rollback | N/A | Unchanged |
| Todo CSV | Supported hardened text export | No | Unchanged |
| Bookmark CSV | Supported hardened text export | No | Unchanged |
| Todo Markdown | Supported hardened text export | No | Unchanged |
| Bookmark Markdown | Supported hardened text export | No | Unchanged |
| Summary Markdown | Supported without Weather payload | No | Unchanged |
| Clear user content | Registry-driven four-key transaction | N/A | Finalized |
| Factory reset | Registry-driven 11-key transaction | N/A | Finalized |
| Merge import | Not supported | N/A | Deferred |

JSON portability still includes Theme, Language, selected/favorite Weather locations, Todos/Countdowns, and Bookmarks. Weather cache, provider/device preferences, credentials, runtime state, developer debug data, and QA artifacts remain non-portable.

## CI and Validation

`test:unit:ci` is a stable Node-only Vitest gate with no dependency change. The QA workflow now runs it after `npm ci` and before Playwright Chromium installation. Stage 45 validation covers registry integrity, exact plans, preservation sentinels, success, repeatability, snapshot failure, first/middle/final mutation failures, read-back failure, rollback mutation/verification failure, hydration rollback, concurrency rejection, Language defaults, production build, route accessibility, screenshot QA, design QA, and targeted Settings browser flows.

Closeout results:

- `npm ls vitest`: `vitest@4.1.10`; package and lockfile diff is empty.
- `npx npm@11.18.0 ci --dry-run` and local `npm ci --dry-run`: pass.
- `npm run test:unit:ci`: 14 files and 189 tests pass.
- `npm run build` and the build phases inside `qa` / `qa:design`: pass.
- All four route accessibility modes pass with 29/29 route-viewports and zero console errors.
- `npm run qa`, `npm run qa:screenshots:ci`, and `npm run qa:design`: pass; screenshot baselines are 29/29.
- Production-preview Settings QA at 390x844 passes cancel, confirmation, 4/11-key removal, repeat reset, default Language, sentinel preservation, focus, overflow, and console checks.
- The standalone `playwright-cli` executable is unavailable in this workspace, so targeted QA used the existing project `playwright@1.61.1` dependency without adding packages.

The existing Vite chunk-size warning remains non-blocking and out of Stage 45 scope.

## Scope Integrity

Stage 45 does not modify Weather stores/services/runtime/assets, JSON schemas or adapters, CSV/Markdown contracts, routes, package dependencies, QA scripts, or the frozen non-Weather visual baseline. It does not add Merge, Calendar, backend sync, new Weather scenes, Xiaomi Weather material work, or broad Settings redesign.

## Closeout Decision

Data portability is closed when the full local validation matrix and targeted production browser QA pass. After closeout, this area is regression-only unless a separately authorized portability requirement is opened.

The only recommended next stage is **Stage 46: Calendar Product / Architecture Spec**. Stage 46 should define Calendar ownership, date semantics, persistence contract, accessibility, responsive behavior, and integration boundaries without implementing the Calendar MVP, changing Weather, or reopening data-portability contracts.
