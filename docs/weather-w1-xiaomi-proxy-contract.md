# Weather W1: Xiaomi Weather Vercel Proxy and Contract Validation

## Scope and stage boundary

W1 adds a server-only Xiaomi Weather boundary using the repository's existing Vercel
Functions model. It does not connect Xiaomi data to Vue, add a selectable provider,
change Open-Meteo, change persistence, or modify Weather, Calendar, or Home UI.
Calendar Stage 48 remains deferred.

W2 may later consume only the stable proxy endpoints, envelopes, sanitized fixtures,
raw provider structures, capability inventory, and deterministic errors documented here.
W1 does not implement a Xiaomi provider client, normalizer, or `WeatherSnapshot` mapping.

## Existing deployment evidence

LifeBoard already serves ESM Functions from `api/`. `vercel.json` resolves `/api/*`
before its catch-all rewrite to `index.html`, so the new nested routes follow the same
deployment model without adding Express, Nitro, or another backend repository. Shared
server helpers live under `server/` and cannot enter the Vite client bundle unless a
future `src/` import explicitly introduces them.

An explicit Xiaomi namespace rewrite sends unknown paths to the JSON 404 Function at
`api/xiaomi-weather-not-found.js`. This prevents the SPA fallback from turning an API
typo into a successful HTML response while leaving existing Caiyun and AMap Functions
unchanged.

## Public endpoints

### `GET /api/weather/xiaomi/search?q=...`

- GET only; other methods return 405 with `Allow: GET`.
- `q` is trimmed, must be unique, well-formed Unicode, contain no control characters,
  and be 1 through 120 UTF-16 code units.
- The upstream host and path are server-controlled.
- The HAR-verified search request contains two identical `appKey` fields. W1 preserves
  them with `URLSearchParams.append()`.
- Upstream `null`, array, and single-object roots normalize to `data.results: []`, the
  original array, and a one-item array respectively.
- Every returned result must expose a non-empty provider `locationKey`.

### `GET /api/weather/xiaomi/all`

Required public parameters are `locationKey`, `latitude`, `longitude`, and `locale`.
`days` may be omitted.

- `locationKey` is a trimmed opaque string with a maximum length of 256.
- Latitude and longitude must be finite decimal strings in `[-90, 90]` and
  `[-180, 180]` respectively.
- The bounded W1 locale contract is only `zh-CN`, mapped to the captured `zh_cn`.
- `en-US` returns `unsupportedLocale`; its upstream spelling requires later live proof.
- Omitted `days` defaults to 15. Explicit 15 is accepted. Other values return
  `unsupportedDays`. W1 does not claim that 15 is Xiaomi's actual maximum.
- The upstream all-weather request contains one `appKey`.

## Server-only environment variables

The Function reads these names only from `process.env`:

- `XIAOMI_WEATHER_BASE_URL`
- `XIAOMI_WEATHER_APP_KEY`
- `XIAOMI_WEATHER_SIGN`
- `XIAOMI_WEATHER_APP_VERSION`
- `XIAOMI_WEATHER_ROM_VERSION`
- `XIAOMI_WEATHER_DEVICE`
- `XIAOMI_WEATHER_OAID`

The base URL, app key, static sign, app version, ROM version, and device must be
non-empty. The base URL must be HTTPS, parseable, and contain no username or password.
The authorized HAR proves successful requests with empty `oaid` and `modDevice`, so W1
permits an empty OAID and sends `modDevice` as an explicit empty string. It does not add
a separate mod-device variable.

No Xiaomi variable uses a `VITE_` prefix or enters `src/`, query input, request bodies,
browser storage, logs, fixtures, documentation values, or `vercel.json`.

## HAR-verified upstream request contract

Both approved operations are HTTPS GET requests to the captured host
`weatherapi.market.xiaomi.com`, with fixed paths `/wtr-v3/location/city/search` and
`/wtr-v3/weather/all`. Authorization
and device fields are explicit query parameters; captured request headers contained no
authorization or Cookie. Their names were `Accept-Encoding`, `Connection`, `Host`, and
`User-Agent`; no values are retained in W1 evidence. W1 sends only
`Accept: application/json` and never forwards incoming browser headers. Successful
responses were JSON (`application/json;charset=UTF-8`) with HTTP gzip encoding; the HAR
stored their decoded JSON text.

The 21 captured search requests and two captured all-weather requests used one static
`sign`, even as ordinary search and location parameters changed. The sign is therefore
treated as a static server credential; W1 does not invent a signing algorithm.

All 21 captured search bodies had an array root at `$`: 12 were empty, one contained a
single object, and eight contained multiple objects. Search records live at `$[]` and
their location keys at `$[].locationKey`. The public contract additionally handles
defensive `null` and single-object roots as specified above.

## Stable envelopes

Search success:

```json
{
  "ok": true,
  "provider": "xiaomi",
  "operation": "search",
  "data": { "results": [] },
  "meta": {
    "receivedAt": "2026-01-01T00:00:00.000Z",
    "upstreamStatus": 200
  }
}
```

All-weather success preserves the sanitized provider-specific object under `data` and
adds a capability-state inventory under `meta.capabilities`.

Errors use `{ "ok": false, "error": { "code": "..." } }`. Upstream rejection may
include only its numeric status. Raw error bodies, URLs, request headers, and credentials
are never returned.

## Error and timeout policy

The explicit upstream timeout is 8 seconds and its timer is always cleared. Deterministic
codes include `methodNotAllowed`, `invalidQuery`, `invalidLocationKey`,
`invalidCoordinates`, `invalidLocale`, `unsupportedLocale`, `unsupportedDays`,
`xiaomiProxyMisconfigured`, `xiaomiTimeout`, `xiaomiUnavailable`, `xiaomiRejected`,
`xiaomiUnreadable`, `xiaomiContractInvalid`, and `xiaomiResponseSecretLeak`.

Responses use `Content-Type: application/json; charset=utf-8` and
`Cache-Control: no-store`. W1 adds no caching and no wildcard CORS policy.

## Response sanitization and capability states

The authorized HAR response echoes the app key at `sourceMaps.clientInfo.appKey`.
Local live verification also proved an app-version echo at
`sourceMaps.clientInfo.appVersion`. The proxy deep-clones JSON, deletes both observed
credential echoes, then recursively checks all remaining primitive values for every
non-empty server credential, including credentials embedded inside longer strings. Any
match aborts the response with
`xiaomiResponseSecretLeak`.

The proxy preserves the remaining `sourceMaps` structure. Capability states are derived
from the verified root paths and distinguish `missing`, `null`, `empty-object`,
`empty-array`, and `available` for current, hourly, daily, AQI, minutely, alerts, indices,
typhoon, yesterday, previous hour, source maps, brand information, and update time.
Captured alerts were empty arrays, so W1 asserts no alert-item schema.

The exact all-weather roots are `$.current`, `$.forecastHourly`, `$.forecastDaily`,
`$.aqi`, `$.minutely`, `$.alerts`, `$.indices`, `$.typhoon`, `$.yesterday`,
`$.preHour`, `$.sourceMaps`, `$.brandInfo`, and `$.updateTime`.

## Fixture policy

Fixtures under `tests/weather-xiaomi/fixtures/` are deliberately sanitized structural
derivatives, not the raw HAR. They contain no request URLs, headers, cookies, app key,
sign, OAID, device identifier, session identifier, live response dump, or precise
location. The fixture README records replacements and preserved structure.

## Local and Preview verification

Plain Vite development does not validate Functions. Run `vercel dev`, then:

```powershell
npm run verify:weather-xiaomi -- http://localhost:3000
```

The verifier searches for 尉氏县, matches the intended city using both its name and
Henan/Kaifeng affiliation, confirms a location key without printing it, then calls the
all-weather proxy and prints only structural metadata.

Real Xiaomi variables belong only to Vercel Development and Preview during W1. Preview
deployment is optional when authentication, project linking, and scoped variables are
available. Production variables remain disabled; do not run `vercel --prod` or promote
a Preview.

## Remaining risk and W2 handoff

The proxy path is publicly reachable and W1 deliberately has no quota protection or
caching; those controls belong to later Weather stages. Production remains disabled.
The `en-US` mapping and any days range beyond the single verified value 15 remain
unverified extensions.

W2 receives only the public paths, bounded request contract, envelopes, sanitized
fixtures, raw provider field structure, capability-state model, and deterministic error
codes. Weather UI, Open-Meteo, provider selection, local storage, registry, backup,
import/reset, Calendar, and Home remain unchanged.
