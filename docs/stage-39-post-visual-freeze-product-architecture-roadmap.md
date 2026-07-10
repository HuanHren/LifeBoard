# Stage 39: Post-Visual-Freeze Product / Architecture Roadmap

## 1. Baseline

- Audit date: 2026-07-10.
- Branch: `main`.
- Starting HEAD and `origin/main`: `4796b5e380557e408ef38c00e86f6db0aa79b2ee` (`docs(qa): verify remote visual freeze baseline`).
- Starting worktree: clean; local and remote histories were synchronized.
- Freeze anchor: `non-weather-visual-freeze-stage-37` points to `b59018d47f0d90c54c020ceb545db73f4ac84532`.
- Remote: `https://github.com/HuanHren/LifeBoard.git`; no plaintext credential was present.
- Stage 39 is documentation-only. It does not reopen the frozen visual or Weather workstreams.

## 2. Skill Gate Summary

The following skill instructions were verified and read in full before the audit:

- `impeccable/SKILL.md`
- `gpt-taste/SKILL.md`
- `redesign-existing-projects/SKILL.md`
- `baseline-ui/SKILL.md`
- `vue-best-practices/SKILL.md`
- `fixing-accessibility/SKILL.md`
- `fixing-motion-performance/SKILL.md`
- `playwright-cli/SKILL.md`

Relevant references were also read for product audit, hardening, layout, adaptation, Vue reactivity/SFC/data flow/composables/state management, and Playwright execution/tests. `vue-best-practices/references/list-performance.md` was checked but is not present.

## 3. Stage 39 Scope

This stage inventories the current product, architecture, persistence contracts, extension costs, and roadmap dependencies. It produces a single recommended Stage 40 and a sequenced Stage 40-48 plan. It does not implement persistence changes, new modules, UI polish, QA infrastructure, backend work, or Weather work.

## 4. Current Product Capability Inventory

| Capability | Status | User value | Data ownership / persistence | Known limitation | Next action |
| --- | --- | --- | --- | --- | --- |
| Landing | Stable / visually frozen | Product orientation and workspace entry | None | Large page component; accepted while frozen | Regression only |
| Home dashboard | Stable / visually frozen | Daily cross-module overview | Reads Weather, Todos, and Bookmarks stores | Aggregator must be edited for every new summary | Define aggregation contract before third-party growth |
| Weather | Frozen | Current, hourly, daily, city, and provider workflows | Weather-owned keys and cache | Large runtime; intentionally excluded from refactor | Regression fixes only |
| Todos | Stable | Local task planning | `lifeboard.todos`, versioned envelope | Invalid stored data can later be overwritten by a write | Harden after portability contract |
| Countdowns | Stable | Important-date tracking | Shares `lifeboard.todos` envelope | Date-only semantics are module-local | Reuse via an explicit date contract |
| Tools | Stable | Private transient utilities | In-memory only | No global command registry | Keep transient; integrate only after registry design |
| Bookmarks | Stable | Saved references, categories, notes, pinning | `lifeboard.bookmarks`, versioned envelope | No cross-module search contract | Preserve; add search contract later |
| Settings | Stable | Appearance, source configuration, data controls | Cross-module orchestration | Hard-coded ownership lists and backup schema | Primary consumer of portability contract |
| Theme | Stable | System/light/dark appearance | `lifeboard-theme` | Raw unversioned value | Classify in registry; no immediate migration |
| Language | Stable | `zh-CN` / `en-US` | `lifeboard.language` | Excluded from backup and "clear all" ownership | Decide explicitly in Stage 40 |
| Data source settings | Stable | Provider choice and credentials | Weather-owned preference/secret keys | Secrets correctly excluded from backup | Preserve privacy exclusion |
| NotFound | Stable / visually frozen | Route recovery | None | No product blocker | Regression only |
| Local persistence | Partial | Local-first operation without account | Multiple module-specific adapters | Registry, migration, and recovery behavior are inconsistent | Foundation before new persisted modules |
| JSON backup/restore | Partial but usable | User-controlled portability | Backup schema v2; strict validation and rollback | Export set is hard-coded and incomplete by policy | Formalize contract, fixtures, and ownership |
| CSV/Markdown export | Stable | Human-readable Todos/Bookmarks/summary exports | Generated in browser; no mutation | Coverage is not automated | Test and align; do not rebuild |
| Route/accessibility QA | Stable baseline | Regression confidence | 9 routes, 29 route-viewports | Smoke-level; no axe or data workflow tests | Extend with each approved module |
| Screenshot QA | Stable local baseline | Deterministic design evidence | 29 captures under ignored `.qa` | Capture only; no visual diff or dark matrix | Keep deferred until a measured need |
| Deployment / CI | Stable | Deployable static app with remote QA | Vercel plus GitHub Actions QA | CI does not upload screenshots | Preserve current baseline |

Missing product capabilities are Calendar, Notes, Habits, a command registry/palette, global search, analytics, accounts, backend storage, and synchronization. These are roadmap candidates, not implied commitments.

## 5. Current Route and Module Inventory

The router contains 11 records including the catch-all: `/`, `/app`, `/weather`, `/weather/cities`, `/weather/15-day`, `/todos`, `/tools`, `/bookmarks`, `/settings`, `/settings/data-sources`, and NotFound. Routes are centralized, lazy-loaded, and use typed metadata for layout, navigation identity, title, and scroll behavior. `LayoutResolver` selects landing, application, or minimal layouts and restores focus to `#main-content`.

| Module | Entry / structure | State and services | Coupling / extension risk |
| --- | --- | --- | --- |
| App / router | Central route records, typed meta, layout resolver, central navigation constants | Theme, language, transient shell state | A new visible module touches route, nav, i18n, and QA registries |
| Home | Page plus focused dashboard components and `useHomeDashboard` | Directly reads Weather, Todos, Bookmarks | Deliberate aggregator, but a growth hotspot |
| Weather | Three route entries, store, services, runtime/rendering layers, assets | Provider, cache, location, favorites, credentials | Frozen; no internal migration or product expansion |
| Todos | Thin page entry, workspace/components, Pinia store, storage service, date utilities | Tasks and countdowns in one envelope | Date model should not be copied into Calendar/Habits |
| Tools | Thin page entry and tool components | Transient component/composable state | Suitable as a later command-registry consumer |
| Bookmarks | Thin page entry, workspace/components, Pinia store and storage service | Versioned bookmark envelope | Searchable domain, but no shared search interface |
| Settings | Page, data-sources route, workspace/components, backup/export services | Coordinates Theme, Weather, Todos, Bookmarks | Highest cross-module persistence coupling |
| Landing / NotFound | Standalone entries | No persistent state | Visually frozen; low product extension value |
| i18n | Typed key arrays, parity assertion, two full catalogs | No runtime persistence beyond selected locale | New modules require keys plus both catalogs |
| Shared | Layouts, navigation, base primitives, tokens/utilities | Mostly stateless | Appropriate host for contracts, not domain logic |

The existing feature-oriented `src/modules` structure is suitable for incremental extension. A one-time repository migration to another architecture is not justified.

## 6. Store and Persistence Inventory

- Pinia owns Weather, Todos, and Bookmarks domain state. Theme and language use dedicated global stores. Home is a read aggregator; Settings is the data-management orchestrator.
- Todos and Bookmarks use versioned storage envelopes and runtime validation. Bookmarks blocks subsequent writes after invalid loading; Todos does not, creating asymmetric corrupt-data protection.
- Weather uses a mix of versioned envelopes, raw validated JSON, raw preferences, raw credentials, and transient cache. This is frozen and must be classified rather than refactored.
- Backup schema v2 exports theme, selected/favorite Weather cities, Todos/countdowns, and Bookmarks. Version 1 import compatibility exists.
- Import rejects files over 1 MB, validates exact shape, requires confirmation, and applies changes through a storage snapshot/rollback transaction.
- Portable Todos and Bookmarks CSV/Markdown and a Markdown summary already exist. They should receive contract/fixture coverage, not duplicate implementation.
- Task records contain stable IDs, title, optional due date/label, completion/deletion timestamps, and created/updated timestamps. Countdowns contain stable IDs, title, target date, and timestamps. Bookmark records contain stable IDs, title, URL, category, note, pin state, and timestamps.
- No page entry or workspace component directly owns LocalStorage serialization; persistence access is concentrated in stores/services and global preference stores. Settings intentionally orchestrates those module contracts.
- No centralized persistence registry, global schema identifier, module migration registry, or uniform corrupt-data recovery policy exists.

## 7. LocalStorage Key Inventory

| Key | Owner | Shape / version | Validation and recovery | Export policy |
| --- | --- | --- | --- | --- |
| `lifeboard-theme` | Global theme | Raw enum, unversioned | Validated; storage errors handled | Exported |
| `lifeboard.language` | Global language | Raw locale, unversioned | Validated; storage errors handled | Currently excluded; Stage 40 decision required |
| `lifeboard-weather-location` | Weather | Raw location JSON | Validated | Exported |
| `lifeboard.weather.forecastCache.v1` | Weather | Versioned transient cache | Invalid cache may be cleared | Never export |
| `lifeboard-weather-favorite-cities` | Weather | Version 1 envelope | Strict validation | Exported |
| `lifeboard.weather.provider` | Weather | Raw provider enum | Validated | Exclude as runtime/source preference unless contract changes |
| `lifeboard.weather.caiyunToken` | Weather | Raw credential | Treated as provider secret | Never export |
| `lifeboard.weather.amapKey` | Weather | Raw credential | Treated as provider secret | Never export |
| `lifeboard.weather.autoLocationOnHome` | Weather / Home preference | Raw boolean string | Validated by owner | Decide explicitly; currently excluded |
| `lifeboard.todos` | Todos | Version 1 `{ tasks, countdowns }` envelope | Strict validation; write blocking is incomplete | Exported |
| `lifeboard.bookmarks` | Bookmarks | Version 1 bookmark envelope | Strict validation; writes blocked after invalid load | Exported |

`__lifeboard_weather_runtime_debug` is a developer-only debug flag, not product data and never exportable. No `sessionStorage` persistence was found. The audit inspected code definitions only and did not read user data.

## 8. Data Ownership Matrix

| Data class | Canonical owner | Consumers | Backup | Clear-all | Future rule |
| --- | --- | --- | --- | --- | --- |
| Theme | Theme store | App shell, Settings | Yes | Yes | Registry-owned preference |
| Language | Language store | Entire UI, Settings | No | No | Stage 40 must classify consistently |
| Weather location/favorites | Weather | Weather, Home, Settings | Yes | Yes | Keep frozen adapter and export DTO |
| Weather cache | Weather | Weather | No | Weather clear / transaction snapshot | Transient, never portable |
| Weather provider/secrets | Weather | Weather, Settings data sources | No | Owned transaction list | Secrets never portable |
| Tasks/countdowns | Todos | Todos, Home, Settings/export | Yes | Yes | Versioned domain adapter and export DTO |
| Bookmarks | Bookmarks | Bookmarks, Home, Settings/export | Yes | Yes | Versioned domain adapter and export DTO |
| Tool input | Tools | Tools only | No | Not applicable | Explicitly ephemeral |
| Future Calendar/Notes/Habits | Future module owner | Home, Settings, command/search layers | Must be decided before implementation | Must register | No module ships without ownership metadata |

## 9. Current Architecture Strengths

- Routes are lazy-loaded, centralized, typed, and layout-aware.
- Feature modules have recognizable page/component/store/service/type boundaries.
- Shared layout and UI primitives already exist; visual consistency is frozen and tested.
- TypeScript, typed i18n parity checks, and explicit domain validators catch common contract errors.
- Backup import already has size limits, strict validation, confirmation, and rollback behavior.
- Local-first privacy is clear: no account is required and tool input remains transient.
- Route QA covers semantics, focus, overflow, console errors, reduced motion, and module smoke behavior across 29 route-viewports.
- CI has a reproducible lockfile, Chromium install, build, QA, JSON summary, and artifact path.
- The Vue/Pinia/Router/Vite/Tailwind stack, `@` alias, strict TypeScript checks, and browser-native file generation are sufficient for the near-term roadmap without a new large dependency.

## 10. Current Architecture Constraints

- Persistence ownership is encoded in scattered constants and hard-coded Settings lists. Adding a module requires coordinated edits without a registry enforcing completeness.
- Backup schema evolution is a top-level v1/v2 union, not a module migration system.
- Corrupt-data write behavior differs between Todos and Bookmarks; unsupported stored data can be overwritten after later Todos actions.
- "All LifeBoard data" currently omits language, while backup/clear descriptions enumerate only a subset. The policy needs an explicit, testable definition.
- Home directly imports multiple domain stores and module types; each new dashboard summary increases coupling.
- Route definitions, navigation items, i18n catalogs, and QA route arrays are separate extension points. This is manageable today but requires an onboarding checklist.
- i18n keys and locale files are large, compile-time-safe files; growth is predictable but increasingly manual.
- Several large components remain, but frozen visual/Weather boundaries make size alone non-blocking.
- There is no unit-test runner for validators, migrations, import transactions, date semantics, or export fixtures. Browser QA is intentionally smoke-level.
- The 500 kB chunk warning is real but does not demonstrate a user-facing regression; splitting it now would violate the freeze scope.

## 11. Candidate Roadmap Audit

**A. Data portability foundation:** Select for Stage 40, beginning with architecture and contract rather than UI. The usable v2 backup is evidence that the direction works, but registry coverage, export classifications, migration rules, import semantics, rollback guarantees, and fixtures are not unified. Weather cache and credentials must remain excluded.

**B. Calendar:** First new productivity module after portability. Existing task due dates and countdowns provide immediate read-only aggregation value. Start with a product/data specification and reuse a shared date-only contract; do not begin with full event CRUD or copy Todo date code.

**C. Notes:** Follow Calendar. A plain textarea/Markdown MVP is sufficient and avoids an editor dependency. Autosave, search, export, and future sync semantics still require the portability contract.

**D. Habits:** Follow Calendar and Notes. Recurrence, streaks, timezone boundaries, missed days, and rollover make it the highest-risk local productivity model.

**E. Command palette / shortcuts:** Build a command registry first, after routes and initial new modules stabilize. Then add `Ctrl+K`, navigation, quick create, focus management, conflict handling, and a mobile alternative. Global search is a later registry consumer, not part of the first palette slice.

**F. Analytics:** Defer until Calendar/Notes/Habits produce enough stable data. Keep analytics local-only unless telemetry receives a separate privacy decision.

**G. Backend / account / sync:** Do not start now. Trigger only after local schemas, identifiers, timestamps, migrations, export/import, conflict policy, and offline ownership are stable, and after validated user demand justifies operational/security cost.

## 12. Architecture Risk Register

Probability and impact use Low / Medium / High. Blocking means the risk must be resolved before the affected capability, not that the current product is blocked.

| ID | Description | Probability | Impact | Evidence | Mitigation | Earliest stage | Blocking / non-blocking |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AR-01 | LocalStorage key fragmentation | High | High | Keys and ownership lists are distributed across stores/services/Settings | Persistence registry and ownership classifications | 40-41 | Blocking for new persisted modules |
| AR-02 | Inconsistent schema versioning | High | High | Raw values and module v1 envelopes coexist | Define app/module schema metadata | 40-41 | Blocking |
| AR-03 | No module migration framework | High | High | Backup supports v1/v2 directly; module stores lack migration registry | Forward migration contract and fixtures | 40-41 | Blocking |
| AR-04 | Import validation drift | Medium | High | Current validation is strict but manually mirrors domain schemas | Contract-owned validators and compatibility fixtures | 40-43 | Blocking for schema expansion |
| AR-05 | Cross-module export inconsistency | High | Medium | Backup, clear, transaction, and portable exports use different lists | Exportable/non-exportable classification in one registry | 40-42 | Blocking |
| AR-06 | Date/timezone errors | Medium | High | Todos uses local date-only utilities; Habits/Calendar add rollover/recurrence | Shared date semantics before Calendar CRUD | 40, 46 | Blocking for Calendar/Habits |
| AR-07 | Home store coupling growth | High | Medium | `useHomeDashboard` imports three domain stores directly | Read-model/adaptor contract with bounded summaries | 46-48 | Non-blocking now |
| AR-08 | Route/nav registry drift | Medium | Medium | Routes/meta and navigation/QA arrays are separate | New-module integration checklist; registry only if drift occurs | 40, then per module | Non-blocking |
| AR-09 | i18n key growth | High | Low | Large typed key arrays and two large locale catalogs | Module-owned key groups and parity checks | Per module | Non-blocking |
| AR-10 | Large component growth | Medium | Medium | Landing, Weather runtime, and Settings workspace are large | Split only when active feature work needs the boundary | Per feature | Non-blocking |
| AR-11 | Backend incompatibility | Medium | High | Local models lack explicit sync/conflict contracts | Stable IDs/timestamps/migrations/export DTOs before backend | 40-48 | Non-blocking until backend trigger |
| AR-12 | File import security/resource abuse | Low | High | 1 MB limit and strict JSON validation exist; richer formats are untested | Preserve limits; reject unknown fields; no executable content | 40-43 | Blocking for import changes |
| AR-13 | Corrupt user data overwrite | Medium | High | Todos does not block writes after invalid load; Bookmarks does | Uniform fail-closed/recovery contract | 40-41 | Blocking for persistence expansion |
| AR-14 | Destructive import surprise | Medium | High | Current import replaces selected local data | Explicit replace decision, preview, confirmation, rollback | 40-43 | Blocking |
| AR-15 | Dependency expansion | Medium | Medium | No schema/date/editor library is present | Approve dependencies only from measured domain need | Per feature | Non-blocking |
| AR-16 | Bundle growth | Medium | Medium | Existing `lib` chunk is 513.51 kB minified | Measure route load/runtime before targeted split | Deferred Phase E | Non-blocking |
| AR-17 | QA matrix growth | High | Medium | Route arrays are manual; two Weather subroutes are not direct QA entries | Add route/fixture checklist with every module | 41 onward | Blocking per new route |
| AR-18 | Weather freeze contamination | Medium | High | Weather owns many services/keys and appears in Home/Settings/QA | Adapter-only classification; no Weather internal edits | All stages | Blocking boundary |

## 13. Prioritization Matrix

Scores are 1-5. Value, urgency, foundation, risk reduction, backend compatibility, and testability reward higher values. Complexity and regression risk are costs, so lower is preferable. Ranking uses dependency gates first, then benefit-to-cost judgment; it is not an opaque summed score.

| Rank | Candidate | User | Urgency | Foundation | Risk reduction | Complexity | Regression | Backend | Testability | Decision |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | Data portability foundation | 4 | 5 | 5 | 5 | 3 | 3 | 5 | 5 | Stage 40-45 foundation |
| 2 | Todo/Bookmark CSV + Markdown export | 3 | 2 | 3 | 3 | 2 | 2 | 3 | 5 | Already built; contract/test closeout in Stage 44 |
| 3 | Calendar | 5 | 3 | 4 | 3 | 4 | 4 | 4 | 4 | First new product module, Stage 46-48 |
| 4 | Notes | 4 | 2 | 3 | 2 | 3 | 3 | 4 | 4 | After Calendar; textarea/Markdown MVP |
| 5 | Dark-mode screenshot QA | 2 | 2 | 2 | 3 | 2 | 1 | 1 | 5 | Deferred quality slice |
| 6 | Axe | 3 | 2 | 3 | 4 | 2 | 2 | 2 | 4 | Separate report-first evaluation |
| 7 | Command palette / shortcuts | 4 | 1 | 3 | 1 | 3 | 3 | 3 | 4 | After routes/modules stabilize |
| 8 | Habits | 4 | 2 | 3 | 2 | 5 | 5 | 4 | 3 | After shared date semantics mature |
| 9 | Pixel diff | 2 | 1 | 2 | 2 | 3 | 2 | 1 | 3 | Only after baseline maintenance value is proven |
| 10 | Vite chunk split | 2 | 1 | 2 | 2 | 3 | 3 | 2 | 3 | Only with measured loading/runtime evidence |
| 11 | Analytics | 2 | 1 | 1 | 1 | 3 | 2 | 2 | 4 | Wait for meaningful stable data |
| 12 | Backend/account/sync | 4 | 1 | 5 | 4 | 5 | 5 | 5 | 2 | Trigger-based, not near-term |
| - | Weather visual work | 3 | 1 | 1 | 1 | 5 | 5 | 1 | 2 | **Frozen / not eligible** |

## 14. Recommended Product Direction

LifeBoard should remain a calm, local-first personal command center: one workspace for daily planning, context, private utilities, and user-owned data. Near-term differentiation should come from dependable continuity across Todos, Calendar, Notes, and later Habits, not from more decorative surfaces or a premature account system. Portability is a product feature because it makes local-first trustworthy.

## 15. Recommended Architecture Direction

- Keep the existing incremental feature-module structure; do not perform a repository-wide architecture migration.
- Introduce a small shared persistence contract: owner, key, schema version, validator, migration, portability class, clear policy, and recovery behavior.
- Keep domain models and persistence adapters inside their owning modules. Settings should consume registered contracts rather than know every storage key.
- Define export DTOs separately from runtime caches and credentials. A backup is not a raw LocalStorage dump.
- Add unit-level fixtures alongside portability implementation, then extend route QA when UI or routes are added.
- Add a bounded Home read-model interface before Calendar integration expands direct store imports.
- Treat Weather as an existing adapter with frozen internals; no key migration or runtime rewrite is part of this direction.

## 16. Phase Roadmap

**Phase A - Data safety and portability (Stages 40-45):** inventory ownership, define registry/schema/migration/recovery contracts, harden the existing JSON backup/restore path, align existing CSV/Markdown exports, and close with fixtures plus regression QA.

**Phase B - Productivity expansion (Stages 46+):** Calendar first because it can aggregate existing due dates/countdowns. Notes follows with a simple local Markdown-capable model. Habits follows only after date/rollover semantics are proven.

**Phase C - Cross-module interaction:** establish a command registry, then add `Ctrl+K`, quick create, and eventually global search. Extend Home through bounded read models rather than unbounded direct imports.

**Phase D - Architecture/backend readiness:** consider repository adapters, API contracts, accounts, synchronization, and conflict resolution only after local schemas and migrations are stable and user demand is validated.

**Phase E - Deferred quality/performance:** separately evaluate axe, dark-mode screenshots, pixel diff, CI screenshot artifacts, and measured Vite chunk splitting. None is bundled into feature stages by default.

**Weather lane:** regression-only. No material analysis, animation expansion, runtime rewrite, asset replacement, store/service change, or visual work. Reopening requires explicit user authorization after the main roadmap.

## 17. Stage 40 Decision

The single recommendation is **Stage 40: Data Portability Architecture Audit and Contract**.

Stage 40 must define all persistent keys, exportability, privacy exclusions, backup schema/metadata, schema versions, validators, replace-versus-merge policy, transaction/rollback guarantees, corrupt-data recovery, filenames, fixtures, and implementation slices for Stage 41+. It is a specification stage, not a complete import UI implementation.

It is not Calendar, Notes, or Habits because each would add another schema before ownership and migration rules are stable. It is not a command palette because route/product commands are still expanding. It is not backend work because local conflict and migration contracts are not ready. It is not continued UI work because visual baselines are frozen. It is not Weather because Weather is regression-only.

## 18. Stage 40-48 Sequence

| Stage | Goal | Allowed scope | Explicit non-goals | Dependencies | Main risks | Required QA | Commit type | Exit criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 40 - Data Portability Architecture Audit and Contract | Approve ownership, schema, privacy, import, rollback, and fixture contracts | Docs and read-only audit | No persistence/UI implementation; no Weather edits | Stage 39 | Incomplete classification | Build + current route QA | `docs(architecture)` | One approved contract and Stage 41 backlog |
| 41 - Persistence Registry / Schema Version Foundation | Implement minimal registry, version, migration, and fail-closed recovery base | Shared contract plus module adapters; targeted tests | No key migration for convenience; no visual changes | Stage 40 | Data loss, over-abstraction | Unit fixtures, build, route QA | `refactor(persistence)` | Existing data loads unchanged; invalid data cannot be silently overwritten |
| 42 - JSON Backup Export Hardening | Drive current JSON export from approved classifications and metadata | Existing Settings export path | No new editor/module; no secrets/cache | Stage 41 | Missing/extra fields | Golden fixtures + download smoke | `feat(data)` | Deterministic valid export covers every approved class |
| 43 - Validated JSON Import and Rollback Hardening | Align current import with migration, validation, preview, replace, and rollback contract | Existing import path and fixtures | No merge unless Stage 40 explicitly approves it | Stages 41-42 | Destructive import, partial restore | Valid/invalid/version/rollback integration cases | `feat(data)` | Atomic restore and clear failure recovery proven |
| 44 - Portable Export Contract Closeout | Align existing Todos/Bookmarks CSV/Markdown and summary exports | Existing generators, fixtures, labels | Do not rebuild existing feature or add formats | Stages 41-43 | Encoding/escaping drift | Golden CSV/Markdown fixtures | `test(data)` or `fix(data)` | Existing exports are deterministic and documented |
| 45 - Data Portability Closeout and QA | Close Phase A and document support matrix | Focused QA/docs and defects only | No new productivity module | Stages 41-44 | Untested browser/storage edge cases | Build, unit/integration, route QA, manual import/export | `docs(data)` | No open portability P0/P1; support matrix frozen |
| 46 - Calendar Product / Architecture Spec | Define read-only aggregation, event model boundary, date semantics, route/Home integration | Docs, prototypes only if explicitly approved | No full CRUD; no Weather changes | Stage 45 | Duplicated date logic, timezone ambiguity | Fixture/test plan | `docs(calendar)` | One MVP definition and approved domain contract |
| 47 - Calendar MVP | Deliver approved smallest Calendar slice | Prefer read-only task/countdown aggregation; CRUD only if Stage 46 approves | No Notes/Habits/command palette | Stage 46 | Mobile density, date errors | Unit date cases, route QA, screenshots | `feat(calendar)` | Core Calendar task passes with no frozen-route regression |
| 48 - Calendar Integration / Closeout | Integrate bounded Home/nav/i18n/data portability surfaces | Calendar-owned integration and QA | No broad Home redesign; no Weather internals | Stage 47 | Home coupling, backup omission | Full build/route/screenshot/data QA | `feat(calendar)` or `docs(calendar)` | Calendar is portable, accessible, responsive, and documented |

After Stage 48, plan Notes, then Habits. Place command registry/palette after the first new module routes are stable; place global search after searchable domain contracts exist.

## 19. QA Strategy for New Modules

- Stage 40 should specify fixtures and acceptance criteria; Stage 41 should add the smallest unit-test capability required for validators/migrations if no existing script can express them.
- Every persisted module needs valid, legacy, malformed JSON, unsupported version, quota/write failure, and rollback fixtures before release.
- Every new route must join route QA at mobile/tablet/desktop, include a route-specific keyboard smoke check, and update expected route-viewports deliberately.
- Data portability needs browser integration cases for preview, confirmation, replace semantics, transaction failure, rollback, download filename, UTF-8/CSV escaping, and privacy exclusions.
- Screenshot QA remains evidence capture. Dark mode, axe, and pixel diff stay separate until approved.
- Weather remains seeded, deterministic regression coverage; new tests must not depend on live providers.

## 20. Weather Freeze Boundary

Weather remains frozen and regression-only across all phases. Allowed changes are only proven build, crash, data-loss, overflow, accessibility, asset-path, cleanup, or fallback regressions. The roadmap does not modify Weather store/services/cache/runtime/PixiJS/assets, migrate its keys, add scenes, expand motion, analyze Xiaomi Weather material, or use Weather as a vehicle for architecture cleanup.

## 21. Deferred Items

- Notes, Habits, command palette, global search, analytics, backend/accounts/sync: deferred behind their dependency gates.
- Axe, dark-mode screenshot matrix, pixel diff, CI screenshot artifacts: separate QA decisions.
- Vite chunk splitting: wait for route-level performance evidence.
- Large frozen components and broad i18n reorganization: debt, not current blockers.
- Further non-Weather polish and all Weather visual work: frozen.

## 22. Validation Results

- `npm run build`: PASS. Vite 8.0.16 built 1,126 modules; the known `lib` chunk warning (513.51 kB minified) remains non-blocking.
- `npm run qa:a11y:routes:ci`: PASS, 29/29 route-viewports, zero console errors.
- `npm run qa:screenshots:ci`: PASS, 29/29 screenshots.
- `npm run qa`: PASS; it repeated build plus local route QA at 29/29.
- `.qa` remained ignored and uncommitted.
- No preview/QA Node process remained after validation.
- No source, Weather, package, workflow, or QA script file changed.

## 23. Known Limitations

- This is a repository audit, not user research; candidate value should be revalidated before major product investment.
- Browser QA is smoke-level and does not prove full import/export, accessibility-rule, visual-diff, or dark-mode coverage.
- Route QA directly covers 9 routes; Weather city management and 15-day routes are not standalone matrix entries.
- The product brief still describes Open-Meteo as the only external service, while current source/README also document optional AMap/Caiyun paths. This non-blocking documentation drift was recorded rather than expanding Stage 39's diff.
- The roadmap names implementation stages, but each stage still requires a separate explicit authorization and baseline check.

## 24. Final Recommendation

Freeze the current product and visual baselines, then begin only **Stage 40: Data Portability Architecture Audit and Contract**. Do not add Calendar, Notes, Habits, command UI, backend, or more Weather work until the ownership/version/migration/import/rollback contract is approved. After Phase A closes, proceed with Calendar as the first new product module, using the frozen QA baselines as regression contracts.
