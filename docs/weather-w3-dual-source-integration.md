# Weather W3: Dual-source Weather Integration

## Scope and W2 dependency

Weather W3 activates the W2 Xiaomi provider in the existing Weather runtime without creating a second Store, page, or component tree. It depends on the frozen W2 proxy client, runtime envelope validation, raw contract, normalizer, `ProviderWeatherSnapshot`, condition mapping, capability states, and sanitized fixtures.

The existing product also supports Caiyun. W3 preserves that proven integration instead of narrowing the runtime type and accidentally removing a user-visible provider. The active provider IDs are therefore `openMeteo`, `caiyun`, and `xiaomi`; Open-Meteo and Xiaomi are the two provider-neutral runtime paths introduced or completed by this stage, while Caiyun continues through the same legacy adapter as before.

## Runtime architecture

```text
preferred provider + locale + location + feature flag
                    |
                    v
             eligibility decision
                    |
                    v
         weatherProviderRuntime dispatcher
          /             |              \
 Open-Meteo         Caiyun            Xiaomi
 legacy normalizer  legacy normalizer W2 normalizer
          \             |              /
             ProviderWeatherSnapshot
                    |
                    v
       one provider-neutral display adapter
                    |
                    v
        existing Weather Store/UI contract
```

Network dispatch and provider-specific inputs live in `weatherProviderRuntime.ts`. The Store owns one shared loading, error, refresh, cancellation, location, and commit lifecycle. Components receive only the existing display snapshot; no component receives Xiaomi raw JSON or Xiaomi extension roots.

## Preferred and effective provider

`preferredProvider` is the stored user selection. `effectiveProvider` is derived from eligibility for the current locale, feature flag, credentials, and location identity.

- Open-Meteo is the default and is always eligible.
- Caiyun keeps its existing missing-token behavior.
- Xiaomi preference is retained when it is ineligible.
- Ineligible Xiaomi derives Open-Meteo as the effective provider and shows the reason.
- A Xiaomi network, proxy, or normalization failure does not change the effective provider and does not trigger a fallback request.

The separation makes an environment or locale restriction visible without pretending that a failed Xiaomi request succeeded through Open-Meteo.

## Eligibility and feature flag

Xiaomi eligibility is represented as either `{ available: true }` or an unavailable result with a reason. The implemented reasons are `feature-disabled`, `unsupported-locale`, `missing-provider-location`, `environment-disabled`, `missing-credential`, and `unknown-provider`.

`VITE_XIAOMI_WEATHER_ENABLED` is a non-secret client feature flag. A centralized parser enables Xiaomi only for the exact string `true`; missing or any other value means disabled. Production remains disabled in W3. Development and protected Preview builds may opt in without exposing the server credentials.

## Open-Meteo and Caiyun adaptation

The proven Open-Meteo and Caiyun transports and normalizers remain unchanged. Their existing normalized `WeatherSnapshot` enters `adaptLegacyWeatherSnapshot`, which creates a `ProviderWeatherSnapshot` non-mutatively. A small compatibility extension retains already-normalized alert, advice, short-term precipitation, and capability values so the round trip to the existing display contract is exact.

This compatibility extension is not raw provider JSON. It is a temporary consolidation seam; a later stage may move all remaining common UI fields directly into the provider-neutral contract.

Capability states are derived with the W2 five-state vocabulary. Unsupported provider-neutral capability roots remain `missing`; existing non-empty normalized data becomes `available`.

## Xiaomi runtime integration

The dispatcher calls the W2 `getXiaomiWeatherSnapshot` function with the selected location's opaque Xiaomi ID, coordinates, `zh-CN`, `days=15`, and the shared `AbortSignal`. The W2 client calls only the same-origin `/api/weather/xiaomi/search` and `/api/weather/xiaomi/all` paths.

The returned `ProviderWeatherSnapshot` is stored separately from the display snapshot so W4 can later consume verified Xiaomi extensions. The display adapter maps only common normalized weather. Xiaomi minutely, alerts, indices, typhoon, yesterday, previous-hour, source-map, and brand roots are not rendered in W3.

The normalized Xiaomi AQI value remains in `providerSnapshot`. Its scale is still unverified, so W3 does not present it as either US AQI or European AQI. The existing common AQI panel continues to use its separate Open-Meteo/CAMS contract for the selected coordinates; this avoids a scientifically unsafe scale conversion while keeping the component provider-neutral.

## Compatibility adapter

`adaptProviderSnapshotForDisplay` maps one provider-neutral snapshot to the existing UI-facing `WeatherSnapshot`:

| Provider-neutral field | Existing display field | Policy |
| --- | --- | --- |
| current temperature and condition | `current.temperature`, `current.condition` | direct normalized mapping |
| optional current measurements | nullable display measurements | missing becomes `null`, never fabricated zero |
| hourly common fields | `hourly[]` | optional values remain `null` |
| daily high/low and condition | `daily[]` | day condition is the existing single display condition |
| observation time | `current.time` | provider observation time is retained |
| provider update time | `fetchedAt` | provider update time is retained |
| unknown condition | unavailable legacy condition | never mapped to clear |
| Xiaomi extension roots | no display field | intentionally not rendered |

For Xiaomi, day/night is derived only when verified observation, sunrise, and sunset timestamps are valid. Unknown values remain `null`. Formatting and precipitation helpers were made null-safe so missing meteorological values display an em dash or are omitted rather than appearing as zero.

## Store lifecycle and cancellation

The Store keeps one selected location, one current display snapshot, one provider snapshot, one forecast status, one error lifecycle, and one refresh action. A monotonically increasing request ID plus `AbortController` protects forecast and search commits.

Changing provider, location, or locale aborts the old request and increments its token. A late response is ignored unless its token is still current. Rapid refreshes share the active lifecycle. Aborted requests do not produce a user-facing failure.

Existing Open-Meteo and Caiyun cache behavior remains unchanged. Xiaomi is not written to the persistent forecast cache or the long-range session cache. W3 adds no new caching or stale-while-revalidate policy.

## Location identity and search

Coordinates remain provider-neutral. `WeatherLocation.providerLocationIds.xiaomi` stores the opaque Xiaomi `locationKey`; it is never derived from coordinates, parsed, or fabricated. Existing locations without that ID remain readable and continue to work with Open-Meteo.

When Xiaomi is preferred and eligible for search, the existing city-search experience dispatches to `searchXiaomiLocations` and converts its normalized candidates to the common `WeatherLocation` shape. Result order is preserved. The user explicitly chooses a result; no code selects the first result or guesses among ambiguous candidates.

If the current location lacks a Xiaomi ID, Xiaomi is ineligible for forecast loading and the Store exposes `locationResolutionRequired`. The UI asks the user to search and select a Xiaomi-backed location. W3 does not implement an unproven coordinate-distance matching threshold.

When Xiaomi search is unavailable because of the flag or locale, no Xiaomi request is made. The existing Open-Meteo search remains available with an explicit notice.

## Locale behavior

Only `zh-CN` is verified for Xiaomi. `en-US` makes Xiaomi ineligible before transport dispatch, derives Open-Meteo as effective, and presents a localized explanation. No `en_us` mapping is guessed.

Locale synchronization is performed by the existing Weather, city-management, Settings, and Home entry points. Changing locale aborts stale search and forecast work. Returning to `zh-CN` makes Xiaomi eligible again when the feature flag is enabled and the location contains its Xiaomi ID.

## Selection UI and accessibility

The single selector remains the existing Settings weather-provider fieldset. Xiaomi is appended only when the feature flag is enabled; with the flag disabled, the Production control is visually unchanged.

The selector uses a native `fieldset`, `legend`, labelled radio inputs, disabled semantics, visible focus styling, and localized descriptions. It shows a live informational notice when Xiaomi is preferred but Open-Meteo is effective because the locale or location identity is unsupported. No duplicate selector was added to the Weather page.

## Error and fallback policy

Runtime errors retain provider, operation, category, and stable code. Categories distinguish input, eligibility, location resolution, network, HTTP, proxy, contract, abort, normalization, and configuration problems. W1 proxy codes remain available through the Xiaomi provider error chain. Raw provider bodies and credentials are never included.

W3 implements no automatic network fallback, retry-policy change, quota behavior, or new cache strategy. A selected and eligible Xiaomi failure remains a Xiaomi failure; the user can retry or manually select another provider.

## Persistence decision

W3 safely extends the existing registered `lifeboard.weather.provider` value to accept `xiaomi`. Missing or invalid stored values continue to normalize to Open-Meteo. No new localStorage key, registry entry, backup version, import schema, or factory-reset count is introduced.

The optional `providerLocationIds` field lives inside the existing stored location object. Old stored locations remain valid. Portable export version 1 deliberately strips this optional runtime field through its existing mapper, so old exports and imports remain valid; importing such a location simply requires explicit Xiaomi location resolution again.

## Home behavior

Home continues reading the same display snapshot from the single Weather Store. It has no Xiaomi-specific component, raw type, or provider branch. It synchronizes locale so eligibility and request cancellation match the current application language. With Xiaomi disabled, Home request and rendering behavior remains the W2 baseline.

## Secret and production boundary

Client modules accept no credential arguments and reference no Xiaomi upstream hostname or `XIAOMI_WEATHER_*` server variables. Only the public same-origin proxy paths and non-secret feature flag may appear in the client bundle.

Production Xiaomi secrets and the Production feature flag remain disabled. W3 permits only local Development and protected Preview verification. It does not deploy or promote Production.

`vercel dev` 56.1.0 successfully served and live-validated both Xiaomi Functions, but its Vite SPA catch-all rewrote `/@vite/client` and `/src/main.ts` to HTML, preventing the Vue app from mounting in that same local process. The tracked Production rewrite was not changed. Browser integration was therefore validated against the feature-enabled built Vite app with deterministic same-origin proxy mocks, while the protected Preview independently proved deployed SPA routes and live Xiaomi Function responses. This local CLI limitation remains an explicit validation risk rather than a claimed pass.

## Test coverage

The dedicated `npm run test:weather-w3:ci` suite covers:

- provider eligibility and Production-safe defaults;
- Open-Meteo/Caiyun legacy round-trip compatibility;
- Xiaomi display compatibility and no-fake-zero behavior;
- provider dispatch, structured errors, cancellation, and same-origin Xiaomi requests;
- Store selection, effective-provider differences, locale changes, retry, refresh, forecast/search races, and no automatic fallback;
- provider-aware search and no blind result selection;
- persistence backward compatibility and portable-export behavior;
- selector semantics, focus/disabled behavior, one-control placement, component raw-type isolation, and static credential/upstream-host safety.

All tests inject transports or use local fixtures. The W3 unit suite contacts no external service.

## Known limitations

- Xiaomi supports only the verified `zh-CN` locale.
- Xiaomi still uses only the verified `days=15` contract.
- Production Xiaomi remains disabled.
- Automatic network fallback is not implemented.
- Xiaomi extended data is retained but not rendered.
- No active alert-item schema is verified.
- The Xiaomi AQI scale remains unresolved.
- Xiaomi AQI is retained in the provider snapshot but is not mapped into the US/EU AQI presentation scale.
- Minutely and typhoon data may be missing, null, or empty by location.
- Imported or existing locations may require explicit Xiaomi location selection.
- Xiaomi has no W3 cache policy; quota, caching, retries, and final failure behavior are deferred to W5.
- Vercel CLI 56.1.0 cannot mount this Vite SPA locally with the tracked catch-all rewrite, although Functions and protected Preview routing were independently verified.

## W4 and W5 handoff

W4 receives the active provider snapshot, preferred/effective provider state, eligibility reasons, common display adapter, provider-aware search, structured errors, location-resolution state, and retained Xiaomi extensions. W4 may render verified extension contracts without changing the shared provider pipeline.

W5 owns caching, retry, quota, rate-limit, automatic-fallback, and final production failure strategy. W3 intentionally defines none of those policies.

## Explicit non-changes

W3 does not add a Weather page, Store, storage key, registry entry, PortableBackup version, Calendar work, Production secret, Production deployment, backend endpoint, Xiaomi extended UI, PixiJS or animation change, broad Home redesign, automatic fallback, retry policy, cache policy, or hypothetical provider framework.
