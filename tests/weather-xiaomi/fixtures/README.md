# Xiaomi Weather contract fixtures

These fixtures are sanitized structural derivatives of the authorized local HAR at
`D:\XiaomiWeather-Reversing\evidence\类原生tracking.miui.com_2026_07_08_03_48_55.har`.
The raw HAR is not copied into LifeBoard and must never be committed.

Sanitization removed all request material, credentials, device identifiers, precise
locations, tracing identifiers, and the upstream `sourceMaps.clientInfo.appKey` and
`sourceMaps.clientInfo.appVersion` credential echoes.
Names, coordinates, identifiers, timestamps, measurements, descriptions, URLs, and
branding values were replaced with clearly sanitized placeholders. The observed JSON
property names, nesting, root types, optional empty arrays, and representative value
types required by W1 contract tests were preserved.

`search.empty.json` preserves the observed empty JSON array. The public proxy also
defensively converts a `null` root to `data.results: []` if Xiaomi returns that form.
