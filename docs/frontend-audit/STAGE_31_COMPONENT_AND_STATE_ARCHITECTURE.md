# Stage 31 Component and State Architecture Audit

## Component Architecture

The project uses Vue SFCs, Pinia setup stores, route-level lazy pages, and shared base components. The shared base layer currently includes button, card, section, skeleton, empty, error, placeholder, page header, and theme toggle primitives.

The architecture is serviceable, but several modules have grown into broad page/workspace components. The largest audited files are:

| File | Lines | Risk |
| --- | ---: | --- |
| `src/modules/weather/components/WeatherAtmosphere.vue` | 1075 | Legacy weather visual surface remains large |
| `src/modules/weather/stores/weather.ts` | 927 | Store owns many provider, cache, search, favorite, AQI, and sync concerns |
| `src/modules/settings/pages/DataSourcesPage.vue` | 552 | Page mixes source metadata, current weather state, and display sections |
| `src/modules/settings/components/SettingsWorkspace.vue` | 501 | Settings workspace owns many unrelated panels and side effects |
| `src/modules/weather/renderers/pixi/WeatherPixiLayer.vue` | 474 | Renderer is specialized but has substantial lifecycle responsibility |

## State and Data Architecture

Pinia stores are used consistently for theme, language, weather, todos, and bookmarks. Local storage access is mostly contained in services or stores. Weather has the strongest domain architecture, but the long-range forecast page currently bypasses the provider/cache store path and calls Open-Meteo directly.

## Findings

| ID | Area | Severity | Route | Viewport | Evidence | Current behavior | Why it is a problem | Recommended direction | Affected files | Dependencies | Suggested phase | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ARCH-01 | State/data architecture | P1 | `/weather/15-day` | all | `LongRangeForecastPage.vue` imports `fetchOpenMeteoForecast` and `normalizeWeatherForecast` directly | The page creates a separate Open-Meteo request/normalization path | It bypasses provider-neutral weather store behavior and can drift from cache/provider rules | Move long-range loading behind the weather store/service abstraction | `src/modules/weather/pages/LongRangeForecastPage.vue`, `src/modules/weather/stores/weather.ts` | Weather regression | Stage 35 | Long-range forecast uses the same provider/cache boundary as the main weather page |
| ARCH-02 | Component boundaries | P1 | `/settings`, `/settings/data-sources` | desktop/mobile | Settings workspace and data sources page exceed 500 lines each | Settings sections are composed but orchestration is still page-heavy | Harder to test, reason about, and productize settings workflows | Split by domain: appearance, language, weather services, data management, exports, privacy | `src/modules/settings/components/SettingsWorkspace.vue`, `src/modules/settings/pages/DataSourcesPage.vue` | Design system and route shell | Stage 39 | Settings pages have smaller domain containers and shared form/status patterns |
| ARCH-03 | Store responsibility | P2 | `/weather`, `/weather/cities` | all | Weather store is 900+ lines | One store handles location, forecast, cache, favorites, provider credentials, search, AQI | Broad store responsibility increases regression risk | Extract provider/cache/search/favorites composables or stores after behavior is covered | `src/modules/weather/stores/weather.ts` | Stage 35 tests | Stage 35 | Weather store public API is narrower and route behavior is unchanged |
| ARCH-04 | Shared primitives | P2 | all | all | Base layer lacks shared input, select, dialog, tabs, tooltip, toast, and form-field primitives | Pages build form and panel patterns locally | Visual and a11y behavior can drift between modules | Add a focused design-system layer before page rebuilds | `src/components/base/*` | Token cleanup | Stage 33 | New primitives cover common forms, feedback, and module navigation without new production dependencies |
| ARCH-05 | Theme initialization | P2 | app shell | all | `main.ts` and `App.vue` both call theme initialization | Theme listener setup is duplicated during startup | It is not breaking, but it is unnecessary lifecycle churn | Centralize app bootstrap ownership | `src/main.ts`, `src/app/App.vue`, `src/stores/theme.ts` | App shell audit | Stage 32 | Theme initialization runs once and dispose ownership is explicit |

## Preserved Strengths

The app uses setup stores and route lazy loading consistently. Weather renderer code is route isolated, and the production build keeps Pixi chunks lazy from the main route shell.
