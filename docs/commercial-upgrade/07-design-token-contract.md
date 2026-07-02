# LifeBoard Commercial Upgrade Stage 2 Design Token Contract

Decision date: 2026-07-02

Baseline commit: `ff1e5732202f46275a2cec631d60672db5953809`

Scope: design-token audit and target token contract only. This document authorizes no CSS, Vue, TypeScript, Tailwind, dependency, source, or Weather changes.

## Evidence Classes

- Fact: current repository behavior verified during Stage 2.
- Final design decision: stable visual-system contract for later implementation.
- Implementation guidance: how Stage 3 should implement the contract.
- Weather boundary: value that must remain Weather-private.
- Needs later verification: item to check when implementation begins.

## Current Token Audit

Fact: LifeBoard already has a useful token foundation.

| Area | Current behavior | Evidence |
| --- | --- | --- |
| Global CSS entry | Tailwind v4 is imported first, then local tokens. | `src/assets/styles/main.css` |
| Theme selector | Light tokens live on `:root`; dark tokens override through `:root[data-theme="dark"]`. | `src/assets/styles/tokens.css` |
| Theme store | Theme mode uses `lifeboard-theme` and applies document theme state. | `src/stores/theme.ts`, `src/main.ts`, `src/app/App.vue` |
| Color model | Global tokens use OKLCH. | `src/assets/styles/tokens.css` |
| Typography | System sans stack and fixed product type sizes exist. | `src/assets/styles/tokens.css`, `src/assets/styles/main.css` |
| Spacing | 8px-based primitive spacing plus page/layout values exist. | `src/assets/styles/tokens.css` |
| Radius | `sm`, `md`, `lg`, `xl`, and `pill` radii exist. | `src/assets/styles/tokens.css` |
| Shadow | Three restrained shadow tokens exist. | `src/assets/styles/tokens.css` |
| Focus | Global `:focus-visible` uses focus-ring tokens. | `src/assets/styles/main.css` |
| Reduced motion | Global reduced-motion media rule disables animation/transition duration. | `src/assets/styles/main.css` |
| Safe area | `.safe-top`, `.safe-bottom`, and `.app-main` account for safe areas and mobile nav clearance. | `src/assets/styles/main.css` |

Current token usage counts from Stage 2 read-only scan:

| Token pattern | Observation |
| --- | --- |
| Heavy use | `--color-text-primary`, `--color-text-secondary`, `--color-surface`, `--color-border`, `--color-border-soft`, `--color-accent` are already widely consumed. |
| Underused semantic status | `--color-success`, `--color-success-soft`, `--color-warning`, `--color-warning-soft` currently have no project usage. |
| Underused layout primitives | `--compact-gap`, `--control-gap`, `--space-5`, `--space-8`, `--space-10`, `--space-16`, `--radius-xl`, `--shadow-overlay`, `--color-overlay` are currently unused or nearly unused. |
| Duplicate naming | `--color-primary` and `--color-accent` currently resolve to the same clay green role; the target system should make their relationship explicit. |
| Existing module-private tokens | Weather defines `--weather-*` variables inside Weather components. These are not global tokens. |

## Current CSS Variables

Fact: current variables fall into these groups:

| Group | Current examples | Assessment |
| --- | --- | --- |
| Font family | `--font-sans` | Keep. Do not install a font in Stage 2 or Stage 3 unless separately approved. |
| Type sizes | `--font-size-page-title`, `--font-size-section-title`, `--font-size-card-title`, body/label/caption/numeric sizes | Keep, but expand for Landing display sizes and App shell labels. |
| Font weights | `--font-weight-regular`, `--font-weight-medium`, `--font-weight-semibold` | Keep; current medium/semibold weights support quiet product UI. |
| Line heights | `--line-height-tight`, `--line-height-body`, `--line-height-label` | Keep. Add display line-height only for Landing if needed. |
| Spacing | `--space-*`, `--page-inline`, `--page-block`, `--section-gap`, `--panel-padding` | Keep. Add page shell and landing section tokens before page rebuilds. |
| Widths | `--content-max-width`, `--content-wide-max-width`, sidebar widths, mobile nav clearance | Keep current widths until Stage 3 replaces sidebar with top nav. |
| Radius | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-pill` | Keep, but define role usage so cards do not over-round. |
| Motion | `--motion-fast`, `--motion-base`, `--motion-standard`, `--motion-slow`, `--motion-ease` | Keep, but replace generic `ease-out` with named easing roles in target. |
| Shadow | `--shadow-soft`, `--shadow-raised`, `--shadow-overlay` | Keep restrained shadows; add component guidance so border+shadow is not decorative default. |
| Colors | `--color-background`, `--color-surface*`, `--color-text*`, border/control/accent/status/focus/overlay | Keep semantic approach; add primitive brand/neutral ramps under it. |

## Tailwind And Scoped CSS Current State

Fact:

- Tailwind v4 is active through `@import "tailwindcss"` and `@tailwindcss/vite`.
- The project mainly uses Tailwind utilities with arbitrary token values such as `bg-[var(--color-surface-raised)]`.
- Scoped CSS is used for page-specific grids and Weather visuals.
- Global CSS contains base resets and reusable utilities, not component implementations.

Final design decision:

- Keep the hybrid strategy.
- Do not rewrite all styling into component classes.
- Do not rewrite all styling into raw Tailwind utilities.
- Use global CSS only for tokens, reset/base, small utility classes, and layout primitives shared across routes.
- Use component props/classes for shared UI primitives.
- Use scoped CSS for complex page layout, Weather internals, and visual algorithms that are not general-purpose tokens.

Evidence:

- `src/components/base/BaseButton.vue` and `BaseInput.vue` use tokenized Tailwind classes.
- `src/modules/home/HomePage.vue` uses scoped CSS for a dashboard grid with `1180px` and `767px` breakpoints.
- `src/modules/weather/components/WeatherSnapshotLayer.vue` uses scoped Weather variables and atmosphere-specific values.
- `src/modules/weather/components/WeatherAtmosphere.vue` owns many Weather-private color/motion variables.

## Target Token Architecture

Final design decision:

```text
Primitive tokens
  -> Semantic tokens
    -> Component tokens
      -> Page/module overrides
```

Rules:

- Primitive tokens describe raw palette, scale, and timing values.
- Semantic tokens describe product meaning: canvas, surface, text, border, accent, status, focus.
- Component tokens describe reusable component roles: button, input, nav, card, menu, sheet, toast.
- Page/module overrides are rare and must be scoped. Weather overrides remain Weather-private.
- Dark mode is implemented by token overrides, not component-level conditionals.
- Tokens must not force every page into the same card grid.

## Brand Primitive Tokens

Final design decision: preserve and expand the current clay/sage direction into a compact brand palette.

Target primitive palette:

| Primitive | Role | Light target | Dark target |
| --- | --- | --- | --- |
| `--brand-clay-50` | light brand wash | near-surface green tint | dark subtle green surface |
| `--brand-clay-100` | soft selected bg | current `--color-accent-wash` successor | dark selected wash |
| `--brand-clay-300` | low-emphasis accent | calm outlines, charts, badges | muted readable accent |
| `--brand-clay-500` | primary action | current clay green anchor | brighter but not neon green |
| `--brand-clay-600` | hover/action pressed | current hover direction | dark hover accent |
| `--brand-clay-800` | text on light brand wash | deep forest text | not used for body text on dark |
| `--brand-forest-900` | deep identity ink | headings, brand marks | dark canvas reference |
| `--brand-sky-300` | Weather-adjacent soft sky | limited info/accent | limited info/accent |
| `--brand-amber-400` | reminders/countdowns | warning, countdown, time markers | warning, countdown, time markers |

Do not create a mechanical ten-step ramp unless Stage 3 needs every step. Current usage can be satisfied with 6-8 brand primitives.

Rejected brand directions:

- Purple AI SaaS palette.
- Pure black technical dashboard.
- High-saturation rainbow UI.
- Large red surfaces.
- Corporate blue admin palette.
- Global glassmorphism.

## Neutral Primitive Tokens

Final design decision:

| Primitive | Role |
| --- | --- |
| `--neutral-stone-0` | light elevated surface |
| `--neutral-stone-50` | light canvas |
| `--neutral-stone-100` | subtle light surface |
| `--neutral-stone-200` | light borders |
| `--neutral-stone-500` | tertiary text |
| `--neutral-stone-700` | secondary text |
| `--neutral-stone-900` | primary text / dark inverse |
| `--neutral-forest-950` | dark canvas |
| `--neutral-forest-900` | dark surface |
| `--neutral-forest-800` | dark elevated surface |

Light theme should be warm-neutral or gently cool-neutral, not pure white and not beige by default. Dark theme should be deep green-gray/charcoal, not pure black.

## Semantic Token Contract

Final design decision: Stage 3 should map the current token names to this stable semantic set, preserving backwards compatibility where possible.

| Target semantic token | Purpose | Current source or successor |
| --- | --- | --- |
| `--color-background` | app body background | keep |
| `--color-foreground` | default text | keep |
| `--color-canvas` | page canvas | keep |
| `--color-background-subtle` | section/subtle band | successor to some `surface` uses |
| `--color-surface` | standard surface | keep |
| `--color-surface-muted` | lower-emphasis surface | keep |
| `--color-surface-raised` | default card/panel | keep |
| `--color-surface-elevated` | nav/menu/modal surface | keep |
| `--color-surface-interactive` | hover/selected neutral surface | keep |
| `--color-surface-inset` | inset fields/skeletons | keep |
| `--color-surface-inverse` | inverse surface | new |
| `--color-text-primary` | main readable text | keep |
| `--color-text-secondary` | supporting text | keep |
| `--color-text-tertiary` | captions/meta | keep |
| `--color-text-inverse` | text on strong surfaces | keep |
| `--color-border-subtle` | faint separators | successor to `--color-border-soft` |
| `--color-border-default` | standard borders | successor to `--color-border` |
| `--color-border-strong` | emphasized borders | keep |
| `--color-control-border` | inputs/buttons | keep |
| `--color-accent-primary` | primary action/current selection | successor to `--color-accent` / `--color-primary` |
| `--color-accent-hover` | hover action | keep |
| `--color-accent-active` | active/pressed action | new |
| `--color-accent-soft` | low-emphasis brand fill | keep |
| `--color-accent-wash` | broad subtle brand fill | keep |
| `--color-accent-text` | text on brand wash | keep |
| `--color-focus-ring` | focus outline | keep |
| `--color-status-success` | success text/icon | successor to `--color-success` |
| `--color-status-success-bg` | success background | successor to `--color-success-soft` |
| `--color-status-warning` | warning text/icon | successor to `--color-warning` |
| `--color-status-warning-bg` | warning background | successor to `--color-warning-soft` |
| `--color-status-danger` | error/destructive | successor to `--color-danger` |
| `--color-status-danger-bg` | error/destructive background | successor to `--color-danger-soft` |
| `--color-status-info` | informational status | new, separate from Weather sky |
| `--color-overlay` | overlay scrim | keep and use for dialogs/drawers |

Implementation guidance:

- Keep existing aliases during migration so Stage 3 can be small.
- Treat `primary` and `accent` as aliases initially, then prefer `accent-primary` in new code.
- Do not map Weather sky colors into `status-info` globally.

## Component Token Contract

Target component tokens:

| Component area | Tokens to define in Stage 3 | Notes |
| --- | --- | --- |
| Button | `--button-radius`, `--button-height-sm/md/lg`, `--button-primary-bg`, `--button-primary-bg-hover`, `--button-secondary-bg`, `--button-danger-bg` | Based on `BaseButton.vue`. |
| Icon button | `--icon-button-size-sm/md/lg`, `--icon-button-radius` | Based on `IconButton.vue`. |
| Input | `--input-height`, `--input-bg`, `--input-border`, `--input-border-focus`, `--input-placeholder` | Based on `BaseInput.vue` and form modules. |
| Card/surface | `--surface-card-radius`, `--surface-card-border`, `--surface-card-bg`, `--surface-panel-padding` | Must not imply all content is a card. |
| Navigation | `--nav-height`, `--nav-surface`, `--nav-border`, `--nav-item-radius`, `--nav-active-bg`, `--nav-active-text` | Stage 3 App top nav and mobile bottom nav. |
| Landing nav | `--landing-nav-height`, `--landing-nav-transparent-bg`, `--landing-nav-solid-bg`, `--landing-nav-border` | Landing layout only. |
| Menu/drawer/sheet | `--overlay-bg`, `--drawer-width`, `--sheet-radius`, `--sheet-shadow` | Stage 3/7. |
| Toast | `--toast-bg`, `--toast-border`, `--toast-shadow` | No app-wide toast exists today. |
| Skeleton | `--skeleton-bg`, `--skeleton-radius`, `--skeleton-motion` | Based on `BaseSkeleton.vue`; motion must respect reduced motion. |

## Typography Token Contract

Final design decision:

- App typography remains a fixed rem scale, not viewport-fluid.
- Landing may introduce display sizes with `clamp()` but must cap hero headings and avoid text overflow.
- System sans remains the implementation default until a separate font decision is approved.
- Numeric displays use tabular figures.

Target tokens:

| Token | Role |
| --- | --- |
| `--font-size-display-hero` | Landing hero only |
| `--font-size-display-section` | Landing narrative section headings |
| `--font-size-page-title` | app page h1 |
| `--font-size-section-title` | app section h2 |
| `--font-size-card-title` | compact surface heading |
| `--font-size-body` | body |
| `--font-size-body-small` | supporting body |
| `--font-size-label` | controls and nav |
| `--font-size-caption` | metadata |
| `--font-size-numeric-large` | dashboard/weather/todo numeric emphasis |
| `--font-size-numeric-medium` | secondary numeric emphasis |

Evidence:

- `src/assets/styles/main.css` defines `text-page-title`, `text-section-title`, `text-card-title`, and numeric utilities.
- `src/modules/weather/components/WeatherSnapshotLayer.vue` uses Weather-private fluid temperature text; do not globalize that scale.

## Spacing And Layout Token Contract

Final design decision:

| Token | Role |
| --- | --- |
| `--space-1` to `--space-16` | primitive 4px/8px rhythm |
| `--page-inline-mobile` | mobile page side padding |
| `--page-inline-tablet` | tablet page side padding |
| `--page-inline-desktop` | desktop page side padding |
| `--page-block-start` | route top padding |
| `--section-gap` | app section vertical rhythm |
| `--panel-padding-sm/md/lg` | surface inner padding |
| `--content-readable-width` | text line length |
| `--content-max-width` | standard app page max width |
| `--content-wide-max-width` | wide app page max width |
| `--landing-content-max-width` | Landing content width |
| `--landing-viewport-section-min-height` | Landing narrative fold sizing |

Evidence:

- Current `PageLayout.vue` uses `page-container`, `page-container-wide`, `!max-w-4xl`, and `space-y-6`.
- Current pages use local values such as `p-5`, `sm:p-6`, `lg:p-8`, `gap-6`, and `space-y-10`.

## Radius, Border, And Shadow Contract

Final design decision:

| Token | Role |
| --- | --- |
| `--radius-sm` | buttons, inputs, nav items |
| `--radius-md` | compact panels, alerts, small cards |
| `--radius-lg` | standard cards/panels |
| `--radius-xl` | large landing/product surfaces only, used sparingly |
| `--radius-pill` | chips, badges, segmented pills |
| `--border-width-default` | standard 1px border |
| `--border-width-focus` | focus outline width |
| `--shadow-soft` | rare soft elevation |
| `--shadow-raised` | menus/modals/raised panels |
| `--shadow-overlay` | modal/sheet/drawer |

Rules:

- Cards top out at `--radius-lg` in App UI unless there is a specific large product surface.
- Do not pair a border and a large decorative shadow as the default card style.
- Prefer border and surface contrast for long-use App pages.
- Landing may use larger surfaces, but not a stack of identical rounded cards.

## Motion Token Contract

Target motion tokens:

| Token | Duration | Role |
| --- | --- | --- |
| `--motion-instant` | 0ms | reduced motion / immediate |
| `--motion-fast` | 120ms | hover, press, focus |
| `--motion-base` | 180ms | menus, small state changes |
| `--motion-standard` | 220ms | page shell transitions |
| `--motion-slow` | 320ms | drawer/sheet/modal |
| `--motion-landing-section` | TBD Stage 4 | Landing narrative only |
| `--motion-ease-out` | cubic/bezier target | standard state change |
| `--motion-ease-emphasized` | cubic/bezier target | larger entry/sheet motion |

Rules:

- App UI uses short motion for state, not decorative choreography.
- Landing may define scroll-linked animation in Stage 4.
- Weather motion presets remain Weather-private.

## Z-index Token Contract

Final design decision:

| Token | Value target | Use |
| --- | --- | --- |
| `--z-base` | 0 | normal content |
| `--z-weather-canvas` | local Weather scope only | Weather internal canvas layering |
| `--z-sticky` | 20 | sticky headers within layout |
| `--z-navigation` | 30 | app/landing navigation |
| `--z-bottom-navigation` | 40 | mobile bottom nav |
| `--z-skip-link` | 50 | skip link |
| `--z-dropdown` | 60 | menus/popovers |
| `--z-drawer` | 70 | drawers/sheets |
| `--z-modal` | 80 | modal/dialog |
| `--z-toast` | 90 | toast |
| `--z-critical-overlay` | 100 | rare blocking overlay |

Evidence:

- Current global/shell z-index values are `z-20`, `z-30`, `z-40`, and skip-link `z-index: 50`.
- Weather has local z-index values from 0-7 inside Weather components.

Rule: never use arbitrary `9999` values.

## Responsive Token Contract

Final design decision:

Named breakpoint intent:

| Name | Width | Role |
| --- | --- | --- |
| `phone-sm` | 375px | smallest target mobile |
| `phone` | 390px | common phone baseline |
| `tablet` | 768px | tablet portrait / wide phone |
| `tablet-lg` | 1024px | tablet landscape / compact desktop |
| `desktop` | 1280px | standard desktop |
| `desktop-lg` | 1440px | wide desktop |
| `desktop-xl` | 1920px | extra-wide desktop |

Implementation guidance:

- Keep Tailwind breakpoints but document how they map to product intent.
- Do not treat responsive design as only mobile/desktop.
- Existing Weather breakpoints remain Weather-private until a Weather-specific task permits changes.

## Weather Token Boundary

Weather boundary:

- Keep `--weather-*` variables inside Weather components.
- Keep Weather atmosphere OKLCH values private.
- Keep Pixi canvas, particle, and atmospheric z-index local.
- Keep Weather reduced-motion and performance tiers private.
- App Shell may provide perimeter tokens: nav contrast, page padding, safe area, route layout.
- Global tokens must not overwrite Weather hero text, atmosphere colors, asset rendering, Pixi opacity, or scene motion.

Evidence:

- `src/modules/weather/components/WeatherSnapshotLayer.vue` defines `--weather-hero-*` text/control variables by atmosphere.
- `src/modules/weather/components/WeatherAtmosphere.vue` defines `--weather-sky-*`, `--weather-rain-*`, `--weather-snow-*`, and local z-index layers.
- `src/modules/weather/renderers/pixi/WeatherPixiLayer.vue` owns canvas opacity, z-index, and reduced-motion display behavior.
- `src/modules/weather/visual/weather-motion-presets.ts` owns long Weather motion durations.

## Naming Rules

Final design decision:

- Use `--color-*` for semantic color roles.
- Use `--brand-*` and `--neutral-*` only for primitives.
- Use `--component-role-state` pattern for component tokens, for example `--button-primary-bg-hover`.
- Use `--landing-*` for Landing-only layout/visual tokens.
- Use `--app-*` for App Shell structural tokens.
- Use `--weather-*` only inside Weather files.
- Do not create one-off variables for every component.
- Do not mix primitive values and semantic names in the same token.

## Rejected Token Schemes

Final design decisions:

- Reject a giant all-in-one token file that includes every component and page.
- Reject one token namespace per component.
- Reject Tailwind-only implementation with all values inline.
- Reject CSS-variables-only implementation with no Tailwind utilities.
- Reject global tokens that force Weather visuals into the App card system.
- Reject dark mode implemented through component `if dark` branches.
- Reject arbitrary visual values without token or clear module-private justification.

## Code Evidence

| File | Evidence used |
| --- | --- |
| `src/assets/styles/main.css` | Tailwind import, reset/base, focus, utilities, safe-area, reduced-motion. |
| `src/assets/styles/tokens.css` | Current OKLCH light/dark variables, typography, spacing, radius, motion, shadow. |
| `package.json` | Tailwind v4, Vue, Vite, PixiJS versions; no extra design dependencies. |
| `vite.config.ts` | Tailwind Vite plugin and weather reference asset cleanup plugin. |
| `src/components/base/BaseButton.vue` | Button visual variants and tokenized Tailwind usage. |
| `src/components/base/BaseInput.vue` | Input control token usage. |
| `src/components/base/BaseSurface.vue` | Surface variants and current padding/radius classes. |
| `src/components/base/PageLayout.vue` | Page width/gap behavior. |
| `src/components/base/BaseEmpty.vue` | Empty state surface pattern. |
| `src/components/base/BaseError.vue` | Error status pattern. |
| `src/components/layout/Topbar.vue` | Current sticky/backdrop nav-like surface. |
| `src/components/layout/MobileNav.vue` | Bottom nav surface and z-index evidence. |
| `src/modules/home/HomePage.vue` | Page-private grid/breakpoint evidence. |
| `src/modules/todos/components/TodosWorkspace.vue` | Page header card and app surface pattern. |
| `src/modules/tools/components/ToolsWorkspace.vue` | Tool split-panel pattern. |
| `src/modules/settings/components/SettingsConfirmationDialog.vue` | Dialog surface, overlay, focus, width. |
| `src/modules/weather/components/WeatherSnapshotLayer.vue` | Weather-private hero tokens. |
| `src/modules/weather/components/WeatherAtmosphere.vue` | Weather-private atmosphere tokens and z-index layers. |
| `src/modules/weather/renderers/pixi/WeatherPixiLayer.vue` | Weather Pixi canvas and reduced-motion boundary. |

## Stage 3 Acceptance Criteria

- Token implementation preserves current light/dark theme behavior.
- Existing token names either remain or receive explicit aliases.
- App Shell can use component tokens without rewriting business pages.
- No source inside `src/modules/weather/**` is changed for token unification.
- No dependency or font package is added.
- Build passes after token implementation.
