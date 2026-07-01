# LB-2D Weather Scene Runtime Stability Audit

## Audit Scope

LB-2D audits the shared config-driven runtime used by `partly-cloudy-day` and `partly-cloudy-night`. It does not migrate any additional weather scene and does not change scene presets, visual parameters, assets, CSS, provider behavior, store state, cache keys, city selection or location behavior.

## Runtime Ownership

| Runtime Object | Owner | Created At | Released At |
| --- | --- | --- | --- |
| Pixi Application | `WeatherPixiLayer.vue` component instance | `initializePixi()` after capability checks | `destroyPixi()` or pending-init catch cleanup |
| Canvas | Pixi Application | after `app.init()` and append to component root | `app.destroy({ removeView: true })` through `destroyPixi()` |
| Scene Container | active Pixi runtime instance | scene build inside `initializePixi()` | `app.destroy(..., { children: true })` |
| Base Sprite | scene container | config/legacy poster build | container/application destroy |
| Ambient Sprite | scene container | config/legacy poster build | container/application destroy |
| Ticker callback | active Pixi runtime instance | one `app.ticker.add(onTick)` | `handles.app.ticker.remove(handles.onTick)` |
| ResizeObserver | `WeatherPixiLayer.vue` component instance | after successful canvas/runtime mount | `destroyPixi()` |
| Visibility listener | `WeatherPixiLayer.vue` component instance | component setup | `onBeforeUnmount()` |
| Media query listeners | `WeatherPixiLayer.vue` component instance | component setup | `onBeforeUnmount()` |
| Texture/source reference | Pixi runtime | scene build from borrowed `HTMLImageElement` and generated ambient canvas | application destroy; browser image element remains owned by the `<picture>` layer |
| Async init state | `initGeneration` and `disposed` guards | every init/destroy cycle | stale continuations are ignored and pending app is destroyed |

Ownership finding: one concrete gap was found. If `app.init()` threw after `new pixi.Application()` and before `handles` was assigned, the previous catch path could not destroy that pending application. LB-2D fixes that with a local `initializingApp` owner and catch cleanup.

## Application Lifecycle

The runtime keeps one Application creation entry point: `new pixi.Application()` inside `initializePixi()`. `destroyPixi()` increments the generation, removes ticker/listeners owned by the mounted runtime, destroys the app with `removeView: true`, clears handles and reports `destroyed`, `loading`, `static-fallback` or `error` status as appropriate.

Pending-init cleanup now destroys an application created before `handles` is assigned. This covers `app.init()` failure and stale generation after async init.

## Ticker Lifecycle

The ticker callback is a stable local `onTick` function saved in `handles.onTick`. It is added once per mounted runtime and removed with the same reference during `destroyPixi()`. Visibility pause/resume calls `ticker.stop()` and `ticker.start()` and does not add another callback.

## Listener Lifecycle

`WeatherPixiLayer.vue` owns one document `visibilitychange` listener, three media-query `change` listeners and one `ResizeObserver` per mounted runtime. All are removed with the same callback references. Scene replacement does not register global listeners; it only rebuilds the runtime after `destroyPixi()` clears the previous observer and app.

## Texture And Source Ownership

Policy:

- `BORROWED_SOURCE`: the `<picture>` base `HTMLImageElement` remains owned by `WeatherAtmosphere.vue` and the browser image cache.
- `RUNTIME_OWNED_TEXTURE`: Pixi `ImageSource`, base `Texture`, generated ambient canvas texture and sprites are owned by the active runtime and destroyed with the Application.
- `SHARED_TEXTURE`: authorized-vendor textures loaded through `pixi.Assets.load()` are Pixi cache-managed legacy resources. LB-2D does not introduce a global texture cache.

Config-driven day/night uses the borrowed poster element as source and does not refetch the image URL. Resize updates renderer size and sprite fit; it does not create a new Application or new texture.

## Scene Replacement

Config scene replacement is handled by the existing watcher over `imageElement`, `visualKey`, `scenePlan.id`, `referenceScene.key` and `enabled`. Replacement calls `initializePixi()`, which first calls `destroyPixi('loading')`, increments generation and clears the previous runtime before building the next scene. Stale async continuations check `disposed || generation !== initGeneration.value` before committing.

## Async Race

Reviewed races:

- `import('pixi.js')` finishing after unmount: guarded by `disposed` and generation.
- `app.init()` finishing after scene change: guarded and pending app destroyed.
- asset/source changes during init: generation changes through `destroyPixi()` before the stale init can commit.
- day/night stale completion: guarded by `scenePlan.id` watcher and generation.
- config-to-legacy and legacy-to-config stale completion: guarded by `scenePlan.id` / `referenceScene.key` watcher and generation.
- reduced-motion during init: media listener calls `destroyPixi('static-fallback')`, increments generation and blocks stale commit.
- route leave during init: `disposed = true` and `destroyPixi('destroyed')` block stale commit.

## Reduced Motion

When reduced motion is active, `canAttemptPixi` becomes false or the media listener destroys the runtime. Browser verification must show no canvas, no active Application and no active ticker callback while reduced motion is active.

## Route Loop Test

PASS. A production preview build on `http://127.0.0.1:5300` completed 10 `/weather -> /settings -> /weather` loops with runtime debug enabled through `localStorage.__lifeboard_weather_runtime_debug = '1'`.

Result after the 10th return to `/weather`:

- `applicationCount: 1`
- `canvasCount: 1`
- `activeSceneCount: 1`
- `tickerCallbackCount: 1`
- `resizeListenerCount: 1`
- `visibilityListenerCount: 1`
- `mediaQueryListenerCount: 3`
- `activeTextureCount: 2`
- `applicationCreateCount: 11`
- `applicationDestroyCount: 10`
- `tickerAddCount: 11`
- `tickerRemoveCount: 10`

Each away step reached `applicationCount: 0`, `canvasCount: 0`, `tickerCallbackCount: 0`, `activeTextureCount: 0` and no DOM canvas.

## Day/Night Loop Test

PARTIAL. Ten day/night alternations passed with a reload-backed harness:

- Day target: `partly-cloudy-day`, `origin: config-driven`, desktop asset, `maxFps: 30`.
- Night target: `partly-cloudy-night`, `origin: config-driven`, desktop asset, `maxFps: 30`.
- Away step before each reload reached inactive runtime counters.

The test could not perform same-page forecast injection without adding test-only provider/store/cache controls. The production store reads the cached forecast at page load and does not expose a same-session injection hook. Per LB-2D scope, the result is capped at PARTIAL instead of adding store or provider behavior.

## Visibility Test

PASS. Ten synthetic `visibilitychange` hidden/visible cycles kept one active Application, canvas, scene, ticker callback and listener set. The debug counters reached `pauseCount: 10` and `resumeCount: 10`; no duplicate ticker callback or listener accumulation was observed.

## Viewport Test

PASS after fix. Desktop-to-mobile and mobile-to-desktop checks on `partly-cloudy-night` kept one active Application, canvas, scene and ticker callback after each resize.

The audit found that a responsive `<picture>` source swap could leave Pixi in `static-fallback` because `img.complete` / `naturalWidth` changed outside Vue reactivity. `WeatherAtmosphere.vue` now treats viewport-profile changes as a source rebind, clears `loadedBaseImage`, waits for the DOM update and re-marks an already-complete responsive image.

Verified mobile result:

- `sceneKey: partly-cloudy-night`
- `origin: config-driven`
- `viewportProfile: mobile`
- `maxFps: 24`
- `currentSrc` contains `partly-cloudy-night-base-mobile`
- `applicationCount: 1`, `canvasCount: 1`, `tickerCallbackCount: 1`

Verified desktop return:

- `viewportProfile: desktop`
- `maxFps: 30`
- `currentSrc` contains `partly-cloudy-night-base-desktop`
- `applicationCount: 1`, `canvasCount: 1`, `tickerCallbackCount: 1`

## Memory And Counter Results

PASS for deterministic counters. `performance.memory` exposed a stable Chromium placeholder value in this headless run, so deterministic runtime counters are the primary evidence. CDP heap was available after the full run: `usedSize: 13350328`, `totalSize: 71254016`, `embedderHeapUsedSize: 11884992`, `backingStorageSize: 1948257`.

Final cleanup on `/settings` reported no DOM canvas and no Pixi debug snapshot because the Pixi layer was not loaded on that route. During active weather scenes, counters stayed bounded at one Application, one canvas, one active scene, one ticker callback, one resize observer, one visibility listener and three media-query listeners.

## Problems Found

1. Pending Pixi Application cleanup gap: `new pixi.Application()` occurred before `await app.init()`, but the catch path could only call `destroyPixi()`, which had no `handles` yet.
2. Responsive image completion race: desktop-to-mobile source selection could leave the runtime in static fallback because the base image became complete after the computed `canAttemptPixi` value had already evaluated.
3. Test harness limitation: same-page day/night forecast injection is not available without modifying production provider/store/cache behavior.

## Fixes Applied

1. Added local `initializingApp` cleanup so failed or stale async initialization destroys a pending Application before falling back.
2. Added a test-gated runtime debug snapshot API with real lifecycle counters for Applications, canvases, scenes, ticker callbacks, listeners, textures and generation.
3. Added `scripts/lb-2d-validate-weather-scene-runtime-stability.mjs` for static lifecycle guard checks and chained LB-2A/B/C regression validation.
4. Added responsive-source recovery in `WeatherAtmosphere.vue` so viewport source swaps re-acknowledge already-complete base images and re-enable the config-driven Pixi runtime.

## Visual Regression

PASS within LB-2D scope. No scene parameters, asset names, weather resolution rules, CSS layout, provider state or store state were changed. Static validation keeps the known `partly-cloudy-day` and `partly-cloudy-night` motion values unchanged. Browser verification confirmed config-driven day and night still render through two loaded layers with the expected desktop/mobile source and frame-rate profile.

## Accessibility

No new UI, focus target, ARIA output or visible text was added. The debug API is not represented in the accessibility tree. The Pixi canvas remains decorative with `aria-hidden="true"`, `role="presentation"` and `tabindex="-1"`.

## Known Limitations

- Same-session day/night injection was not tested because the production weather store does not expose a test-only forecast injection hook and LB-2D forbids provider/store/cache behavior changes.
- The browser harness intentionally aborted authorized vendor weather-asset requests for unrelated legacy assets. The resulting `net::ERR_FAILED` console entries are harness noise, not application exceptions.
- Headless Chromium reported a fixed `performance.memory` value; deterministic lifecycle counters and CDP heap were used instead.
- The runtime debug API is for local audits only and is gated by development mode or explicit localStorage opt-in.

## Next Migration Readiness

Result: PARTIAL. The runtime lifecycle issues found during LB-2D were fixed and the production-preview browser checks passed, but the day/night alternation proof remains reload-backed because same-page injection is outside the current production API surface.

Recommended next step: Runtime is stable; evaluate whether clear-day is suitable for the next single-scene migration.
