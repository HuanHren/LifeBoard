# Stage 22 Source Asset Verification

Stage 22 approved source images were verified before runtime export and after implementation. The files remain in `docs` and are not imported by the application runtime.

## Approved Source Files

| Source | Path | Dimensions | Bytes | SHA-256 | Alpha |
|---|---|---:|---:|---|---:|
| Desktop night | `D:\LifeBoard\docs\partly-cloudy-night-base-desktop-source.png` | 1896x829 | 1246172 | `1EEEE03082D8E5C809E7D76DF7959FD3EFCBDA1A4F1FC853F2C461E9D5C48132` | false |
| Mobile night | `D:\LifeBoard\docs\partly-cloudy-night-base-mobile-source.png` | 941x1672 | 1350144 | `133C0667FEBB2DF08E78B493F50EBD60ADAE7FAFA02C3263AE784EC5F5A1FEBF` | false |

## Export Verification

| Runtime asset | Format | Dimensions | Bytes | SHA-256 |
|---|---|---:|---:|---|
| `src/assets/weather/atmosphere/partly-cloudy-night/desktop/partly-cloudy-night-base-desktop.avif` | AVIF | 1896x829 | 18110 | `370BE4F465DE23C9FD1669E2756680659E2EEA76F7DA062AB621C9E42503D694` |
| `src/assets/weather/atmosphere/partly-cloudy-night/desktop/partly-cloudy-night-base-desktop.webp` | WebP | 1896x829 | 22202 | `C4E546F9156796149083B37FC0451F3706D06E79688AFA8690480DA6B08E5148` |
| `src/assets/weather/atmosphere/partly-cloudy-night/mobile/partly-cloudy-night-base-mobile.avif` | AVIF | 941x1672 | 9031 | `864E12C65FF403FF5427B0342D050498AB5992135FC7AC67178E0003703FCEBE` |
| `src/assets/weather/atmosphere/partly-cloudy-night/mobile/partly-cloudy-night-base-mobile.webp` | WebP | 941x1672 | 13454 | `900F62B0ED725EE25D9CED85255C43C6364AD711C3A49970A1CB71F563C26584` |

AVIF files were decoded back to PNG for dimension verification. WebP files were inspected directly with Pillow.

## Boundary

No Xiaomi weather images, shaders, scene configs, native code, resource names, or copied layouts were used. The two approved PNG sources were not edited during Stage 22.
