# Weather W4: Xiaomi Extended Weather UI

## Scope and W3 dependency

Weather W4 presents only evidence-backed Xiaomi extension data below the existing common Weather content. It depends on W3's single Store, `ProviderWeatherSnapshot`, effective-provider decision, five-state capability map, and retained Xiaomi extensions. It does not create another page, Store, request lifecycle, or provider branch in common components.

The implemented data flow is:

```text
Store ProviderWeatherSnapshot
  -> pure Xiaomi extension adapters
  -> UI-only view models
  -> one capability-driven extended region
  -> existing Weather page
```

## Evidence matrix

| Capability | Raw path | Verified root | Verified nested evidence | Unit or meaning evidence | State in W1 fixture | W4 decision |
| --- | --- | --- | --- | --- | --- | --- |
| Minutely | `$.minutely` | object | `status`, `precipitation.status`, `isShow`, textual descriptions, `pubTime`; numeric sequences also exist | Provider-authored text and offset timestamp are verified; numeric sequence unit is absent | available | Level A for text summary; numeric chart deferred |
| Alerts | `$.alerts` | array | W1 fixture is empty; W4 Preview safely observed three items with field names only | no committed sanitized item values, level semantics, affected-area rule, or expiry contract | empty-array in W1; available in W4 Preview | Level C; no active-alert UI |
| Indices | `$.indices` | object | item code and numeric-string value | decompiled constants identify codes, but numeric categorical meanings are not verified | available | Level B; not rendered |
| Typhoon | `$.typhoon` | array | name, type, code, latitude, longitude, central wind value | wind unit, status, relevant time, local relevance, and severity are not verified | available | Level B; not rendered |
| Yesterday | `$.yesterday` | object | temperature-like fields exist | units and observation alignment are not explicit | available | Level B; not compared |
| Previous hour | `$.preHour` | array | `pubTime`; temperature, feels-like, humidity, pressure, visibility, and wind speed each carry explicit units | `°C`, `%`, `hPa`, `km`, and `km/h` are explicit | available | Level A; compact recent-change UI |
| Source maps | `$.sourceMaps` | object | internal metadata structure | operational/internal metadata, including a client-information branch, is unsafe for presentation | available | Level B/internal; never rendered |
| Brand information | `$.brandInfo` | object | localized names plus IDs, URLs, and logo metadata | localized source name is safe; other fields are not needed | available | Level A for localized name only |
| AQI detail | `$.aqi` | object | AQI and pollutant-shaped structures exist | AQI scale and station interpretation remain unresolved | available | Level B; station detail deferred |
| Update time | `$.updateTime` | primitive timestamp | normalized by W2 into `snapshot.updatedAt` | timestamp semantics already verified by W2 | available | Level A; attribution update time |

The primary committed evidence is the sanitized W1 fixture and its contract tests. The original authorized HAR at `D:\XiaomiWeather-Reversing\evidence\类原生tracking.miui.com_2026_07_08_03_48_55.har` was consulted read-only only to resolve nested optional structures. No request URL, header value, cookie, credential, or raw response was copied into LifeBoard.

## Capability decisions

- Level A: minutely provider-authored text, equal-unit previous-hour comparisons, localized brand name, and normalized update time.
- Level B: indices, typhoon, yesterday, AQI station detail, and internal source-map structure. Their roots are known, but units, category semantics, scale, or user relevance are incomplete.
- Level C: active alert items. Both authorized successful responses contained an empty array, so an item contract cannot be established.

A deferred Level B or C capability does not create an empty card. It remains available in Store-domain data for future evidence-backed work.

## View-model architecture

`xiaomiExtendedWeatherAdapters.ts` contains small pure adapters for minutely text, recent changes, and attribution. The adapters receive the provider snapshot and locale, validate untrusted extension values, preserve numeric zero, reject non-finite numbers, validate explicit units and offset timestamps, avoid mutation, and return structured diagnostic codes without response bodies.

Vue components receive only `XiaomiExtendedWeatherViewModel`. They never receive the raw extension object. A defensive recursive key check rejects an extension tree containing credential-shaped field names before any view model is produced. Attribution uses a strict allowlist and never forwards `sourceMaps`, `clientInfo`, brand IDs, logos, or URLs.

## UI hierarchy and rendering

The single “Xiaomi weather details” region is inserted after existing common precipitation content and before the existing provider notice/attribution. It is subordinate to the Hero and common current, hourly, daily, detail, AQI, and precipitation sections.

The region appears only when all of these are true:

- the Store's effective provider is Xiaomi;
- the provider snapshot is a Xiaomi snapshot;
- at least one safe minutely or recent-change view model exists.

Attribution alone never creates the region. Switching to Open-Meteo or Caiyun, changing to unsupported `en-US`, disabling Xiaomi, losing the Xiaomi location identity, or receiving a sparse snapshot removes the region without leaving an empty surface.

Capability states retain W2 semantics: `missing`, `null`, and `empty-object` do not render; `empty-array` renders only where a useful verified empty meaning exists; `available` still must pass the capability-specific adapter. Root truthiness is never enough.

## Minutely behavior

The minutely card answers the immediate-weather question using only Xiaomi's provider-authored precipitation summary, optional detail/advice, and valid offset timestamp. It does not interpret or chart the captured numeric sequences because no measurement unit is present in the verified evidence. Missing, hidden, malformed, or semantically empty minutely data removes the card.

## Alert evidence limitation

`ACTIVE_ALERT_ITEM_UI_DEFERRED_EVIDENCE_MISSING`

The committed verified alert root is an empty array. The protected W4 Preview safely observed three live items and retained only this structural inventory: `alertId`, `detail`, `images`, `level`, `locationKey`, `pubTime`, `title`, and `type`. Field names alone do not prove level semantics, affected-area behavior, expiry, safe image handling, or an emergency-warning contract, and the live values were not written to disk. W4 therefore does not create an active-alert view model or fake fixture. A future alert UI requires deliberate sanitization of an authorized item response, documented semantics, item-level types, and accessibility rules for critical notices.

## Indices and typhoon behavior

Life indices and typhoon are not rendered. Index codes are known, but the meaning of their numeric values and recommendation categories is not. Typhoon items expose several structural fields, but wind units, current status, timing, severity, and local relevance are unresolved. W4 therefore avoids raw codes, alarming presentation, maps, trajectory calculations, and guessed measurements.

## Recent comparisons

The recent-change card compares current normalized values with the latest valid previous-hour entry whose timestamp is not later than the current observation. It does not blindly use array index zero. Only fields with the same explicit units are compared: temperature, apparent temperature, humidity, pressure, visibility, and wind speed.

Each item provides previous value, current value, direction text, and signed delta. Zero and negative values are preserved; invalid fields are omitted individually; and the whole card disappears when no meaningful equal-unit comparison remains. Yesterday comparison is deferred because the verified object does not establish equivalent units and observation alignment.

## AQI scale limitation

`AQI_SCALE_PRESENTATION_DEFERRED`

W4 does not merge Xiaomi station data into the existing common AQI panel, assign colors or health categories, convert scales, or rank stations. The AQI scale and station-level meaning remain unresolved, so no Xiaomi station detail is rendered.

## Source attribution allowlist

The attribution view model may contain only unique localized provider names selected from `brandInfo.brands[].names` and the already-normalized snapshot update timestamp. It rejects or ignores client information, credentials, internal endpoints, IDs, request identifiers, logos, arbitrary links, tracking metadata, and the complete source-map object.

## Accessibility and responsive behavior

The region uses a labelled semantic `section`, an `h2` for the region, `h3` headings for its two articles, semantic description lists for comparisons, localized text, and text equivalents for every direction. It introduces no color-only meaning, chart, disclosure, or new live-region noise. Existing focus and keyboard behavior remain unchanged because W4 adds no interaction.

The layout is one column on mobile/tablet and two balanced surfaces at the existing large breakpoint. Existing spacing, surface, border, radius, typography, light/dark, and accent tokens are reused. Long Chinese and English content wraps naturally; no fixed height or fixed-width table is introduced.

Targeted deterministic browser evidence covers 390, 768, and 1440 px, full and sparse capability sets, dark mode, long text, Open-Meteo non-rendering, provider/locale switching, Home non-rendering, console errors, and horizontal overflow. These screenshots are local ignored QA artifacts and do not replace the feature-disabled 32-screenshot baseline.

## Performance and motion

W4 adds no dependency, chart library, canvas, animation, transition, watcher, or request. Transformations run in a Vue computed value outside templates and produce small immutable view models. The existing 513.51 kB library chunk remains unchanged. No motion-specific skill or review was needed because no motion was introduced.

## Security boundary

The frontend still calls only the W1 same-origin proxy through W3. W4 performs no request. Raw Xiaomi extensions are validated at the adapter boundary, and no source-map/client-information object reaches a component. Sanitized fixtures contain no real authorization value. Source, fixture, documentation, built output, rendered DOM, console, screenshot text, storage-key names, Preview URLs, and response markers are audited separately before the stage is frozen.

## Test coverage

Dedicated W4 tests cover minutely states and malformed data; latest-valid previous-hour selection, equal units, zero/negative values, direction and omission; attribution localization and allowlisting; secret-shaped rejection; snapshot immutability; and effective-provider/locale/sparse integration. The targeted browser runner uses deterministic W1-style envelopes and checks the complete rendering and stale-removal paths without contacting Xiaomi or Vercel.

## Preview validation

Preview deployment `dpl_HX9AuZGfET47kVZr5ri4zHyyJVww` remained Ready and Preview-only at `https://life-board-8duakgcuy-jingrenhuang4gmailcoms-projects.vercel.app`. It used the deployment-scoped non-secret feature flag, existing encrypted Preview server variables, and the established authenticated Vercel automation cookie. Deployment Protection remained enabled; the cookie stayed in an ignored local file and was never printed, put in application storage, traced, recorded, or captured in a screenshot.

The real protected-browser flow searched for 尉氏县, obtained one intended result matching 开封市 / 河南 / 中国, retained a non-empty opaque Xiaomi location ID, and received HTTP 200 from both same-origin proxy routes. Common current, hourly, and daily UI rendered. The live snapshot rendered the verified previous-hour comparison; minutely and typhoon were missing and created no empty surfaces. Open-Meteo switching removed the region, switching back reloaded Xiaomi, Home remained free of extended UI, and `en-US` prevented new Xiaomi requests and removed the region. The 390, 768, and 1440 checks had no horizontal overflow, console errors were zero, direct upstream requests were zero, and no credential/internal marker was found in URLs, non-cookie request headers, response structures, DOM, HTML, console, or storage-key names.

## Known platform and portability limitations

- Only `zh-CN -> zh_cn` is verified for Xiaomi.
- Xiaomi weather-all remains fixed to `days=15`.
- Production Xiaomi remains disabled and has no Production secrets.
- Automatic fallback, caching, retry hardening, quota handling, and rate limiting belong to W5.
- Minutely and typhoon may be absent for a location.
- The local `vercel dev` SPA mount limitation for `/@vite/client` and `/src/main.ts` remains; W4 uses Vite plus deterministic proxy envelopes locally and protected Preview for real data.
- Portable export intentionally omits runtime-only Xiaomi location identity. Restoring a portable backup may require explicitly reselecting the Xiaomi city.
- W4 adds no storage key, registry entry, backup version, persisted UI preference, or Calendar work.

## Explicit non-changes and W5 handoff

W4 does not change the W1 proxy, W2 normalizer, W3 provider orchestration/eligibility/location identity/request lifecycle, Open-Meteo or Caiyun transport, cache behavior, Weather Hero, PixiJS/scenes, Home UI, Settings selector, persistence, backup/import/reset, Calendar, Production environment, or deployment target.

W5 receives the evidence-backed extended view models and components, capability-state rendering policy, sanitized fixture tests, targeted responsive QA, explicit active-alert/AQI/index/typhoon/yesterday limitations, and the unchanged local-development limitation. W5 alone owns cache keys, stale-data policy, retries, recovery/fallback policy, quota/rate-limit strategy, final Production gating, and Weather Track freeze.
