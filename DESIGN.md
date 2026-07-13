# LifeBoard Design System

## Direction

LifeBoard feels like a warm, quiet daily desk: grounded, readable, refined, and practical. It avoids generic administration templates, analytics styling, glass effects, decorative gradients, and excessive card grids.

## Visual System

- Warm clay green is the single product accent.
- Colors are semantic OKLCH variables in `src/assets/styles/tokens.css`.
- Light, dark, and system themes share the same token names.
- A system sans-serif stack keeps utility content familiar and readable.
- Spacing follows an 8px rhythm with moderate product density.
- Borders and subtle surface shifts provide depth; shadows are restrained.
- Small, medium, and large radii distinguish controls, groups, and module surfaces.

Vue components consume tokens rather than raw color values. Headings use balanced wrapping, body copy uses readable line lengths, and numerical data uses tabular figures where alignment matters.

## Interaction And Accessibility

- Keyboard focus remains visible on every interactive control.
- Native semantic elements are preferred.
- Forms use visible labels and associated errors.
- Empty, loading, success, and error states use direct language.
- Interaction motion is brief and respects `prefers-reduced-motion`.
- Light and dark theme text pairs target WCAG AA contrast.

## Product Structure

The app shell provides a fixed desktop sidebar, sticky topbar, responsive main region, and fixed mobile navigation. Lazy-loaded routes cover Home, Calendar, Weather, Todos, Tools, Bookmarks, Settings, and a calm not-found state. Calendar is a read-only projection of existing Todo and Countdown dates and owns no persistence.

Feature code remains under `src/modules`. Shared base and layout components stay under `src/components`, while cross-app constants, types, composables, and utilities live under `src/shared`.

## Data Boundaries

Weather requests use Open-Meteo. Theme, selected city, todos, countdowns, and bookmarks use browser-local persistence. Tools process input in memory and do not persist it. Settings backup and restore operate only on LifeBoard-owned storage fields.
