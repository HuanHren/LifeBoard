# Stage 22.1 Fallback Root Cause

## Scope

This audit covers the Stage 22 caveat where a selected AVIF `<source>` fails at request time and Chromium does not automatically retry the sibling WebP `<source>`.

Evidence:

`docs/weather-visual/screenshots/stage-22-1/network/root-cause-pre-fix.json`

## Confirmed Browser Behavior

Normal AVIF path:

- Chromium selected the desktop AVIF source.
- Only the AVIF asset was requested.
- The image loaded with natural size 1896x829.
- No WebP request was made.

AVIF network failure path:

- Chromium selected the desktop AVIF source.
- The AVIF request failed with `net::ERR_FAILED`.
- Chromium did not request the sibling WebP source.
- The base image ended with `naturalWidth=0`.
- Weather text and interactions stayed present.
- No horizontal overflow occurred.

## Root Cause

`<picture>` format negotiation is a capability and source-selection mechanism, not a network retry mechanism. Once the browser has selected an AVIF source, a request-time failure for that URL does not require the browser to reconsider lower-priority sibling sources such as WebP.

In Stage 22, `WeatherAtmosphere.vue` treated any base image error as a complete base layer failure. That preserved the weather text but did not attempt an equivalent same-viewport WebP asset.

## Distinctions

- Format capability fallback: browser does not support or does not select AVIF, so it can select WebP before making the image request.
- Network error fallback: browser selected AVIF, the AVIF request failed, and application code must remove AVIF sources before the browser can select WebP.
- Responsive source selection: desktop/mobile is still native `<picture>` media selection and must not be replaced with JavaScript viewport logic.
- Full visual fallback: only after AVIF and WebP both fail should the component remove the base image and use the existing CSS neutral visual fallback.

## Required Fix Shape

The fix belongs in the weather image presentation layer. It should keep the resolver, timeline, WMO mapping, visual registry, and responsive asset set unchanged.

The minimum stable state machine is:

`prefer-avif -> webp-only -> visual-fallback`
