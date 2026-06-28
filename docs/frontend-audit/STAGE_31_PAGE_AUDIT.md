# Stage 31 Page Audit

## Home

Home is reliable and readable, with summaries for weather, todos, tools, bookmarks, and settings. It should become the product's command center rather than a module index.

## Weather

Weather is the most mature module. It has route-specific pages, visual scenes, provider notices, cache state, favorites, city management, AQI, hourly and daily panels, and reduced-motion handling. The main architectural risk is the long-range route bypassing the main provider/cache abstraction.

## Todos and Countdowns

Todos and countdowns are functional and have meaningful empty, edit, delete, and composer states. The section still uses card-heavy layouts and a small native checkbox target.

## Tools

Tools are route-lazy, but all tool implementations are bundled into the Tools route and selected with local state. This is acceptable for the current size, but the tools workspace lacks deep links, history, and per-tool route identity.

## Bookmarks

Bookmarks has composer, controls, sections, edit form, delete confirmation, storage, validation, and URL normalization. It is functional but closer to a utility list than a polished knowledge workspace.

## Settings

Settings is comprehensive but heavy. It combines appearance, language, weather provider preferences, location services, data source transparency, backups, exports, privacy, and data clearing.

## NotFound

NotFound is simple, accessible, and correctly recovers to Home. It is visually consistent but still uses the same card style as many other pages.

## Findings

| ID | Area | Severity | Route | Viewport | Evidence | Current behavior | Why it is a problem | Recommended direction | Affected files | Dependencies | Suggested phase | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PAGE-01 | Home productization | P1 | `/` | all | Production preview shows module summaries and entry links | Home summarizes modules but does not drive a daily workflow | It underuses the first screen for commercial value | Rebuild around current weather, today's tasks, urgent countdowns, and recent bookmarks | `src/modules/home/*` | App shell and design system | Stage 34 | First viewport has one primary operational story and quick actions |
| PAGE-02 | Tools routing | P2 | `/tools` | all | `ToolsWorkspace.vue` selects `activeTool` locally | Tool state is not URL-addressable | Users cannot link to or restore a specific tool directly | Add per-tool route/query state while keeping the single workspace | `src/modules/tools/*`, router | Route shell | Stage 37 | Each tool can be directly opened and browser back/forward works |
| PAGE-03 | Task touch target | P2 | `/todos` | mobile | `TaskItem.vue` checkbox uses `size-5` | Checkbox control is visually small | Touch ergonomics are weaker even if the label is clickable | Increase control affordance or wrap in larger hit area | `src/modules/todos/components/TaskItem.vue` | Design system field primitive | Stage 36 | Task completion target meets mobile touch expectations |
| PAGE-04 | Bookmarks workspace | P2 | `/bookmarks` | desktop/mobile | Browser preview shows a management-list pattern | Bookmark interactions work but lack higher-level grouping/pinning/product hierarchy | A commercial bookmark tool needs faster retrieval and organization | Add richer list density, saved views, import/export affordances, and clear grouping | `src/modules/bookmarks/*` | Design system | Stage 38 | Common retrieval actions are visible and keyboard accessible |

## Browser Evidence

Production preview verified all listed routes across desktop, tablet, and mobile viewports. The route matrix recorded no horizontal overflow, failed network requests, or unnamed buttons/links.
