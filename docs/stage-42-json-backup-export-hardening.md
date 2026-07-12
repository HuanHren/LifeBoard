# Stage 42: JSON Backup Export Hardening

## 1. Baseline

- Branch: `main`.
- Starting commit: `95e67d1` (`persistence-registry-foundation-stage-41`), synchronized with `origin/main`.
- Working tree was clean before Stage 42 changes.
- Stage 40 contract and Stage 41 registry/schema foundation were present.

## 2. Skill Gate Summary

The required eight skills and their required references were verified and read before implementation. The optional project-local Impeccable context script was not present; `PRODUCT.md` and `DESIGN.md` were read directly instead.

## 3. Scope

Stage 42 adds a pure TypeScript, registry-driven `PortableBackupV1` export foundation, strict export-side validation, deterministic JSON serialization, and unit fixtures. It does not implement import, rollback, merge, clear/reset rewiring, CSV/Markdown work, UI changes, Weather source changes, dependency changes, or workflow changes.

## 4. Existing Production Export

`src/modules/settings/services/settingsBackup.ts` currently creates the legacy LifeBoard backup root with `version: 2`. Settings still uses this production path.

## 5. Existing Production Importer

The current validator accepts only legacy root versions 1 and 2 and requires the exact legacy root keys `version`, `exportedAt`, `preferences`, `weather`, `todos`, and `bookmarks`. It does not understand the new `format`, `schemaVersion`, and `data` envelope.

## 6. Compatibility Gate Result

Source audit and a direct unit test prove that the current exporter/importer legacy v2 round trip remains valid while a generated `PortableBackupV1` document is rejected by the current importer.

## 7. Production Cutover Decision

**Deferred until Stage 43.** Wiring the new exporter into Settings now would create backups that the same production UI cannot restore. The existing legacy v2 download behavior is intentionally unchanged.

## 8. Foundation Location

The foundation lives under `src/shared/persistence/`:

- `portableExport.ts`: injected storage reader and registry-driven DTO construction.
- `portableExportValidation.ts`: source parsing, DTO mapping, envelope checks, and structured errors.
- `portableSerialization.ts`: deterministic JSON, byte-size enforcement, filename, and MIME descriptor.

## 9. Portable Source Inventory

The exporter reads exactly the six Stage 41 entries selected by `createPortableRegistryPlan()`:

- Theme
- Language
- Weather selected location
- Weather favorite locations
- Todos and countdowns
- Bookmarks

No debug, cache, credential, provider, device, runtime, or QA storage key is read.

## 10. Export Reader Design

Storage access is injected through `PersistenceStorageAdapter`. Reads follow registry plan order. Missing settings use explicit defaults and missing durable collections become empty. Existing corrupt or invalid values fail closed; export does not repair, delete, or silently replace them.

## 11. DTO Mapping

Every portable payload is constructed field by field into readonly DTOs. Raw storage objects are never spread into the output. Internal-only and unknown fields are therefore excluded by construction.

## 12. Envelope Contract

The output uses the Stage 41 `PortableBackupV1` discriminated envelope and independent module schema versions. `exportedAt` is canonical UTC, `appVersion` is injected or falls back to `unknown`, and module ordering is stable.

## 13. Language Inclusion

Language is included as a first-class portable setting. Supported locale validation and the root locale metadata remain aligned. A missing value uses the configured default locale.

## 14. Weather Exclusions

Only selected location and favorite locations are portable. Weather caches, API responses, provider/device preferences, credentials, runtime state, debug flags, assets, store logic, and rendering code remain excluded and unchanged.

## 15. Serialization Contract

Serialization validates the completed envelope first, uses two-space indentation, LF line endings, one trailing newline, UTF-8 encoding, and no BOM. Stable DTO construction provides deterministic key and collection ordering for equivalent input.

## 16. Filename/MIME Contract

- Filename: `lifeboard-backup-v1-YYYY-MM-DD.json`
- MIME: `application/json;charset=utf-8`

The pure descriptor does not touch the DOM or initiate a browser download.

## 17. Size Contract

The maximum serialized UTF-8 size is 1 MiB (`1,048,576` bytes). Oversized output fails before a downloadable descriptor is returned; no partial artifact is produced.

## 18. Validation Contract

Validation covers exact shapes, limits, identifiers, duplicate IDs, enums, URLs, date-only values, canonical timestamps, finite numeric values, coordinate ranges, safe object keys, and valid Unicode scalar sequences. Generated output is revalidated before serialization.

## 19. Error Model

Failures use structured, redacted codes for storage reads, JSON parsing, invalid portable data, serialization, size overflow, and download preparation. Errors identify the portable module or storage key where safe, but do not include stored values or full backup contents.

## 20. Security/Privacy

The implementation rejects dangerous prototype keys, does not invoke source `toJSON` methods, strips unknown/internal fields through explicit mapping, and excludes tokens, credentials, caches, API payloads, debug data, and local paths. Error details do not echo sensitive source content.

## 21. Unit Tests

The persistence suite now contains 76 passing tests across six files. Stage 42 coverage includes exact registry reads, complete/empty data, defaults, Unicode, deterministic serialization, filename/MIME/size, field exclusion, malformed storage, invalid DTO values, duplicate IDs, prototype hazards, serialization failures, and compatibility gating.

## 22. Fixture Inventory

Fixtures cover complete portable data, empty data, all known storage keys plus exclusion canaries, Unicode, corrupt JSON, invalid shapes and locale, duplicate IDs, and an oversized collection. Fixtures contain no production data, credentials, API responses, or machine-specific paths.

## 23. Existing Behavior Preservation

No Settings component, production backup service, importer, clear/reset path, store, router, Weather module, workflow, or QA script changed. Package manifests and build configuration remain unchanged. The new foundation is not imported by the production application bundle.

## 24. Known Limitations

- Production Settings still downloads legacy v2 backups.
- The production importer cannot restore `PortableBackupV1` yet.
- Stage 42 does not provide browser download wiring or user-facing error messages.
- Import validation, Replace semantics, read-back verification, and rollback remain Stage 43 work.
- The existing Vite chunk-size warning remains a non-blocking P2 item unrelated to this change.

## 25. Stage 43 Implementation Contract

Stage 43 should add validated `PortableBackupV1` import compatibility before production export cutover. It must preserve explicit legacy v1/v2 adapters, reject future/unknown versions before writes, use Replace-only semantics, snapshot in-memory rollback data, verify writes by read-back, restore on failure, and synchronize affected stores. Merge remains out of scope.

Only after that importer passes compatibility and rollback tests should Settings switch its production download path to the Stage 42 exporter. Cutover and importer changes should land together so every newly downloaded backup is restorable by the same release.

## 26. Validation Results

- `npm run test:unit:ci`: pass, 76/76 tests.
- `npm run build`: pass, 1,126 modules; existing 513.51 kB chunk warning only.
- `npm run qa:a11y:routes`: pass, 29/29 route-viewports, zero console errors.
- `npm run qa:a11y:routes:ci`: pass, 29/29.
- JSON stdout and file-output route QA: pass, 29/29.
- `npm run qa`: pass.
- `npm run qa:screenshots:ci`: pass, 29/29.
- `npm run qa:design`: pass, build plus 29/29 screenshots.
- `npm ls vitest`, `npm ci --dry-run`, and `npx npm@11.18.0 ci --dry-run`: pass.

## 27. Final Decision

PortableBackupV1 exporter ready; production cutover deferred until Stage 43 importer compatibility is complete.
