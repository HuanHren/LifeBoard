# LifeBoard

LifeBoard is a local-first personal life workspace for checking daily context, planning small tasks, using private browser tools, and keeping useful references together.

Repository: https://github.com/HuanHren/LifeBoard

Live demo: https://life-board-two.vercel.app/

## Screenshots

| Home | Weather |
| --- | --- |
| ![LifeBoard Home dashboard in light mode](docs/screenshots/home.png) | ![LifeBoard Weather assistant with a real forecast](docs/screenshots/weather.png) |

![LifeBoard Settings in dark mode](docs/screenshots/settings-dark.png)

## Features

- **Home**: calm summaries and direct entry points for connected modules
- **Calendar**: a read-only month and agenda view derived from Todo due dates and Countdown targets
- **Weather**: city search, current conditions, 24-hour forecast, 7-day outlook, practical daily advice, and optional Caiyun Weather provider support
- **Todos and Countdowns**: create, edit, complete, filter, and locally persist tasks and important dates
- **Tools**: JSON formatting, timestamp conversion, text cleanup, line deduplication, case conversion, and text counting
- **Bookmarks**: locally save, categorize, search, edit, pin, and remove useful links
- **Settings**: theme controls, local data status, backup, restore, privacy information, and selective data clearing
- **Language Switching**: built-in Simplified Chinese and US English
- **Backup and Restore**: local JSON export and import for LifeBoard-owned browser data
- **Translation Source Export**: export static UI text for translation work without including user data
- **Not Found**: a clear recovery page for unknown routes

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Tailwind CSS v4
- Open-Meteo
- AMap Web Service
- Caiyun Weather
- CSS variables and OKLCH design tokens

## Privacy And External Services

LifeBoard is local-first. It has no account system, analytics, cloud sync, or mobile application.

Open-Meteo is the default weather service. City search and Open-Meteo forecasts are requested directly from Open-Meteo.

AMap Web Service can be used for Chinese city geocoding and current-location reverse geocoding when you save your own AMap Web Service Key in Settings. The key is stored only in this browser and sent only in same-origin POST requests to LifeBoard's Vercel API routes. Do not paste real keys into source files, README content, screenshots, commits, or issue comments.

Caiyun Weather can be selected as an optional forecast provider. Its token is entered locally in Settings, stored only in this browser, and sent only in a same-origin POST request to LifeBoard's Vercel API proxy. The token is not stored on the server, not included in URLs, not included in backups, and not included in portable exports.

Interface translation is bundled locally. LifeBoard does not use a machine translation API.

LifeBoard stores these values in this browser's `localStorage`:

- Theme preference
- Selected weather city
- Optional AMap Web Service Key and Home auto-location preference
- Todos and countdowns
- Bookmarks

Tools input is processed in memory and is not persisted. Forecast response data is not included in backups.

Backup files are generated locally. Translation source export contains only static UI text, not user-created content or local data.

## Backup And Restore

Settings can export a JSON backup containing the LifeBoard-owned local data listed above. Import validates the file before replacing current local data. Restore operations use the existing storage formats and roll back if a browser storage write fails.

Backups are user-controlled files. LifeBoard does not upload them.

## Local Running

Requirements:

- Node.js compatible with Vite 8
- npm

```bash
git clone https://github.com/HuanHren/LifeBoard.git
cd LifeBoard
npm install
```

Start the development server:

```bash
npm run dev
```

`npm run dev` runs the Vite frontend only. It does not serve Vercel API routes such as `/api/caiyun-weather`, `/api/amap-geocode`, `/api/amap-reverse-geocode`, or the optional server-only Xiaomi proxy under `/api/weather/xiaomi/*`.

To test same-origin API routes locally, use Vercel's local runtime:

```bash
vercel dev
```

Browser geolocation requires HTTPS or localhost and always requires user permission. LifeBoard uses `getCurrentPosition` only; it does not use background tracking or `watchPosition`.

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run the route accessibility smoke baseline:

```bash
npm run qa:a11y:routes
```

Run the same route baseline with CI-oriented text output:

```bash
npm run qa:a11y:routes:ci
```

Generate machine-readable JSON output:

```bash
npm run qa:a11y:routes:json
```

Write the JSON summary to the artifact path used by CI:

```bash
npm run qa:a11y:routes:json:file
```

Generate the route screenshot and design QA baseline:

```bash
npm run qa:screenshots
```

Run the same screenshot baseline with CI-oriented settings:

```bash
npm run qa:screenshots:ci
```

Run build plus the screenshot baseline:

```bash
npm run qa:design
```

Run the full local QA baseline:

```bash
npm run qa
```

`npm run qa:a11y:routes` starts a local production preview, checks the main routes at 390x844, 768x1024, and 1440x900, and verifies core landmarks, headings, skip link behavior, overflow, console errors, navigation, tablists, form labels, dialog semantics, Settings confirmation-dialog hooks, and frozen Weather route smoke. Playwright is a project dev dependency; on a fresh machine or CI runner, run `npm ci` and `npx playwright install chromium` before QA if Chromium has not been installed yet. Axe automation is not part of this baseline yet.

`npm run qa:screenshots` captures 32 route screenshots into `.qa/route-screenshots/`, writes `.qa/route-screenshots/manifest.json`, and writes `.qa/route-screenshots-summary.json`. The `.qa/` directory is ignored by git, so generated screenshots are local QA artifacts and should not be committed.

GitHub Actions runs build plus route accessibility QA on pushes and pull requests targeting `main`. The workflow uploads `.qa/route-a11y-summary.json` as the `route-a11y-summary` artifact when the JSON summary is available.

## Project Structure

```text
src/
  app/                 Application entry composition
  assets/styles/       Global styles and design tokens
  components/
    base/              Shared UI primitives
    layout/            App shell, sidebar, topbar, and mobile navigation
  modules/
    home/              Daily overview
    calendar/          Read-only Todo and Countdown date aggregation
    weather/           Weather providers, store, advice, and forecast UI
    todos/             Tasks, countdowns, and local persistence
    tools/             Isolated browser utility workspaces
    bookmarks/         Saved-link management and local persistence
    settings/          Theme, backup, restore, privacy, and data clearing
    not-found/         Unknown-route recovery
  router/              Vue Router configuration
  stores/              Cross-app Pinia stores
  shared/              Shared constants and types
```

## Deployment

### Vercel

LifeBoard is hosted on Vercel: https://life-board-two.vercel.app/

1. Push the repository to GitHub.
2. Import `https://github.com/HuanHren/LifeBoard` into Vercel.
3. Use the Vite framework preset.
4. Use `npm run build` as the build command.
5. Use `dist` as the output directory.
6. Leave environment variables empty for the default Open-Meteo experience. The optional Xiaomi Weather proxy requires server-only `XIAOMI_WEATHER_*` variables in Development or Preview; W1 does not enable them for Production. Never use `VITE_` variables for Xiaomi credentials.

`vercel.json` keeps `/api/*` available for Vercel Functions and rewrites other direct requests to `index.html`, allowing Vue Router to preserve clean history-mode routes. After deployment, test direct access to `/`, `/calendar`, `/weather`, `/todos`, `/tools`, `/bookmarks`, `/settings`, `/missing-route`, and the POST-only `/api/caiyun-weather`, `/api/amap-geocode`, and `/api/amap-reverse-geocode` routes.

For a Development or Preview environment with the optional Xiaomi variables configured,
also validate `GET /api/weather/xiaomi/search?q=尉氏县` and
`GET /api/weather/xiaomi/all?locationKey=...&latitude=...&longitude=...&locale=zh-CN&days=15`.
Weather W3 can expose Xiaomi in the existing Settings weather-source control only when the
non-secret `VITE_XIAOMI_WEATHER_ENABLED=true` feature flag is present. The flag defaults to
disabled, Xiaomi remains unavailable in Production, and the verified client contract is limited
to `zh-CN` and `days=15`. See `docs/weather-w1-xiaomi-proxy-contract.md` for the proxy safety
boundary, `docs/weather-w3-dual-source-integration.md` for runtime eligibility, and
`docs/weather-w5-resilience-finalization.md` for the bounded cache, retry, cooldown, and
transparent Xiaomi-to-Open-Meteo recovery policy. Production Xiaomi remains disabled until a
separate, explicit release task completes the production checklist.

A custom domain can be connected from Vercel Project Settings > Domains after the project is imported.

### GitHub Pages

GitHub Pages is possible but is not configured in this repository. A project-site deployment would require a `/LifeBoard/` Vite base path and explicit handling for direct SPA route requests. GitHub Pages does not provide Vercel-style rewrites, so clean route refreshes require a `404.html` workaround or hash-based routing.

## Route Check

After local preview or deployment, verify these routes load:

- `/`
- `/calendar`
- `/weather`
- `/todos`
- `/tools`
- `/bookmarks`
- `/settings`
- `/missing-route`

## Roadmap

- Add more language packs
- Add optional local utilities where they fit the daily workspace
- Improve backup and import review flows
- Continue mobile polish for dense everyday workflows

The roadmap does not include accounts or cloud sync unless the product direction changes.

## License

No license has been selected. Copyright remains with the repository owner unless a license file is added later.
