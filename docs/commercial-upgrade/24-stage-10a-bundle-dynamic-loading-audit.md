# Stage 10A Bundle And Dynamic Loading Audit

## 1. Stage Name

LifeBoard Commercial Upgrade - Stage 10A: bundle, chunk, and dynamic loading boundary audit.

## 2. Baseline Commit

- Baseline commit: `7ce4e96`
- Baseline message: `fix(app): close sitewide polish gaps`
- Weather freeze baseline: `a54de16`
- Current branch during audit: `main`

## 3. Skill Gate

Required local skill files were verified with `Test-Path -LiteralPath` and read with `Get-Content -LiteralPath -Raw` before project code reads, builds, or edits:

- `impeccable`
- `gpt-taste`
- `baseline-ui`
- `vue-best-practices`
- `vue-best-practices/references/reactivity.md`
- `vue-best-practices/references/sfc.md`
- `vue-best-practices/references/component-data-flow.md`
- `vue-best-practices/references/composables.md`
- `fixing-accessibility`
- `fixing-motion-performance`
- `playwright-cli`
- `audit`
- `harden`
- `impeccable/reference/product.md`

The optional helper `D:\LifeBoard\.agents\skills\impeccable\scripts\context.mjs` was not present and was recorded as non-blocking.

## 4. Project Docs Read

Read `PRODUCT.md`, `DESIGN.md`, and commercial upgrade documents `01` through `23`, including `23-stage-10-sitewide-closeout.md`.

## 5. Build Baseline

`npm run build` passed before edits. The existing warning remains:

```text
Some chunks are larger than 500 kB after minification.
```

The only chunk over 500 kB was:

```text
dist/assets/lib-CvCYwzkI.js 513.51 kB, gzip 145.82 kB
```

The complete build output was saved outside the repository at:

```text
C:\Users\jingr\AppData\Local\Temp\lifeboard-stage10a-bundle-audit\stage10a-build-baseline.txt
```

## 6. Chunk Summary Before

Largest JS and CSS chunks:

| Chunk | Type | Size |
| --- | --- | ---: |
| `lib-CvCYwzkI.js` | JS | 513.51 kB |
| `index-ItrLiooO.js` | JS | 343.93 kB |
| `WeatherPage-B9yuXhiu.js` | JS | 108.32 kB |
| `gsap-wuNaKWGN.js` | JS | 69.94 kB |
| `index-CnN9rROJ.css` | CSS | 67.62 kB |
| `SettingsPage-DXUks2NR.js` | JS | 64.40 kB |
| `Geometry-BpCb9ZJL.js` | JS | 63.44 kB |
| `GraphicsContext-Bz1xObDx.js` | JS | 54.28 kB |
| `RenderTargetSystem-BUrEuh7n.js` | JS | 52.32 kB |

Route page chunks:

| Route area | JS chunk | Size | CSS chunk | Size |
| --- | --- | ---: | --- | ---: |
| Landing | `LandingPage-D0sv6zEJ.js` | 17.03 kB | `LandingPage-GSUg2PyS.css` | 22.26 kB |
| Workspace | `HomePage-98VokjOB.js` | 26.53 kB | `HomePage-EgxNktbm.css` | 6.84 kB |
| Weather | `WeatherPage-B9yuXhiu.js` | 108.32 kB | `WeatherPage-DPi7hpyb.css` | 22.52 kB |
| Weather cities | `WeatherCityManagementPage-BLYVO0mu.js` | 17.20 kB | shared/global | n/a |
| Weather 15-day | `LongRangeForecastPage-LrjZKn_3.js` | 12.99 kB | shared/global | n/a |
| Todos | `TodosPage-Dul6kt7w.js` | 29.41 kB | `TodosPage-EfEbo3Ju.css` | 12.65 kB |
| Bookmarks | `BookmarksPage-B7okFeDy.js` | 25.09 kB | `BookmarksPage-Cx6C5lT3.css` | 9.58 kB |
| Tools | `ToolsPage-DW8oEji7.js` | 28.14 kB | `ToolsPage-DMCi8cSg.css` | 17.65 kB |
| Settings | `SettingsPage-DXUks2NR.js` | 64.40 kB | `SettingsPage-BhpHQiqH.css` | 3.66 kB |
| Data sources | `DataSourcesPage-DCrNyVVv.js` | 16.58 kB | `DataSourcesPage-zZ_H4Vym.css` | 4.33 kB |

## 7. Import Boundary Audit

Mandatory read-only audit covered 269 actual files. `D:\LifeBoard\src\App.vue` does not exist in the current architecture; the actual app root is `D:\LifeBoard\src\app\App.vue`.

Router findings:

- `/` uses `() => import('@/modules/landing/LandingPage.vue')`
- `/app` uses `() => import('@/modules/home/HomePage.vue')`
- `/weather` uses `() => import('@/modules/weather/WeatherPage.vue')`
- `/weather/cities` uses `() => import('@/modules/weather/pages/WeatherCityManagementPage.vue')`
- `/weather/15-day` uses `() => import('@/modules/weather/pages/LongRangeForecastPage.vue')`
- `/todos` uses `() => import('@/modules/todos/TodosPage.vue')`
- `/bookmarks` uses `() => import('@/modules/bookmarks/BookmarksPage.vue')`
- `/tools` uses `() => import('@/modules/tools/ToolsPage.vue')`
- `/settings` uses `() => import('@/modules/settings/SettingsPage.vue')`
- `/settings/data-sources` uses `() => import('@/modules/settings/pages/DataSourcesPage.vue')`

No page component was synchronously imported into the app shell.

## 8. GSAP / Landing Boundary

GSAP and ScrollTrigger only appear in `src/modules/landing/composables/useLandingScrollNarrative.ts`, inside dynamic imports:

```ts
await Promise.all([
  import('gsap'),
  import('gsap/ScrollTrigger'),
])
```

The production network audit did not load GSAP or ScrollTrigger on `/app`, `/todos`, `/bookmarks`, `/tools`, `/settings`, weather routes, or not-found.

## 9. Weather / Pixi Boundary

Pixi-related source imports are confined to `src/modules/weather/**`, with the runtime import inside the weather Pixi renderer:

```ts
await import('pixi.js')
```

The large `lib-CvCYwzkI.js` chunk contains PixiJS runtime code and imports Pixi subchunks such as geometry, graphics, filters, render target, and renderer chunks. It is not referenced by `dist/index.html`.

Production network evidence showed that `/app`, `/todos`, `/bookmarks`, `/tools`, `/settings`, `/settings/data-sources`, landing, and not-found did not request:

- `lib-CvCYwzkI.js`
- Pixi subchunks
- `WeatherPage-B9yuXhiu.js`
- GSAP chunks

Home and Settings intentionally import light weather store, formatting, source metadata, and backup/data-management helpers. They do not import `WeatherPage`, `WeatherAtmosphere`, or the Pixi renderer.

## 10. Route-Level Lazy Import Audit

All public routes remain route-level lazy imports. No route contract, route meta, title key, navigation key, or path was changed.

## 11. Vendor Split Analysis

`vite.config.ts` currently has no `manualChunks`. The warning is real, but the largest chunk is a lazy weather/Pixi runtime chunk, not the initial app shell.

Manual chunking was not applied in Stage 10A because:

- The over-limit chunk is only 13.51 kB above the 500 kB warning threshold.
- It is already outside the initial HTML load.
- It is tied to weather/Pixi runtime behavior and should stay behind the weather boundary.
- A broad manual vendor split could accidentally change preload behavior or fragment the Pixi runtime without clear user-facing benefit.
- No evidence showed GSAP or Pixi leaking into non-owning routes.

## 12. Optimization Decision

Stage 10A performed audit only. The lib warning remains and is documented for future vendor splitting.

No source optimization was applied because the safe conclusion is to preserve current lazy boundaries and defer any Pixi-specific vendor split until a dedicated weather performance pass.

## 13. Changes Made

No source changes were made.

The only repository change in this stage is this audit document:

```text
docs/commercial-upgrade/24-stage-10a-bundle-dynamic-loading-audit.md
```

## 14. Chunk Summary After

Because no source or build configuration changed, the final chunk summary is expected to match the baseline. The final build output is recorded separately in `stage10a-build-final.txt`.

Largest chunk before and after:

```text
lib-CvCYwzkI.js 513.51 kB, gzip 145.82 kB
```

The warning remains and is accepted for this stage because the chunk is lazy weather/Pixi runtime, not a global app-shell dependency.

## 15. Functional Smoke

Production-preview CDP smoke passed for:

- Landing open
- Workspace open
- Weather open
- Weather cities open
- Weather 15-day open
- Todo checkbox
- Bookmark search
- Tools JSON valid path
- Tools JSON error path
- Tools copy action
- Settings theme switch
- Settings language switch
- Settings clear confirmation cancel
- Unknown route not-found

Browser console events: `0`.

Page exceptions: `0`.

## 16. Weather Freeze

Weather frozen paths remained read-only:

```text
src/modules/weather/**
src/assets/weather/atmosphere/**
public/weather-assets/**
public/__local_weather_reference/**
```

Weather routes `/weather`, `/weather/cities`, and `/weather/15-day` passed production-preview route regression.

## 17. Known Limitations

- The `lib` chunk warning remains because it belongs to the weather/Pixi runtime chunk.
- `manualChunks` was not introduced because the current evidence does not prove a benefit larger than the lazy-boundary risk.
- Weather still needs its own future upgrade track for renderer and asset performance decisions.
- i18n copy and encoding cleanup was not expanded in Stage 10A.

## 18. Recommended Next Stage

Recommended next stage should be one of:

- Stage 10B: i18n copy and encoding audit.
- Stage 11: Weather module final regression and next upgrade preparation.

Do not start the next stage automatically.

## Evidence Files

Temporary evidence was written outside the repository:

```text
C:\Users\jingr\AppData\Local\Temp\lifeboard-stage10a-bundle-audit
```

Included files:

- `stage10a-build-baseline.txt`
- `stage10a-build-final.txt`
- `stage10a-chunk-summary.json`
- `stage10a-import-boundary.json`
- `stage10a-forbidden-import-scan.json`
- `stage10a-network-boundary.json`
- `stage10a-route-regression.json`
- `01-stage10a-390-app.png`
- `02-stage10a-390-tools-json.png`
- `03-stage10a-390-weather.png`
- `04-stage10a-1440-landing.png`
- `05-stage10a-1440-app.png`
- `06-stage10a-1440-weather.png`
- `07-stage10a-1440-tools.png`
- `08-stage10a-1440-settings.png`
- `09-stage10a-route-regression.png`
- `10-stage10a-network-boundary.png`
