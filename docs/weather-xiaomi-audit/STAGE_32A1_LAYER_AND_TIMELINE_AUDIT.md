# Stage 32A.1 Layer and Timeline Audit

## Scene Configuration

Xiaomi weather scenes are described by `weather_android_data_OS2.json`. The file separates sky-level data from weather-level data:

| Config area | Role |
| --- | --- |
| `skies` | Broad sky family and cloud speed values. |
| `weathers` | Weather scene family, cloud layout ids, atmosphere data, and time-bucket entries. |
| `cloudLayouts` | Cloud type composition for each weather scene. |
| Time entries | Background position, color, atmosphere, dynamic atmosphere, and cloud config for different day segments. |

## Confirmed Scene Families

| V12 id | Scene family | Sky | Weather config | Time entries |
| --- | --- | --- | --- | ---: |
| `0` | Clear / sunny | `SKY_SUNNY_N` | `WEATHER_SUNNY_N` | 17 |
| `1` | Cloudy | `SKY_CLOUDY_L` | `WEATHER_CLOUDY_L` | 17 |
| `2` | Overcast | `SKY_OVERCAST` | `WEATHER_OVERCAST` | 4 |
| `3` | Fog | `SKY_FOGGY` | `WEATHER_FOGGY` | 4 |
| `4` | Haze / smog | `SKY_SMOGGY` | `WEATHER_SMOGGY` | 4 |
| `5` | Light rain / sleet | `SKY_RAINY` | `WEATHER_RAINY_S` | 4 |
| `6` | Moderate rain | `SKY_RAINY` | `WEATHER_RAINY_M` | 4 |
| `7` | Heavy rain | `SKY_RAINY` | `WEATHER_RAINY_L` | 4 |
| `8` | Thunderstorm | `SKY_RAINY` | `WEATHER_RAINY_XL` | 4 |
| `9` | Light snow | `SKY_SNOWY` | `WEATHER_SNOWY_S` | 4 |
| `10` | Moderate snow | `SKY_SNOWY` | `WEATHER_SNOWY_M` | 4 |
| `11` | Heavy snow | `SKY_SNOWY` | `WEATHER_SNOWY_L` | 4 |
| `12` | Heavy sand | `SKY_SANDY` | `WEATHER_SANDY_L` | 4 |
| `13` | Ice / freezing rain | `SKY_RAINY` | `WEATHER_RAINY_S` | 4 |
| `14` | Light sand / dust | `SKY_SANDY` | `WEATHER_SANDY_S` | 4 |

## Implementation Findings

| Area | Xiaomi implementation finding | Browser/Pixi interpretation |
| --- | --- | --- |
| Cloud | Multiple cloud layout ids with sky-family cloud speed. | Use a shared cloud layer system with scene-specific opacity, scale, density, drift speed, and day/night tint. |
| Rain | Rain has particle, line, screen, and droplet references. | Use capped Pixi particles, optional streak layers, and bounded foreground droplets. |
| Snow | Snow has particle, line, and screen references. | Use capped particle layers with light/moderate/heavy presets. |
| Fog/haze | Fog and haze are separate sky/weather families. | Use translucent atmosphere sheets plus depth haze and reduced contrast. |
| Thunder | Thunderstorm is a rainy XL scene with thunder-specific resources. | Use LifeBoard-owned non-periodic brightness overlay; avoid copying shader timing. |
| Sand/dust | Sandy scenes share dusty atmospheric treatment with two intensity families. | Use tinted atmosphere, low-contrast dust sheets, and capped debris particles. |
| Foreground droplets/water | Rain and thunder resources include screen-level/droplet references. | Implement as optional static or low-frequency overlay, with hard caps and reduced-motion disablement. |

## Timeline Parameters

Clear and cloudy scenes have 17 time entries, while precipitation, fog, haze, snow, and dust scenes generally have 4 entries. Stage 32A.2 should normalize this into LifeBoard timeline buckets without duplicating the original configuration format.
