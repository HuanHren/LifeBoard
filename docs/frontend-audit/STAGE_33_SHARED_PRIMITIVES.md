# Stage 33 Shared Primitives

## Added

- `BaseIcon.vue`: small inline icon registry used by shell navigation and icon buttons.
- `IconButton.vue`: accessible icon-only button primitive with named icon, size, variant, disabled, and type props.
- `BaseSurface.vue`: shared panel/surface wrapper for future route rebuilds.
- `FormField.vue`: label, description, error, and slot-prop wrapper for consistent form semantics.
- `BaseInput.vue`: base text input with optional leading/trailing icons and state styling.
- `PageLayout.vue`: shared page container primitive.

## Updated

- `BaseButton.vue` now supports primary, secondary, ghost, and danger variants; small, medium, large, and icon sizing; disabled and loading states.
- `ThemeToggle.vue` now uses the shared icon button.

## Dependency Impact

No new production dependency was added. Icons are implemented as local inline SVG paths to keep the Stage 33 scope small.

## Adoption Boundary

The primitives were introduced for shell and future rebuild readiness. Stage 33 did not refactor every existing form or page card into these primitives.
