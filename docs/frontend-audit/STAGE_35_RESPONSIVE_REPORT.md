# Stage 35 Responsive Report

## Checked Viewports

- Desktop: `1366x768`, `1440x1000`.
- Tablet: `820x1180`.
- Mobile: `390x844`.
- Dark desktop and zh mobile smoke views were also captured.

## Results

- Desktop first viewport shows the Hero and the next advice/status section.
- Daily forecast now uses the main content width on desktop.
- Mobile uses a separate stacked layout and local horizontal scroll for hourly/precipitation timelines.
- A mobile horizontal overflow caused by the precipitation timeline inside a grid was found and fixed with `min-w-0` containment on the grid wrappers and scroll sections.

## Evidence

Local ignored evidence:

- `docs/frontend-audit-local/stage-35/screenshots/weather-desktop-1366.png`
- `docs/frontend-audit-local/stage-35/screenshots/weather-desktop-1366-full-fixed.png`
- `docs/frontend-audit-local/stage-35/screenshots/weather-mobile-390-full-fixed.png`
- `docs/frontend-audit-local/stage-35/screenshots/weather-tablet-820.png`
