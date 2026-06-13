# LifeBoard Design System

## Design Read

LifeBoard is a personal daily workspace for practical routines, with a warm, quiet, clear product UI language.

## Direction

The interface should feel like a calm daily desk: grounded, readable, restrained, and ready for utility modules. It should not look like a generic admin dashboard, an analytics product, or an AI-purple template.

## Color System

The primary accent is warm clay green. It is the only accent color in the interface.

Colors are defined as OKLCH CSS variables in `src/assets/styles/tokens.css`. Components consume semantic variables instead of hardcoded values.

Token groups:

- Canvas and surfaces
- Borders
- Text hierarchy
- Warm clay green accent
- Focus ring
- Danger state

## Theme Foundation

LifeBoard supports light, dark, and system theme modes.

Theme mode is stored in Pinia and applied through `data-theme` on the document root. Both themes share the same semantic token names so components do not need theme-specific branching.

## Type System

The skeleton uses a reliable system sans-serif stack. Type scale is defined with CSS variables:

- Page title
- Section title
- Body
- Label
- Caption

Headings use balanced wrapping. Paragraphs use pretty wrapping. Numeric future content should use tabular numbers.

## Spacing And Density

The spacing system uses an 8px rhythm expressed as CSS variables. The product density is practical and moderate: more compact than a landing page, calmer than a dense dashboard.

## Shape And Depth

Corners use a small, consistent radius scale:

- Small for buttons and compact controls
- Medium for grouped UI
- Large for module surfaces
- Pill only for narrow skeleton bars or future chip-like controls

Depth is restrained. Borders and subtle surface shifts do most of the structural work. Shadows are reserved for elevated mobile panels and explicit raised surfaces.

## Motion

Motion is limited to fast CSS transitions for interaction feedback. No GSAP or heavy animation libraries are used in the first stage.

All motion respects `prefers-reduced-motion`.

## App Shell

Desktop layout:

- Fixed left sidebar
- Sticky topbar
- Main content area with constrained width

Mobile layout:

- Sticky topbar
- Bottom primary navigation
- Optional compact navigation panel controlled by Pinia shell state

## Components

Base components:

- BaseButton
- BaseCard
- BaseSection
- BaseEmpty
- BaseError
- BaseSkeleton
- ThemeToggle
- PageHeader
- ModulePlaceholder

Layout components:

- AppShell
- SidebarNav
- Topbar
- MobileNav

## Routes

- `/`
- `/weather`
- `/todos`
- `/tools`
- `/bookmarks`
- `/settings`

## Module Boundaries

Route modules live under `src/modules`. Route page components stay thin and compose shared base components. Shared UI stays in `src/components`. Cross-app constants, types, composables, and utilities live under `src/shared`.

## Placeholder Rules

Placeholders must be honest. They may describe future module intent, but they must not show fake weather, fake metrics, fake charts, fake sync status, fake completed task counts, or invented activity.
