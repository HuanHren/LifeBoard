# Stage 31 Accessibility Audit

## Baseline

The app has important accessibility foundations:

- Skip link to main content.
- Stable main landmark.
- Route titles and page headers.
- Visible focus styles.
- Native controls for most actions.
- Alert/status roles in error, empty, and weather states.
- Reduced-motion support for weather visuals.
- Language store updates `html lang`.

## Browser Checks

The production preview matrix found no unnamed buttons or links across 60 route-viewport checks. The dark English scenario correctly produced `html lang="en-US"` and an English route title.

## Findings

| ID | Area | Severity | Route | Viewport | Evidence | Current behavior | Why it is a problem | Recommended direction | Affected files | Dependencies | Suggested phase | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A11Y-01 | Focus and overlays | P2 | `/settings`, `/weather/cities` | all | Settings confirmation and weather search use custom focus/list behavior | Custom patterns exist without a shared dialog/listbox primitive | Future dialogs/search lists may drift from expected keyboard behavior | Build shared dialog, popover/listbox, and field primitives with documented keyboard behavior | `src/components/base/*`, settings/weather components | Design system | Stage 33/40 | Dialog/search patterns pass keyboard and screen reader smoke tests |
| A11Y-02 | Form system | P2 | `/bookmarks`, `/todos`, `/settings` | all | Forms are locally implemented | Labels and errors are mostly present, but field structure is repeated | Repetition increases risk of inconsistent error announcement | Add shared form-field, help text, error text, and validation summary patterns | Shared base components and module forms | Design system | Stage 33 | New and existing forms share accessible field/error structure |
| A11Y-03 | Touch ergonomics | P2 | `/todos`, mobile nav | mobile | Task checkbox is visually 20 px; mobile nav is two-row fixed | Controls are usable but not fully polished for frequent mobile use | Small or crowded controls slow repeated use | Increase hit areas and use icon+label navigation | Todos and layout components | Visual system | Stage 36/40 | Mobile controls meet touch target expectations without layout crowding |

## Preserved Strengths

No automated name failures were found for links/buttons. The app already has a working language switch, focus-visible styling, and reduced-motion behavior.
