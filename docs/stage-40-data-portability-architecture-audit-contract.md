# Stage 40: Data Portability Architecture Audit and Contract

## 1. Baseline

- Audit date: 2026-07-10.
- Branch: `main`.
- Starting HEAD and `origin/main`: `17337cda28d3c768b8e633b4a72c2c273236d992` (`docs(roadmap): plan post-freeze product architecture`).
- Starting worktree: clean; local and remote histories were synchronized.
- Stage 38 (`4796b5e`) and Stage 39 (`17337cd`) are ancestors of HEAD.
- Freeze tag `non-weather-visual-freeze-stage-37` still points to `b59018d47f0d90c54c020ceb545db73f4ac84532`.
- Remote: `https://github.com/HuanHren/LifeBoard.git`; no plaintext credential was present.
- Validation: `npm run build` passed; `npm run qa:a11y:routes:ci` passed 29/29 with zero console errors; `npm run qa:screenshots:ci` passed 29/29; `npm run qa` passed.
- `.qa` remained ignored, no preview/QA process remained, and the existing 513.51 kB `lib` chunk warning remained non-blocking.

## 2. Skill Gate Summary

The following skill files were verified and read in full:

- `impeccable/SKILL.md`
- `gpt-taste/SKILL.md`
- `redesign-existing-projects/SKILL.md`
- `baseline-ui/SKILL.md`
- `vue-best-practices/SKILL.md`
- `fixing-accessibility/SKILL.md`
- `fixing-motion-performance/SKILL.md`
- `playwright-cli/SKILL.md`

Additional references read: Impeccable product, audit, harden, and critique; Vue reactivity, SFC, component data flow, composables, and state management; Playwright running code and Playwright tests. The project-local Impeccable context script at `.agents/skills/impeccable/scripts/context.mjs` is not present; `PRODUCT.md` and `DESIGN.md` were read directly.

## 3. Scope

Stage 40 is a read-only architecture audit plus an implementation contract. It defines ownership, portability, schema, migration, validation, import, transaction, clear/reset, security, privacy, errors, tests, ADRs, and Stages 41-45. It does not change source, storage keys, schemas, UI, packages, workflows, QA scripts, or Weather behavior.

Normative terms in this document use **MUST**, **MUST NOT**, **SHOULD**, and **MAY**. Stage 41 and later require separate authorization.

## 4. Existing Implementation Inventory

| Area | Current implementation | Assessment |
| --- | --- | --- |
| Theme | Raw validated enum in `lifeboard-theme` | Stable but unversioned |
| Language | Raw validated locale in `lifeboard.language` | Stable; omitted from data-management ownership |
| Todos / Countdowns | Version 1 envelope with domain validation | Stable; no migration or duplicate-ID validation |
| Bookmarks | Version 1 envelope with strict domain validation | Stable; writes fail closed after corrupt load |
| Weather location | Raw validated JSON | Portable today; invalid data is removed by Weather initialization |
| Weather favorites | Strict version 1 envelope | Portable today |
| Weather forecast cache | Version 1 rebuildable snapshot | Transient; invalid cache is cleared |
| Provider / credentials / Home location preference | Raw values in Weather-owned services | Device-local or secret; not portable |
| JSON export/import | Settings backup root versions 1 and 2 | Usable, strict, hard-coded, partial |
| Transaction | In-memory raw LocalStorage snapshot and immediate rollback | Good base; no write read-back verification |
| Clear actions | Weather, Todos, Bookmarks, and all | Hard-coded; "all" omits Language |
| CSV/Markdown | Todos, Countdowns, Bookmarks, and summary | Human-readable exports; no restore contract |
| Home | Reads Weather, Todos, and Bookmarks stores | No direct persistence |
| Tools | Component/composable memory only | No persistence or backup ownership |

There is no `sessionStorage` use and no dynamic LocalStorage key generation. AQI, geocoding search results, long-range forecasts, loading/error states, active filters, selected tool, and dashboard summaries are memory-only or derived.

## 5. Full Storage Key Inventory

There are **11 product LocalStorage keys** and **1 developer-only debug flag**.

| Exact key | Owner / source | Category | Current schema | Portable decision | Current backup | Current all-clear | Validation / migration | Recovery / sensitivity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `lifeboard-theme` | Theme, `src/stores/theme.ts` | Preference | Raw `system\|light\|dark` | Yes | Yes | Yes | Enum / none | Invalid value ignored; public |
| `lifeboard.language` | Language, `src/stores/language.ts` | Preference | Raw `zh-CN\|en-US` | **Yes** | **No** | **No** | Enum / none | Invalid value ignored; public |
| `lifeboard-weather-location` | Weather store/constants | Preference | Raw `WeatherLocation` JSON | Yes | Yes | Yes | Shape validation / none | Invalid value removed; location-sensitive |
| `lifeboard.weather.forecastCache.v1` | Weather forecast cache | Rebuildable cache | Version 1 forecast snapshot | No | No | Yes | Version/shape partial / none | Invalid value removed; API-derived |
| `lifeboard-weather-favorite-cities` | Weather favorites | Durable saved data | Version 1 envelope | Yes | Yes | Yes | Strict shape / none | Invalid value retained with error; location-sensitive |
| `lifeboard.weather.provider` | Weather provider | Device-local preference | Raw `openMeteo\|caiyun` | Conditional; excluded from format v1 | No | Yes | Enum / none | Invalid value reports error; public |
| `lifeboard.weather.caiyunToken` | Weather provider | Secret | Raw trimmed token | No | No | Yes | Non-empty only / none | Retained on read failure; credential |
| `lifeboard.weather.amapKey` | Weather AMap | Secret | Raw trimmed API key | No | No | Yes | Non-empty only / none | Retained on read failure; credential |
| `lifeboard.weather.autoLocationOnHome` | Weather/Home | Device-local preference | Raw `true\|false` string | No | No | Yes | Partial (`true` else false) / none | Device/privacy preference |
| `lifeboard.todos` | Todos | Durable user data | Version 1 `{tasks,countdowns}` | Yes | Yes | Yes | Domain shape / none | Corrupt value retained, but later writes are not blocked |
| `lifeboard.bookmarks` | Bookmarks | Durable user data | Version 1 `{bookmarks}` | Yes | Yes | Yes | Domain shape / none | Corrupt value retained and writes blocked |
| `__lifeboard_weather_runtime_debug` | Weather Pixi debug | Developer runtime flag | Raw `'1'` | No | No | No | Exact enable value / none | Developer-only; outside product registry |

The proposed product registry MUST cover all 11 product keys. The developer debug flag remains documented but MUST NOT become portable, syncable, or part of product clear/reset behavior. There are no dynamic key rules to register.

## 6. Data Ownership Classification

Each existing key maps to one primary category:

| Category | Existing data | Contract |
| --- | --- | --- |
| A. User-created durable data | Todos, Countdowns, Bookmarks, saved favorite cities | Portable by default; versioned, validated, migratable, rollback-protected |
| B. User preferences | Theme, Language, selected Weather location | Portable unless explicitly device-local |
| B2. Device-local preferences | Provider choice, Home auto-location | Excluded from format v1; portability requires a later explicit decision |
| B3. Secrets | Caiyun token, AMap key | Never portable; factory-reset clearable |
| C. Rebuildable caches | Weather forecast cache; in-memory AQI/geocoding/long-range caches | Never portable; clearable and rebuilt after restore |
| D. Ephemeral runtime state | Filters, form input, loading/error states, selected tool, QA seed, Pixi debug/runtime | Never portable and never part of durable schema |
| E. Derived data | Counts, completion statistics, Home summaries | Never portable; recompute from canonical data |

Bookmark categories are fields of Bookmark records, not an independent storage owner. They travel with Bookmarks.

## 7. Exportable / Non-Exportable Matrix

| Data | Decision for portable backup format v1 | Reason |
| --- | --- | --- |
| Theme | Export | Explicit user preference, safe across devices |
| Language | **Export** | Explicit user preference; current omission is accidental |
| Todos, including completed and soft-deleted tasks | Export | Complete machine-restorable history |
| Countdowns | Export | User-created durable data |
| Bookmarks and categories/pin state | Export | User-created durable data |
| Selected Weather location | Export | Explicitly saved user preference |
| Favorite Weather cities | Export | Explicitly saved durable data |
| Weather provider | Conditional; **exclude in v1** | Restoring `caiyun` without its secret would create an unusable configuration |
| Home auto-location preference | Exclude | Device permission/privacy context is not portable |
| Caiyun token and AMap key | Exclude | Credentials MUST NOT enter backup files |
| Forecast/AQI/geocoding/long-range cache | Exclude | Rebuildable API data, not user data |
| Tool input, active filters/tabs/search | Exclude | Ephemeral runtime state |
| Dashboard summaries/statistics | Exclude | Derived data |
| QA seed, logs, debug state, paths, build metadata | Exclude | Test/runtime metadata and possible privacy leakage |

Future unit preferences MAY be portable if they become explicit user settings. Recent searches, selected tools, panel expansion, diagnostics, and similar convenience state remain excluded unless a product decision changes their ownership.

## 8. Existing Backup Behavior

The current exporter creates root `version: 2` with `exportedAt`, `preferences.themeMode`, Weather selected location/favorites, Todos envelope, and Bookmarks envelope. It uses current in-memory store state, pretty JSON, `application/json`, and filename `lifeboard-backup-YYYY-MM-DD.json`.

Current export does not include a format discriminator, root `schemaVersion`, application version, locale/Language, provider preference, credentials, Home auto-location, cache, or a module ownership manifest. Root versions 1 and 2 are accepted; version 1 omits Weather favorites. All modules are required and unknown root/module fields are rejected.

## 9. Existing Import Behavior

- File size is rejected above 1 MiB; the browser reads text and parses JSON.
- Root versions 1 and 2 are validated before a preview is shown.
- Preview shows export time, theme, Weather city, and item counts; it does not show Language, favorite-city count, exclusions, or schema migration.
- Import is **replace for the represented portable subset**, not merge. It writes theme, selected location, favorites, Todos, and Bookmarks. Non-portable provider/credential/cache preferences remain untouched.
- It does not clear all data first and does not reload the page.
- User confirmation is required. Cancel closes the dialog without writes; the selected pending backup remains until explicitly discarded.
- A raw LocalStorage snapshot is captured before writes. Any thrown write failure attempts immediate rollback. Store memory is synchronized only after successful storage writes.
- There is no staging key, read-back verification, duplicate-ID detection, generalized migration pipeline, or persistent crash journal.

Version 1 handling is an inline compatibility branch that restores an empty favorites list. It is not a reusable migration abstraction.

## 10. Existing Clear / Reset Behavior

Selective clear removes Weather saved location/cache/favorites, Todos, or Bookmarks. Current `all` additionally removes Theme, provider, Caiyun token, AMap key, and Home auto-location. It does **not** remove Language or the developer debug flag.

The UI describes `all` as all LifeBoard data, but `hasAnyData` does not consider Language. If Language is the only non-default stored value, the all-clear action can be disabled. This is a confirmed coverage mismatch.

Current `all` is closer to factory reset than content clear because it removes preferences, secrets, and cache. The contract therefore distinguishes these operations instead of treating backup coverage and clear coverage as identical sets.

## 11. Current Inconsistencies

1. Storage ownership is duplicated across module constants, `OWNED_STORAGE_KEYS`, snapshot builders, clear code, backup types, and UI status logic.
2. Language is owned and persisted but absent from backup, transaction snapshots, all-clear, status, and store synchronization.
3. Current root backup `version` mixes format evolution with domain envelope versions and has no format discriminator.
4. Todos and Bookmarks have different corrupt-data write behavior; Todos may overwrite an unsupported/corrupt stored value on the next action.
5. Validation does not reject duplicate IDs or bound collection counts/depth; several object validators allow unknown fields.
6. Import rollback has no write read-back verification and no generalized migration pipeline.
7. Snapshot coverage includes untouched Weather cache/secrets while omitting Language.
8. JSON backup, clear-all, portable exports, and summaries each maintain separate coverage logic.
9. CSV does not neutralize spreadsheet formulas. Markdown does not fully neutralize raw HTML or all structural characters.
10. Human-readable exports currently receive all task records, including soft-deleted tasks, without an explicit trash policy.

## 12. Backup JSON Schema Contract

Portable backup format v1 MUST use this root shape. This is valid JSON and represents an empty dataset:

```json
{
  "format": "lifeboard-backup",
  "schemaVersion": 1,
  "exportedAt": "2026-07-10T12:00:00.000Z",
  "app": {
    "name": "LifeBoard",
    "version": "0.0.0"
  },
  "locale": "zh-CN",
  "data": {
    "settings": {
      "schemaVersion": 1,
      "themeMode": "system",
      "language": "zh-CN"
    },
    "weather": {
      "schemaVersion": 1,
      "selectedLocation": null,
      "favoriteCities": []
    },
    "todos": {
      "schemaVersion": 1,
      "tasks": [],
      "countdowns": []
    },
    "bookmarks": {
      "schemaVersion": 1,
      "bookmarks": []
    }
  }
}
```

Contract details:

- Root required keys: `format`, `schemaVersion`, `exportedAt`, `app`, `locale`, `data`.
- `format` MUST equal `lifeboard-backup`; `schemaVersion` MUST be a positive integer.
- `app.name` MUST equal `LifeBoard`. `app.version` is optional informational metadata and MUST NOT gate import. Current `0.0.0` is not a reliable release compatibility signal.
- `locale` records the export UI locale. In v1 it MUST equal `data.settings.language`.
- Required namespaces are `settings`, `weather`, `todos`, and `bookmarks`; partial backups are not accepted.
- Every namespace has an independent positive integer `schemaVersion`.
- Unknown root keys, namespaces, module fields, and record fields are fatal in v1. Additive module changes therefore require a module version increment.
- Empty modules use empty arrays; optional scalar values use explicit `null`. Required modules are never omitted.
- `exportedAt`, `createdAt`, `updatedAt`, `completedAt`, and `deletedAt` use canonical UTC ISO 8601 strings. Date-only values use valid `YYYY-MM-DD`.
- New durable record IDs SHOULD be UUIDs. Import requires non-empty strings of at most 128 characters and uniqueness within the owning collection; legacy non-UUID IDs remain valid.
- Array order is not semantic. The serializer SHOULD emit a deterministic order for readable diffs.
- Maximum file size remains 1 MiB. Writer encoding is UTF-8 without BOM, two-space indentation, and LF endings.
- Filename: `lifeboard-backup-v1-YYYY-MM-DD.json`.
- MIME type: `application/json;charset=utf-8`.

Runtime LocalStorage envelopes remain module-owned. The backup DTO MUST NOT be a raw LocalStorage dump.

## 13. Version Contract

- The new root format starts at `schemaVersion: 1`, independent of legacy root `version: 1|2`.
- Root version increments when root metadata, required namespaces, or cross-module semantics break compatibility.
- A module version increments whenever that module payload changes, including additive fields because v1 validation is strict.
- A module-only change MAY leave the root version unchanged if the namespace and root semantics remain stable.
- Versions are integers; semantic-version strings are not used for data schemas.
- Application version is informational only. Data compatibility is decided exclusively by format and schema versions.
- Future root or module versions are rejected with no writes and a message that a newer LifeBoard version is required.
- Downgrade migrations are not supported.

## 14. Migration Contract

Migration is forward-only from a recognized older format to the current format:

1. Identify the exact format/version using discriminators.
2. Run minimal structural and safety validation for that version.
3. Apply consecutive pure migrations in memory (`n -> n+1`).
4. Strictly validate the complete current schema and semantics.
5. Only then build an import preview and write plan.

Migrations MUST be deterministic, side-effect-free, and must not access LocalStorage, stores, DOM, network, time, or random values. An immutable migration context MAY provide the current Language only for legacy backups that never recorded it.

Explicit legacy adapters are required:

- Legacy root `version: 1`: validate the known exact shape, map Weather favorites to `[]`, and preserve the current Language through explicit migration context.
- Legacy root `version: 2`: validate the known exact shape, carry favorites, and preserve the current Language through explicit migration context.
- A file with no new `format/schemaVersion` and no recognized legacy `version` is rejected. There is no best-effort guessing.

Migration failure is fatal, produces no writes, and leaves current data unchanged. Multiple versions are migrated one consecutive step at a time so every step can have fixtures.

## 15. Validation Contract

Validation is layered:

1. **File:** extension/MIME advisory check, 1 MiB limit, non-empty bytes, fatal UTF-8 decoding, optional single UTF-8 BOM removal, JSON parse.
2. **Safe tree:** object/array/depth scan before domain access; reject `__proto__`, `constructor`, `prototype`, excessive depth, and unsafe object shapes.
3. **Root discriminator:** exact format/version or exact legacy adapter; reject future versions and unknown modules.
4. **Pre-migration schema:** validate the recognized source version sufficiently to migrate safely.
5. **Migration:** pure in-memory conversion.
6. **Current modules:** exact keys, types, enums, nullability, lengths, URL/date/timestamp/location rules.
7. **Semantics:** duplicate IDs, invalid relationships, collection bounds, coordinate ranges, and root/module consistency.

Required bounds for current format v1:

- Nesting depth: at most 32.
- Tasks: at most 10,000; Countdowns: 2,000; Bookmarks: 10,000; favorite cities: 500.
- Existing title/label/category/note/URL limits remain authoritative.
- IDs: 1-128 characters and unique per collection.
- Date-only values must be real calendar dates. Timestamps must normalize to the same canonical UTC ISO value.
- Bookmark URLs must be HTTP/HTTPS, include a hostname, contain no username/password, and remain within 2,048 characters.
- Latitude is `[-90, 90]`; longitude is `[-180, 180]`; all numbers must be finite.

Known incompatible MIME types are fatal. Empty/unknown MIME is allowed only for a `.json` filename because browser MIME reporting is unreliable.

Validation severity:

- **Fatal:** file cannot produce a safe complete replacement; import stops.
- **Recoverable:** operation failed but current data was preserved or rollback succeeded; user may retry.
- **Warning:** import can proceed without data loss, such as informational app-version mismatch. Warnings appear in preview.

## 16. Replace / Merge Decision

**Decision: Stage 43 supports Replace with rollback snapshot only. Merge is deferred.**

Replace means all portable namespaces are replaced together: Theme, Language, selected/favorite Weather locations, Todos/Countdowns, and Bookmarks. Excluded provider preferences, credentials, device-local auto-location, cache, and runtime state are preserved.

Preview MUST show source format/version, export time, Theme, Language, Weather city/favorite count, task/countdown/bookmark counts, warnings, the exact replacement scope, and the fact that credentials/cache remain untouched. Confirmation copy MUST say that existing portable data will be replaced and rollback will be attempted on failure.

Merge is deferred because there is no approved policy for ID collisions, timestamps, soft-deleted tasks, preference conflicts, category normalization, or cross-device ordering. It MUST NOT be inferred from current code.

## 17. Transaction / Rollback Contract

LocalStorage has no native transaction. Stage 43 MUST emulate one with this synchronous flow:

1. Read and validate file, migrate, validate again, and build preview without writes.
2. After confirmation, serialize and validate every target value in memory.
3. Capture raw pre-import values and key presence for the exact registry write set.
4. Write portable keys in deterministic registry order without mutating Pinia stores.
5. Read back every written/removed key, compare serialized values, and revalidate.
6. On success, hydrate stores from the committed canonical model and discard the in-memory snapshot.
7. On write/verify failure, restore raw values in reverse order and verify restoration.
8. Hydrate stores only from the verified final storage state. If hydration fails after commit, perform one controlled reload.

The snapshot is memory-only, contains raw values only for affected keys, and is discarded after commit or rollback. No staging or rollback key is persisted because LocalStorage writes are synchronous and a persistent journal would duplicate sensitive/local data. A browser/process crash inside the short synchronous write window is an accepted v1 limitation; a durable journal requires separate evidence and design.

Failure classes are distinct:

- **Validation failure:** no snapshot and no writes.
- **Snapshot failure:** no writes.
- **Write/verification/quota failure:** rollback immediately; if rollback verifies, report recoverable failure.
- **Rollback failure:** fatal, do not claim recovery, do not hydrate from the intended import model, and instruct the user to reload and use a known backup.

Current user data MUST never be logged or included in error details. No automatic backup download or new recovery UI is required in Stage 43.

## 18. Registry Contract

Stage 41 MUST establish one product persistence registry as the source for backup read/export, import write/restore, clear/factory reset, portable summaries, schema migration, and future sync classification.

Each entry MUST declare:

```ts
interface PersistenceRegistryEntry<TStored, TPortable> {
  id: string
  owner: string
  storageKey: string
  category: 'durable' | 'preference' | 'device-preference' | 'secret' | 'cache'
  sensitivity: 'public' | 'location' | 'secret'
  portable: boolean
  clearOnContentClear: boolean
  clearOnFactoryReset: boolean
  schemaVersion: number | null
  exportNamespace: 'settings' | 'weather' | 'todos' | 'bookmarks' | null
  read(storage: Storage): RegistryResult<TStored | null>
  validate(value: unknown): ValidationResult<TStored>
  migrate(value: unknown, context: MigrationContext): MigrationResult<TStored>
  toPortable(value: TStored | null, context: ExportContext): TPortable
  serialize(value: TStored | null): string | null
  write(storage: Storage, serialized: string | null): void
  clear(storage: Storage): void
  summarize(value: TStored | null): PortableSummary
}
```

The registry MUST enforce unique `id`, unique `storageKey`, complete product-key coverage, deterministic order, and explicit portable/clear policies. Portable and clearable are independent flags. Module adapters remain in their owner modules; the shared coordinator consumes descriptors and MUST NOT absorb domain logic.

The Weather debug flag is an audited developer exception outside the product registry. Stage 41 MUST NOT modify Weather runtime or persistence keys to register it.

## 19. Clear-All / Factory-Reset Contract

The registry defines two distinct operations:

- **Clear user content:** removes durable user-created data and explicitly saved locations/favorites; preserves Theme, Language, provider/device preferences, credentials, and caches unless a targeted clear says otherwise.
- **Factory reset:** removes every product key marked `clearOnFactoryReset`, including Theme, Language, provider/device preferences, credentials, cache, Todos, Bookmarks, and Weather saved locations/favorites. It does not call `localStorage.clear()` and never removes unrelated-origin keys or the developer debug flag.

The current UI's "clear all LifeBoard data" is contractually a factory reset and must eventually include Language. Selective Weather/Todos/Bookmarks clear remains available. A new global content-only UI action is not required by this contract.

Stage 41 defines flags without changing behavior. Stage 45 aligns implementation, store synchronization, UI copy, `hasAnyData`, and QA with the registry.

## 20. CSV / Markdown Export Contract

JSON backup is the complete machine-restorable format. CSV and Markdown are human-readable external-use formats and MUST NOT promise round-trip restore.

Stage 44 preserves the existing export families and closes these contracts:

- CSV uses UTF-8 BOM, comma delimiter, CRLF, stable English machine headers, stable column order, ISO/date-only values, lowercase `true/false`, RFC-style double-quote escaping, and ASCII filenames `lifeboard-{scope}-YYYY-MM-DD.csv`.
- CSV user text beginning after optional whitespace with `=`, `+`, `-`, `@`, tab, or carriage return MUST be neutralized before spreadsheet use. Structural date/boolean fields are not modified.
- Markdown uses UTF-8 without BOM, LF, localized headings/body labels, stable heading structure, and `lifeboard-{scope}-YYYY-MM-DD.md` filenames.
- User text MUST escape Markdown structure and raw HTML. Titles/categories used as headings or list labels MUST collapse embedded line breaks safely.
- Completed tasks are included. Soft-deleted tasks are included in JSON backup but excluded from human-readable exports unless a future explicit Trash export is added.
- Empty Markdown exports remain valid with explicit empty-state text. Empty CSV remains header-only if invoked programmatically; UI MAY keep current disabling behavior.
- Bookmark pin/category/note and task label/completion fields remain represented.

Stage 44 is closeout/test hardening, not a replacement export system.

## 21. Security Contract

| Risk | Required control | Blocking stage |
| --- | --- | --- |
| Oversized/deep JSON | 1 MiB byte limit, depth 32, collection/string bounds | 41-43 |
| Prototype pollution | Reject dangerous keys recursively; use exact own-key checks | 41-43 |
| Invalid Unicode/BOM | Fatal UTF-8 decoder; allow one UTF-8 BOM on import; writer emits none | 43 |
| Unknown/future schema | Reject before writes | 41-43 |
| Duplicate IDs/invalid dates/URLs | Semantic validation | 41-43 |
| XSS from imported text | Keep data as text; no `v-html`; validate URL protocols | 43 |
| CSV formula injection | Neutralize dangerous leading formula characters | 44 |
| Markdown raw HTML/injection | Escape raw HTML and Markdown structure | 44 |
| Filename injection | Generate filenames from fixed prefix/version/UTC date only | 42-44 |
| Quota/partial writes | Pre-serialize, snapshot, deterministic writes, read-back, rollback | 43 |
| Credentials/cache leakage | Registry-level non-portable classification and fixtures | 41-43 |

Encryption, signed backups, password-protected archives, a durable crash journal, and backend threat modeling are deferred. They are not justified for the current local manual import flow.

## 22. Privacy Contract

- Backup contains only explicitly portable local user data and preferences.
- It excludes Weather/API responses, AQI/geocoding/forecast caches, diagnostics, logs, QA fixtures, tokens, API keys, system paths, clipboard content, and private build/runtime metadata.
- Public `app.version`, if emitted, is informational; current `0.0.0` is not a compatibility signal.
- Preview MUST summarize included modules and state that provider credentials/cache are excluded.
- Files are generated and read locally and are never uploaded automatically.
- Error reports and developer details MUST NOT contain user data fragments, credentials, full imported JSON, or filesystem paths.
- Future backend/sync MUST use a separately reviewed transport/API contract; the backup file is not implicit telemetry or a sync protocol.

## 23. Error Model

```ts
interface DataPortabilityError {
  code: DataPortabilityErrorCode
  severity: 'fatal' | 'recoverable' | 'warning' | 'info'
  module: 'file' | 'root' | 'settings' | 'weather' | 'todos' | 'bookmarks' | 'transaction'
  path: string | null
  message: string
  userMessageKey: string
  recoverable: boolean
  details?: Record<string, string | number | boolean | null>
}
```

`path` uses JSON Pointer without embedding values. `message/details` are developer diagnostics; UI displays localized `userMessageKey` and safe context only.

| Code | Default severity | User-visible outcome |
| --- | --- | --- |
| `FILE_TOO_LARGE` | fatal | Choose a file within 1 MiB |
| `FILE_READ_FAILED` | recoverable | Choose/read another file |
| `JSON_PARSE_FAILED` | fatal | File is not valid JSON |
| `INVALID_ROOT` | fatal | File is not a complete backup |
| `INVALID_FORMAT` | fatal | File is not a LifeBoard backup |
| `UNSUPPORTED_FUTURE_VERSION` | fatal | Upgrade LifeBoard; no writes |
| `MODULE_VALIDATION_FAILED` | fatal | Name module/path without data value |
| `MIGRATION_FAILED` | fatal | Legacy backup could not be upgraded |
| `IMPORT_CANCELLED` | info | No changes made |
| `SNAPSHOT_FAILED` | recoverable | No changes made |
| `WRITE_FAILED` | recoverable if rollback succeeds | Existing data restored |
| `VERIFY_FAILED` | recoverable if rollback succeeds | Existing data restored |
| `QUOTA_EXCEEDED` | recoverable if rollback succeeds | Free storage and retry |
| `ROLLBACK_FAILED` | fatal | Recovery not guaranteed; reload/use backup |

Sanitized error-report export is deferred and disabled by default. No error object may contain raw user-data snippets.

## 24. Test / Fixture Plan

Stage 41 SHOULD add **Vitest** as the single unit-test dev dependency with a `test:unit` script. Node's built-in test runner was considered, but the current TypeScript source uses Vite aliases and has no compiled test target; loader/build workarounds would be more fragile than one Vite-native runner. Vue Test Utils is not required for the contract layer.

Unit coverage:

- Registry uniqueness/completeness/policy invariants.
- Root/module validators and bounds.
- Every consecutive migration and legacy adapter.
- Serializer determinism and round-trip validation.
- Transaction snapshot, read-back, rollback, rollback failure, and quota simulation.
- CSV formula/quote/newline/BOM behavior and Markdown escaping.

Required fixtures:

- Valid current, empty current, legacy v1, legacy v2, and future-version backups.
- Corrupt JSON, empty file, wrong root type, missing/unknown fields/modules, partial modules.
- Duplicate/empty IDs, malformed URLs, invalid/canonical dates, invalid coordinates, excessive depth/arrays/strings.
- Missing legacy Language, Weather cache/credentials accidentally present, prototype keys, invalid UTF-8/BOM.
- Write failure after each registry entry, read-back mismatch, quota failure, rollback success, rollback failure.

Integration coverage:

- Export then strict validate.
- Legacy migration then replace import.
- Failed validation makes zero writes.
- Partial write failure preserves old raw values and store state.
- Language is exported/restored/factory-reset.
- Weather cache/provider credentials are excluded and preserved during portable import.
- Registry drives backup and factory-reset coverage.

Browser QA:

- Settings file picker, preview, confirmation/cancel/discard, focus restoration, errors, and success.
- Keyboard-only and mobile Settings behavior.
- Download filename/MIME and no console errors.
- Existing 29 route-viewports plus focused Settings data scenarios.

## 25. ADR Decisions

| ADR | Status | Context | Decision | Consequences | Stage / verification |
| --- | --- | --- | --- | --- | --- |
| DP-ADR-001 Unified persistence registry | Accepted | Coverage is hard-coded in multiple places | One typed product registry with independent portability/reset policies | Up-front adapter work; prevents omission drift | 41; invariant tests cover all 11 product keys |
| DP-ADR-002 Portable backup root schema | Accepted | Legacy root lacks format/metadata/namespaces | Use `format: lifeboard-backup`, root v1, required module namespaces | New export shape; legacy adapters required | 42; golden schema fixture |
| DP-ADR-003 Root/module schema versions | Accepted | Root and domain versions are conflated | Integer root plus per-module versions | Clear migration ownership | 41-43; migration matrix tests |
| DP-ADR-004 Weather cache exclusion | Accepted | Forecast/API data is rebuildable | Exclude all Weather/API caches/runtime/QA state | Smaller, safer backup; refetch after restore | 41-43; exclusion fixtures |
| DP-ADR-005 Language in backup | Accepted | Language is a persisted user preference omitted today | Export, restore, summarize, and factory-reset Language | Legacy imports preserve current Language | 42-45; Language integration tests |
| DP-ADR-006 First import strategy | Accepted; Merge deferred | No collision/conflict policy exists | Replace portable namespaces with preview and rollback | Predictable restore; no cross-device append | 43; replace/zero-write tests |
| DP-ADR-007 Rollback snapshot | Accepted | LocalStorage has no transactions | In-memory exact-write-set snapshot, read-back, reverse rollback | No crash-persistent journal | 43; injected failure tests |
| DP-ADR-008 Clear vs factory reset | Accepted | Current all-clear mixes content/preferences and omits Language | Separate content clear and factory reset policies; current all UI converges to factory reset | Independent registry flags and clearer copy | 45; coverage/UI tests |
| DP-ADR-009 CSV/Markdown role | Accepted | Existing exports are not complete snapshots | Human-readable only; no restore promise | Safety/format contract without importer | 44; golden files |
| DP-ADR-010 Validation/migration order | Accepted | Current compatibility is inline | Safe parse -> source validation -> pure migrations -> strict current validation -> preview | Future versions rejected before writes | 41-43; invalid/legacy fixtures |

Rejected: raw LocalStorage dump, best-effort unknown versions, importing credentials/cache, automatic Merge, and `localStorage.clear()`. Deferred: persistent rollback journal, encrypted/signed backup, sanitized error-report export, and backend sync format.

## 26. Stage 41 Implementation Contract

The only recommended next stage is **Stage 41: Persistence Registry / Schema Version Foundation**.

**Goal**

- Add typed registry contracts and descriptors for all 11 product keys.
- Add root/module schema constants, canonical portable read model, validators/migration interfaces, and legacy fixture shapes.
- Add the minimal Vitest unit harness.
- Allow the existing backup read path to consume registry-backed reads while preserving current output and UI behavior.

**Allowed**

- New focused files under a shared persistence/data-portability boundary.
- Module-owned adapter descriptors that call existing services.
- Schema/serializer/result/error types and pure utilities.
- Registry/validator/migration fixtures and tests.
- Minimal package/script changes only for Vitest, if separately approved in Stage 41.

**Non-goals**

- No new root backup export format yet.
- No complete Replace import, Merge, Settings redesign, new route, Calendar, or portable-export behavior change.
- No storage-key migration and no Weather store/service/cache/runtime/PixiJS/asset edits.
- No visual work, cache export, credential export, or broad architecture migration.

**Required QA**

- Unit registry/validator/legacy fixtures, `npm run build`, route QA 29/29, screenshot QA if any visible output changes unexpectedly.

**Exit criteria**

- Registry invariant proves 11/11 product keys classified once with no duplicate IDs/keys.
- Theme, Language, Weather location/favorites/cache/preferences/secrets, Todos, and Bookmarks have explicit policies.
- Root/module schema and migration interfaces compile and have fixtures.
- Existing backup export/import/clear UI behavior is unchanged.
- No Weather internal file, storage key, or visual baseline changes.

## 27. Stage 41-45 Sequence

| Stage | Goal | Dependencies | Allowed scope | Explicit non-goals | Data risks | QA | Commit / exit criteria |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 41 - Persistence Registry / Schema Version Foundation | Implement registry, schema types, validators/migration interfaces, unit harness | Stage 40 contract | Foundation and minimal existing read-path adapter | No new export/import UI or behavior; no Weather internals | Registry omission, over-abstraction | Unit invariants/fixtures, build, route QA | `refactor(data)`; 11/11 keys classified, behavior unchanged |
| 42 - JSON Backup Export Hardening | Emit new format v1 with Language and deterministic metadata/modules | Stage 41 | Export serializer, filename/MIME, preview summary inputs, golden fixtures | No import writes, Merge, clear/reset, CSV/Markdown | Secret/cache leakage, non-determinism | Golden export, strict validate, browser download smoke | `feat(data)`; complete valid v1 backup excludes forbidden data |
| 43 - Validated JSON Import and Rollback Hardening | Import new format plus legacy v1/v2 using Replace/read-back/rollback | Stages 41-42 | File decoder, validators, migrations, preview/confirmation, transaction, store hydration | No Merge, new module, broad Settings redesign | Data loss, quota, rollback failure | Failure injection, legacy/current integration, Settings browser QA | `feat(data)`; atomic replace proven, no open P0/P1 |
| 44 - CSV / Markdown Export Contract and Test Closeout | Secure and freeze existing human-readable formats | Stages 41-43 | Formula/Markdown escaping, deleted-item policy, deterministic golden files | No JSON schema/import/registry redesign, no new formats | Formula injection, raw HTML, encoding drift | Golden CSV/MD and download smoke | `test(data)` or `fix(data)`; contract fixtures pass |
| 45 - Data Portability Closeout and QA | Align factory reset/Language/registry coverage and freeze support matrix | Stages 41-44 | Registry-driven clear/reset, minimal copy/sync fixes, complete QA/docs | No Calendar, backend, Merge, Weather internals | Coverage drift, store/storage mismatch | Full unit/integration/build/route/screenshot/manual matrix | `docs(data)` or focused `fix(data)`; no portability P0/P1 |

Scopes do not overlap: Stage 42 writes export only; Stage 43 owns machine import; Stage 44 owns human-readable exports; Stage 45 owns reset alignment and closeout.

## 28. Weather Freeze Boundary

- Weather remains regression-only throughout Stages 41-45.
- Selected location and favorite cities are classified as portable through existing adapters.
- Provider preference is conditional but excluded from format v1. Caiyun token, AMap key, and Home auto-location are excluded.
- Forecast cache, AQI cache, geocoding/search cache, long-range/session cache, API responses, runtime/PixiJS state, debug flags, and QA mock/seed data are never portable.
- Factory reset may clear existing Weather-owned product keys through their current public storage/adapter boundary; it must not refactor Weather internals or migrate keys.
- No Weather visual work, motion expansion, Xiaomi material analysis, scene changes, runtime rewrite, asset replacement, or key migration is permitted.

## 29. Known Limitations

- This stage is a static code and contract audit; it did not execute destructive import failure or quota simulations.
- Current validators were inspected, not replaced. Duplicate-ID, collection-bound, and strict canonical timestamp checks remain future implementation.
- No registry, migration pipeline, import validator, or test framework was implemented.
- The proposed in-memory transaction does not survive a browser/process crash during its short synchronous write window.
- No backend/account/sync compatibility proof of concept was performed.
- Merge, encryption, signed files, persistent journals, axe, dark screenshot expansion, pixel diff, and chunk splitting remain deferred.
- Weather remains frozen.

## 30. Final Decision

Freeze this contract as the implementation authority for Stages 41-45. Proceed only with **Stage 41: Persistence Registry / Schema Version Foundation** after a separate authorization. Stage 41 must establish typed ownership, schema, validation/migration interfaces, fixtures, and a minimal unit harness while preserving all current UI/storage behavior and the Weather/visual freezes.
