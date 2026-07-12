# Stage 44: CSV / Markdown Export Contract and Test Closeout

## 1. Baseline

- Branch: `main`; starting worktree clean.
- Starting HEAD and `origin/main`: `df9a9b5bbe1874918b8d0684b1ba5899e33bb57a` (`validated-backup-import-stage-43`).
- Stage 41, 42, and 43 tags were present. `non-weather-visual-freeze-stage-37` still pointed to `b59018d47f0d90c54c020ceb545db73f4ac84532`.
- Remote URL was HTTPS and contained no plaintext credential.

## 2. Skill Gate Summary

All eight required skills were verified and read in full: Impeccable, GPT Taste, Redesign Existing Projects, Baseline UI, Vue Best Practices, Fixing Accessibility, Fixing Motion Performance, and Playwright CLI. Required Impeccable, Vue, and Playwright references were also read. The optional project-local Impeccable context script was absent; `PRODUCT.md` and `DESIGN.md` were read directly.

## 3. Stage 44 Scope

Stage 44 hardens the existing Todo/Countdown/Bookmark CSV and Markdown exports. It does not add import, restore, Merge, new formats, dependencies, routes, design changes, JSON portability changes, clear/reset work, or Weather changes.

## 4. Existing CSV Behavior

Settings exposed one combined Todo/Countdown CSV and one Bookmark CSV. CSV already used UTF-8 BOM, fixed English headers, comma delimiters, CRLF record separators, fixed filenames, and `text/csv;charset=utf-8`. It quoted commas, quotes, and line breaks but did not neutralize spreadsheet formulas, normalize embedded line endings, validate row widths, or return byte length. Todo rows included soft-deleted records and omitted IDs/status; data order followed store arrays.

## 5. Existing Markdown Behavior

Settings exposed Todo/Countdown Markdown, Bookmark Markdown, and a compact Summary Markdown. Headings/body labels were localized and files used UTF-8-compatible strings, LF, stable filenames, and `text/markdown;charset=utf-8`. User titles, labels, categories, notes, raw HTML, list/heading markers, and most Markdown syntax were not safely escaped. Link destinations were concatenated directly. Soft-deleted tasks could appear. Sorting used ambient locale comparison. Summary included a selected Weather city.

## 6. Existing Production Entry Points

All production entry points remain the existing Settings export panel and `SettingsWorkspace` coordinator. CSV and Markdown buttons call `createPortableExport`, then `downloadPortableExport`. No new page, route, modal, or export center was added.

## 7. Todo Inclusion Policy

Active and completed non-deleted tasks are included. Soft-deleted/recycle-bin tasks are excluded from every human-readable export. They remain in `PortableBackupV1`, which is the complete recovery format. Todo CSV fields are `type`, `id`, `title`, `status`, `dueDate`, `targetDate`, `label`, `completed`, `completedAt`, `createdAt`, and `updatedAt`.

## 8. Countdown Inclusion Policy

All saved Countdowns are included in the combined Todo/Countdown file, including dates already reached. The model has no completed/deleted state. Countdown rows use the same fixed schema with `type=countdown`, `status=countdown`, `completed=false`, target date, ID, title, and timestamps; non-applicable fields are empty.

## 9. Bookmark Inclusion Policy

All saved Bookmarks are included. Pinning affects deterministic order and remains an explicit field; it never excludes a record. Fields are `id`, `title`, `url`, `category`, `note`, `pinned`, `createdAt`, and `updatedAt`. Missing category/note values are empty CSV fields and the localized uncategorized group in Markdown.

## 10. Ordering Contract

- Todos: due date ascending, missing due date last, then `createdAt`, then ID.
- Countdowns: target date ascending, then `createdAt`, then ID.
- Bookmarks: pinned first, then normalized category, normalized title, then ID.
- Comparison uses deterministic code-unit ordering, not the system locale. Exports include the approved full dataset and ignore current page search/filter state. Input arrays are copied, never sorted in place.

## 11. CSV Encoding / BOM Contract

CSV is UTF-8 with exactly one BOM. Descriptor byte length uses `TextEncoder`, not JavaScript string length. Unicode and emoji remain lossless.

## 12. CSV Line-ending Contract

CSV uses CRLF for record separators and normalizes CR, LF, or CRLF inside fields to CRLF before quoting. There is no trailing synthetic data row.

## 13. CSV Headers / Columns Contract

Headers are stable canonical English identifiers and do not change with UI Language. Column order is explicit and invariant. Every row must match the header width or serialization fails.

## 14. CSV Escaping Contract

Null/undefined become empty fields. Booleans are lowercase `true`/`false`; enums and dates remain stable machine values. Fields containing commas, quotes, line breaks, or leading/trailing whitespace are quoted; embedded quotes are doubled.

## 15. CSV Formula-injection Contract

User-controlled text beginning, after optional ASCII spaces, with `=`, `+`, `-`, `@`, Tab, or CR receives a leading apostrophe before CSV escaping. Typed dates, booleans, and numeric values are not modified. Protection never writes back to domain data.

## 16. Markdown Structure Contract

Todo Markdown uses a title plus Active tasks, Completed tasks, and Countdowns sections. Bookmark Markdown uses title, Pinned bookmarks, and category sections. Summary retains its existing task/countdown/bookmark overview but no longer reads or emits Weather data.

## 17. Markdown Escaping Contract

User text escapes backslashes, code markers, emphasis, headings, lists, blockquotes, links, images, parentheses, pipes, and related structural punctuation. Embedded lines collapse to a stable inline ` / ` separator where titles/labels/list entries require one line.

## 18. Raw HTML Policy

User `&`, `<`, and `>` become HTML entities before Markdown punctuation escaping. Raw `<script>`, `<img onerror>`, or other user HTML cannot be emitted as executable Markdown HTML. No export preview uses `v-html`.

## 19. Date / Boolean / Enum Formatting

CSV retains validated ISO timestamps, date-only values, lowercase booleans, and stable enums. Markdown date formatting uses the explicit `zh-CN` or `en-US` locale with UTC, so output does not depend on host timezone/locale. Invalid records fail before export; `Invalid Date` is never emitted.

## 20. Filename / MIME Contract

- `lifeboard-todos-YYYY-MM-DD.csv` / `.md`
- `lifeboard-bookmarks-YYYY-MM-DD.csv` / `.md`
- `lifeboard-summary-YYYY-MM-DD.md`
- CSV: `text/csv;charset=utf-8`; Markdown: `text/markdown;charset=utf-8`

The date is the injected clock's UTC date. Filenames never contain user or localized text.

## 21. Empty Dataset Behavior

Pure CSV generation returns a valid header-only file. Existing Settings behavior remains: empty CSV buttons are disabled with explanatory copy. Markdown downloads remain enabled and contain the localized title and explicit empty sections; no format produces a zero-byte file.

## 22. DTO Mapping

Explicit `TodoCsvRow`, `CountdownCsvRow`, `BookmarkCsvRow`, and Markdown entry types map approved fields only. Store objects are not spread or stringified into output, reactive/internal/UI state is excluded, and serializers do not access Pinia, LocalStorage, DOM, time, random values, or Weather.

## 23. Error Model

Structured redacted errors cover invalid data, serialization, oversized-output policy, download failure, and unsupported formats. Errors include code, severity, module, path, safe message key, and recoverability without titles, URLs, exported text, or raw records. No additional text-size limit is imposed; descriptors always report UTF-8 byte length and never truncate.

## 24. Security / Privacy

Formula-like CSV user text is neutralized, Markdown structure and HTML are escaped, and links require validated HTTP/HTTPS URLs without credentials. Exports contain only approved Todo/Countdown/Bookmark fields. Weather, credentials, caches, API responses, tools input, runtime/debug state, system paths, and QA metadata are excluded.

## 25. Unit Test Inventory

The full persistence suite passes 13 files / 168 tests. Stage 44 adds CSV field/encoding/schema tests, formula vectors, Todo/Countdown/Bookmark inclusion tests, Markdown/raw HTML/link tests, deterministic ordering, error/redaction, input immutability, empty data, Unicode byte length, and production JSON round-trip coverage.

## 26. Fixture Inventory

Synthetic fixtures cover empty data, active/completed/deleted Todos, multiline/formula/Chinese/emoji text, expired Countdowns, pinned/category Bookmarks, URL query/hash/parentheses, invalid URL/date/ID, Markdown controls, raw HTML-like content, reordering, and storage sentinels. They contain no real user data, token, email, API response, or system path.

## 27. Browser QA

Production Settings buttons passed isolated download QA for Todo CSV/Markdown and Bookmark CSV/Markdown. Checks covered filename, Blob MIME, BOM, headers, formula protection, row inclusion, raw HTML/Markdown escaping, safe links, English/Chinese output, locale-stable CSV schema, empty data, 390x844 overflow, keyboard focus/Enter activation, focus retention, storage sentinels, and zero console errors. `playwright-cli` was unavailable (`could not determine executable to run`), so locked project Playwright `1.61.1` was used without dependency installation.

## 28. Existing Behavior Preservation

Todo/Countdown/Bookmark CRUD, Theme/Language settings, routes, Settings hierarchy, mobile layout, and download entry points are preserved. The intentional contract corrections are formula/Markdown safety, deterministic output, soft-delete exclusion, explicit IDs/status, and removal of Weather from Summary Markdown.

## 29. JSON Portability Boundary

`PortableBackupV1` remains the only machine-restorable format. Current JSON exporter/importer, legacy v1/v2 adapters, Replace transaction, snapshots, read-back, rollback, and hydration were not modified. A production JSON export/import round-trip test remains green. CSV and Markdown have no importer and make no round-trip promise.

## 30. Weather Freeze Boundary

No file under `src/modules/weather` changed. Text export types/serializers do not import Weather types, read Weather stores, or emit locations, favorites, provider settings, credentials, caches, runtime state, assets, or API data. Weather visual/runtime work remains frozen.

## 31. Known Limitations

- CSV and Markdown are not restore formats; CSV/Markdown import does not exist.
- No extra output-size ceiling is imposed beyond available browser memory; byte length is reported and partial files are never produced.
- Merge remains deferred.
- Factory reset and Language coverage remain Stage 45 work.
- Unit tests remain local and are not added to remote CI.
- The existing Vite 513.51 kB chunk warning remains a non-blocking P2.

## 32. Stage 45 Contract

The only recommended next stage is **Stage 45: Factory Reset / Language Coverage / Data Portability Closeout and QA**, under separate authorization. It may connect registry policies to clear/reset, distinguish content clear from factory reset, include Language in factory reset, verify all 11 product keys, and freeze the support matrix. It must not add Merge, Calendar, JSON schema rewrites, CSV/Markdown features, Weather changes, or UI redesign.

## 33. Validation Results

- `npm ls vitest`: PASS (`4.1.10`).
- `npx npm@11.18.0 ci --dry-run` and `npm ci --dry-run`: PASS.
- `npm run test:unit:ci`: PASS, 13 files / 168 tests.
- `npm run build`: PASS, 1137 modules; known chunk warning only.
- Route accessibility local/CI/JSON/file: PASS, 29/29, zero console errors and overflow failures.
- `npm run qa`: PASS.
- `npm run qa:screenshots:ci` and `npm run qa:design`: PASS, 29/29 screenshots.
- Targeted production browser QA: PASS; `.qa` remained ignored and preview port 4173 was released.
- `package.json` and `package-lock.json` are unchanged.

## 34. Final Decision

Stage 44 is complete and ready to freeze. Existing human-readable exports now have explicit inclusion, ordering, encoding, escaping, safety, descriptor, error, and test contracts. JSON portability and Weather remain unchanged. Do not begin Stage 45 without separate authorization.
