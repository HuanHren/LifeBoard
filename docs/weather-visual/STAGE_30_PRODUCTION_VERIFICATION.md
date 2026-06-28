# Stage 30 Production Verification

## Build Verification

`npm run build` passed after Stage 30 integration. The only warning was the existing Vite chunk size warning.

## Dist Checks

Expected production output:

- `dist/weather-assets/vendor/xiaomi/manifest.json`
- 21 copied vendor image files under `dist/weather-assets/vendor/xiaomi/`
- No `dist/__local_weather_reference`
- No `.env.local` dependency
- No `D:\LifeBoard` or `D:\XiaomiWeather-Reversing` strings
- No JADX, Apktool, Smali, MAML, shader, or native implementation paths

## Runtime Checks

Local Playwright verification was run against both Vite dev and production preview.

- Total rows: 148
- Dev rows: 74
- Production preview rows: 74
- Failed rows: 0
- Viewports: 1440x1000, 1920x1080, 834x1112, 1024x768, 390x844, 430x932
- Evidence: `docs/weather-visual-local/stage-30/stage-30-runtime-verification.json`

Verified production checks:

- `partly-cloudy` reports `data-weather-asset-origin="lifeboard-original"`
- clear/cloudy/overcast/fog/haze/rain/snow/thunderstorm/sleet-freezing/sand-dust report `authorized-vendor`
- unknown reports fallback
- maximum one Pixi canvas in the weather atmosphere
- reduced-motion disables Pixi animation
- route leave removes the canvas and route return recreates one canvas
- failed manifest or image request falls back without infinite retry
