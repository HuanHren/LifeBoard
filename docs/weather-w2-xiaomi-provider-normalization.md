# Weather W2: Xiaomi Provider and Normalization Contract

## Scope and W1 dependency

Weather W2 adds an independently testable browser-side client and pure normalization boundary for the W1 same-origin proxy. It does not activate Xiaomi in the Weather Store, Settings, Home, persistence, or any Vue component. W1 remains responsible for authorization, upstream request construction, response sanitization, and the public `/api/weather/xiaomi/*` envelope.

W2 uses the committed W1 fixtures and contract tests as its primary data evidence. A read-only comparison of the two successful authorized HAR weather responses and decompiled Xiaomi model parsers was required only to resolve three ambiguities that a deliberately sanitized fixture could not safely preserve: daily `from`/`to` meaning, Unix timestamp units, and V7 weather-code interpretation. No request URL, request header, cookie, device identifier, or credential value was copied into this repository.

## Provider client boundary

`xiaomiProvider.ts` exposes:

- `searchXiaomiLocations(query, options)`
- `fetchXiaomiWeatherRaw(input, options)`
- `getXiaomiWeatherSnapshot(input, options)`

The client uses only relative same-origin paths:

- `GET /api/weather/xiaomi/search?q=...`
- `GET /api/weather/xiaomi/all?locationKey=...&latitude=...&longitude=...&locale=zh-CN&days=15`

The client accepts an injected `fetch` implementation and an optional `AbortSignal`. It adds no timeout, retry, fallback, or cache policy. It cannot accept an upstream URL or credential. `zh-CN` and `days=15` are the only accepted bounded contract; `en-US` and other day counts are rejected before the request.

## Proxy envelope contract

Success envelopes must have:

- `ok: true`
- `provider: "xiaomi"`
- the expected `operation`
- an object `data`
- `meta.receivedAt` as a string
- `meta.upstreamStatus` as an integer
- when present, a complete five-state capability map

Error envelopes must have `ok: false` and `error.code`. Known W1 codes such as `unsupportedLocale`, `unsupportedDays`, `xiaomiTimeout`, `xiaomiUnavailable`, `xiaomiRejected`, `xiaomiUnreadable`, `xiaomiContractInvalid`, and `xiaomiResponseSecretLeak` are preserved. Network, HTTP, unreadable JSON, abort, proxy, input, and malformed-contract failures remain distinguishable through `XiaomiProviderError.kind`.

## Raw Xiaomi contract

The evidence-backed root fields are:

`current`, `forecastHourly`, `forecastDaily`, `aqi`, `minutely`, `alerts`, `indices`, `typhoon`, `yesterday`, `preHour`, `sourceMaps`, `brandInfo`, and `updateTime`.

Fields needed for common normalization are typed to their verified nesting. Unverified extension content remains `unknown`; it is not represented as `any`. In particular, W1 proved only the root array contract for alerts, so W2 does not invent an alert-item schema.

## Provider-neutral contracts

The existing `types/weather.ts` `WeatherSnapshot` remains the active Open-Meteo/Caiyun UI contract. It makes many Open-Meteo-shaped values mandatory. Reusing it for Xiaomi in W2 would require fake precipitation, cloud, gust, apparent-daily, and UV values, so W2 introduces the additive `ProviderWeatherSnapshot` contract for W3 instead of changing the active Store.

The new contract separates:

- provider and opaque provider location identity;
- source update and observation times;
- common current, hourly, daily, and AQI values;
- explicit normalized units;
- five-state capability information;
- Xiaomi-only extensions;
- structured normalization diagnostics.

The location candidate keeps `locationKey` unchanged as `providerLocationId`. It validates finite coordinate ranges, preserves provider result order, and omits country/timezone fields that the fixture does not prove.

## Field mapping

| Common target | Xiaomi source path | Source type/unit | Conversion | Invalid or absent policy |
| --- | --- | --- | --- | --- |
| location id | search `$.locationKey` | opaque string | trim only | drop candidate |
| name | search `$.name` | string | trim only | drop candidate |
| administrative area | search `$.affiliation` | string | preserve as one label | omit |
| latitude | search `$.latitude` | numeric string | finite number, -90..90 | drop candidate |
| longitude | search `$.longitude` | numeric string | finite number, -180..180 | drop candidate |
| snapshot update | all `$.updateTime` | Unix milliseconds | ISO UTC string | fatal snapshot error |
| observation time | `$.current.pubTime` | offset-bearing ISO | ISO UTC string | fatal current error |
| current temperature | `$.current.temperature.value` | C/℃ | finite number, Celsius | fatal current error |
| apparent temperature | `$.current.feelsLike.value` | C/℃ | finite number, Celsius | omit + diagnostic |
| condition | `$.current.weather` | Xiaomi V7 code | canonical condition + raw code | unknown fallback |
| humidity | `$.current.humidity.value` | % | finite number | omit + diagnostic |
| wind speed | `$.current.wind.speed.value` | km/h | finite number | omit + diagnostic |
| wind direction | `$.current.wind.direction.value` | degree/° | finite number | omit + diagnostic |
| pressure | `$.current.pressure.value` | hPa | finite number | omit + diagnostic |
| visibility | `$.current.visibility.value` | km | finite number | omit + diagnostic |
| UV index | `$.current.uvIndex` | index | finite number | omit + diagnostic |
| hourly time | `$.forecastHourly.wind.value[i].datetime` | offset-bearing ISO | ISO UTC string | skip malformed entry |
| hourly temperature | `$.forecastHourly.temperature.value[i]` | C/℃ from sibling unit | finite number | skip malformed entry |
| hourly condition | `$.forecastHourly.weather.value[i]` | Xiaomi V7 code | canonical condition + raw code | unknown fallback |
| daily date | `$.forecastDaily.pubTime` + index | local forecast date in ISO timestamp | preserve date part and add calendar days in UTC arithmetic | skip malformed entry |
| daily maximum | `$.forecastDaily.temperature.value[i].from` | C/℃ | finite number | skip malformed entry |
| daily minimum | `$.forecastDaily.temperature.value[i].to` | C/℃ | finite number | skip malformed entry |
| day condition | `$.forecastDaily.weather.value[i].from` | Xiaomi V7 code | canonical condition + raw code | unknown fallback |
| night condition | `$.forecastDaily.weather.value[i].to` | Xiaomi V7 code | canonical condition + raw code | unknown fallback |
| sunrise/sunset | `$.forecastDaily.sunRiseSet.value[i].from/to` | offset-bearing ISO | ISO UTC string | omit astronomy, keep daily item |
| AQI | `$.aqi.aqi` | numeric string, scale unverified | finite non-negative number with `scale: "unknown"` | omit + diagnostic |

Xiaomi currently provides no evidence-backed common values for current precipitation, cloud cover, gusts, hourly apparent temperature, or daily apparent temperature. W2 does not manufacture zeroes. Hourly wind and hourly/daily precipitation probability are deliberately not normalized because the relevant nested HAR fields do not carry a verified unit.

## Units

The two successful HAR responses and fixture metadata agree on Celsius (`℃`; sanitized fixture `C`), current wind `km/h`, visibility `km`, pressure `hPa`, humidity `%`, and wind direction `°`/`degree`. The normalized contract spells these as `celsius`, `kilometres-per-hour`, `kilometres`, `hectopascals`, `percent`, and `degrees`. No presentation rounding occurs.

AQI retains `scale: "unknown"`; W2 does not treat national AQI standards as interchangeable, derive categories, or calculate AQI from pollutants.

## Time semantics

Both successful HAR responses identify `updateTime` as Unix milliseconds: interpreting it as milliseconds yields a plausible capture-era date; interpreting it as seconds does not. Current, hourly wind, daily publication, sunrise, and sunset times are offset-bearing ISO strings.

Daily date-only values are kept as `YYYY-MM-DD`. The normalizer never calls `new Date('YYYY-MM-DD')`; it validates the lexical provider date and uses explicit UTC calendar arithmetic for subsequent forecast days. Tests therefore do not depend on the machine timezone.

## Weather-code mapping

The Xiaomi model parser stores response weather values as V7 codes and calls `convertV7WeatherTypeToV6WetherType` for current, hourly, and daily accessors. W2 maps those verified V7 semantics into LifeBoard's existing condition categories. This is intentionally lossy: multiple fog, haze, rain, snow, storm, and dust severities collapse into the smaller canonical set. The original provider code remains in `ProviderWeatherCondition.providerCode`. Unknown and malformed codes map to `unknown`, never `clear`.

## Capability-state model

Each root capability is classified without truthiness:

- property absent: `missing`
- `null`: `null`
- `[]`: `empty-array`
- `{}`: `empty-object`
- any non-empty supported value, including numeric zero: `available`

The map covers current, hourly, daily, AQI, minutely, alerts, indices, typhoon, yesterday, preHour, sourceMaps, brandInfo, and updateTime. A later UI may derive booleans, but W2 retains the original state.

## Xiaomi extensions

The snapshot extension contains only purpose-specific Xiaomi roots: minutely, alerts, indices, typhoon, yesterday, preHour, sourceMaps, and brandInfo. They are copied non-mutatively and remain outside common current/hourly/daily objects. Empty versus absent semantics live in the capability map.

The normalizer recursively rejects credential-shaped keys (`appKey`, `sign`, `oaid`, device/app/ROM version keys) before constructing output. Source and bundle scans separately enforce that server environment names and the upstream hostname do not enter client artifacts. The normalizer cannot reintroduce the W1-removed `sourceMaps.clientInfo.appKey` field.

## Failure policy

Fatal snapshot failures include invalid provider location identity/coordinates, invalid required current temperature/time/condition, invalid `updateTime`, unequal required hourly parallel arrays, and any secret-boundary violation.

Capability-level failures include missing/null/empty optional roots, malformed daily collection shape, and unverified units. They produce empty common capability data or omit optional common fields while preserving capability state and diagnostics.

Entry-level failures skip a malformed hourly/daily entry and add a path-only diagnostic. Unknown weather codes are retained with canonical `unknown`. Error messages never include raw response bodies.

## Purity and tests

Normalizers do not access Vue, Pinia, Router, localStorage, browser locale, Store state, or the network. They do not use `Date.now()` and do not mutate response fixtures or locations. W2 tests use only the committed sanitized W1 fixtures and injected `fetch` functions; unhandled network access is impossible.

The dedicated command is `npm run test:weather-xiaomi-provider:ci`. GitHub Actions runs it separately from the existing main and W1 test suites.

## Known limitations

- Only `zh-CN` → upstream `zh_cn` is verified by W1.
- Only `days=15` is verified.
- No active alert-item schema is verified.
- Minutely and typhoon data may be missing, null, or empty by location.
- Hourly wind and precipitation-probability units are unresolved and excluded from common normalization.
- AQI scale metadata is unresolved.
- Production Xiaomi proxy configuration remains disabled.
- No dual-source runtime integration exists yet.

## W3 handoff

W3 receives the relative proxy client, runtime envelope parser, provider-neutral location candidates, evidence-based raw types, `ProviderWeatherSnapshot`, five-state capabilities, Xiaomi extensions, condition mapping, structured diagnostics, and deterministic fixture tests. W3 may decide provider selection and Store orchestration. W2 makes no such runtime decision.

## Explicit non-changes

W2 does not change Weather Store behavior, Open-Meteo or Caiyun requests/normalization, Vue pages/components, Settings, Home, Calendar, PixiJS, weather animations, persistence, registry, backup/import/reset, Vercel Functions, server helpers, environment variables, localStorage keys, or Production deployment.
