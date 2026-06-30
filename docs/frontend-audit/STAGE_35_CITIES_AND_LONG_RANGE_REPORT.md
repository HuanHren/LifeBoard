# Stage 35 Cities And Long-Range Report

## Cities

The city management route keeps its existing search, current-location, selected-city, and favorites behavior. It remains inside the Stage 33 `PageLayout` wide container and shares the same restrained product tone as the main Weather page.

## 15-Day

The long-range route continues to load through the Weather store and provider boundary. It preserves the existing temperature trend and horizontally scrollable daily sequence.

## Consistency

- `/weather` now exposes Manage cities and 15-day actions from the page header.
- `/weather/cities` and `/weather/15-day` retain back-to-weather navigation.
- No provider request protocol, cache policy, or long-range data path was changed.

## Evidence

- `docs/frontend-audit-local/stage-35/screenshots/cities-desktop-1440.png`
- `docs/frontend-audit-local/stage-35/screenshots/long-range-desktop-1440.png`
