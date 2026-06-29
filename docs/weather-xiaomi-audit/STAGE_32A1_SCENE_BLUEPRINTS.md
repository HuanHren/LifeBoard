# Stage 32A.1 Scene Blueprints

## Blueprint Evidence

The ignored local evidence file `scene-blueprints.json` records 38 candidate scene rows. Rows combine V12 scene family, day/night mode, LifeBoard target effect group, layer stack, asset candidate category, and browser portability notes.

## Proposed Scene Families

| LifeBoard family | Xiaomi reference | Desktop composition | Tablet composition | Mobile composition |
| --- | --- | --- | --- | --- |
| Clear | V12 `0` | Sky gradient, subtle clouds/stars, sun/moon accent | Same with lower cloud density | Reduced layers and lower particle budget |
| Partly cloudy | V12 `1` authorized vendor scene | Vendor cloud scene with partly-cloudy composition parameters | Same with lower cloud density | Reduced cloud sprites |
| Cloudy | V12 `1` | Multi-cloud layout, low precipitation budget | Fewer cloud sprites | Reduced cloud sprites |
| Overcast | V12 `2` | Darker cloud cover and muted sky | Same, lower texture count | Single cloud-depth layer |
| Fog/rime fog | V12 `3` | Atmosphere sheet and shallow cloud depth | Lower opacity and particle budget | Static atmosphere fallback allowed |
| Haze | V12 `4` | Warm/gray atmosphere tint and low contrast | Same with fewer overlays | Static atmosphere fallback allowed |
| Light/moderate/heavy rain | V12 `5`, `6`, `7` | Shared rain renderer with intensity presets | Lower line density | Lower particle cap and speed |
| Freezing/sleet | V12 `13` | Rain/sleet mix with cold tint | Same, lower density | Static/low-density mix |
| Light/moderate/heavy snow | V12 `9`, `10`, `11` | Shared snow renderer with layer presets | Lower near-field count | Lower particle cap |
| Thunderstorm | V12 `8` | Heavy rain plus low-frequency brightness overlay | Lower overlay amplitude | Reduced overlay and particle cap |
| Sand/dust | V12 `12`, `14` | Dust atmosphere and sparse debris | Lower debris count | Static/low-particle atmosphere |
| Unknown | V12 `99` reference only | LifeBoard neutral fallback | LifeBoard neutral fallback | LifeBoard neutral fallback |

## Required Priority Rule

Current runtime scene selection should use the project owner's approved transition model:

```text
authorized-vendor
-> fallback
```

The existing LifeBoard original partly-cloudy files stay in the repository as archival and future replacement assets. They are not deprecated, but they do not participate in Stage 32A.2 runtime scene selection. After the full weather system is complete, each authorized vendor scene can be replaced per scene key by a completed LifeBoard original scene.

## Non-goals for Stage 32A.2

- Do not port Majestic/MGL or native rendering code.
- Do not copy shader source.
- Do not expose Xiaomi names in public business types.
- Do not add a second weather renderer.
- Do not remove existing LifeBoard original weather assets while they are retained for future replacement.
