# Weather W6A: Xiaomi current-location resolution

## 1. Problem statement

The browser current-location flow previously produced only latitude and longitude. Xiaomi Weather still requires a verified Xiaomi `locationKey` together with those coordinates, so a newly acquired GPS position could not remain on Xiaomi and must never inherit the previous location's provider identity.

W6A resolves that gap without changing the Xiaomi `/all` contract, the shared Weather Store lifecycle, or Production configuration.

## 2. Current-location flow

The user-initiated flow is:

1. acquire a new browser geolocation position;
2. invalidate any earlier current-location operation;
3. when Xiaomi, zh-CN, and the Xiaomi feature flag are active, ask for consent before third-party lookup;
4. reverse-geocode the new coordinates in the browser;
5. search Xiaomi sequentially by the most suitable district/locality name and, only when needed, by city;
6. rank and deduplicate verified Xiaomi candidates;
7. require the user to choose and explicitly confirm a candidate;
8. preserve the browser GPS coordinates while attaching the confirmed Xiaomi `locationKey`;
9. reuse the existing Store selection, forecast, cache, retry, fallback, and Home snapshot flow.

No reverse lookup runs on page load or in the background. Home's existing automatic geolocation is suppressed while Xiaomi is preferred; the user must start this privacy-sensitive flow explicitly.

## 3. Why `locationKey` remains required

The Xiaomi `/api/weather/xiaomi/all` client contract remains `locationKey + latitude + longitude + locale + days`. W6A does not guess `isLocated=true`, accept an empty identity, derive an ID from coordinates, or reuse an ID from an older place. The identity comes only from a validated Xiaomi search result.

## 4. Reverse-geocoding provider

W6A uses BigDataCloud's public Free Client-side Reverse Geocoding to City endpoint:

`https://api.bigdatacloud.net/data/reverse-geocode-client`

The request contains only the newly acquired `latitude`, `longitude`, and `localityLanguage=zh`. It is sent directly by the browser and does not use a LifeBoard/Vercel proxy or API key. The provider is isolated behind `bigDataCloudReverseGeocoder.ts`; UI, Store, and Xiaomi provider code receive only the normalized domain model.

References:

- [Free Client-side Reverse Geocoding to City API](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api)
- [BigDataCloud fair-use policy](https://www.bigdatacloud.com/docs/article/fair-use-policy-for-free-client-side-reverse-geocoding-api)

## 5. Client-only fair-use boundary

The free endpoint is used only for the current device position obtained during the same explicit user action. It is not used for favorites, imported locations, stored coordinates, bulk lookups, background tracking, or server-side/proxied requests. Each action performs at most one reverse request and performs no automatic reverse retry.

## 6. User consent and privacy notice

Browser geolocation permission and consent to send coordinates to BigDataCloud are separate decisions. After GPS succeeds and before the third-party request starts, an accessible dialog explains that the current coordinates will be sent directly to BigDataCloud for this one recognition attempt. The user can continue or cancel.

Consent is not stored. Canceling sends no BigDataCloud or Xiaomi search request and leaves the existing Weather location unchanged. Every new user-initiated Xiaomi current-location operation presents the notice again.

## 7. Sanitized reverse model

`ReverseGeocodedLocation` contains only validated coordinates and trimmed, optional administrative fields: two-letter uppercase country code, country, principal subdivision, city, locality, postcode, optional China administrative code, a bounded useful administrative-name list, and the stable lookup-source identifier.

Unknown fields are ignored. Empty strings become absent values. Coordinates must be finite and within geographic ranges. Malformed payloads produce structured errors. The raw response, IP metadata, request URL, and coordinates are never persisted or logged.

## 8. Xiaomi query strategy

The resolver produces at most two distinct non-empty queries:

1. the most suitable fine-grained locality/district/county-level administrative name;
2. the city, only when the first query produced no trustworthy match.

Queries are sequential, not concurrent. Street, road, village, community, and coordinate-string values are excluded. A trusted first result set stops the fallback query. One user action is bounded to one reverse request, two Xiaomi searches, and one Xiaomi `/all` request after confirmation.

## 9. Candidate ranking

Candidates are deduplicated by their real Xiaomi `locationKey` and sorted using country, province, city, exact/normalized district-name and affiliation matches, then Haversine distance from the browser GPS position. Common Chinese administrative suffixes are ignored only for comparison; displayed provider names remain unchanged.

Up to five candidates are exposed. The first ranked candidate may be marked recommended, but ranking never confirms it automatically. Distance is informative and used for ordering only.

## 10. Explicit confirmation

The shared native-dialog component is reused by both Weather city management and Home. Candidate choices use radio semantics, visible labels, optional approximate distance, and a separate confirm button. No candidate is preselected, including a single candidate.

The dialog traps focus, supports Escape cancellation when no request is active, restores focus to the initiating current-location button, exposes loading through a polite status region, and exposes failures through an alert region. “Choose another location” returns to the existing city-search experience.

## 11. GPS coordinates versus candidate coordinates

After confirmation, the displayed name, administrative label, and `providerLocationIds.xiaomi` come from the chosen Xiaomi candidate. Latitude and longitude always remain the browser's newly acquired GPS coordinates. Candidate center coordinates are used only for distance ranking and are never persisted as the user's current position.

## 12. Persistence behavior

The confirmed location goes through the existing `selectLocation` path and existing `lifeboard-weather-location` storage value. W6A adds no storage key, registry entry, backup version, or persistence schema. A newly acquired GPS position starts without the prior Xiaomi identity; cancellation or failure never writes a Xiaomi ID.

Portable export behavior is unchanged and continues to strip runtime-only provider identity. Favorites remain static snapshots when the user explicitly saves a location; W6A introduces no live GPS reference or background tracking. Clear and factory-reset behavior are unchanged.

## 13. Locale and foreign-location behavior

Xiaomi resolution requires the client feature flag, preferred Xiaomi provider, zh-CN locale, valid coordinates, and a normalized `CN` country code. en-US never triggers BigDataCloud through the Xiaomi flow, Xiaomi search, or Xiaomi `/all`; the existing eligible provider behavior remains in control.

Outside China or when a valid country code cannot be established, no Xiaomi search runs. The GPS position is retained through the existing provider-neutral/Open-Meteo-compatible path and the UI explains that Xiaomi could not resolve the current place.

## 14. Cancellation and stale-response handling

Each operation owns a monotonically increasing token and one abort controller for reverse/search resolution. Starting again, switching provider or locale, closing the dialog, or unmounting invalidates the token and aborts the active resolution. Late responses cannot commit candidates or locations. Abort is not shown as an ordinary failure and no request loop is introduced.

## 15. Error handling

Stable categories cover permission denial, unavailable position, geolocation timeout, reverse network/HTTP/contract failures, outside-region locations, no trustworthy Xiaomi candidate, ambiguity, and abort. Messages are localized and never include complete coordinates, `locationKey`, raw provider bodies, or upstream diagnostics.

On reverse or Xiaomi-resolution failure the sanitized GPS location remains usable by the existing eligible provider flow, while Xiaomi offers the existing manual city-search route. No automatic reverse retry occurs.

## 16. Security boundary

The public BigDataCloud endpoint may appear in the client bundle because it is intentionally called by the current user's browser and requires no key. The client must not contain Xiaomi upstream hosts or credentials, Vercel credentials, a BigDataCloud API key, raw reverse responses, or raw Xiaomi responses. Tests and QA report only request counts, validity flags, candidate counts, identity presence/length, and approximate distance.

## 17. Test coverage

`test:weather-current-location-xiaomi:ci` uses an isolated Vitest configuration and mocked transports. It covers reverse normalization/errors, sequential query fallback, ranking/deduplication/distance, explicit confirmation, GPS preservation, stale-operation cancellation, locale/provider/region gates, Store persistence behavior, and accessibility/privacy contracts.

`qa:weather-current-location-xiaomi` performs deterministic Chromium validation at 390, 768, and 1440 pixels with mocked geolocation, BigDataCloud, Xiaomi, and Open-Meteo responses. It verifies cancel-before-request, one-operation request bounds, keyboard confirmation, Home reuse, a second location, multiple candidates, outside-China behavior, en-US behavior, zero direct Xiaomi-upstream calls, zero secret markers, zero console/page/unhandled errors, and zero overflow.

## 18. Known limitations

- Xiaomi Weather remains verified only for zh-CN.
- Xiaomi `/all` still requires a real `locationKey`; coordinate-only requests are unsupported.
- BigDataCloud recognition and Xiaomi search can be unavailable or ambiguous; manual search remains the recovery path.
- Candidate distance reflects the provider candidate's representative coordinates and is not an accuracy guarantee.
- Portable restore may require Xiaomi city reselection.
- No background geolocation, alert UI, system notifications, or evidence-deferred Weather semantics are introduced.

## 19. Preview handoff

W6A implementation deliberately performs no Preview deployment. After exact-SHA CI succeeds, a separate authorized release task can deploy an exact-commit Preview and validate the live BigDataCloud/Xiaomi contracts without altering this stage's source or historical Weather tags.

## 20. Production non-change

W6A does not deploy, promote, roll back, or change any Vercel environment variable or Xiaomi credential. The currently released Production remains on its pre-W6A deployment until a separate explicit release is authorized.

## 21. Rollback and stage boundary

The W6A commit is additive and can be reverted independently without moving `weather-w5-resilience-final-freeze` or `weather-post-freeze-xiaomi-display-contract-hotfix`. Calendar Stage 48, Weather animations, PixiJS, alerts, and Production release work remain outside this stage.
