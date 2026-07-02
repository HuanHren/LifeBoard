# Stage 4.1 Landing Visual Correction

## 1. Scope

Stage 4.1 corrects the high-fidelity commercial Landing implementation for `/`.

Allowed implementation surface:

- `src/modules/landing/LandingPage.vue`
- `src/modules/landing/composables/useLandingScrollNarrative.ts`
- `src/app/navigation/LandingNavigation.vue` if Landing-only navigation behavior is required
- `src/assets/styles/main.css` for Landing navigation centering only
- `src/i18n/**` for Landing visible copy and labels

No Stage 5 workspace work is included.

## 2. Baseline

Baseline commit for this stage:

```text
44a7a7bf5d7cf72bfe74fb63399f3760934e91a8
```

Baseline build passed before edits with the existing large chunk warning from Vite.

## 3. Visual Problems Corrected

The Stage 4 Landing implementation exposed these product-quality gaps:

- Hero felt like a generic text area instead of a weather-led LifeBoard product surface.
- The visual preview did not clearly show how Weather becomes Workspace context.
- Product entry cards were too uniform and did not establish hierarchy.
- The demo toolbar was visually dependent on available width and needed stronger centering.
- Visible copy included implementation language that should not appear in a commercial page.
- Sticky story motion needed a clearer scene-to-card transition while keeping one contained scroll narrative.

## 4. Hero Correction

Final decision:

- The hero now uses a weather atmosphere field, a compact weather card, and a workspace preview.
- The first viewport makes LifeBoard, weather, workspace, todos, bookmarks, and tools legible without exposing implementation terms.
- Primary CTA enters Workspace.
- Secondary CTA enters Weather.
- The hero remains responsive and avoids oversized mobile typography.

## 5. Product Preview

The preview surface now shows:

- Weather card with current temperature and condition copy.
- Workspace top bar.
- Focus task card.
- Countdown card.
- Tools card.
- Bookmarks card.

This is a visual product preview only. It does not import Weather internals, read Weather data, or mutate application stores.

## 6. Sticky Story

Final decision:

- Keep a single Landing scroll narrative.
- Keep one GSAP/ScrollTrigger timeline.
- Keep motion inside `useLandingScrollNarrative`.
- Add a workspace scene card between Weather and the downstream app cards.
- Disable pinned animation below desktop motion conditions and when reduced motion is requested.

The scroll narrative remains Landing-only and is cleaned up through the existing GSAP context revert.

## 7. Product Entrances

Final decision:

- Workspace and Weather receive larger visual priority.
- Todos, Bookmarks, and Tools remain direct entries.
- All entries route to existing application route names.
- No new route is created.
- No hidden redirect or auto-skip behavior is introduced.

## 8. Interactive Demo

Final decision:

- Demo tabs are centered and keyboard operable.
- ArrowLeft, ArrowRight, Home, and End move between demo tabs.
- Weather demo remains decorative.
- Todos demo uses local checkbox state only.
- Tools demo uses local textarea state and calculates characters, words, and lines.

The demo does not read or write the real Todos, Tools, Bookmarks, Weather, or Home data.

## 9. Visible Copy Cleanup

Visible Landing copy must not mention:

- Stage numbers.
- Store or Pinia.
- Frozen module status.
- Route implementation details.
- Internal architecture phrases.

The corrected copy focuses on user-facing product value:

- Daily essentials.
- Weather context.
- Workspace continuity.
- Local, temporary tools.
- Direct entry into product areas.

## 10. Navigation Correction

Final decision:

- Landing desktop navigation uses a three-column grid at desktop widths.
- Brand remains left aligned.
- Main Landing links are centered in the viewport.
- Utility actions remain right aligned.
- The App Top Navigation structure is not changed.

## 11. Responsive Contract

Validated target behavior:

- 375 and 390 widths use mobile layout without horizontal overflow.
- 768 and 1024 widths keep readable hierarchy and avoid squeezed toolbar controls.
- 1280, 1440, and 1920 widths preserve the centered navigation and hero composition.
- The product preview stacks on small screens.
- Demo stats stack on narrow screens.

## 12. Light And Dark Theme

The visual correction keeps token-based colors and adds Landing-specific atmosphere composition through CSS only.

Theme behavior remains driven by the existing theme system. No new theme store or token contract is introduced.

## 13. i18n

The Landing copy now has explicit Chinese and English strings for:

- Hero action label.
- Weather CTA.
- Product preview labels.
- Workspace story step.
- Product entry descriptions.
- Demo action labels.
- Tools demo statistic labels.

Visible text remains resolved through the existing i18n catalog.

## 14. Accessibility

Final behavior:

- Hero actions have an accessible label.
- Demo tabs use `role="tablist"`, `role="tab"`, `aria-selected`, and `aria-controls`.
- Demo tab keyboard navigation supports ArrowLeft, ArrowRight, Home, and End.
- Decorative weather visuals remain hidden from assistive technology.
- Reduced motion keeps the content accessible without requiring pinned animation.

## 15. Performance

Final behavior:

- No dependency is added.
- GSAP and ScrollTrigger remain lazy-loaded only by the Landing scroll composable.
- The Weather/Pixi chunks remain async and untouched.
- The Vite large chunk warning remains existing baseline behavior.

## 16. Weather Freeze Boundary

No files under these frozen paths are modified:

- `src/modules/weather/**`
- `src/assets/weather/atmosphere/**`
- `public/weather-assets/**`
- `public/__local_weather_reference/**`

The Landing weather visuals are CSS-only decorative previews and do not reuse or alter Weather internals.

## 17. Files Changed

Expected implementation files:

- `src/modules/landing/LandingPage.vue`
- `src/modules/landing/composables/useLandingScrollNarrative.ts`
- `src/assets/styles/main.css`
- `src/i18n/keys.ts`
- `src/i18n/locales/en-US.ts`
- `src/i18n/locales/zh-CN.ts`

Expected documentation file:

- `docs/commercial-upgrade/12-stage-4-1-landing-visual-correction.md`

## 18. Verification Checklist

Required after implementation:

- `npm run build`
- Route smoke test for `/`, `/app`, Weather routes, Todos, Bookmarks, Tools, Settings, and Not Found.
- Responsive screenshots for desktop and mobile.
- Light and dark theme screenshots.
- Chinese and English visible copy check.
- Reduced motion check.
- Frozen Weather path diff check.
- `git diff --check`
- Final clean working tree after commit.

## 19. Known Limits

Stage 4.1 does not:

- Implement Stage 5 Workspace content.
- Redesign App Layout.
- Change App Top Navigation information structure.
- Change Mobile Bottom Navigation information structure.
- Change Weather internals.
- Add new dependencies.

## 20. Next Stage

Stage 5 should focus on the `/app` Workspace homepage and reuse the established route, layout, navigation, and visual token contracts.
