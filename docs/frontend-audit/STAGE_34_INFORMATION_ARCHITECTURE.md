# Stage 34 Information Architecture

## Runtime Goal

Home now presents a daily workspace instead of a module index.

The reading order is:

1. Today context
2. Today's actionable work
3. Upcoming plans
4. Weather and quick access

## Structure

```text
Home
├─ Today Header
├─ Today Focus
├─ Next Up
│  ├─ Upcoming Tasks
│  └─ Countdowns
└─ Side Rail
   ├─ Weather Summary
   └─ Quick Access
      ├─ Pinned Bookmarks
      └─ Tool Shortcuts
```

## Design Notes

- The page no longer follows navigation order.
- Settings is not promoted as a Home card.
- Today Focus is the dominant desktop region.
- Weather is a lightweight summary and does not mount the full Weather scene.
- Quick Access uses compact rows and buttons rather than repeated large cards.

## Empty and Recovery Paths

- Empty tasks point to Todos.
- Empty countdowns point to plan management through Todos.
- Empty bookmarks point to Bookmarks.
- Weather with no selected city points to Weather city selection or one-time current location.
- Store persistence errors stay local to the affected panel.
