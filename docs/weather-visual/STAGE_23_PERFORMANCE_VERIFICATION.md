# Stage 23 Performance Verification

## Build

Final commands:

```powershell
npm run build
npm ls pixi.js
```

Result: PASS. Vite emitted a chunk-size warning for the async Pixi `lib` chunk, not for the main app entry.

## Runtime Metrics

Playwright production-preview verification used mocked Open-Meteo responses for `partly-cloudy` day and night.

| Case | Pixi status | Canvas | DPR | Max FPS | Duplicate weather image requests |
|---|---|---:|---:|---:|---:|
| Desktop day 1440x1000 | ready | 1 | 1 | 30 | 0 |
| Desktop night 1600x900 | ready | 1 | 1 | 30 | 0 |
| Mobile day 390x844 | ready | 1 | 1.25 | 24 | 0 |
| Mobile night 430x932 | ready | 1 | 1.25 | 24 | 0 |
| Reduced motion | static-fallback | 0 | n/a | n/a | 0 |
| Save Data | static-fallback | 0 | n/a | n/a | 0 |
| WebGL failure | static-fallback | 0 | n/a | n/a | 0 |

## Resize

Mobile to desktop resize:

- Before: `ready`, FPS `24`, DPR `1.25`, one mobile AVIF request.
- After: `ready`, FPS `30`, DPR `1.5`, one additional desktop AVIF request selected by the existing responsive `<picture>`.
- Canvas count stayed `1`.

## Route Lifecycle

`/weather -> / -> /weather`:

- Before leaving: one ready canvas.
- After leaving weather route: canvas count `0`.
- After returning: one new ready canvas.
- Console error count: `0`.

## Visibility

The implementation stops the Pixi ticker on `visibilitychange` when the document is hidden and resumes only when status is `ready` and reduced motion is not active.

## Caveats

WebGL context-loss restoration was verified through forced WebGL creation failure and fallback behavior. A real browser context-loss/recovery event still needs manual browser DevTools or device-level validation.
