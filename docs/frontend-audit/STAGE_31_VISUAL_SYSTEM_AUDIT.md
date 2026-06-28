# Stage 31 Visual System Audit

## Current Visual System

The visual system is token-driven with OKLCH color variables, semantic surface/text/border/focus tokens, dark theme support, and responsive type tokens. The app maintains a restrained operational tone, especially in Weather and Settings.

However, the UI is card-heavy. Many pages use repeated bordered panels, summary blocks, and module cards. This is functional but not yet a commercial-grade product hierarchy. It lacks a stronger shell, denser operational views, and consistent component variants for status, segmented controls, forms, and compact data rows.

## Findings

| ID | Area | Severity | Route | Viewport | Evidence | Current behavior | Why it is a problem | Recommended direction | Affected files | Dependencies | Suggested phase | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VIS-01 | Design tokens | P1 | `/weather` | all | `WeatherHero.vue` uses `rounded-[var(--radius-xl)]` and `shadow-[var(--shadow-sm)]`; audited tokens define radius and shadow names differently | Some arbitrary CSS variable references may resolve invalid if the variable is absent | Visual consistency depends on undefined token behavior | Normalize token names and replace invalid references | `src/modules/weather/components/WeatherHero.vue`, `src/assets/styles/tokens.css` | Token audit | Stage 32 | No component references undefined design tokens |
| VIS-02 | Product hierarchy | P1 | `/`, `/todos`, `/bookmarks`, `/settings` | all | Home and settings use stacked cards/sections with similar visual weight | Pages feel like grouped panels rather than product workflows | Users have to scan too many equal-weight surfaces | Establish page templates: command dashboard, workbench, management table/list, settings form | `src/modules/home/*`, `src/modules/settings/*`, shared base components | App shell/design system | Stage 33-39 | Each page has one clear primary zone and predictable secondary zones |
| VIS-03 | Navigation affordance | P2 | all | desktop/mobile | Primary nav uses text markers such as `HM`, `WE`, `TD` | Markers are compact but not strong visual symbols | Commercial polish is lower than icon+label navigation | Introduce a small curated icon set or consistent symbolic system | `src/components/layout/*` | Dependency decision or inline icon strategy | Stage 33 | Navigation has recognizable icons and preserved accessible names |
| VIS-04 | Component variants | P2 | all | all | Many panels repeat arbitrary class combinations | Repeated utility classes stand in for formal variants | Future visual changes require broad page edits | Add variants for cards, rows, alerts, pills, form fields, and action bars | `src/components/base/*`, module components | Token cleanup | Stage 33 | Common UI states are expressed through shared primitives |

## Preserved Strengths

Color tokens are semantic, dark mode is coherent, focus tokens exist, and the current palette avoids the worst one-note product theming. Weather has a distinctive visual identity without overwhelming the whole app.
