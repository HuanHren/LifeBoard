# LifeBoard Commercial Upgrade Stage 2 Responsive And Motion Specification

Decision date: 2026-07-02

Baseline commit: `ff1e5732202f46275a2cec631d60672db5953809`

Scope: responsive, motion, safe-area, z-index, and verification contract only. This document authorizes no implementation.

## Current Responsive Facts

| Area | Current behavior | Evidence |
| --- | --- | --- |
| Minimum viewport | Body min width is `320px`. | `src/assets/styles/main.css` |
| App shell desktop switch | Current sidebar shell switches at `56.25rem`. | `src/assets/styles/main.css`, `AppShell.vue`, `SidebarNav.vue`, `MobileNav.vue` |
| Typography desktop bump | Page title and numeric sizes increase at `64rem`. | `src/assets/styles/tokens.css` |
| Home grid | Uses `1180px`, `767px`, and component-local grid rules. | `src/modules/home/HomePage.vue` |
| Home quick access | Uses `768px` and `480px` local breakpoints. | `src/modules/home/HomeQuickAccess.vue` |
| Weather | Uses private mobile/tablet queries around `39.9375rem`, `40rem`, and `74.9375rem`. | `src/modules/weather/components/WeatherAtmosphere.vue`, `WeatherPixiLayer.vue` |
| Mobile nav | Fixed bottom nav uses safe-area padding and six columns today. | `src/components/layout/MobileNav.vue` |
| Page width | `content-max-width` is `76rem`; wide max is `90rem`. | `src/assets/styles/tokens.css`, `PageLayout.vue` |

Final design decision: Stage 3 must introduce a named responsive contract without rewriting every page-specific grid.

## Breakpoint Strategy

Final design decision:

| Target | Width | Contract |
| --- | --- | --- |
| 375px | Small phone | All primary app routes must fit without horizontal scroll; nav labels must not overflow. |
| 390px | Common phone | Default phone composition; bottom nav and page padding tuned here. |
| 768px | Tablet portrait | Not just a large phone; evaluate two-column content only when useful. |
| 1024px | Tablet landscape / compact desktop | App top nav may appear if space allows, but do not force dense desktop layout too early. |
| 1280px | Desktop | Standard App top navigation and normal page width. |
| 1440px | Wide desktop | Wider page containers allowed; text line length still constrained. |
| 1920px | Extra-wide desktop | Content must not stretch infinitely; Landing may use more spatial pacing. |

Implementation guidance:

- Map Tailwind defaults and custom media queries to these product names in Stage 3 documentation or comments.
- Use container and layout tokens for page gutters rather than repeated local breakpoints.
- Keep Weather private breakpoints unless a Weather-specific implementation task permits edits.

## Page Width And Spacing

Final design decision:

| Surface | Width contract |
| --- | --- |
| App standard pages | Use standard max width near current `76rem`. |
| App wide pages | Use wide max width near current `90rem` for dashboards, Weather, Todos. |
| App readable prose | Keep text blocks around `65-75ch`; use `max-w-2xl` / `max-w-3xl` equivalents. |
| Landing sections | May use wider visual scenes, but text remains constrained. |
| Weather hero | May exceed normal content framing as part of Weather visual identity. |

Page side padding:

- 375/390px: compact but consistent; avoid edge-to-edge form controls unless intentionally full-width.
- 768px: increase gutters modestly.
- 1024px+: use App shell padding tokens.
- 1440/1920px: increase whitespace through max-width and section rhythm, not by stretching cards.

Evidence:

- `AppShell.vue` uses `px-[var(--page-inline)]` and `pt-[var(--page-block)]`.
- `PageLayout.vue` uses standard/wide/narrow containers.

## Mobile Contract

Final design decision:

- One-handed operation is prioritized.
- Touch targets remain at least 44px.
- Page side padding is consistent across app routes.
- Titles should not consume excessive first-viewport height.
- Cards must not stack into endless undifferentiated blocks.
- Bottom sheets should replace some desktop modals when appropriate.
- Inputs remain usable when the virtual keyboard is open.
- Safe-area insets must be respected.
- Landing animation is significantly downgraded.
- Weather keeps its existing mobile scene strategy.

Stage 7 verification:

- 375px and 390px screenshots for `/app`, `/weather`, `/todos`, `/bookmarks`, `/tools`, `/settings`, and Not Found.
- Keyboard-open checks for forms in Todos, Bookmarks, Tools, and Settings.

## Tablet Contract

Final design decision:

- Tablet is its own layout class.
- Do not simply scale the phone layout.
- Do not expose full dense desktop navigation too early if it crowds content.
- Use two-column layouts only when the content benefits.
- Evaluate Weather, Todos, and Tools separately.
- 768px and 1024px must be distinct verification targets.

Examples:

- Todos may use a task column plus countdown side panel at wider tablet sizes.
- Tools may use side tool navigation at 1024px but not necessarily 768px.
- Weather may keep its own tablet atmospheric composition.

## Wide Desktop Contract

Final design decision:

- Content does not stretch indefinitely.
- Reading text stays constrained.
- Cards cannot become over-wide horizontal strips.
- Landing may use stronger spacing and full-bleed visual regions.
- Weather visuals may exceed standard content containers when Weather needs atmosphere.

Stage 8 verification:

- 1440px and 1920px screenshots must show intentional use of width, not empty accidental sprawl.

## App Shell Responsive Contract

Final design decision:

- Stage 3 replaces permanent sidebar with App Layout top navigation.
- Desktop top navigation appears on desktop/large tablet where it has enough room.
- Mobile bottom navigation appears on mobile and remains max five items.
- App content reserves bottom clearance when bottom navigation is present.
- Safe-area padding applies to top and bottom surfaces.

Evidence:

- `.safe-top`, `.safe-bottom`, `.app-main`, and `--mobile-nav-clearance` already exist in `src/assets/styles/main.css`.
- Current `MobileNav.vue` already uses fixed bottom positioning and safe bottom utility.

## Bottom Navigation Contract

Final design decision:

- Five items maximum: Workspace, Weather, Todos, Bookmarks, More.
- Use stable icon size and label size.
- Active indicator must be visible without relying only on color.
- More is active for Tools and Settings.
- Content bottom padding must prevent overlap.
- Bottom nav must not cover focused inputs when the keyboard opens; Stage 7 verifies and adjusts.

## Safe Area Contract

Final design decision:

- Top navigation/header uses safe top padding where it can overlap device UI.
- Bottom navigation uses `env(safe-area-inset-bottom)`.
- Main content reserves bottom clearance on mobile app routes.
- Drawers/sheets must include safe area padding.
- Landing sticky sections must account for safe top and bottom regions.

## Motion Categories

Final design decision:

| Category | Duration | Allowed properties | Use |
| --- | --- | --- | --- |
| Instant | 0ms | none | reduced motion, immediate state |
| Micro | 80-140ms | color, opacity, transform | hover, press, focus |
| Standard | 150-220ms | opacity, transform | menus, small panels, feedback |
| Emphasized | 240-320ms | opacity, transform | drawer/sheet/modal entry |
| Landing narrative | Stage 4-defined | transform, opacity, scroll timelines when safe | scroll storytelling only |
| Weather atmosphere | Weather-private | Weather runtime controls | Weather visual core only |

Rules:

- App motion conveys state.
- App pages do not run large marketing motion continuously.
- Animate transform and opacity by default.
- Avoid layout animation on large surfaces.
- Avoid continuous blur/filter animation.
- Use temporary `will-change` only when measured need exists.

## Current Motion Evidence

| Surface | Current motion | Evidence |
| --- | --- | --- |
| Global interactive surfaces | Tokenized background/border/color/box-shadow/transform transitions. | `src/assets/styles/main.css` |
| Buttons | `motion-fast` transitions and active scale. | `BaseButton.vue`, `IconButton.vue` |
| Sidebar/Mobile active indicators | opacity transitions with `motion-fast`. | `SidebarNav.vue`, `MobileNav.vue` |
| Weather atmosphere | long keyframes, Weather-specific transitions, reduced-motion fallbacks. | `WeatherAtmosphere.vue`, `WeatherHero.vue`, `WeatherSnapshotLayer.vue` |
| Weather Pixi | opacity transition and Pixi runtime performance tiers. | `WeatherPixiLayer.vue` |
| Tools feedback | timer-based clipboard state. | `src/modules/tools/composables/useClipboardFeedback.ts` |

## Page Transitions

Final design decision:

- Stage 3 may use very light page transitions only if they do not delay route entry.
- Browser Back/Forward and scroll restoration from Stage 1B remain authoritative.
- Do not use custom animation to lock route changes.
- Do not use view transitions for interaction-heavy module content in Stage 3.

## Scroll-linked Motion

Final design decision:

- Scroll-linked motion belongs to Landing only.
- Scroll narrative must be reversible when scrolling up/down.
- Content is accessible without animation.
- Do not drive animation by polling `scrollY` or hijacking wheel events.
- Prefer CSS Scroll/View Timelines where supported or a bounded animation runtime in Stage 4.
- Use IntersectionObserver to pause offscreen work when needed.
- Respect reduced motion by showing final readable content directly.

Stage 4 must verify:

- Native browser Back/Forward works.
- Hash anchors work.
- Keyboard users are not trapped in sticky sections.
- Reduced-motion users see all content.

## Reduced Motion Contract

Final design decision:

- Disable scroll-bound parallax.
- Disable large scale transitions.
- Do not force smooth scrolling.
- Keep necessary state transitions immediate or short.
- Landing content remains fully available.
- Weather existing reduced-motion behavior must not be broken.

Evidence:

- `src/assets/styles/main.css` already sets animation duration to `1ms`, one iteration, scroll behavior auto, and transition duration `0ms` under reduced motion.
- `WeatherAtmosphere.vue`, `WeatherHero.vue`, `WeatherSnapshotLayer.vue`, and `WeatherPixiLayer.vue` include Weather-specific reduced-motion handling.

## Low-performance Device Contract

Final design decision:

- App UI remains functional with no animation.
- Landing degrades to static sections and product imagery.
- Weather keeps its own performance tier and static fallback behavior.
- Avoid site-wide WebGL.
- Avoid many large promoted layers.
- Do not animate blur on large containers.

Evidence:

- `WeatherPixiLayer.vue` detects reduced motion, save-data, WebGL capability, mobile/tablet profiles, and falls back to static poster.
- `sharedScenePresetParts.ts` defines static/low/balanced/high quality constraints.

## Z-index And Overlay Contract

Final design decision:

| Layer | Contract |
| --- | --- |
| Base | normal content. |
| Weather internal | local 0-7 inside Weather components only. |
| Sticky | layout sticky headers. |
| Navigation | App/Landing top nav. |
| Bottom navigation | mobile bottom nav above content. |
| Skip link | above navigation. |
| Dropdown | above nav. |
| Drawer / sheet | above dropdown. |
| Modal | above drawer/sheet. |
| Toast | above modal when non-blocking. |
| Critical overlay | rare blocking system state. |

Rules:

- Do not use `9999`.
- Weather canvas stays inside Weather stacking context.
- Mobile bottom nav and drawers must not collide.
- Toasts must not cover critical modal actions.

Evidence:

- Current shell uses `z-20`, `z-30`, `z-40`, and skip link `z-index: 50`.
- Weather internal layers use local `z-index` 0-7.

## Navigation Visual States

### Landing Navigation

Final design decision:

| State | Visual contract |
| --- | --- |
| Initial | May be transparent or low-surface over hero, but contrast must pass. |
| Scrolled | Solid/elevated surface with border or subtle shadow. |
| Menu open | Drawer/sheet/full-screen menu with overlay, focus management, scroll lock. |
| Reduced motion | State changes are immediate or short opacity only. |

### App Top Navigation

Final design decision:

- Stable, sticky, restrained.
- Uses surface/elevated tokens.
- Active state uses text, surface, and/or indicator; not color alone.
- Utility actions stay visually secondary to primary route nav.

### Mobile Bottom Navigation

Final design decision:

- Elevated surface.
- Border top.
- Safe-area padding.
- Five items maximum.
- Active state has indicator plus color/surface.

### Weather Perimeter Navigation

Final design decision:

- App nav on Weather may use a Weather-aware contrast variant.
- Variant belongs to App Layout tokens.
- It must not change Weather internals or Pixi behavior.

## Responsive Verification Matrix

Required later verification:

| Width | Stage | Check |
| --- | --- | --- |
| 375px | Stage 7/8 | no text overflow, bottom nav fits, forms usable |
| 390px | Stage 7/8 | default phone composition |
| 768px | Stage 7/8 | tablet portrait layout, no oversized phone copy |
| 1024px | Stage 7/8 | tablet landscape / compact desktop nav decision |
| 1280px | Stage 3/8 | standard desktop App Shell |
| 1440px | Stage 8 | wide desktop rhythm |
| 1920px | Stage 8 | max width and Landing spacing |

## Weather Motion Boundary

Weather boundary:

- Do not modify `src/modules/weather/**` for Stage 2.
- Do not modify `src/assets/weather/atmosphere/**`.
- Do not modify `public/weather-assets/**`.
- Do not modify `public/__local_weather_reference/**`.
- Do not change PixiJS runtime, Weather motion presets, Weather scene transitions, Weather responsive scene layout, or Weather reduced-motion fallbacks.

Allowed later perimeter work:

- App Layout page padding around Weather.
- App top navigation contrast variant.
- Safe-area integration.
- Route metadata and navigation active state.

## Stage 3 Implementation Boundary

Stage 3 may implement:

- Design token foundation and aliases.
- Global theme entry cleanup.
- Layout Resolver.
- Landing Layout shell.
- App Layout.
- Minimal Layout.
- Desktop top navigation.
- Mobile bottom navigation.
- `/` and `/app` route migration from Stage 1B.
- Weather perimeter integration.

Stage 3 must not implement:

- Scroll narrative Landing animation.
- Workspace redesign.
- Todos/Bookmarks/Tools/Settings redesign.
- Weather internals.
- GSAP or new animation dependencies.
- Large directory migration.

## Code Evidence

| File | Evidence used |
| --- | --- |
| `src/assets/styles/main.css` | min width, safe-area utilities, app-main clearance, reduced motion, transition utilities. |
| `src/assets/styles/tokens.css` | current breakpoints through media query, width tokens, motion tokens. |
| `src/components/layout/AppShell.vue` | current shell padding and sidebar offset. |
| `src/components/layout/Topbar.vue` | sticky top surface and z-index. |
| `src/components/layout/MobileNav.vue` | current bottom nav, safe bottom, z-index. |
| `src/modules/home/HomePage.vue` | local workspace grid breakpoints. |
| `src/modules/home/HomeQuickAccess.vue` | local responsive thresholds. |
| `src/modules/todos/components/TodosWorkspace.vue` | dashboard-like responsive grid. |
| `src/modules/tools/components/ToolsWorkspace.vue` | split-panel tool layout. |
| `src/modules/settings/components/SettingsConfirmationDialog.vue` | modal width, overlay, focus, native dialog. |
| `src/modules/weather/components/WeatherAtmosphere.vue` | Weather responsive queries, keyframes, reduced motion, local z-index. |
| `src/modules/weather/components/WeatherHero.vue` | Weather hero transition boundary. |
| `src/modules/weather/renderers/pixi/WeatherPixiLayer.vue` | Weather Pixi performance and reduced-motion behavior. |
| `src/modules/weather/scenes/presets/sharedScenePresetParts.ts` | Weather scene quality and transition presets. |

## Needs Later Verification

- Stage 3 build after token aliases and layout shell.
- Stage 3 desktop screenshot at 1280px.
- Stage 7 mobile/tablet screenshot matrix.
- Stage 8 reduced-motion verification.
- Stage 8 forced-colors verification for Weather and shell.
- Stage 8 performance check that Landing motion does not run on App routes.
