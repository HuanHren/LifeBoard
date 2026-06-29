# Stage 32A.2 Performance Report

## Tiers

| Tier | Target |
| --- | --- |
| `high` | Desktop, max 30 FPS |
| `balanced` | Tablet, max 30 FPS with fewer layers |
| `low` | Mobile or saveData, max 24 FPS |
| `static` | Reduced motion or WebGL/saveData fallback |

## Runtime Rules

- Desktop maximum FPS remains 30.
- Mobile maximum FPS remains 24.
- Tablet maximum FPS remains 30.
- DPR is capped.
- Scene layer count is capped by performance tier.
- Scene textures are loaded on demand.
- Duplicate scene URLs are loaded once.
- The ticker stops on page hidden and route teardown.
- Reduced motion destroys the Pixi layer and uses static/fallback atmosphere.

## Local Evidence

`performance-results.json` records max layer count and particle caps for each scene family.
