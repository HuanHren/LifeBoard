# Stage 32A.1 Asset Import Plan

## Local Evidence

The ignored local evidence file `asset-import-plan.json` contains 314 candidate import rows. It is intentionally kept outside Git because it includes detailed resource references and source metadata.

## Import Buckets

| Bucket | Candidate type | Stage 32A.2 action |
| --- | --- | --- |
| Runtime texture candidates | Approved weather PNG/WebP sheets, clouds, precipitation, atmosphere, dust, and icon-like references | Import only the minimal authorized subset needed for browser Pixi scenes. |
| Existing LifeBoard vendor assets | Current `public/weather-assets/vendor/xiaomi` subset | Reuse and expand manifest only if provenance remains explicit. |
| Reference-only technical assets | GLSL, compute shader names, MGL native references | Do not copy. Rebuild behavior in TypeScript/Pixi. |
| Documentation-only evidence | Code maps and matrix rows | Summarize publicly; keep detailed source evidence in ignored local docs. |
| Excluded sources | APKs, smali, native libraries, full decompiled Java/Kotlin, full path/hash manifests | Never commit to LifeBoard. |

## Minimum Import Strategy

Stage 32A.2 should import assets by scene need, not by source directory:

1. Clear/cloudy/overcast atmosphere and cloud texture candidates.
2. Rain and thunder precipitation candidates.
3. Snow candidates.
4. Fog/haze/dust atmosphere candidates.
5. Optional foreground droplet candidates.

Every imported asset should have:

- Provenance documentation.
- A manifest entry.
- A runtime origin classification.
- A production build check.
- A fallback path if the asset is absent or unsupported.

## Public Interface Rule

Do not expose Xiaomi code names, file names, or scene ids as public LifeBoard business API. They may exist only inside an internal vendor adapter or provenance document where needed.

## Original Asset Retention

Existing LifeBoard original weather files should remain in the repository as archival and future replacement assets. They are not deleted, marked useless, or selected in the current Stage 32A.2 runtime plan. The active runtime priority for identified weather scenes is authorized vendor scene first, then fallback for unknown, unmapped, or failed asset loads.
