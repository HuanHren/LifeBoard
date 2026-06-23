# Weather Visual Skill Stack

## Recommended Stack
- Main design Skill: `impeccable`
- Vue / technical stack Skill: `vue-best-practices`
- Foundation UI constraint Skill: `baseline-ui`, used selectively because some React-specific rules do not apply
- Animation / specialty Skill: `fixing-motion-performance`; optionally `12-principles-of-animation` for critique only
- Visual verification Skill: `playwright-cli` plus `wcag-audit-patterns` when verification-heavy

## Scenario Load Orders
| Scenario | Load order | Notes |
|---|---|---|
| 1. Weather visual system architecture | vue-best-practices -> impeccable -> baseline-ui -> fixing-accessibility | Start with Vue boundaries and project tokens, then design direction, then constraints. |
| 2. Weather Hero asset integration | impeccable -> vue-best-practices -> imagegen-frontend-web or imagegen-frontend-mobile -> baseline-ui | Only for original local artwork; obey WEATHER_ATMOSPHERE_ASSETS.md. |
| 3. Weather background animation | vue-best-practices -> fixing-motion-performance -> 12-principles-of-animation -> playwright-cli | CSS transform/opacity first; no canvas/WebGL unless constraints change. |
| 4. Mobile independent composition | imagegen-frontend-mobile -> impeccable -> vue-best-practices -> wcag-audit-patterns | Useful for mobile composition/asset direction, not architecture changes. |
| 5. Global visual audit | impeccable -> web-quality-audit -> wcag-audit-patterns -> playwright-cli | Audit first; avoid broad refactors unless findings require them. |

## Do Not Load Together By Default
- `design-taste-frontend` + `impeccable` as co-primary design authorities.
- `threejs-*` with the current weather atmosphere implementation stage.
- React/Next/Shadcn skills for Vue component implementation.
- Multiple large redesign skills in one incremental LifeBoard task.
