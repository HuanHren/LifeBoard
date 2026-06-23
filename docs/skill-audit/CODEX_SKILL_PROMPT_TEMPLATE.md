# Codex Skill Prompt Template

Use this template for future LifeBoard stages. Replace bracketed values only.

```text
You are working in Windows PowerShell.

Project directory:
D:\LifeBoard

Task:
[describe the stage]

Primary goal:
[one concrete outcome]

Do not implement:
- Do not modify unrelated LifeBoard files.
- Do not modify any Skill source file.
- Do not add dependencies unless explicitly approved.
- Do not use React/Next/shadcn instructions for Vue code.

Required Skills:
1. Main design Skill: C:\Users\jingr\codex-skills\impeccable\SKILL.md
2. Vue stack Skill: C:\Users\jingr\codex-skills\vue-best-practices\SKILL.md
3. UI constraint Skill: C:\Users\jingr\codex-skills\baseline-ui\SKILL.md
4. Specialty Skill: [exact optional SKILL.md path]

Preflight gate:
Run PowerShell exactly:
Test-Path -LiteralPath "D:\LifeBoard"
Test-Path -LiteralPath "C:\Users\jingr\codex-skills\impeccable\SKILL.md"
Test-Path -LiteralPath "C:\Users\jingr\codex-skills\vue-best-practices\SKILL.md"
Test-Path -LiteralPath "C:\Users\jingr\codex-skills\baseline-ui\SKILL.md"
Test-Path -LiteralPath "[optional specialty skill path]"

If any required Skill path is missing or unreadable, stop immediately and report the missing path. Do not claim the Skill was read.

Read order:
1. Fully read each required SKILL.md.
2. For any Skill that points to mandatory references, read those references before editing.
3. Read LifeBoard PRODUCT.md, DESIGN.md, src/assets/styles/tokens.css, src/assets/styles/main.css, and the files directly relevant to the task.

Skill responsibilities:
- Main design Skill controls visual direction and existing-product fit.
- Vue stack Skill controls Vue 3, Composition API, SFC, props/emits, composables, Pinia/Router integration.
- UI constraint Skill is an audit/constraint layer only; ignore React-specific primitive requirements unless conceptually applicable.
- Specialty Skill controls only its narrow domain.

Conflict priority:
1. User task and explicit project docs.
2. Existing LifeBoard architecture and dependencies.
3. Vue stack Skill.
4. Main design Skill.
5. UI constraint and specialty Skills.

Current-state audit:
Before editing, inspect package.json, vite.config.ts, relevant src/modules/weather files, CSS tokens, and existing docs. Summarize what exists.

Implementation scope:
[exact files or directories allowed]

Acceptance criteria:
- TypeScript/Vue build must pass if code is changed.
- Responsive desktop/mobile behavior must be checked when UI changes.
- Reduced motion and forced-colors behavior must remain valid for weather visuals.
- Final report must list changed files, verification commands, and remaining caveats.
```
