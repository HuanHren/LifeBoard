# Stage 30 Vendor Asset Audit

## Source Boundary

Only files referenced by `public/__local_weather_reference/manifest.json` were selected. The audit did not read from `D:\XiaomiWeather-Reversing` or any APK/decompiled directory.

## Summary

- Selected image files: 21
- Manifest files: 1
- Scene entries: 28
- Total selected image size: 1,703,784 bytes
- Largest selected file: 681,880 bytes
- Files over 20 MB: none
- Files over 100 MB: none
- Git LFS required: no

## Asset Checks

Each selected file was copied into `public/weather-assets/vendor/xiaomi/` and verified with SHA-256 against the existing local manifest record. The copied files are WebP or PNG browser-supported image assets. The manifest records dimensions, alpha presence, SHA-256, and file size.

The formal manifest excludes Windows absolute paths, source extraction paths, APK/JADX/Apktool names, shader/native/MAML implementation references, and raw local manifest fields that are not needed at runtime.

## Excluded

- `public/__local_weather_reference/manifest.json` as a runtime source
- Local absolute `sourcePath` values
- Xiaomi app code, native code, shader files, MAML files, APK outputs, and reverse-engineering workspaces
- UI logos, brand marks, and non-weather scene assets
