# LifeBoard

LifeBoard is a personal daily utility workspace built with Vue 3, TypeScript, Vite, Vue Router, Pinia, Tailwind CSS, and CSS variables.

This repository currently contains the first-stage project skeleton only.

## Stack

- Vue 3 with `<script setup lang="ts">`
- TypeScript
- Vite
- Vue Router
- Pinia
- Tailwind CSS v4 through `@tailwindcss/vite`
- CSS variable design tokens

## Routes

- `/`
- `/weather`
- `/todos`
- `/tools`
- `/bookmarks`
- `/settings`

## Project Structure

```text
src/
  app/
  assets/
    styles/
  components/
    base/
    layout/
  modules/
    home/
    weather/
    todos/
    tools/
    bookmarks/
    settings/
  router/
  stores/
  shared/
    composables/
    constants/
    types/
    utils/
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Current Scope

Implemented:

- Project skeleton
- App shell
- Router setup with lazy route components
- Pinia setup
- Theme store
- App shell store
- Light and dark theme foundation
- Sidebar, topbar, and mobile navigation
- Route page shells
- Base components
- Product and design documentation

Not implemented:

- Weather API
- Todo logic
- Real tools
- Bookmark persistence
- Backend
- Authentication
- Charts
- Image generation
- Heavy animation
