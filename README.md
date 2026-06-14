# LifeBoard

LifeBoard is a local-first personal daily workspace built with Vue 3, TypeScript, Vite, Vue Router, Pinia, Tailwind CSS v4, and CSS variables.

Repository: https://github.com/HuanHren/LifeBoard

## Modules

- Home: real summaries and entry points for the connected modules
- Weather: city search, current conditions, hourly and daily forecasts, and practical advice from Open-Meteo
- Todos: locally persisted tasks and countdowns
- Tools: private in-browser text, JSON, timestamp, case, and counting utilities
- Bookmarks: locally persisted links with categories and pinning
- Settings: theme controls, local data review, backup, restore, privacy information, and selective clearing

## Privacy

LifeBoard has no account system, backend, analytics, or cloud sync. Theme, selected city, todos, countdowns, and bookmarks stay in browser storage. Tool input is not persisted. Open-Meteo is the only external data service and is used only for city search and weather forecasts.

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

The application routes are `/`, `/weather`, `/todos`, `/tools`, `/bookmarks`, and `/settings`.
