# Stage 32A.1 Weather Code Matrix

## Matrix Summary

The local evidence file `weather-code-matrix.json` contains 28 target WMO rows. Each row records:

```text
WMO code -> LifeBoardCondition -> WeatherEffectGroup -> intensity -> Xiaomi local code -> Xiaomi V12 id -> scene family -> import recommendation
```

## Target WMO Coverage

| WMO | LifeBoard target | Xiaomi local reference | V12 reference | Audit result |
| --- | --- | --- | --- | --- |
| `0` | clear | `0` sunny | `0` | Covered |
| `1` | partly-cloudy | `1` cloudy | `1` | Covered by authorized vendor scene |
| `2` | partly-cloudy | `1` cloudy | `1` | Covered by authorized vendor scene |
| `3` | overcast | `2` overcast | `2` | Covered |
| `45` | fog | `3` fog | `3` | Covered |
| `48` | rime-fog | `3` fog | `3` | Covered by fog family |
| `51` | drizzle | `11` light rain | `5` | Covered by light rain family |
| `53` | drizzle | `11` light rain | `5` | Covered by light rain family |
| `55` | drizzle | `11` light rain | `5` | Covered by light rain family |
| `56` | freezing-drizzle | `25` freezing rain | `13` | Covered by freezing/sleet family |
| `57` | freezing-drizzle | `25` freezing rain | `13` | Covered by freezing/sleet family |
| `61` | light rain | `11` light rain | `5` | Covered |
| `63` | moderate rain | `10` moderate rain | `6` | Covered |
| `65` | heavy rain | `9` heavy rain | `7` | Covered |
| `66` | freezing rain | `25` freezing rain | `13` | Covered |
| `67` | freezing rain | `25` freezing rain | `13` | Covered |
| `71` | light snow | `17` light snow | `9` | Covered |
| `73` | moderate snow | `16` moderate snow | `10` | Covered |
| `75` | heavy snow | `15` heavy snow | `11` | Covered |
| `77` | snow grains | `17` light snow | `9` | Covered by light snow family |
| `80` | rain showers | `8` showers | `5` | Covered |
| `81` | rain showers | `10` moderate rain | `6` | Covered |
| `82` | rain showers | `9` heavy rain | `7` | Covered |
| `85` | snow showers | `14` snow showers | `9` | Covered |
| `86` | snow showers | `15` heavy snow | `11` | Covered |
| `95` | thunderstorm | `7` thunderstorm | `8` | Covered |
| `96` | thunderstorm with hail | `7` thunderstorm | `8` | Covered with hail caveat |
| `99` | thunderstorm with hail | `7` thunderstorm | `8` | Covered with hail caveat |

## Unknown

Unrecognized provider codes must continue to resolve to LifeBoard `unknown` and then to the neutral fallback. Xiaomi local `99` is a reference for null or unknown data, not a replacement for LifeBoard fallback behavior.

## Runtime Priority

Current runtime scene selection is:

```text
authorized-vendor
-> fallback
```

The existing LifeBoard original partly-cloudy files remain in the repository as archival and future replacement assets. They do not participate in Stage 32A.2 runtime scene selection. Future replacement should happen per scene key only after a LifeBoard original scene is completed and approved.

## Hail Caveat

Xiaomi has a distinct local ice/hail reference path (`22` -> V12 `13`), while LifeBoard currently normalizes WMO `96` and `99` into thunderstorm. Stage 32A.2 should explicitly decide whether to keep thunderstorm visuals with a hail overlay or route hail-bearing storms through the freezing/sleet visual family.
