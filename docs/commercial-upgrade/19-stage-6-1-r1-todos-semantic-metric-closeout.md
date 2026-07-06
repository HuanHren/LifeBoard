# LifeBoard Commercial Upgrade - Stage 6.1R1

## Baseline

- Stage baseline commit: `6d25924` (`fix(todos): close mobile workflow and crud gaps`)
- Weather freeze baseline: `a54de16`
- Branch: `main`

## Root Cause

The Todos status rail rendered numeric counts and semantic empty states through the same `dd` element and the same large metric typography. Empty strings such as `None overdue`, `Nothing scheduled`, and `No saved dates` therefore inherited the visual hierarchy intended for real numeric counts. The English Today empty value also used `Today Clear`, repeating the card label.

## Metric Contracts

Numeric metric values now use an explicit `valueKind: 'numeric'` state derived from the same count that drives the existing metric copy. Numeric values keep the established large, tabular, high-emphasis metric style.

Semantic metric values now use `valueKind: 'semantic'` when the underlying count is zero. They keep the existing empty-state copy and use a smaller, controlled text style that remains stronger than helper text but below real numeric metrics.

This contract is data-driven and does not depend on string length, spaces, locale-specific selectors, or text matching.

## English Copy Correction

- `todos.tasks.metric.todayClear` changed from `Today Clear` to `Clear`.
- Other English empty metric copy remains unchanged: `None overdue`, `Nothing scheduled`, and `No saved dates`.

## Chinese Copy Verification

Chinese metric copy remains unchanged. The current strings continue to use natural semantic empty states rather than numeric zero values.

## Modified Files

- `src/modules/todos/components/TodosWorkspace.vue`
- `src/i18n/locales/en-US-modules.ts`
- `docs/commercial-upgrade/19-stage-6-1-r1-todos-semantic-metric-closeout.md`

## Responsive Verification Matrix

Required production-preview verification covered:

- `375 x 812`
- `390 x 844`
- `768 x 1024`
- `1024 x 768`
- `1280 x 800`
- `1440 x 900`
- `1920 x 1080`

The rail preserves the existing 2 x 2 mobile layout and one-row desktop layout. Semantic empty values wrap naturally without becoming the dominant page heading.

## Light, Dark, And i18n

Verification covered English and Chinese, empty and populated metric states, light mode, dark mode, and reduced motion. Semantic values remain readable in dark mode without using pure-white oversized text.

## Accessibility

The metric labels and values remain real document text in the existing `dl`, `dt`, and `dd` structure. No critical copy is injected through CSS pseudo-elements or hidden with `aria-hidden`. Color is not the only difference between numeric and semantic states; they use explicit class branches from the metric contract.

## CRUD Minimal Regression

The implementation does not touch stores, schemas, filters, persistence, delete/restore flows, or task/countdown components. Minimal production-preview regression confirmed filter switching, checkbox access, edit/delete controls, countdown readability, new-task entry, and refresh persistence.

## Route Regression

Production-preview route checks covered:

- `/`
- `/app`
- `/todos`
- `/weather`
- `/weather/cities`
- `/weather/15-day`
- `/bookmarks`
- `/tools`
- `/settings`
- `/settings/data-sources`
- `/this-route-does-not-exist`

Routes continue to render a `main` landmark and expected page heading/title behavior, with the unknown route resolving to Not Found.

## Weather Freeze Verification

No files under the weather freeze paths were modified:

- `src/modules/weather`
- `src/assets/weather/atmosphere`
- `public/weather-assets`
- `public/__local_weather_reference`

The weather freeze diff is empty.

## Build Result

Baseline and final builds pass. The existing Vite large chunk warning for `lib` remains. No dependency files were changed, and this stage does not add synchronous dependencies.

## Screenshots

Screenshot output directory:

`C:\Users\jingr\AppData\Local\Temp\lifeboard-stage61r1-final`

Expected files:

- `01-stage61r1-light-390-empty-metrics.png`
- `02-stage61r1-dark-390-empty-metrics.png`
- `03-stage61r1-light-768-empty-metrics.png`
- `04-stage61r1-light-1024-empty-metrics.png`
- `05-stage61r1-light-1440-empty-metrics.png`
- `06-stage61r1-dark-1440-empty-metrics.png`
- `07-stage61r1-light-1440-populated-metrics.png`
- `08-stage61r1-light-1920-empty-metrics.png`
- `09-stage61r1-zh-390-empty-metrics.png`
- `10-stage61r1-zh-1440-empty-metrics.png`

## Known Limitations

The production build still reports the pre-existing large `lib` chunk warning. The baseline also includes existing approved split chunks from previous stages; this stage did not introduce those imports or dependencies.

## Recommended Next Stage

Do not start Stage 7 from this closeout. A next stage should begin from the committed Stage 6.1R1 checkpoint with a fresh scope and separate verification plan.
