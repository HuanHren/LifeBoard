# Stage 33 Design Tokens

## Scope

Stage 33 keeps the existing Tailwind and CSS variable stack and extends the token layer instead of adding a new UI framework or production dependency.

## Token Changes

- Added semantic application colors for background, foreground, surfaces, primary actions, focus rings, success, warning, and overlay roles.
- Added layout tokens for page inline padding, page block padding, content max width, wide content max width, compact sidebar width, full sidebar width, and mobile navigation clearance.
- Added typography tokens for card titles, compact body copy, and numeric display values.
- Added shared motion duration tokens and explicit raised/overlay shadow roles.
- Preserved compatibility tokens such as `--color-canvas`, `--color-card`, and `--color-accent`.

## Theme Parity

Light and dark themes define the same semantic roles. The shell, navigation, buttons, panels, and base inputs now read from semantic variables so later page rebuilds can migrate without changing theme mechanics.

## Guardrails

- No weather vendor tokens or weather scene assets were modified.
- No new design dependency was introduced.
- Reduced motion continues to disable CSS animation and transition duration globally.
