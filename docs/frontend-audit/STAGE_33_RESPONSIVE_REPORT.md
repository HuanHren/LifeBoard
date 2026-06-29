# Stage 33 Responsive Report

## Matrix

Verified routes across these viewports:

- Mobile: `360x800`, `390x844`, `430x932`
- Tablet portrait: `768x1024`, `820x1180`, `834x1112`
- Tablet landscape: `1024x768`, `1180x820`
- Desktop: `1366x768`, `1440x1000`, `1600x900`, `1920x1080`

## Results

- Matrix rows: 108
- Horizontal overflow failures: 0
- Failed network rows: 0
- Local reference asset request rows: 0
- Screenshot count: 16

## Behavior

- Mobile and tablet portrait use bottom navigation.
- Tablet landscape and desktop use sidebar navigation.
- Desktop extra-wide expands sidebar labels and descriptions.
- Page body spacing is driven by shared page tokens.

## Evidence

- `docs/frontend-audit-local/stage-33/responsive-results.json`
- `docs/frontend-audit-local/stage-33/route-shell-results.json`
- `docs/frontend-audit-local/stage-33/screenshots/`
