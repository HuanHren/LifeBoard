# Weather W5: resilience and finalization

## Scope and dependency

Weather W5 builds on the frozen W4 commit `1c074f0abb4f08a6396471edd51351684c17f48c`. It hardens the existing shared Weather runtime with provider-aware cache identity, request coalescing, bounded retry, cooldown, stale-if-error, offline behavior, and an explicit Xiaomi-to-Open-Meteo fallback. It does not add a provider, weather capability, storage key, page, Store, or Production enablement.

## Cache architecture

The existing `lifeboard.weather.forecastCache.v1` runtime-only cache key is retained. Its value is now a versioned envelope containing at most four validated `ProviderWeatherSnapshot` entries. The key remains registered as cache data, excluded from portable export, and removed by the existing reset path.

Each canonical identity contains:

- cache schema version;
- provider (`openMeteo`, `caiyun`, or `xiaomi`);
- opaque Xiaomi location ID, or normalized coordinates for Open-Meteo/Caiyun;
- normalized latitude and longitude;
- locale;
- the 15-day forecast contract;
- the `metric-v1` unit contract.

City names, array positions, request URLs, and credentials are not cache identity. An invalid identity cannot read or write cache data.

Each entry contains the identity, validated provider-neutral snapshot, local storage time, optional provider update time, fresh deadline, and stale deadline. The runtime rejects malformed versions, invalid timestamps, non-finite values, provider/identity mismatches, unsafe internal metadata, and secret-shaped fields. Xiaomi `sourceMaps.clientInfo` is removed before validation and persistence. Expired entries are pruned; raw Xiaomi responses and diagnostic bodies are never persisted.

## Freshness policy

- Fresh: 15 minutes. A fresh entry satisfies the request without a duplicate provider call.
- Stale-if-error: after 15 minutes and through 2 hours from storage. It may be shown during a refresh and retained after an eligible failure, with an explicit stale/update-failed notice.
- Expired: after 2 hours. It is pruned and never displayed.

Provider `updateTime` remains provider metadata; local cache timestamps determine freshness.

## Shared request resilience

One provider-neutral resilience service wraps all forecast providers. A canonical cache key also identifies the in-flight request. Identical concurrent Weather/Home requests receive the same Promise; provider, location, locale, days, or units differences prevent coalescing. Settled or rejected work is removed from the in-flight map.

Search retains its existing debounce and cancellation path. W5 does not automatically retry search requests.

### Timeout

The Xiaomi Vercel Function keeps its authoritative 8-second upstream timeout. Direct Open-Meteo/Caiyun client transport keeps its existing 12-second timeout. The shared forecast boundary is 13 seconds, allowing either lower layer to return its stable error first. Navigation aborts propagate without becoming a visible provider failure, and every timer/listener is cleaned up.

### Retry

Forecast GET requests receive at most one automatic retry. Eligible categories are network, timeout, HTTP 408, HTTP 425, HTTP 5xx, and the stable Xiaomi upstream-unavailable proxy error. Delay is 250–500 ms using injected randomness in tests. Input, eligibility, location-resolution, contract, normalization, secret-boundary, unknown fatal, rate-limit, and explicit abort failures are not automatically retried.

### Rate-limit cooldown

HTTP 429 or Xiaomi `xiaomiRejected` with sanitized upstream status 429 enters an in-memory provider/forecast cooldown. A validated `Retry-After` value is honored from 1 second through 15 minutes; otherwise the cooldown is 60 seconds. Calls during cooldown are blocked before transport, valid cache remains usable, and retry is disabled until the deadline.

Client cooldown and request coalescing reduce request storms. Durable global rate limiting requires separate infrastructure and is not implemented.

## Failure classification

| Category | Retry | Stale cache | Xiaomi fallback | Notes |
| --- | --- | --- | --- | --- |
| eligibility | no | no | no | unsupported environment/locale/input |
| location-resolution | no | no | no | never fabricates a Xiaomi ID |
| offline | no live request | yes | no | connectivity is a hint |
| network | once | yes | yes | recoverable |
| timeout | once | yes | yes | recoverable |
| http-recoverable | once | yes | yes | 408, 425, 5xx |
| rate-limited | no immediate retry | yes | yes | cooldown applies |
| proxy | no by default | no | no | only explicit unavailable/status codes are remapped |
| contract | no | no automatic substitution | no | remains visible |
| normalization | no | no automatic substitution | no | remains visible |
| secret-boundary | no | no automatic substitution | no | remains visible |
| aborted | no | no | no | navigation is silent |
| unknown | no | no | no | fatal and visible |

An already displayed, previously validated snapshot can remain visible when a refresh is rejected, but it is not relabelled as a successful refresh.

## Recovery order

1. Return a valid fresh cache entry.
2. Make one live provider request.
3. Make one bounded retry only for eligible failures.
4. Use a valid stale entry for the same identity when allowed.
5. For eligible Xiaomi failures only, request Open-Meteo using the same coordinates.
6. Surface a controlled failure.

## Xiaomi fallback and serving-provider semantics

Fallback requires Xiaomi as the requested eligible provider, valid coordinates, no usable Xiaomi cache, and a network, timeout, 408, 425, 429, 5xx, or upstream-unavailable failure. Contract, normalization, secret-boundary, input, eligibility, location-resolution, abort, and unknown fatal errors never fall back.

Fallback does not change the saved preference. `preferredProvider` remains Xiaomi, `effectiveProvider` still describes eligibility, `servingProvider` becomes Open-Meteo, and `fallbackFromProvider` records Xiaomi. The Weather page and Home explicitly say that Open-Meteo is temporarily serving data. A successful manual Xiaomi retry clears fallback state. Open-Meteo never automatically falls back to Xiaomi, preventing a reverse loop.

## Offline behavior

`navigator.onLine` is treated only as a request-avoidance hint. When offline, a valid fresh or stale entry is shown with an offline label; expired cache is rejected. Preference is preserved. W5 does not add an automatic reconnect loop; the existing manual retry action provides controlled recovery after connectivity returns.

## Store, UI, and Home behavior

The existing Pinia Store keeps one display snapshot, one loading/error lifecycle, one request ID/AbortController strategy, and one refresh action. It now exposes freshness, recovery state, serving/fallback providers, last successful time, cooldown deadline, cache age, and sanitized refresh diagnostics. Provider, locale, and location changes clear incompatible display state; request IDs still prevent stale responses from winning.

The Weather page adds one restrained polite status region and a native, focus-visible retry button. It distinguishes fresh cache, stale cache, failed refresh, offline, fallback, and rate-limit states without technical codes or raw bodies. Home keeps the shared snapshot visible during recoverable refreshes and adds a concise honesty label for cached/fallback data. The Hero, W4 Xiaomi extension hierarchy, animations, and page structure are unchanged.

## Proxy boundary

No endpoint, authorization parameter, or upstream contract changed. W1 now preserves only bounded, numeric `Retry-After` seconds and the sanitized upstream status inside the stable error envelope. Upstream response text is discarded. This metadata supports client cooldown without exposing raw responses or credentials.

## Security boundary

Cache, UI, and diagnostics reject or omit authorization, app keys, signatures, OAID, device/app/ROM identifiers, `clientInfo`, Vercel protection artifacts, raw upstream bodies, and complete sensitive URLs. The cache stores validated provider-neutral snapshots only. Cooldown and in-flight state are memory-only.

## Validation strategy

Unit tests cover cache identity/schema/freshness/retention/sanitization; coalescing; retry; cooldown; stale-if-error; fallback; offline behavior; proxy retry metadata; and recovery UI semantics. Browser QA uses sanitized fixtures and request interception at 390, 768, and 1440 px for live, fresh-cache, stale, fallback, fatal contract, offline, rate-limit, retry, provider/locale transitions, Home honesty, and feature-disabled behavior.

The known `vercel dev` rewrite issue for `/@vite/client` and `/src/main.ts` remains `LOCAL_FULL_STACK_DEV_ROUTING_LIMITATION`. Local fixture QA does not claim to prove live Xiaomi behavior.

Protected Preview deployment `dpl_4bJdX16eZtX79iR7vLshB2yAmQUa` (`life-board-91oduso5u-jingrenhuang4gmailcoms-projects.vercel.app`) remained a Preview deployment, enabled Xiaomi only through the non-secret Preview build flag, and passed secure browser validation. Access used an ephemeral Deployment Protection cookie supplied only to the browser process; it was not printed, persisted, traced, or captured. Real same-origin Xiaomi search and all-weather requests returned HTTP 200. Navigation reused fresh cache without another all-weather request. Sanitized interception verified network/unavailable stale handling, 429 cooldown, timeout fallback, and fatal-contract no-fallback behavior. Console errors and overflow were zero, and the marker scan found no credential or upstream-host exposure.

The first W5 Preview audit detected that a real successful envelope still retained `sourceMaps.clientInfo`. Validation stopped, the W1 sanitizer was tightened to remove the entire internal object, W1 contract tests were updated, and a replacement Preview was deployed and revalidated. No raw Preview response was committed.

## Production-readiness checklist

Production stays disabled in W5. A later explicit release task must verify every item:

- configure all required server-only Xiaomi variables in Production without `VITE_` exposure;
- explicitly set the non-secret client feature flag only after approval;
- retain the verified `zh-CN` and `days=15` limits;
- confirm 8-second proxy and 13-second shared client timeout behavior;
- confirm one-retry, stale cache, fallback, and cooldown notices;
- provide quota and error monitoring without logging sensitive URLs or bodies;
- verify the disable switch (`VITE_XIAOMI_WEATHER_ENABLED` absent/false);
- confirm Deployment Protection differences and authorized smoke-test procedure;
- run source/build/browser Secret scans;
- smoke-test search, weather, navigation cache reuse, provider switching, and locale prevention;
- document rollback by disabling the feature flag, leaving Open-Meteo as default;
- accept that durable global rate limiting is not present, or provision separately approved infrastructure.

Until that separate action is approved and completed, status is `WEATHER_PRODUCTION_BLOCKED`.

## Rollback

Disable or remove the non-secret Xiaomi feature flag. Open-Meteo remains the default; no storage migration is required. If the W5 runtime itself must be rolled back, restore the frozen W4 commit/tag. The versioned runtime cache fails closed and can be cleared without affecting portable user data.

## Deferred evidence and known limitations

- `ACTIVE_ALERT_ITEM_UI_DEFERRED_EVIDENCE_MISSING`
- `AQI_SCALE_PRESENTATION_DEFERRED`
- `LIFE_INDICES_SEMANTICS_DEFERRED`
- `TYPHOON_SEMANTICS_DEFERRED`
- `YESTERDAY_COMPARISON_DEFERRED`
- `MINUTELY_NUMERIC_UNIT_DEFERRED`
- Xiaomi is verified only for `zh-CN`; `days` remains fixed at 15.
- Portable restore can require Xiaomi city reselection because provider location identity is not in the portable contract.
- Durable global rate limiting is not implemented.
- Production Xiaomi remains disabled.
- The local full-stack Vercel/Vite SPA limitation remains.

## Persistence, Calendar, and final freeze

No key was added; the registry remains 11 entries. PortableBackup version/schema, factory-reset count, imports, Calendar, Home architecture, provider preference storage, and W4 presentation persistence were not expanded. The cache remains non-portable.

After this local W5 commit is reviewed, the final Weather freeze requires a separate closeout task to:

1. push the exact W5 commit to `main` without force;
2. wait for the exact GitHub Actions QA run to complete successfully;
3. verify W1–W5 tests, build, route accessibility, screenshots, and security steps in that run;
4. create and push annotated tag `weather-w5-resilience-final-freeze` at the exact pushed commit;
5. verify the remote peeled tag target.

Only then is Weather W1–W5 frozen and Calendar Stage 48 eligible to resume. Production Xiaomi enablement remains a different, explicitly approved release task.
