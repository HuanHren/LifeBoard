# Stage 33 Current State Audit

## Shell Hierarchy

Current hierarchy:

```text
App.vue
-> AppShell
   -> Skip link
   -> SidebarNav
   -> Topbar
   -> main#main-content
   -> MobileNav
-> RouterView
```

The shell is already route-driven and does not load page business data. Weather Pixi remains route isolated. The shell still mixes page title display into `Topbar`, while each page also renders its own `PageHeader`.

## Navigation Behavior

- Desktop uses a fixed 17rem sidebar at `lg` and above.
- Tablet currently falls into mobile bottom navigation until `lg`.
- Mobile uses a fixed two-row bottom navigation with six entries.
- Weather and settings child routes correctly keep their parent nav active.

## Header Duplication

`Topbar` reads `route.meta.titleKey` and renders the current page title. Most routes also render a page-level `PageHeader` with the same or equivalent title, creating duplicate title signals.

## Page Containers

The global `main` provides max width and padding. Individual pages still define their own spacing and max-width rules. Weather has a justified wider immersive surface, while Home, Todos, Tools, Bookmarks, Settings, NotFound, and child routes use repeated hand-authored wrappers.

## Sidebar Icon Implementation

Navigation icons are currently two-letter markers:

- `HM`
- `WE`
- `TD`
- `TL`
- `BK`
- `ST`

This is accessible only because labels are present, but it reads as a prototype visual system rather than a polished product shell.

## Mobile Bottom Navigation Risk

The current mobile nav uses a 3-column, two-row layout. It preserves discoverability but consumes too much vertical space and increases the chance that long page content feels blocked by navigation. The app mitigates this with `--mobile-nav-clearance`, but the nav footprint itself remains heavy.

## Existing Base Components

Current shared base components include:

- `BaseButton`
- `BaseCard`
- `BaseEmpty`
- `BaseError`
- `BaseSection`
- `BaseSkeleton`
- `ModulePlaceholder`
- `PageHeader`
- `ThemeToggle`

Missing or incomplete foundation pieces:

- `IconButton`
- `BaseInput`
- `FormField`
- semantic `Surface` / `Panel`
- reusable status / badge vocabulary
- compact page container component

## Token Sources

Tokens live in `src/assets/styles/tokens.css` and are already OKLCH based. They include semantic canvas, surface, text, border, accent, focus, danger, radius, motion, and shadow tokens.

Gaps:

- no explicit `background` / `foreground` aliases;
- no `success`, `warning`, `overlay`, `primary`, `muted`, or `surface-interactive` names;
- no `radius-xl`;
- no limited shadow scale beyond `--shadow-soft`;
- typography roles cover only page title, section title, body, label, caption.

## Theme Parity

Light and dark themes both define the current token set. The dark theme is coherent but lacks the same richer surface role vocabulary requested for Stage 33.

## Minimal Page Adaptation Needed

The following pages only need outer wrapper adoption:

- Home
- Weather
- Todos
- Tools
- Bookmarks
- Settings
- NotFound
- Weather city management
- Long-range weather
- Data sources

The page business content, stores, provider logic, weather renderer, WMO mapping, vendor manifest, and weather assets must remain unchanged.
