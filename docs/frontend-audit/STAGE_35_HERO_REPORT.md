# Stage 35 Hero Report

## Changes

- Kept the existing Pixi scene pipeline and `WeatherSnapshotLayer`.
- Moved Weather page actions and city context into the page header.
- Removed provider name from the Hero primary meta line.
- Preserved location, condition, current temperature, high/low, AQI, update time, and manage-cities entry.

## Result

The Hero now reads as current conditions first: location, temperature, AQI, condition, high/low, and update time. The visual scene remains decorative and no scene, FPS, lifecycle, or vendor behavior was changed.

## Verification

- Desktop screenshot: `docs/frontend-audit-local/stage-35/screenshots/weather-desktop-1366-full-fixed.png`.
- Mobile screenshot: `docs/frontend-audit-local/stage-35/screenshots/weather-mobile-390-full-fixed.png`.
- Dark screenshot: `docs/frontend-audit-local/stage-35/screenshots/weather-dark-desktop-1366.png`.
