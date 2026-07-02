# LifeBoard Commercial Upgrade Stage 2 Commercial Visual System

Decision date: 2026-07-02

Baseline commit: `ff1e5732202f46275a2cec631d60672db5953809`

Scope: commercial visual system contract only. This document authorizes no implementation.

## Brand Positioning

Final design decision:

LifeBoard is a calm personal life operating system with weather atmosphere, scroll narrative, and modern productivity interaction.

Visual keywords:

- Quiet.
- Natural.
- Precise.
- Modern.
- Warm.
- Suitable for long-term daily use.

Physical scene:

LifeBoard should feel like a well-lit personal desk near a window: soft weather context in the room, a few precise tools within reach, no corporate dashboard noise, no theatrical AI effects.

## Reference Mix And Non-copy Rule

Confirmed direction:

| Reference share | What to learn | What not to copy |
| --- | --- | --- |
| 50% Notion Calendar | clear structure, white space, calm density | exact calendar UI or monochrome sameness |
| 25% Linear | precision, alignment, restrained borders | dark-blue SaaS styling or status-heavy work tracking |
| 15% Todoist | warm task action language | red-heavy brand system |
| 10% Raycast | command surface quality and fast utility interactions | black command-center cosplay |

Landing reference mix:

| Reference share | What to learn | What not to copy |
| --- | --- | --- |
| 35% Apple | product pacing and scroll narrative | device-commercial imitation |
| 25% Linear | real product UI pinned in narrative | exact Linear landing layout |
| 15% Stripe | components demonstrating function | gradient-heavy Stripe imitation |
| 15% Lusion | atmosphere, depth, space | full-site WebGL |
| 10% Vercel | typography order and section rhythm | black/white developer monoculture |

Final design decision: these are direction anchors, not UI sources. Do not copy exact layouts, brand assets, interaction choreography, or component styles.

## Color System

Final design decision:

LifeBoard uses a restrained clay green / sage / warm stone system, with Weather allowed to keep its own sky and atmosphere palette.

Brand color roles:

| Role | Use |
| --- | --- |
| Clay Green | primary action, selection, product identity |
| Sage | soft backgrounds, selected states, calm feature highlights |
| Warm Ivory | light canvas option, not beige overload |
| Deep Forest | primary ink, dark theme base |
| Soft Sky | Weather-adjacent and limited information accents |
| Muted Amber | reminders, countdowns, warning/time emphasis |
| Neutral Stone | surfaces, text, borders, disabled states |

Light theme:

- Warm neutral or very softly cool-neutral canvas.
- Not pure white everywhere.
- Low-contrast surface steps, but body text remains readable.
- Clay green is the main product action color.
- Amber is reserved for warning/time/countdown.
- Sky belongs primarily to Weather and must not become the global accent.

Dark theme:

- Deep green-gray or neutral charcoal canvas.
- Not pure black.
- Surfaces separate by luminance and borders.
- Green accent is muted enough for long use.
- Text contrast must meet WCAG AA.
- Weather still uses its own atmospheric backgrounds when active.

## Typography System

Final design decision:

- App UI uses one familiar sans stack, fixed rem scale, and compact hierarchy.
- Landing may use larger display sizes but keeps the same font family unless a later explicit font decision is approved.
- Do not install fonts in Stage 2 or Stage 3.
- Do not use display typography for labels, form controls, data, or navigation.
- Keep line length around 65-75 characters for prose.
- Numeric data uses tabular figures.

Evidence:

- `src/assets/styles/tokens.css` defines `--font-sans` and fixed app type sizes.
- `src/assets/styles/main.css` defines reusable text utilities and balanced/pretty wrapping.
- `src/modules/weather/components/WeatherSnapshotLayer.vue` has Weather-private fluid temperature display; it should not become a global product type scale.

## Icon System

Fact:

- Current icon system is a small custom inline SVG set in `BaseIcon.vue`.
- Icons use `stroke-width="1.8"`, `currentColor`, rounded caps/joins, and sizes `sm/md/lg`.
- `IconButton.vue` provides accessible names through `ariaLabel`.

Final design decision:

- Keep one icon style.
- Default stroke width remains approximately 1.75-2px.
- Navigation icons use the shared icon system.
- Icon-only buttons require accessible names.
- Do not use emoji as core UI icons.
- Do not install a new icon library in Stage 2.

Needs later verification:

- If Stage 3 needs icons not present today, extend the existing system or explicitly approve a library before use.

## Imagery System

Final design decision:

LifeBoard imagery is primarily product UI and weather atmosphere.

Allowed:

- Real LifeBoard interface screenshots or live UI compositions.
- Existing Weather visual assets and atmosphere scenes.
- Carefully scoped future abstract life-system imagery if it supports the product.

Rejected:

- Generic stock photos unrelated to the product.
- Fake team photos.
- Customer logo walls.
- Decorative AI illustrations with no product function.
- Using illustration to hide real product UI.

Landing rule:

- Landing product demonstration should show real LifeBoard surfaces and Weather visuals.
- Weather atmosphere can be immersive, but the Landing must still keep direct app entry visible.

## Page Background And Surface Layers

Final design decision:

| Layer | App behavior | Landing behavior |
| --- | --- | --- |
| Canvas | calm neutral background | can use larger atmosphere/product scene regions |
| Subtle band | optional for grouping | can pace narrative sections |
| Surface | panels, forms, lists | product UI demos, not every section |
| Raised surface | menus, prominent panels | selective product frames |
| Overlay | dialogs, drawers, sheets | mobile menu, narrative overlays |

Rules:

- Do not turn every piece of content into an equal card.
- Do not nest cards inside cards as a default.
- Use unframed layouts for page sections where possible.
- Use cards for repeated items, forms, dialogs, compact panels, and genuinely framed tools.

Evidence:

- `BaseSurface.vue`, `BaseCard.vue`, `BaseEmpty.vue`, and `BaseError.vue` provide useful surfaces.
- `TodosWorkspace.vue` uses a card-like page header.
- `ToolsWorkspace.vue` uses a framed split panel.
- `SettingsWorkspace.vue` repeats many framed settings panels.

## Component Visual Contracts

### Buttons

Final design decision:

- Primary: clay green filled, text inverse.
- Secondary: raised surface, control border, primary text.
- Ghost: transparent, text secondary, surface hover.
- Danger: danger color for destructive actions only.
- Minimum touch height: 44px.
- Loading state may use spinner, but must preserve accessible text or busy state.

Evidence: `src/components/base/BaseButton.vue`.

### Inputs

Final design decision:

- Inputs use surface-raised background, control border, clear focus border/ring.
- Placeholder text must remain readable.
- Error state uses status danger tokens and `aria-invalid`.
- Search uses the same input vocabulary unless it becomes a command palette.

Evidence: `src/components/base/BaseInput.vue`, `BookmarkComposer.vue`, `TaskComposer.vue`, `WeatherSearchForm.vue`.

### Cards And Panels

Final design decision:

- App panels use `radius-lg` max in normal cases.
- Shadows are rare; borders and surface shifts carry depth.
- Repeated cards need varied information hierarchy, not identical icon-heading-text blocks.
- Settings may use stacked panels because it is a form/config surface; Landing should not inherit that density.

### Navigation

Final design decision:

- Landing navigation has transparent, elevated, and solid states.
- App navigation uses stable top navigation and restrained active state.
- Mobile bottom navigation uses five items, safe-area padding, and clear active state.
- Weather perimeter may use a contrast-aware nav variant, but Weather internals do not change global nav.

### Modal / Drawer / Sheet

Final design decision:

- Native `<dialog>` pattern in Settings is the current best local pattern.
- Modal/drawer/sheet tokens must cover overlay, surface, radius, shadow, and focus return.
- Mobile should prefer sheet/drawer over desktop-style modal when the task is not destructive.

Evidence: `src/modules/settings/components/SettingsConfirmationDialog.vue`.

### Loading / Empty / Error / Offline

Final design decision:

- Skeleton states are preferred for loading content.
- Empty states should teach the next action.
- Error states must be direct and actionable.
- Offline/stale states should use status language without alarmism.

Evidence:

- `BaseSkeleton.vue`, `BaseEmpty.vue`, `BaseError.vue`.
- Weather cache/stale copy in `WeatherWorkspace.vue`.

### Toast And Feedback

Fact:

- No app-wide toast host exists today.
- Some modules use inline success/error messages and clipboard feedback.

Final design decision:

- Stage 3 may define toast tokens but should not add an app-wide toast unless needed by shell actions.
- Critical feedback must not be toast-only.

## Landing And App Visual Separation

Final design decision:

Landing may use:

- Larger type.
- Wider whitespace.
- Weather atmosphere backgrounds.
- Sticky narrative sections.
- Scroll-linked transitions.
- Product UI demonstrations.
- Stronger brand expression.

App must use:

- Higher information efficiency.
- Stable layouts.
- Less continuous animation.
- Clear states.
- Consistent page-to-page controls.
- Long-use calmness.

Shared:

- Brand colors.
- Type family.
- Icon style.
- Button language.
- Surface and border logic.
- Accessibility standards.

Not shared:

- Landing scroll runtime.
- Landing parallax state.
- Landing large narrative viewport logic.
- Landing scene-animation controllers.

## Weather Perimeter Fusion

Final design decision:

- App Shell may wrap Weather with page padding, navigation, and safe-area rules.
- Weather hero, atmosphere, Pixi canvas, Weather color variables, and Weather scene motion remain frozen.
- App nav on Weather must maintain readable contrast against the page perimeter.
- If a transparent/weather nav variant is used, it belongs to App Layout tokens, not Weather internals.

Evidence:

- `WeatherPage.vue` is a route perimeter around `WeatherWorkspace.vue`.
- `WeatherSnapshotLayer.vue`, `WeatherAtmosphere.vue`, and `WeatherPixiLayer.vue` own Weather visuals.

## Current Page Visual Findings

| Surface | Worth preserving | Must unify later | Evidence |
| --- | --- | --- | --- |
| Home / future Workspace | Real dashboard aggregation and useful two-column rhythm. | Page grid thresholds and panel spacing should align with App Layout tokens. | `src/modules/home/HomePage.vue`, `useHomeDashboard.ts` |
| Weather perimeter | Strong atmospheric identity and performance-aware fallbacks. | Only outer shell/nav/padding integration. Do not globalize inner visuals. | `src/modules/weather/**` |
| Todos | Clear task action hierarchy and status chips. | Header card, chips, and list surfaces need component tokens. | `src/modules/todos/components/TodosWorkspace.vue` |
| Bookmarks | Composer/controls/sections use clear forms and empty states. | Form field and repeated section spacing should align with shared input/panel tokens. | `src/modules/bookmarks/components/**` |
| Tools | Split-panel layout fits utility workflows. | Tool nav/sidebar should map to future App surface/nav tokens. | `src/modules/tools/components/ToolsWorkspace.vue` |
| Settings | Good grouped settings structure and dialog accessibility. | Many repeated framed panels should use component tokens and avoid over-carded feel. | `src/modules/settings/components/SettingsWorkspace.vue`, `SettingsConfirmationDialog.vue` |
| Not Found | Calm recovery surface. | Stage 3 should move it to Minimal Layout and provide Landing/Workspace exits. | `src/modules/not-found/NotFoundPage.vue` |
| Sidebar | Tokenized and accessible enough as current shell. | Must be replaced by top nav per Stage 1B. | `src/components/layout/SidebarNav.vue` |
| Topbar | Useful sticky/backdrop behavior. | Convert into App top nav token system. | `src/components/layout/Topbar.vue` |
| MobileNav | Uses safe area and active state. | Replace six columns with five-item bottom nav and More. | `src/components/layout/MobileNav.vue` |

## Current Visual Risks

Must unify before broad page rebuilds:

- Page-specific breakpoints are inconsistent.
- Component padding choices are repeated as utilities rather than component tokens.
- `primary` and `accent` color roles are duplicates.
- Some status colors are defined but unused.
- Shadow roles exist but are not fully mapped to overlays/menus/toasts.
- No final z-index scale exists.
- No app-wide drawer/sheet/toast component vocabulary exists.

Should not globalize:

- Weather atmosphere colors.
- Weather Pixi canvas z-index and opacity.
- Weather hero temperature type scale.
- Weather scene motion durations.
- Module-specific data semantics.

## Copy Visual Rules

Final design decision:

- Page titles are direct and short.
- Feature descriptions should be one or two short sentences.
- Buttons use action verbs.
- Empty states explain next action.
- Error copy states the problem and recovery.
- Landing copy is calm and product-specific, not hype.
- Do not use fake user counts, fake customer logos, or fake metrics.
- Do not overuse exclamation marks.
- Do not call every feature "smart".
- Chinese and English text lengths must be tested in compact UI.

Tone:

- Calm.
- Direct.
- Clear.
- Warm.
- Not over-marketed.

## Anti-patterns Rejected

Final design decisions:

- Permanent left primary nav for the commercial upgrade.
- Generic admin-dashboard template styling.
- All content as equal cards.
- Same card grid on every page.
- Large purple gradients.
- Neon AI SaaS style.
- Global glassmorphism.
- Excessive rounding.
- Decorative shadows everywhere.
- Low-contrast gray text.
- Scroll hijacking.
- Site-wide WebGL.
- Mobile copying desktop complex animation.
- Page components hard-coding raw colors.
- Global tokens overriding Weather internals.
- Removing Weather's independent visual identity for uniformity.
- Sacrificing readability or task efficiency for "premium" aesthetics.

## Stage 3 Visual Implementation Order

Implementation guidance:

1. Add token foundation and aliases without breaking current pages.
2. Define App Layout structural tokens.
3. Implement Layout Resolver and layouts from Stage 1B.
4. Implement App top navigation and mobile bottom navigation using component tokens.
5. Move current Home responsibility to `/app` without content redesign.
6. Create minimal Landing route shell only if Stage 3 scope allows it.
7. Keep Weather internal files untouched; apply only perimeter shell tokens.

## Code Evidence

| File | Evidence used |
| --- | --- |
| `PRODUCT.md` | Product purpose and local-first principles. |
| `DESIGN.md` | Existing warm clay green, semantic OKLCH, app shell, and accessibility direction. |
| `docs/commercial-upgrade/04-information-architecture.md` | `/` and `/app` responsibilities. |
| `docs/commercial-upgrade/05-route-layout-contract.md` | layout and Weather perimeter contract. |
| `docs/commercial-upgrade/06-navigation-contract.md` | navigation information architecture. |
| `src/assets/styles/tokens.css` | current token source. |
| `src/assets/styles/main.css` | global base/utilities. |
| `src/components/base/BaseIcon.vue` | icon system. |
| `src/components/base/BaseButton.vue` | button variants. |
| `src/components/base/BaseInput.vue` | input visual pattern. |
| `src/components/base/BaseSurface.vue` | surface variants. |
| `src/components/layout/Topbar.vue` | sticky/backdrop nav-like surface. |
| `src/components/layout/MobileNav.vue` | mobile bottom nav evidence. |
| `src/modules/settings/components/SettingsConfirmationDialog.vue` | dialog and focus pattern. |
| `src/modules/weather/components/WeatherSnapshotLayer.vue` | Weather visual boundary. |
| `src/modules/weather/renderers/pixi/WeatherPixiLayer.vue` | Weather canvas and motion boundary. |

## Needs Later Verification

- Stage 3 must verify contrast for all new nav states in light/dark themes.
- Stage 3 must verify text does not overflow at 375px and 390px.
- Stage 4 must verify Landing uses real product/weather visuals rather than generic decoration.
- Stage 7 must verify mobile bottom nav and More sheet ergonomics.
- Stage 8 must verify reduced motion and forced colors after visual implementation.
