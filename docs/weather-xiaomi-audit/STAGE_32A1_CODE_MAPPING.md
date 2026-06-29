# Stage 32A.1 Code Mapping Audit

## Scope

This audit traces the Xiaomi Weather visual condition chain from weather code classification to visual scene identity. Evidence comes from the current reverse-engineering run folders: JADX source, apktool resources, extracted assets, and the Stage 4 visual mapping package.

Public documentation intentionally avoids copying decompiled implementation bodies, native code, shader source, full asset hashes, or private absolute path lists.

## Primary Code Entry Points

| Area | Evidence | Finding |
| --- | --- | --- |
| Local weather condition constants | `WeatherType.java` | Xiaomi uses local V6-style condition ids `0-25` and `99` for null or unknown data. |
| New/server to local condition conversion | `WeatherType.V7V6_MAP` | Server/new weather ids are normalized into the local condition set before visual selection. |
| Visual background id selection | `WeatherType.BACKGROUND_V12_MAP` | Local condition ids collapse into V12 background/effect ids. |
| Icon selection | `WeatherData.WEATHER_ICON` and `WeatherData.WEATHER_ICON_NIGHT` | Day/night icon resources are selected separately, with night-specific variants confirmed for clear, cloudy, and fog. |
| Timeline selection | `WeatherType.TIME_LINE_TYPE` and day/night utility methods | Time-of-day buckets are selected from sunrise/sunset and fallback hour logic. |
| Scene config loading | Majestic weather config loader | `weather_android_data_OS2.json` provides sky, weather, cloud layout, atmosphere, and timeline data consumed by the native/MGL scene path. |

## Local Weather Condition Set

| Local id | Meaning | V12 background result |
| --- | --- | --- |
| `0` | Sunny / clear | `0` |
| `1` | Cloudy | `1` |
| `2` | Overcast | `2` |
| `3` | Fog / mist family | `3` |
| `4`, `5`, `6`, `9` | Heavy rainstorm, downpour, rainstorm, heavy rain | `7` |
| `7` | Thunderstorm | `8` |
| `8`, `11`, `12` | Showers, light rain, rain and snow | `5` |
| `10` | Moderate rain | `6` |
| `13`, `15` | Blizzard, heavy snow | `11` |
| `14`, `17` | Snow showers, light snow | `9` |
| `16` | Moderate snow | `10` |
| `18`, `19` | Strong sandstorm, sandstorm | `12` |
| `20`, `21`, `23` | Light sandstorm, dust storm, floating dust | `14` |
| `22`, `25` | Hail / ice rain, freezing rain | `13` |
| `24` | Haze / PM dirt | `4` |
| `99` | Null / unknown | `99` |

## LifeBoard Translation Point

LifeBoard should keep its current provider-neutral chain:

```text
weather provider code
-> LifeBoardCondition
-> WeatherEffectGroup
-> intensity
-> timeline
-> scene key
```

The Xiaomi mapping should be used as an implementation source for scene selection and parameterization, not as a public business API. Xiaomi ids must remain internal adapter data if used in Stage 32A.2.

## Runtime Priority

The current owner-approved runtime target is:

```text
authorized-vendor
-> fallback
```

This applies to clear, mostly-clear, partly-cloudy, cloudy, overcast, fog, haze, rain, snow, freezing, sleet, thunderstorm, and sand/dust. Existing LifeBoard original weather assets remain in the repository as archival and future replacement assets, but do not participate in Stage 32A.2 runtime scene selection.

## Key Caveats

- Xiaomi does not preserve one-to-one effects for drizzle, snow grains, rime fog, or hail-bearing WMO thunderstorms.
- Xiaomi collapses multiple rainstorm strengths into V12 large-rain visuals.
- Main weather scene rendering depends on Majestic/MGL/native rendering classes and cannot be directly ported to browser PixiJS.
- Shader and compute programs are reference-only for behavior and layering, not copy candidates.
