# Weather Timeline Spec

Source: `src/modules/weather/visual/weather-timeline.ts`

## Buckets

- `sunrise`
- `day`
- `sunset`
- `night`

## Resolution Order

1. Use current weather time plus daily sunrise/sunset when valid.
2. Use provider `isDay` when solar timestamps are absent or invalid.
3. Fall back conservatively to `day` only when no usable time or provider day flag exists.

## Windows

- Sunrise bucket: 45 minutes before to 45 minutes after sunrise.
- Sunset bucket: 60 minutes before to 60 minutes after sunset.

Only `partly-cloudy + day` currently has registered imagery. Other timeline buckets safely fall back.
