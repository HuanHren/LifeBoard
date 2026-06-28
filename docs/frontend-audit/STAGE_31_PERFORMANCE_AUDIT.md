# Stage 31 Performance Audit

## Build Baseline

`npm run build` passed. The build produced the expected Vite chunk-size warning for the large vendor/library chunk. Route chunks are split, and Pixi renderer modules are not part of every page route.

Largest audited chunks:

| Chunk | Size |
| --- | ---: |
| `lib-*.js` | about 513 KB |
| `index-*.js` | about 289 KB |
| `WeatherPage-*.js` | about 84 KB |
| `SettingsPage-*.js` | about 63 KB |
| Pixi geometry/render chunks | about 39-63 KB each |
| `ToolsPage-*.js` | about 26 KB |
| `BookmarksPage-*.js` | about 21 KB |
| `TodosPage-*.js` | about 21 KB |

## Production Isolation

Production scan found no local evidence directory references, absolute local project paths, or credentials in `dist`. Stage 30 authorized vendor weather assets are present by baseline and were not changed during this audit.

## Findings

| ID | Area | Severity | Route | Viewport | Evidence | Current behavior | Why it is a problem | Recommended direction | Affected files | Dependencies | Suggested phase | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PERF-01 | Bundle size | P1 | all | all | `lib-*.js` is about 513 KB and triggers Vite warning | Shared vendor/library chunk is large | Initial navigation can pay too much shared JS before feature use | Analyze vendor splitting and lazy boundaries without adding new production dependencies | Vite config, route imports, shared modules | Stage 32 baseline | Stage 41 | Chunk plan documented and warning either justified or reduced |
| PERF-02 | Tools loading | P2 | `/tools` | all | Tools route chunk contains all tool implementations | The main app is protected, but Tools workspace loads all tools together | Future tools will grow the route chunk | Add per-tool async components if the tool set expands | `src/modules/tools/components/ToolsWorkspace.vue` | Route/query update | Stage 37 | Tools route remains under agreed budget or splits heavy tools |
| PERF-03 | Large page components | P2 | `/settings`, `/weather` | all | Multiple 400+ line components and a 900+ line store | Build passes but maintainability and tree-shaking boundaries are broad | Large files make performance regressions harder to isolate | Split by domain with tests and route-level evidence | Settings/weather modules | Design system and weather closeout | Stage 35/39 | Large page/workspace files are reduced or justified by explicit ownership |

## Browser Runtime

The production preview matrix recorded no failed requests and no unexpected local reference requests. The only console warnings were Chromium WebGL `ReadPixels` performance warnings during a weather desktop screenshot capture.
