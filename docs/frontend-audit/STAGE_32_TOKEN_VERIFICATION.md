# Stage 32 Token Verification

## Issue

`WeatherHero.vue` referenced two token names that were not defined by the current design token set:

- `--radius-xl`
- `--shadow-sm`

The defined radius and shadow tokens include:

- `--radius-sm`
- `--radius-md`
- `--radius-lg`
- `--radius-pill`
- `--shadow-soft`

## Fix

The hero container now uses existing tokens:

```text
rounded-[var(--radius-lg)]
shadow-[var(--shadow-soft)]
```

No global token names were added, and no non-weather component was changed.

## Light and Dark Verification

Production preview computed styles showed the WeatherHero using:

- border radius: `16px`
- light theme shadow: resolved from `--shadow-soft`
- dark theme shadow: resolved from `--shadow-soft`

The same preview pass verified no horizontal overflow and no unnamed buttons on the weather route across desktop, tablet, and mobile.

## Scope Notes

Stage 32 did not redesign WeatherHero, alter visual assets, change Pixi scene parameters, or change the weather visual mapping. The fix is limited to replacing undefined token references with existing design tokens.
