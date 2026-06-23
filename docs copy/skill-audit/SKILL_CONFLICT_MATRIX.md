# Skill Conflict Matrix

## Duplicate Skills
- Same SHA-256:
  - `C:\Users\jingr\codex-skills\design-taste-frontend\SKILL.md`
  - `C:\Users\jingr\codex-skills\frontend-skills\design-taste-frontend\SKILL.md`
- Same SHA-256:
  - `C:\Users\jingr\codex-skills\frontend-slides\plugins\frontend-slides\skills\frontend-slides\SKILL.md`
  - `C:\Users\jingr\codex-skills\frontend-slides\SKILL.md`

## Same Name Groups
- Same skill name:
  - `C:\Users\jingr\codex-skills\design-taste-frontend\SKILL.md`
  - `C:\Users\jingr\codex-skills\frontend-skills\design-taste-frontend\SKILL.md`
- Same skill name:
  - `C:\Users\jingr\codex-skills\frontend-skills\impeccable\SKILL.md`
  - `C:\Users\jingr\codex-skills\impeccable\SKILL.md`
- Same skill name:
  - `C:\Users\jingr\codex-skills\frontend-slides\plugins\frontend-slides\skills\frontend-slides\SKILL.md`
  - `C:\Users\jingr\codex-skills\frontend-slides\SKILL.md`

## Main Conflict Decisions
| Conflict | Primary | Audit only | Do not load now | Resolution |
|---|---|---|---|---|
| Multiple broad design skills | impeccable | design-taste-frontend, high-end-visual-design, ui-ux-pro-max, bencium-innovative-ux-designer | design-lab unless doing exploration | Use one primary design skill per stage; for LifeBoard app UI, impeccable wins because it reads PRODUCT/DESIGN and existing tokens. |
| React/Tailwind primitive requirements vs Vue app | vue-best-practices | baseline-ui for generic constraints | shadcn, react-doctor, next-* | Do not apply React primitive/library instructions to Vue components. |
| GSAP/motion dependency suggestions vs package.json | fixing-motion-performance | 12-principles-of-animation, transitions-dev | skills that require motion/react or GSAP | Prefer CSS transform/opacity and existing reduced-motion rules unless dependency addition is approved. |
| Three.js/WebGL weather visuals vs current docs | WEATHER_ATMOSPHERE_ASSETS.md project constraint | threejs-* for conceptual review | threejs-* for implementation | Current docs say not to add JavaScript animation controllers, canvas, WebGL, video, remote artwork, or per-particle DOM nodes. |
| Full output vs staged delivery | task scope and incremental design | full-output-enforcement | overdrive for routine increments | Complete the current stage, but avoid unrelated page rewrites. |
