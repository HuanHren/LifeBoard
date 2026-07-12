# Stage 43: Validated JSON Import and Rollback Hardening

## 1. Baseline

- Branch: `main`.
- Starting commit: `61edd4264e3d679c8789f3d3e6c328d315e0f7bc`, aligned with `origin/main`.
- The worktree was clean. Stage 42 was present at HEAD and tagged `portable-backup-export-foundation-stage-42`.

## 2. Skill Gate

The required local design, Vue, accessibility, motion, and Playwright skills were verified and read in full, including their required Vue and Playwright references. The optional project-local Impeccable context script was not present, so `PRODUCT.md` and `DESIGN.md` were read directly.

## 3. Scope

Stage 43 adds validated JSON import and rollback hardening only. It does not add Merge, persistent journals, CSV/Markdown changes, clear/reset rewiring, dependencies, QA scripts, workflow changes, or Weather implementation changes.

## 4. Existing Behavior

Before Stage 43, production export/import used the legacy Settings backup path. The Stage 42 portable exporter existed behind a compatibility gate because production import could not restore its envelope.

## 5. Format Matrix

| Input | Result |
| --- | --- |
| `PortableBackupV1` | Strictly validated and imported |
| Legacy root v1 | Adapted; favorite cities default empty and current Language is preserved |
| Legacy root v2 | Adapted; favorite cities retained and current Language is preserved |
| Unknown, mixed, malformed, or future version | Rejected before snapshot or write |

## 6. File Validation

Import accepts `.json` files with `application/json`, `text/json`, or an empty browser MIME. It enforces the 1 MiB limit before and after reading, rejects empty files, decodes fatal UTF-8, strips one UTF-8 BOM, and reports parse failures without writes.

## 7. Safe Tree Validation

Parsed values are scanned before format handling. The scanner rejects dangerous keys, accessors, non-plain objects, cycles, non-finite numbers, excessive depth, oversized arrays/objects/strings, and excessive total nodes.

## 8. Portable Validation

Current portable roots require exact root/module shapes, current root and module schema versions, canonical timestamps, valid enums, and validated DTO semantics. Future root or module versions receive a distinct rejection.

## 9. Legacy V1 Adapter

The v1 adapter is pure and exact-keyed. It maps Theme, selected Weather location, Todos/Countdowns, and Bookmarks; favorite cities become an empty list and current Language is preserved.

## 10. Legacy V2 Adapter

The v2 adapter is pure and exact-keyed. It also maps favorite Weather locations while preserving current Language because legacy v2 did not own that setting.

## 11. Canonical Model

Every accepted source becomes a validated `PortableBackupV1`. Adapter output is revalidated with the current validator before preview or transaction planning.

## 12. Import Preview

The confirmation preview exposes only source format, export time, replacement mode, aggregate module counts, location presence, Theme/Language changes, and preserved exclusions. It does not reveal Todo titles, Bookmark titles/URLs, city names, credentials, or raw payloads.

## 13. Replace-only Boundary

The UI and transaction support Replace only. Merge remains unsupported and is stated explicitly in the preview. Cancellation performs zero storage writes.

## 14. Snapshot

Before any write, the transaction captures the exact raw value and existence state for all six portable storage keys. A snapshot read failure stops the transaction with zero writes.

## 15. Write Plan

The registry produces a deterministic six-entry plan: Todos, Bookmarks, Weather favorites, Weather location, Theme, then Language. Values are serialized before snapshot/writes so serialization failure cannot cause partial mutation.

## 16. Read-back Verification

Every set/remove is immediately checked using exact raw equality or verified absence. A mismatch stops subsequent writes and triggers rollback.

## 17. Rollback

Write, quota, and read-back failures restore the full snapshot in reverse order and verify every restored key. Successful rollback is reported as a recoverable structured failure.

## 18. Rollback Failure

Rollback write and rollback verification failures are distinct fatal error codes. Error details are redacted and never contain storage values or imported content.

## 19. Hydration

After durable storage verification, public store synchronization runs for Todos, Bookmarks, Weather location/favorites, Theme, and Language. Hydration is verified; failure restores storage and the captured in-memory state, with no page reload.

## 20. Production Cutover Gate

Production export could switch only after current-format import, both legacy adapters, transaction rollback, hydration, round-trip tests, and the compatibility gate passed.

## 21. Production Cutover Result

Completed safely. Settings now downloads the Stage 42 deterministic portable JSON descriptor, and the same production import path accepts that output.

## 22. Round-trip Result

Complete, empty, Unicode, deterministic-order, and production export-to-import cases pass. The restored canonical payload matches the exported portable content.

## 23. Non-portable Data

Weather provider/device preferences, credentials, forecast cache, runtime/debug state, QA data, assets, and rendering state are neither exported nor written by import. Sentinel tests confirm preservation.

## 24. Error Model

File, tree, format, adapter, module, semantic, snapshot, write, quota, verification, hydration, rollback, and rollback-verification failures use stable structured codes mapped to bilingual UI messages.

## 25. Security and Privacy

Validation avoids getter invocation, prototype-sensitive assignment, and raw content in diagnostics. Preview and errors expose metadata only. This is validation and recovery hardening, not encryption or authenticity verification.

## 26. Unit Test Inventory

The persistence suite contains 10 files and 134 tests covering file handling, format detection, tree limits, strict schemas, adapters, preview redaction, deterministic planning, snapshots, write/read-back failures, rollback, hydration, round trips, sentinels, and production cutover.

## 27. Fixtures

Fixtures include current portable roots, legacy v1/v2 roots, empty/complete/Unicode payloads, hostile trees, future versions, storage sentinels, and injectable storage/hydration failures.

## 28. Browser QA

Targeted production-preview QA passed portable export/import, legacy v2 import, invalid JSON with same-file reselection, cancellation, Escape handling, dialog focus entry/return, accessible controls, sentinel preservation, and zero console errors. The requested `playwright-cli` executable was unavailable, so the existing project Playwright `1.61.1` runtime was used without installing dependencies.

## 29. Existing Behavior Preservation

Clear-all and Todo/Bookmark CSV/Markdown exports are unchanged. Existing navigation, route, screenshot, responsive, accessibility, and reduced-motion baselines remain green.

## 30. Weather Freeze Boundary

No Weather source, runtime, asset, scene, store, or rendering implementation was changed. Stage 43 only invokes existing public Weather synchronization actions after a validated import. Weather remains regression-only.

## 31. Known Limitations

- Import is Replace-only; Merge is intentionally absent.
- Rollback is in-memory for the active transaction, not a persistent crash journal.
- Backups are not encrypted or signed.
- The existing Vite `lib` chunk-size warning remains a non-blocking P2 item.

## 32. Stage 44 Boundary

Stage 44 may close out the existing Todo/Bookmark CSV and Markdown export contracts and tests. It must not reopen JSON import, Weather internals, Merge, or broad persistence migration without separate authorization.

## 33. Validation Record

- `npm run test:unit:ci`: PASS, 10 files / 134 tests.
- `npm run build`: PASS, 1137 modules; known non-blocking chunk warning only.
- `npm run qa:a11y:routes`, `:ci`, `:json`, and `:json:file`: PASS, 29/29 and zero console errors.
- `npm run qa`, `npm run qa:screenshots:ci`, and `npm run qa:design`: PASS; screenshots 29/29.
- `npm ls vitest`, `npm ci --dry-run`, and `npx npm@11.18.0 ci --dry-run`: PASS.

## 34. Final Decision

Stage 43 is complete. The portable production export/import pair, legacy compatibility, Replace-only transaction, exact read-back, rollback, and in-memory synchronization are ready to freeze. Stage 44 is the next separately authorized scope; no Stage 44 work is included here.
