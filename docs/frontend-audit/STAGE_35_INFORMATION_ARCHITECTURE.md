# Stage 35 Information Architecture

## Target Reading Order

```text
Weather page header
-> current conditions Hero
-> compact weather advice/status
-> next 24 hours
-> next few days
-> useful details and air quality
-> precipitation/source/data status
```

## Route Responsibilities

- `/weather`: current weather, immediate next hours, short daily outlook, actionable details, and data freshness.
- `/weather/cities`: city selection, current-location entry, saved cities, and search results.
- `/weather/15-day`: longer daily range, trend context, and source-length boundary.

## Data Honesty

- Open-Meteo can provide up to the 15-day daily route through the existing provider path.
- Caiyun can expose a shorter daily range; the UI must label that as Caiyun 3-day outlook when applicable.
- AQI is shown only when returned by the air-quality service; no zero or fake fallback is displayed.
- Details show only fields available in the normalized model.

## Header Model

The Weather page header owns the page `h1`, short description, selected city context, Manage cities entry, and 15-day entry. The Hero keeps the current conditions and visual scene rather than duplicating global page title chrome.

## Status Model

Freshness, stale, offline-stale, background refresh, and update failure remain visible but secondary. Provider/source attribution belongs near the data status area, not in the Hero primary visual line.
