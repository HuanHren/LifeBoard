# LifeBoard Commercial Upgrade - Stage 5.1 Workspace Mobile Closeout

## Scope

Stage 5.1 closes the first-pass Workspace implementation from Stage 5. It keeps the `/app` route, App Layout, navigation contract, stores, weather module, storage format, and token system intact. The work is limited to mobile density, status overview semantics, empty-state clarity, English copy, and verification.

## Evidence Rechecked

- Workspace route and shell: `src/router/index.ts`, `src/app/layouts/AppLayout.vue`, `src/app/navigation/AppTopNavigation.vue`, `src/app/navigation/MobileBottomNavigation.vue`.
- Workspace page and sections: `src/modules/home/HomePage.vue`, `src/modules/home/HomeTodayHeader.vue`, `src/modules/home/TodayFocusPanel.vue`, `src/modules/home/HomeNextUp.vue`, `src/modules/home/HomeWeatherSummary.vue`, `src/modules/home/HomeQuickAccess.vue`.
- Workspace data composition: `src/modules/home/composables/useHomeDashboard.ts`.
- Local data sources: `src/modules/todos/stores/todos.ts`, `src/modules/bookmarks/stores/bookmarks.ts`, `src/modules/weather/stores/weather.ts`.
- i18n and tokens: `src/i18n/moduleKeys.ts`, `src/i18n/locales/en-US-modules.ts`, `src/i18n/locales/zh-CN-modules.ts`, `src/assets/styles/tokens.css`, `src/assets/styles/main.css`.
- Stage 5 baseline: `docs/commercial-upgrade/14-stage-5-workspace-home-implementation.md`.

## Final Decisions

### Mobile header density

The Workspace hero remains the first `/app` section, but the mobile rhythm is tighter. The H1, summary, date, and primary actions now use smaller mobile-specific spacing so the next Workspace content appears in the first 390px viewport more reliably.

### Status rail

The status rail is now a semantic list, not a set of four navigation cards. It reports:

| Status | Source | Empty behavior |
| --- | --- | --- |
| Today focus | `todayFocusTasks + todayTaskOverflowCount` | Uses the short empty label `Clear` / `无待办` instead of a numeric zero. |
| Saved dates | `countdownRows.length` | Uses the short empty label `None saved` / `无日期` instead of a numeric zero. |
| Weather context | `weatherStore.hasWeather` | Reports connected or connect state only. |
| Quick references | `bookmarkRows.length` | Uses the short empty label `None saved` / `无资料` instead of a numeric zero. |

Operational navigation remains in the header CTAs and section-level actions. Weather setup stays in `HomeWeatherSummary.vue`, where the user can choose a city or use current location.

### Empty states

The empty Workspace state no longer creates a row of meaningless large zero cards. Empty values use descriptive text while preserving the original Todos, Weather, and Bookmarks empty-state actions.

### English copy

English Workspace copy was tightened:

- `home.today.title`: `Today's workspace`.
- `home.quick.title`: `Saved shortcuts`.

Chinese copy was left structurally unchanged to avoid unnecessary churn in the existing locale file.

## Weather Freeze Boundary

No weather module file was modified. Stage 5.1 only reads `weatherStore.hasWeather` through the existing `useHomeDashboard()` composition and leaves city selection, forecast loading, cache behavior, PixiJS, weather assets, condition mapping, and weather page layout untouched.

## Accessibility

- The status rail uses list semantics and avoids presenting display-only metrics as links.
- Primary Workspace actions remain keyboard reachable through existing `RouterLink` CTAs.
- Weather setup actions remain in the Weather Context card with their existing accessible labels.
- The logo behavior remains owned by `AppTopNavigation.vue`; the visible mark keeps the accessible name `LifeBoard` and targets the Landing route.

## Responsive Verification Targets

Stage 5.1 is verified against these states:

- 390px light populated.
- 390px light empty.
- 390px dark populated.
- 768px light populated.
- 1024px light populated.
- 1280px light populated.
- 1440px light populated.
- 1440px light empty.
- 1440px English.
- 1920px light populated.
- 390px reduced motion.
- Weather unavailable and Weather error Workspace states.

## Implementation Boundary

Files intentionally modified:

- `src/modules/home/HomePage.vue`
- `src/modules/home/HomeTodayHeader.vue`
- `src/modules/home/TodayFocusPanel.vue`
- `src/i18n/moduleKeys.ts`
- `src/i18n/locales/en-US-modules.ts`
- `src/i18n/locales/zh-CN-modules.ts`
- `docs/commercial-upgrade/15-stage-5-1-workspace-mobile-closeout.md`

Files intentionally not modified:

- `src/router/**`
- `src/app/layouts/**`
- `src/app/navigation/**`
- `src/modules/weather/**`
- `src/modules/todos/**`
- `src/modules/bookmarks/**`
- `src/stores/**`
- `src/assets/styles/tokens.css`
- `package.json`
- `package-lock.json`
