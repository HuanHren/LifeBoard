# Weather post-freeze Xiaomi display-contract hotfix

## Scope and frozen dependency

This hotfix is based on the frozen Weather W5 commit
`adc8e92a8c8a74c5ef23d381bab4ecb1ae55c9ab` and tag
`weather-w5-resilience-final-freeze`. It corrects Xiaomi-to-common-display
mapping and presentation only. It does not change provider selection, Store
request lifecycle, cache/fallback policy, persistence, Calendar, PixiJS, or
Production configuration.

## Read-only evidence

The authorized evidence was inspected read-only at
`D:\XiaomiWeather-Reversing\evidence\类原生英语➕中文meteo_mojicdn_com_2026_07_14_18_35_38_1.har`.
The HAR is not copied into LifeBoard, used as a fixture, or committed. URLs,
query values, authorization values, and complete response bodies were not
recorded.

Two successful `weather/all` responses were present. Both used `zh_cn`; this
does not verify an en-US Xiaomi provider contract. `updateTime` was a Unix
millisecond number. Observed weather codes were current `{1}`, hourly
`{1, 2, 7}`, and daily from/to `{0, 1, 2, 7, 8}`.

## Confirmed defects

The compatibility adapter used non-registry magic numbers for `cloudy`,
`haze`, and `sand-dust`. Xiaomi code `1` normalized correctly to canonical
`cloudy`, but the display code was not the shared cloudy code, so the existing
localized UI treated it as unavailable.

The full-time formatter sliced the hour from an ISO string. That preserves a
provider-local wall-clock forecast string but is incorrect for an absolute
timestamp: `2026-07-14T10:29:00Z` was displayed as 10 instead of 18:29 in
Asia/Shanghai.

## Condition mapping

The provider/display compatibility adapter now uses
`WEATHER_CONDITION_CODES.cloudy`, `WEATHER_CONDITION_CODES.haze`, and
`WEATHER_CONDITION_CODES.sandDust`. Unknown conditions continue to map to the
existing unavailable fallback. Weather scenes and PixiJS mappings are
unchanged.

## Absolute time and forecast wall-clock semantics

Absolute timestamps ending in `Z` or an explicit numeric offset are parsed as
instants and formatted with `Intl.DateTimeFormat`. A supplied provider/location
timezone is used when it is a concrete IANA zone. `auto`, a missing timezone,
or an absent provider timezone falls back to the browser timezone. No fixed
UTC+8 conversion is used, and date/time cross-day conversion is performed
together.

Offset-less provider forecast strings retain the existing wall-clock path.
Hourly forecast labels are therefore not shifted as if they were UTC instants.

## Hourly precipitation probability

The verified path is
`forecastHourly.precipitationProbability.value[index]`. Both evidence arrays
had 23 values, matched temperature/weather/wind length, contained finite
numbers, and ranged from 0–90 and 0–70. The normalizer accepts only finite
numeric values in 0–100 for this field, preserves zero, and emits
`precipitationProbabilityPercent`. A missing or malformed item affects only
that index; array-length mismatch does not invalidate the hourly forecast.
Probability is not treated as precipitation amount.

## Hourly wind decision

The verified item fields are `datetime`, `speed`, and `direction`. Evidence
speed ranges were 5.4–10.03 and 5.6–10.2; direction ranges were 89.67–196.43
and 39.15–194.09. The hourly container has no top-level unit, but the same
successful response contract labels current/daily wind speed as `km/h` and
direction as degrees. This same-contract cross-evidence is sufficient for the
strict common fields `windSpeedKmh` and `windDirectionDegrees`.

Speed must be finite and non-negative. Direction must be finite and is
normalized to 0–360. Invalid values are omitted per item. No gust value is
created.

## Daily contract decision

Temperature, weather, wind speed, wind direction, and sunrise/sunset arrays
had 15 entries. Daily wind units were `km/h` and degrees. Daily precipitation
probability had 15 entries in one response and only 5 in the other, so mapping
is strictly per existing index; later dates remain missing rather than being
filled or copied.

Daily wind from/to values are day/night values, not proven maxima or gusts.
They are therefore not written to `windGustMaxKmh`, and the Xiaomi display does
not show the peak-gust row without real gust evidence.

## Capability-aware presentation

Hourly cards show rain probability, precipitation amount, and wind only when
the corresponding value exists. A card with no extra metrics has no empty
definition list. Daily cards independently show probability and peak gust only
when those values exist. These decisions are data-driven, not provider-name
branches, so Open-Meteo retains its complete presentation.

## Deferred evidence

Minutely was available in one response and missing in one. Provider text was
present, but the numeric sequence still had no verified physical unit, so no
numeric minutely display is added. Active-alert items, AQI scale conversion,
life-index semantics, typhoon semantics, yesterday comparison, and en-US
Xiaomi provider behavior remain unverified and unchanged.

## Validation and security boundary

Dedicated hotfix tests cover condition mapping, absolute and wall-clock time,
hourly probability, hourly wind, partial daily probability, capability-driven
UI, Open-Meteo compatibility, and forbidden-data boundaries. Browser QA uses
only deterministic sanitized fixtures. Protected Preview validation, when
available, uses the existing Preview-only Xiaomi server boundary; no raw body
or credential is retained.

Production configuration and deployments remain unchanged. The Xiaomi
Production release state is outside this hotfix.

At the time of this local validation, Vercel's Preview environment-variable
scope contained no Xiaomi server variables. Development listed six encrypted
server variables, while the optional empty OAID variable was not listed.
Those Development values were not copied to Preview because that would be a
new cross-environment Secret decision rather than reuse of an existing Preview
configuration. Consequently, no non-functional Preview was created and the
real Preview `weather/all` validation remains blocked until the intended
Preview-scoped server variables are provisioned by an authorized release task.

## Rollback

Rollback is the single hotfix commit. Reverting it restores the W5-frozen
normalizer, adapter, formatter, and field rendering without changing storage,
provider selection, cache, or server contracts. The W5 freeze tag must not be
moved.
