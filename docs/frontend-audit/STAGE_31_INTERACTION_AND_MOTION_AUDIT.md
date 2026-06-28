# Stage 31 Interaction and Motion Audit

## Interaction Model

The app uses links and native buttons for most interactions. Weather city search, bookmark editing, task editing, settings confirmation, theme switching, and language switching are implemented with normal browser controls and Vue state.

## Motion Model

Motion is restrained. Weather is the primary animated surface, using Pixi only when motion is allowed. Production preview with reduced motion showed weather canvas count at 0. The global CSS currently shortens transitions under reduced motion rather than fully eliminating all transition classes.

## Findings

| ID | Area | Severity | Route | Viewport | Evidence | Current behavior | Why it is a problem | Recommended direction | Affected files | Dependencies | Suggested phase | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MOT-01 | Reduced motion | P2 | all | all | Global CSS uses near-zero transition duration under `prefers-reduced-motion` | Motion is effectively minimized but not explicitly disabled at every component boundary | Some users prefer no animation rather than very short animation | Audit transitions and disable nonessential animation under reduced motion | `src/assets/styles/main.css`, animated components | Component inventory | Stage 40 | Reduced-motion mode has no decorative transitions and no weather canvas animation |
| MOT-02 | Weather WebGL warning | P2 | `/weather` | desktop | Browser console recorded Chromium WebGL `ReadPixels` performance warnings on desktop weather screenshot capture | Runtime works, but headless capture triggers GPU performance warnings | It is not user-facing failure, but it should be tracked for performance QA | Keep Pixi screenshot checks, avoid unnecessary readbacks, and monitor GPU warnings | `src/modules/weather/renderers/pixi/*` | Weather visual regression | Stage 35 | Weather visual checks pass without persistent runtime console errors in normal navigation |
| MOT-03 | Tool/workspace history | P2 | `/tools` | all | Tool selection is local component state | Browser back/forward does not represent tool changes | Workspace interactions feel less app-like | Route or query-synchronize active tool | `src/modules/tools/components/ToolsWorkspace.vue` | Route update | Stage 37 | Back/forward restores active tool without remounting unrelated state |

## Preserved Strengths

Weather ticker lifecycle and reduced-motion behavior from prior stages remain intact in production preview. There were no failed route loads, no infinite local reference requests, and no unexpected canvas on non-weather routes.
