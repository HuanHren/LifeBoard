# Stage 41: Persistence Registry / Schema Version Foundation

Date: 2026-07-10

Status: implemented and locally validated. This foundation is not wired into production persistence paths.

## 1. Baseline

- Branch: `main`.
- Starting commit: `1ec04b43a4d8fa5cd47db7692868ea1e2fc77a8b` (`docs(data): define portability architecture contract`).
- `HEAD` matched `origin/main`; the worktree was clean.
- Stage 40 was the starting commit. Stage 39 and Stage 38 were ancestors.
- Freeze tag `non-weather-visual-freeze-stage-37` still points to `b59018d47f0d90c54c020ceb545db73f4ac84532`.

## 2. Skill Gate Summary

All required files were verified readable and read in full: Impeccable, GPT Taste, Redesign Existing Projects, Baseline UI, Vue Best Practices, Fixing Accessibility, Fixing Motion Performance, and Playwright CLI. Required Impeccable and Vue references were also read. The optional project-local Impeccable context script was absent, so `PRODUCT.md` and `DESIGN.md` were read directly; this did not block Stage 41.

## 3. Scope

Stage 41 adds a pure TypeScript metadata foundation, schema/version types, boundary interfaces, registry plans, integrity validation, fixtures, and Node-environment unit tests. It does not connect these additions to existing export, import, clear, stores, services, UI, router, or Weather code.

## 4. Exact Key Inventory

| Storage key | Owner | Registry status |
| --- | --- | --- |
| `lifeboard-theme` | Theme | Product key |
| `lifeboard.language` | Language | Product key |
| `lifeboard-weather-location` | Weather | Product key |
| `lifeboard.weather.forecastCache.v1` | Weather cache | Product key |
| `lifeboard-weather-favorite-cities` | Weather | Product key |
| `lifeboard.weather.provider` | Weather provider | Product key |
| `lifeboard.weather.caiyunToken` | Weather provider | Product key |
| `lifeboard.weather.amapKey` | Weather AMap | Product key |
| `lifeboard.weather.autoLocationOnHome` | Weather/Home | Product key |
| `lifeboard.todos` | Todos | Product key |
| `lifeboard.bookmarks` | Bookmarks | Product key |

Developer-only `__lifeboard_weather_runtime_debug` is explicitly documented as excluded and is not a registry or factory-reset target.

## 5. Chosen Location

The foundation lives in `src/shared/persistence/`. Persistence ownership is cross-module, and the existing `src/shared` boundary is the narrowest fit without adding a parallel top-level architecture. Tests and fixtures live only in `tests/persistence/`, so fixtures cannot enter the application bundle.

## 6. Registry Types

The contract defines `PersistenceOwner`, `PersistenceCategory`, `PersistenceSensitivity`, `PortablePolicy`, `ClearPolicy`, `PersistenceModuleId`, `PersistenceEntryId`, and `PersistenceRegistryEntry`. The portable policy is a discriminated union, so a portable entry requires a namespace and positive schema version at compile time.

## 7. Registry Entries

The immutable registry contains exactly 11 entries. Every entry has ownership, storage key, category, sensitivity, portable policy, content/factory-reset policy, portable contract version, current LocalStorage version where applicable, validation/migration flags, ordering, summary kind, notes, and `metadata-only` implementation status.

## 8. Categories

The registry uses `durable-data`, `preference`, `cache`, and `secret` for current keys. `runtime` and `derived` remain valid contract categories for future classified state, but no current product LocalStorage key needs them.

## 9. Portability

Portable: Theme, Language, selected Weather location, favorite Weather cities, Todos/Countdowns, and Bookmarks. Non-portable: Weather forecast cache, provider, Home auto-location, Caiyun token, and AMap key. Every portable entry has one of the four approved namespaces and schema version 1.

## 10. Clear Policies

Content clear targets Todos, Bookmarks, selected Weather location, and Weather favorites. It preserves preferences, device-local state, credentials, and cache. The factory-reset target contract covers all 11 product keys, including Language, but Stage 41 does not change the current clear implementation or UI.

## 11. Sensitivity

Theme and Language are public preferences. User content and saved locations are personal data. Forecast cache, provider, and Home auto-location are device-local. Caiyun token and AMap key are secret. Secret and cache entries are always non-portable.

## 12. Schema/Version Constants

- New root: `LIFEBOARD_BACKUP_FORMAT = 'lifeboard-backup'` and `LIFEBOARD_BACKUP_SCHEMA_VERSION = 1`.
- New modules: independent schema version 1 constants for Settings, Weather, Todos, and Bookmarks.
- Existing storage: represented separately by each entry's `storageSchemaVersion`.
- Legacy roots: separate `LEGACY_BACKUP_ROOT_VERSION_1`, `LEGACY_BACKUP_ROOT_VERSION_2`, and `SUPPORTED_LEGACY_BACKUP_VERSIONS` constants.

The numeric value `1` is shared where contracts require it, but its semantic ownership is not shared.

## 13. Envelope Types

`PortableBackupV1`, `PortableBackupData`, and generic `PortableModuleEnvelope` express the approved root metadata and four required namespaces. Portable DTOs are explicit. Record collections use controlled JSON object types until Stage 42 binds production serializers to domain types; no `any`, Pinia store, component, or browser runtime import is used.

## 14. Legacy Boundary

Legacy roots continue to use `version: 1|2`; the new portable root uses `format` plus `schemaVersion: 1`. Stage 41 defines only boundaries and fixtures. It does not recognize files in production, guess formats, run migrations, or modify the existing importer.

## 15. Validator Interfaces

The foundation defines `ValidationSeverity`, `ValidationIssue`, `ValidationResult<T>`, `PortableValidator<T>`, and `ValidationContext`. Issues include code, severity, module, path, internal message, user message key, recoverability, and optional metadata-only details. Helpers cover positive integer versions, safe objects, and dangerous object keys.

## 16. Migration Interfaces

`MigrationContext`, `MigrationStep<TInput,TOutput>`, `MigrationPipeline`, and `MigrationResult<T>` define pure old-to-current boundaries. No production migration, best-effort compatibility, mutation, storage access, store access, UI access, or future-version downgrade is implemented.

## 17. Serializer/Storage Interfaces

`PortableSerializer<T>`, `PortableDeserializer<T>`, `PersistenceStorageAdapter`, read/write/verify results, and an injectable `KeyValueStorage` contract are defined. A lightweight raw adapter catches read/write/remove/read-back failures. It has no browser-global binding and is unused by current production paths.

## 18. Selectors

Readonly selectors support lookup by id and storage key plus portable, content-clear, factory-reset, cache, secret, and owner queries. Missing direct lookups return `undefined`. Returned lists are frozen and perform no storage access.

## 19. Integrity Validation

The explicit validator checks inventory count, duplicate IDs/keys, invalid categories/policies, portable namespace/version requirements, forbidden portability categories, exact key coverage, factory-reset coverage, Language policy, Weather cache exclusion, credential exclusion, and debug-flag exclusion. The optional assertion is never called at import time.

## 20. Vitest Setup

Vitest `4.1.10` is the only new dev dependency. `test:unit` and `test:unit:ci` scripts were added. `vitest.config.ts` uses Node, mirrors the `@` alias, and includes only `tests/persistence/**/*.test.ts`. No browser environment, coverage package, Vue Test Utils, schema library, or second test framework was added.

## 21. Unit Tests

Three files provide 45 tests for exact inventory, immutability, portable/sensitivity/clear rules, selectors, plans, integrity success and constructed failures, schema boundaries, fixtures, generic validation helpers, and injected storage success/failure behavior.

## 22. Fixtures

Fixtures cover a valid current v1 envelope, an empty current v1 envelope, legacy root v1 metadata, legacy root v2 metadata, and future-version metadata. They contain synthetic records only, with no tokens, cache responses, system paths, or real user data.

## 23. Behavior Preservation

No existing production module imports `src/shared/persistence`. Existing JSON export/import/clear behavior, storage keys, LocalStorage values, store hydration, CSV/Markdown exports, routes, UI, QA scripts, and workflow remain unchanged. The registry describes the target contract only.

## 24. Weather Freeze

No file under `src/modules/weather`, no Weather page/store/service/cache/runtime/PixiJS code, and no Weather asset changed. Registry metadata classifies existing Weather keys without importing or invoking Weather implementation. Weather remains regression-only.

## 25. Limitations

- Foundation is not connected to export, import, or clear paths.
- Production module serializers and validators are not implemented.
- Legacy adapters and migrations are not implemented.
- Import transaction, read-back orchestration, and rollback are not implemented.
- Unit tests are local-only and are not added to CI.
- Current factory reset still has its pre-Stage-45 Language coverage mismatch.
- The known Vite chunk-size warning remains non-blocking and unchanged.

## 26. Stage 42 Contract

Stage 42 may bind production read serializers to this registry and emit deterministic portable JSON format v1, including Language and all approved portable namespaces while excluding cache, credentials, and device-local preferences. It must not add import writes, migrations, rollback, Merge, clear/reset rewiring, CSV/Markdown changes, Weather internals, or UI redesign.

## 27. Validation Results

- `npm ls vitest`: passed; resolved `vitest@4.1.10`.
- `npx npm@11.18.0 ci --dry-run`: passed.
- `npm ci --dry-run`: passed.
- `npm run test:unit:ci`: passed, 3 files and 45 tests.
- `npm run build`: passed. Existing `lib` chunk warning over 500 kB remains non-blocking.
- `npm run qa:a11y:routes`: passed, 29/29, zero console errors.
- `npm run qa:a11y:routes:ci`: passed, 29/29, zero console errors.
- `npm run qa:a11y:routes:json`: passed, machine-readable PASS.
- `npm run qa:a11y:routes:json:file`: passed; ignored `.qa` output created.
- `npm run qa`: passed.
- `npm run qa:screenshots:ci`: passed, 29/29.
- `npm run qa:design`: passed, build plus 29/29 screenshots.
- `.qa` output is ignored; no preview process remained after QA.

## 28. Final Decision

Stage 41 is complete. The typed persistence registry and schema-version foundation are ready for a separately authorized Stage 42. Current production behavior and the Weather freeze are preserved. Do not start Stage 42 from this document alone.
