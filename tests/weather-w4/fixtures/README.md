# Weather W4 sanitized extension fixture

`extended.success.json` is a deliberately sanitized structural derivative of the two
authorized local Xiaomi `weather/all` responses used in W1 and the W4 read-only evidence
audit. It is not a raw HAR response.

The fixture preserves only the extension roots, nested property names, value types,
explicit unit strings, timestamp shapes, empty alert state, and representative optional
sections needed by W4 tests. Text, identifiers, measurements, coordinates, timestamps,
brand values, URLs, and storm values are synthetic sanitization replacements.

It contains no request URL, request header, cookie, app key, sign, OAID, device value,
session identifier, authorization value, or live response dump. The `clientInfo` object
is retained solely to prove that the W4 adapter ignores internal source metadata; no
field from that object may appear in a view model or component.
