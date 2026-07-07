# Next Upgrade Plan

Date: 2026-07-07

Status: planning only. No source implementation is authorized by this document.

## Sequence

1. Keep the current Weather module frozen.
2. Allow Weather changes only for regression fixes.
3. Start the next workstream with whole-site architecture upgrade and commercial-grade visual refactor.
4. Unify the global design system, route/page layout contracts, responsive behavior, and motion rules across Home, Todos, Tools, Bookmarks, Settings, Landing, and shared app shell.
5. After the whole-site upgrade is complete, schedule Weather follow-up animation work.
6. Resume Xiaomi Weather material analysis and any Weather effect rewrite only after the whole-site upgrade is complete.

## Weather Boundary

Do not continue Weather animation expansion during the whole-site upgrade. Do not add new Weather scenes, replace approved Weather assets, rewrite the Pixi runtime, or introduce a new Weather motion engine unless a separate Weather unfreeze decision is made.

## Upgrade Focus

- Whole-site architecture upgrade.
- Commercial-grade visual refactor.
- Global design token and component contract cleanup.
- Page-level visual consistency.
- Responsive layout and interaction consistency.
- Motion system consolidation with reduced-motion support.
- Weather regression preservation against `docs/weather-module-freeze-baseline.md`.

## Weather Follow-up Queue

- Weather regression fixes only during the whole-site upgrade.
- Weather animation rewrite planning after the whole-site upgrade.
- Xiaomi Weather material analysis after the whole-site upgrade.
