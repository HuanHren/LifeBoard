# LifeBoard Commercial Upgrade - Stage 9 Settings Data Management Implementation

## Stage

Stage 9 redesigned `/settings` and `/settings/data-sources` as a local-first control center for preferences, data management, recovery, and weather source boundaries.

## Baseline

- Baseline commit: `46e20f69d7598fb760e4ffbdedb5f5683959beb9`
- Baseline message: `feat(tools): redesign utility workflow`
- Weather freeze baseline: `a54de16`
- Branch: `main`

## Skill Gate

All required local skill files were checked with `Test-Path -LiteralPath` and read with `Get-Content -LiteralPath -Raw`.

Read skills:

- `impeccable`
- `gpt-taste`
- `baseline-ui`
- `vue-best-practices` and required references
- `fixing-accessibility`
- `fixing-motion-performance`
- `playwright-cli`
- `audit`
- `harden`

The Impeccable helper at `D:\LifeBoard\.agents\skills\impeccable\scripts\context.mjs` was not present and was recorded as non-blocking.

## Current Settings Audit

Settings currently owns:

- Theme mode: `system`, `light`, `dark`, persisted with `lifeboard-theme`.
- Language: `zh-CN`, `en-US`, persisted with `lifeboard.language`.
- Full LifeBoard JSON backup export/import, version `2`, max import size 1 MB.
- Portable Markdown/CSV exports for Todos, Countdowns, Bookmarks, and summary output.
- Local data status for weather, Todos, Countdowns, Bookmarks, and Tools.
- Clear actions for weather, Todos, Bookmarks, and all LifeBoard local data.
- Weather provider preference, Caiyun token, AMap key, and Home current-location preference.
- `/settings/data-sources` source status for Open-Meteo, Caiyun, AMap, Open-Meteo Air Quality, CAMS model attribution, alerts, and long-range availability.

There is no `src/services` directory in the current project. Settings and weather service behavior is module-local.

## Function Contract

No storage keys, backup schema, import validation, export formats, filename rules, provider behavior, route definitions, or weather API behavior were changed.

Preserved behavior:

- Theme persistence and reload behavior.
- Language persistence, `<html lang>`, and document title behavior.
- Backup JSON export/import shape.
- Import schema validation and invalid JSON failure handling.
- Clear confirmation flow and clear target scope.
- Portable Markdown/CSV export kinds and filenames.
- AMap key save/clear.
- Caiyun token save/clear.
- Data-source page read-only status behavior.

## Data And Privacy Contract

The redesign remains local-first:

- No backend was added.
- No account system was added.
- No analytics were added.
- No implicit upload was added.
- No clipboard reads were added.
- No automatic browser-location request was added.
- No automatic API key test was added.
- No hidden provider ping was added from `/settings/data-sources`.

## Storage Contract

Existing storage keys are unchanged:

- `lifeboard-theme`
- `lifeboard.language`
- weather location/cache/favorites/provider/Caiyun/AMap/Home-location keys
- Todos storage key
- Bookmarks storage key

Verification used a temporary browser profile. After deliberate settings interactions, observed keys were expected: theme, language, and AMap key.

## Information Architecture

`/settings` now presents:

1. Control center hero with local status facts.
2. Preferences: theme, language, translation source.
3. Backup and restore.
4. Portable exports.
5. Clear local data.
6. Local data status.
7. Weather data source entry.
8. Weather provider and location service controls.
9. Privacy context.

`/settings/data-sources` now presents:

1. Data source hero with provider and local-storage facts.
2. Local-first source status.
3. Active configuration summary.
4. Forecast providers.
5. Air quality and location services.
6. Alert availability.
7. Licence and attribution context.

## Visual System

The pages use a quiet control-center treatment:

- restrained surfaces,
- compact status facts,
- clear destructive-action separation,
- source and storage boundaries,
- no marketing hero,
- no large red warning blocks,
- no card-heavy equal-weight wall.

## Component Structure

Changed:

- `SettingsPage.vue`
- `SettingsWorkspace.vue`
- `DataSourcesPage.vue`

Existing behavior components were reused:

- `ThemeModeControl`
- `LanguageControl`
- `BackupPanel`
- `PortableExportsPanel`
- `DataClearPanel`
- `LocalDataStatus`
- `WeatherProviderPreferences`
- `WeatherLocationServices`
- `PrivacyPanel`
- `SettingsConfirmationDialog`
- `DataSourceRow`

## Appearance Verification

Verified by browser interaction:

- Switch to dark mode.
- Reload/navigate with persisted theme.
- Light and dark screenshots for settings and data sources.

## Language Verification

Verified:

- `en-US` settings and data sources.
- `zh-CN` settings and data sources.
- `<html lang>` updates.
- Document titles update from the current i18n catalog.

## Export And Import Verification

Backup export:

- UI button clicked.
- Original blob download path triggered.
- Filename observed: `lifeboard-backup-2026-07-06.json`.

Import:

- Invalid JSON file selected through the real file input.
- Error state rendered.
- Storage schema was not polluted.

Portable exports remain unchanged.

## Clear And Reset Verification

Clear all confirmation was opened through the real UI.

Verified:

- Confirmation dialog appears.
- Cancel is first focus target.
- Escape/cancel path remains available through native dialog cancellation.
- Destructive confirmation is visually distinct and requires acknowledgement for all-data clear.

## Data Sources Verification

Verified:

- `/settings/data-sources` opens directly.
- Open-Meteo status is visible.
- Caiyun token configuration state is visible.
- AMap configuration state is visible.
- Browser local storage boundary is visible.
- AMap key save success was triggered from the existing Settings control.
- Weather route opens without data-source errors.

## Empty, Error, And Success States

Verified:

- Empty local data state.
- Import invalid JSON error state.
- Export success path.
- AMap key save success path.
- Clear confirmation state.
- Unconfigured provider/key states.

## Responsive Verification

Verified viewports:

- 375 x 812 equivalent coverage through required mobile screenshots.
- 390 x 844
- 768 x 1024
- 1024 x 768
- 1280 x 800
- 1440 x 900
- 1920 x 1080

No horizontal overflow was detected in evidence checks.

## i18n Verification

New visible copy was added to the existing Settings i18n catalog in:

- `src/i18n/keys.ts`
- `src/i18n/locales/en-US.ts`
- `src/i18n/locales/zh-CN.ts`

Settings currently lives in the core i18n catalog rather than `*-modules.ts`, so the change follows the current structure instead of migrating keys.

## Light And Dark Verification

Captured:

- Light mobile settings.
- Dark mobile settings.
- Light desktop settings.
- Dark desktop settings.
- Light data sources.
- Dark data sources.

## Accessibility Verification

Verified:

- One main H1 per route.
- Section heading hierarchy remains structured.
- Native radio groups remain keyboard-operable.
- File input keeps its label.
- API key/token inputs keep labels and password semantics.
- Error and success messages retain `role="alert"` or `aria-live`.
- Confirmation dialog keeps title, description, focus trap, cancel-first focus, and return focus.
- Reduced-motion mode was captured.

## App Regression

Opened and captured:

- `/app`
- `/todos`
- `/bookmarks`
- `/tools`
- `/weather`

No console errors or horizontal overflow were detected.

## Route Regression

Checked direct access to:

- `/`
- `/app`
- `/todos`
- `/bookmarks`
- `/tools`
- `/settings`
- `/settings/data-sources`
- `/weather`
- `/weather/cities`
- `/weather/15-day`
- `/this-route-does-not-exist`

Each route had a main region and one H1 in the automated checks.

## Weather Freeze Verification

No weather module files were modified.

Forbidden weather paths remained unchanged:

- `src/modules/weather`
- `src/assets/weather/atmosphere`
- `public/weather-assets`
- `public/__local_weather_reference`

## Build Result

Baseline build passed before edits.

Final build passed after edits.

Existing warning remains:

- `lib` chunk larger than 500 kB.

Final relevant chunks:

- `SettingsPage-CwNsWJIs.js`: 64.40 kB, gzip 14.99 kB.
- `SettingsPage-BhpHQiqH.css`: 3.66 kB, gzip 0.88 kB.
- `DataSourcesPage-BhqmVqLx.js`: 16.57 kB, gzip 3.59 kB.
- `DataSourcesPage-zZ_H4Vym.css`: 4.32 kB, gzip 0.93 kB.

No dependency was added.

## Screenshots

Screenshot and evidence directory:

`C:\Users\jingr\AppData\Local\Temp\lifeboard-stage9-settings-final`

Generated required screenshots:

1. `01-stage9-light-390-settings-top.png`
2. `02-stage9-light-390-settings-data-management.png`
3. `03-stage9-light-390-settings-confirmation.png`
4. `04-stage9-dark-390-settings-top.png`
5. `05-stage9-light-390-data-sources-top.png`
6. `06-stage9-light-390-data-sources-editing.png`
7. `07-stage9-dark-390-data-sources.png`
8. `08-stage9-light-768-settings.png`
9. `09-stage9-light-1024-settings.png`
10. `10-stage9-light-1280-settings.png`
11. `11-stage9-light-1440-settings.png`
12. `12-stage9-dark-1440-settings.png`
13. `13-stage9-light-1920-settings.png`
14. `14-stage9-zh-390-settings.png`
15. `15-stage9-zh-1440-data-sources.png`
16. `16-stage9-export-success.png`
17. `17-stage9-import-invalid.png`
18. `18-stage9-data-source-save-success.png`
19. `19-stage9-bottom-nav-clearance.png`
20. `20-stage9-reduced-motion.png`
21. `21-stage9-app-regression.png`
22. `22-stage9-weather-regression.png`
23. `23-stage9-tools-regression.png`
24. `24-stage9-bookmarks-regression.png`
25. `25-stage9-todos-regression.png`

## Known Limitations

Chrome Headless/CDP fallback was used because `playwright-cli` was unavailable.

The data-source page remains a read-only status page. It does not test providers, request location, or verify external credentials because those behaviors are intentionally not part of the current contract.

## Recommended Next Stage

Proceed to the next commercial upgrade stage only after a separate handoff. This stage stops at Settings and Data Sources.
