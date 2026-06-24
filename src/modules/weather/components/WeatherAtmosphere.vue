<script lang="ts">
type BaseFormatState = 'prefer-avif' | 'webp-only' | 'visual-fallback'

const baseFormatStateByVisualIdentity = new Map<string, BaseFormatState>()
</script>

<script setup lang="ts">
import { computed, ref, shallowRef, useTemplateRef, watch } from 'vue'
import {
  getWeatherAtmosphereAssets,
  type WeatherAtmosphereAssetSource,
} from '@/modules/weather/constants/weatherAtmosphereAssets'
import { WeatherPixiLayer } from '@/modules/weather/renderers/pixi'
import type { LocalWeatherReferenceScene } from '@/modules/weather/renderers/pixi/local-reference'
import type {
  PixiWeatherRendererStatus,
  PixiWeatherVisualKey,
} from '@/modules/weather/renderers/pixi'
import type { WeatherLighting } from '@/modules/weather/types/weatherLighting'
import type { WeatherAtmosphere } from '@/modules/weather/utils/weatherAtmosphere'
import type { ResolvedWeatherVisual } from '@/modules/weather/visual/types'

type LocalWeatherReferenceModule = typeof import('@/modules/weather/renderers/pixi/local-reference')

interface Props {
  atmosphere: WeatherAtmosphere
  lighting?: WeatherLighting
  visual?: ResolvedWeatherVisual
  visualState?: 'stable' | 'outgoing' | 'incoming'
}

type AtmosphereLayer = 'base' | 'depth' | 'foreground'
type BaseArtworkReadiness = 'loaded' | 'failed' | 'absent'

const props = defineProps<Props>()
const emit = defineEmits<{
  baseReady: [readiness: BaseArtworkReadiness]
}>()
const baseImageRef = useTemplateRef<HTMLImageElement>('baseImage')
const failedLayers = ref<Set<AtmosphereLayer>>(new Set())
const baseFormatState = shallowRef<BaseFormatState>('prefer-avif')
const loadedBaseImage = shallowRef<HTMLImageElement | null>(null)
const localReferenceScene = shallowRef<LocalWeatherReferenceScene | null>(null)
const pixiStatus = shallowRef<PixiWeatherRendererStatus>('idle')
let localReferenceRequestId = 0

const localReferenceAssetsEnabled =
  import.meta.env.DEV &&
  import.meta.env.VITE_ENABLE_LOCAL_WEATHER_REFERENCE_ASSETS === 'true'

const assetSet = computed(() => getWeatherAtmosphereAssets(props.atmosphere))
const resolvedBase = computed(() => {
  if (!props.visual?.hasRegisteredVisual) {
    return null
  }

  if (!props.visual.desktopAsset && !props.visual.mobileAsset) {
    return null
  }

  return {
    desktop: props.visual.desktopAsset,
    mobile: props.visual.mobileAsset,
  }
})
const baseDesktopSource = computed(
  () => resolvedBase.value?.desktop ?? assetSet.value.base?.desktop,
)
const baseMobileSource = computed(
  () => resolvedBase.value?.mobile ?? assetSet.value.base?.mobile,
)
const baseFallbackSource = computed(
  () => {
    if (baseFormatState.value === 'visual-fallback') {
      return null
    }

    if (baseFormatState.value === 'webp-only') {
      return (
        baseDesktopSource.value?.webp ??
        baseDesktopSource.value?.png ??
        baseMobileSource.value?.webp ??
        baseMobileSource.value?.png ??
        null
      )
    }

    return (
      baseDesktopSource.value?.webp ??
      baseDesktopSource.value?.avif ??
      baseDesktopSource.value?.png ??
      baseMobileSource.value?.webp ??
      baseMobileSource.value?.avif ??
      baseMobileSource.value?.png ??
      null
    )
  },
)
const depthSource = computed(() => assetSet.value.depth)
const foregroundSource = computed(() => assetSet.value.foreground)
const hasBaseAsset = computed(
  () => Boolean(baseFallbackSource.value) && !failedLayers.value.has('base'),
)
const hasDepthAsset = computed(
  () => hasLayerSource(depthSource.value) && !failedLayers.value.has('depth'),
)
const hasForegroundAsset = computed(
  () =>
    hasLayerSource(foregroundSource.value) &&
    !failedLayers.value.has('foreground'),
)
const hasAnyAsset = computed(
  () => hasBaseAsset.value || hasDepthAsset.value || hasForegroundAsset.value,
)
const hasBaseWebpFallback = computed(
  () => Boolean(baseDesktopSource.value?.webp || baseMobileSource.value?.webp),
)
const visualIdentity = computed(() => [
  props.visual?.condition ?? 'legacy',
  props.visual?.timeline ?? 'day',
  baseDesktopSource.value?.avif ?? '',
  baseDesktopSource.value?.webp ?? '',
  baseDesktopSource.value?.png ?? '',
  baseMobileSource.value?.avif ?? '',
  baseMobileSource.value?.webp ?? '',
  baseMobileSource.value?.png ?? '',
].join('|'))
const pixiVisualKey = computed<PixiWeatherVisualKey | null>(() => {
  if (
    props.visual?.condition !== 'partly-cloudy' ||
    (
      props.visual.timeline !== 'day' &&
      props.visual.timeline !== 'night'
    )
  ) {
    return null
  }

  return props.visual.timeline === 'night'
    ? 'partly-cloudy-night'
    : 'partly-cloudy-day'
})
const localReferenceRequestKey = computed(() => {
  if (
    !props.visual ||
    props.visual.effectGroup === 'partly-cloudy' ||
    props.visual.effectGroup === 'unknown'
  ) {
    return null
  }

  return `${props.visual.effectGroup}:${props.visual.intensity}:${props.visual.timeline}`
})
const shouldEnablePixi = computed(
  () =>
    props.visualState !== 'outgoing' &&
    baseFormatState.value !== 'visual-fallback' &&
    (
      (pixiVisualKey.value !== null && loadedBaseImage.value !== null) ||
      localReferenceScene.value !== null
    ),
)
const assetOrigin = computed(() => {
  if (localReferenceScene.value) {
    return 'local-reference'
  }

  if (baseFormatState.value === 'visual-fallback') {
    return 'fallback'
  }

  if (hasBaseAsset.value) {
    return 'lifeboard-original'
  }

  return 'fallback'
})
const effectiveFallbackClass = computed(() =>
  baseFormatState.value === 'visual-fallback'
    ? 'weather-atmosphere--neutral'
    : assetSet.value.fallbackClass,
)
const canDriftDepth = computed(
  () => Boolean(assetSet.value.shouldDriftDepth) && hasDepthAsset.value,
)
const motionPreset = computed(
  () => props.visual?.motionPreset ?? assetSet.value.motionPreset ?? 'static',
)
const safeLighting = computed<WeatherLighting>(() => props.lighting ?? {
  lightLevel: 0.62,
  lightWarmth: 0.48,
  lightX: 78,
  lightY: 28,
  ambientOpacity: 0.3,
  highlightOpacity: 0.24,
  hazeOpacity: 0.2,
  cloudShadowOpacity: 0.18,
  contrastStrength: 0.38,
  nightDepth: 0,
  precipitationOpacity: 0,
  snowLightOpacity: 0,
  stormShadowOpacity: 0,
  foregroundMode: 'dark',
})
const atmosphereStyle = computed(() => ({
  '--weather-atmosphere-object-position-desktop':
    assetSet.value.objectPosition.desktop,
  '--weather-atmosphere-object-position-mobile':
    assetSet.value.objectPosition.mobile,
  '--weather-atmosphere-depth-position':
    assetSet.value.objectPosition.depth ?? assetSet.value.objectPosition.desktop,
  '--weather-atmosphere-foreground-position':
    assetSet.value.objectPosition.foreground ??
    assetSet.value.objectPosition.desktop,
  '--weather-light-level': String(safeLighting.value.lightLevel),
  '--weather-light-warmth': String(safeLighting.value.lightWarmth),
  '--weather-light-x': `${safeLighting.value.lightX}%`,
  '--weather-light-y': `${safeLighting.value.lightY}%`,
  '--weather-ambient-opacity': String(safeLighting.value.ambientOpacity),
  '--weather-highlight-opacity': String(safeLighting.value.highlightOpacity),
  '--weather-haze-opacity': String(safeLighting.value.hazeOpacity),
  '--weather-cloud-shadow-opacity': String(safeLighting.value.cloudShadowOpacity),
  '--weather-contrast-strength': String(safeLighting.value.contrastStrength),
  '--weather-night-depth': String(safeLighting.value.nightDepth),
  '--weather-lighting-precipitation-opacity': String(
    safeLighting.value.precipitationOpacity,
  ),
  '--weather-snow-light-opacity': String(safeLighting.value.snowLightOpacity),
  '--weather-storm-shadow-opacity': String(safeLighting.value.stormShadowOpacity),
}))

function hasLayerSource(source: WeatherAtmosphereAssetSource | undefined) {
  return Boolean(source?.webp || source?.avif || source?.png)
}

function setBaseFormatState(nextState: BaseFormatState) {
  baseFormatState.value = nextState
  baseFormatStateByVisualIdentity.set(visualIdentity.value, nextState)
}

function markLayerFailed(layer: AtmosphereLayer) {
  if (layer === 'base') {
    loadedBaseImage.value = null
  }

  if (layer === 'base' && baseFormatState.value === 'prefer-avif') {
    if (hasBaseWebpFallback.value) {
      setBaseFormatState('webp-only')
      return
    }
  }

  if (layer === 'base' && baseFormatState.value === 'webp-only') {
    setBaseFormatState('visual-fallback')
  }

  failedLayers.value = new Set(failedLayers.value).add(layer)

  if (layer === 'base') {
    emit('baseReady', 'failed')
  }
}

function markBaseLoaded() {
  loadedBaseImage.value = baseImageRef.value
  emit('baseReady', 'loaded')
}

function updatePixiStatus(status: PixiWeatherRendererStatus) {
  pixiStatus.value = status
}

watch(
  visualIdentity,
  (identity) => {
    const preservedFormatState = baseFormatStateByVisualIdentity.get(identity)
    baseFormatState.value = preservedFormatState ?? 'prefer-avif'

    if (!preservedFormatState) {
      baseFormatStateByVisualIdentity.set(identity, 'prefer-avif')
    }

    failedLayers.value = new Set()
    loadedBaseImage.value = null
    pixiStatus.value = 'idle'
  },
  { immediate: true },
)

watch(
  localReferenceRequestKey,
  async (key) => {
    const requestId = ++localReferenceRequestId
    localReferenceScene.value = null

    if (!key || !props.visual || !localReferenceAssetsEnabled) {
      return
    }

    const localReferenceModulePath =
      '/src/modules/weather/renderers/pixi/local-reference/index.ts'
    const { resolveLocalWeatherReferenceScene } = await import(
      /* @vite-ignore */ localReferenceModulePath
    ) as LocalWeatherReferenceModule
    const scene = await resolveLocalWeatherReferenceScene({
      effectGroup: props.visual.effectGroup,
      intensity: props.visual.intensity,
      timeline: props.visual.timeline,
    })

    if (requestId === localReferenceRequestId) {
      localReferenceScene.value = scene
    }
  },
  { immediate: true },
)

watch(
  () => [baseFallbackSource.value, baseFormatState.value] as const,
  ([source, formatState]) => {
    if (!source && formatState !== 'visual-fallback') {
      emit('baseReady', 'absent')
    }
  },
  { immediate: true },
)
</script>

<template>
  <div
    aria-hidden="true"
    class="weather-atmosphere"
    :class="[
      effectiveFallbackClass,
      {
        'weather-atmosphere--has-assets': hasAnyAsset,
        'weather-atmosphere--drift-depth': canDriftDepth,
      },
      `weather-atmosphere--motion-${motionPreset}`,
    ]"
    :data-atmosphere="atmosphere"
    :data-weather-asset-origin="assetOrigin"
    :data-effect-group="visual?.effectGroup ?? 'legacy'"
    :data-fallback-reason="visual?.fallbackReason ?? 'registered'"
    :data-format-state="baseFormatState"
    :data-intensity="visual?.intensity ?? 'none'"
    :data-life-board-condition="visual?.condition ?? 'unknown'"
    :data-neutral-fallback-active="baseFormatState === 'visual-fallback' ? 'true' : 'false'"
    :data-pixi-status="pixiStatus"
    :data-weather-scene-key="localReferenceScene?.key ?? pixiVisualKey ?? 'fallback'"
    :data-timeline="visual?.timeline ?? 'day'"
    :style="atmosphereStyle"
  >
    <span class="weather-atmosphere__wash" />
    <span class="weather-atmosphere__horizon" />
    <span class="weather-atmosphere__ambient" />
    <span class="weather-atmosphere__highlight" />

    <picture
      v-if="hasBaseAsset"
      class="weather-atmosphere__asset weather-atmosphere__asset--base"
    >
      <source
        v-if="baseFormatState === 'prefer-avif' && baseMobileSource?.avif"
        media="(max-width: 39.9375rem)"
        :srcset="baseMobileSource.avif"
        type="image/avif"
      >
      <source
        v-if="baseMobileSource?.webp"
        media="(max-width: 39.9375rem)"
        :srcset="baseMobileSource.webp"
        type="image/webp"
      >
      <source
        v-if="baseMobileSource?.png"
        media="(max-width: 39.9375rem)"
        :srcset="baseMobileSource.png"
        type="image/png"
      >
      <source
        v-if="baseFormatState === 'prefer-avif' && baseDesktopSource?.avif"
        :srcset="baseDesktopSource.avif"
        type="image/avif"
      >
      <source
        v-if="baseDesktopSource?.webp"
        :srcset="baseDesktopSource.webp"
        type="image/webp"
      >
      <source
        v-if="baseDesktopSource?.png"
        :srcset="baseDesktopSource.png"
        type="image/png"
      >
      <img
        ref="baseImage"
        alt=""
        class="weather-atmosphere__image weather-atmosphere__image--base"
        decoding="async"
        fetchpriority="high"
        :src="baseFallbackSource ?? ''"
        @error="markLayerFailed('base')"
        @load="markBaseLoaded"
      >
    </picture>

    <WeatherPixiLayer
      v-if="pixiVisualKey || localReferenceScene"
      :enabled="shouldEnablePixi"
      :image-element="loadedBaseImage"
      :local-scene="localReferenceScene"
      :visual-key="pixiVisualKey"
      @status-change="updatePixiStatus"
    />

    <picture
      v-if="hasDepthAsset"
      class="weather-atmosphere__asset weather-atmosphere__asset--depth"
    >
      <source
        v-if="depthSource?.avif"
        :srcset="depthSource.avif"
        type="image/avif"
      >
      <source
        v-if="depthSource?.webp"
        :srcset="depthSource.webp"
        type="image/webp"
      >
      <source
        v-if="depthSource?.png"
        :srcset="depthSource.png"
        type="image/png"
      >
      <img
        alt=""
        class="weather-atmosphere__image weather-atmosphere__image--depth"
        decoding="async"
        loading="lazy"
        :src="depthSource?.webp ?? depthSource?.avif ?? depthSource?.png ?? ''"
        @error="markLayerFailed('depth')"
      >
    </picture>

    <picture
      v-if="hasForegroundAsset"
      class="weather-atmosphere__asset weather-atmosphere__asset--foreground"
    >
      <source
        v-if="foregroundSource?.avif"
        :srcset="foregroundSource.avif"
        type="image/avif"
      >
      <source
        v-if="foregroundSource?.webp"
        :srcset="foregroundSource.webp"
        type="image/webp"
      >
      <source
        v-if="foregroundSource?.png"
        :srcset="foregroundSource.png"
        type="image/png"
      >
      <img
        alt=""
        class="weather-atmosphere__image weather-atmosphere__image--foreground"
        decoding="async"
        loading="lazy"
        :src="
          foregroundSource?.webp ?? foregroundSource?.avif ?? foregroundSource?.png ?? ''
        "
        @error="markLayerFailed('foreground')"
      >
    </picture>

    <span class="weather-atmosphere__detail" />
    <span class="weather-atmosphere__precipitation" />
    <span class="weather-atmosphere__contrast" />
  </div>
</template>

<style scoped>
.weather-atmosphere {
  --weather-sky-start: var(--color-surface-raised);
  --weather-sky-end: var(--color-surface);
  --weather-horizon: color-mix(in oklch, var(--color-accent) 12%, transparent);
  --weather-detail: color-mix(in oklch, var(--color-accent) 18%, transparent);
  --weather-detail-size: 14rem;
  --weather-detail-opacity: 0.55;
  --weather-precipitation-opacity: 0;
  --weather-light-level: 0.62;
  --weather-light-warmth: 0.48;
  --weather-light-x: 78%;
  --weather-light-y: 28%;
  --weather-ambient-opacity: 0.3;
  --weather-highlight-opacity: 0.24;
  --weather-haze-opacity: 0.2;
  --weather-cloud-shadow-opacity: 0.18;
  --weather-contrast-strength: 0.38;
  --weather-night-depth: 0;
  --weather-lighting-precipitation-opacity: 0;
  --weather-snow-light-opacity: 0;
  --weather-storm-shadow-opacity: 0;
  --weather-precipitation-angle: 168deg;
  --weather-atmosphere-object-position-desktop: center center;
  --weather-atmosphere-object-position-mobile: center center;
  --weather-atmosphere-depth-position: center center;
  --weather-atmosphere-foreground-position: center bottom;
  --weather-atmosphere-contrast: linear-gradient(
    90deg,
    color-mix(
      in oklch,
      var(--weather-sky-start) calc((0.42 + var(--weather-contrast-strength) * 0.48) * 100%),
      transparent
    ),
    transparent 58%
  );
  --weather-rain-layer: color-mix(
    in oklch,
    var(--color-text-inverse) 30%,
    transparent
  );
  --weather-rain-layer-soft: color-mix(
    in oklch,
    var(--color-text-inverse) 18%,
    transparent
  );
  --weather-snow-layer: color-mix(
    in oklch,
    var(--color-text-inverse) 58%,
    transparent
  );
  --weather-snow-layer-soft: color-mix(
    in oklch,
    var(--color-text-inverse) 34%,
    transparent
  );

  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    linear-gradient(
      140deg,
      color-mix(
        in oklch,
        var(--weather-sky-start) calc((0.72 + var(--weather-light-level) * 0.18) * 100%),
        var(--color-surface-raised)
      ),
      color-mix(
        in oklch,
        var(--weather-sky-end) calc((0.74 + var(--weather-light-level) * 0.16) * 100%),
        var(--color-surface)
      )
    );
}

.weather-atmosphere__wash,
.weather-atmosphere__horizon,
.weather-atmosphere__ambient,
.weather-atmosphere__highlight,
.weather-atmosphere__detail,
.weather-atmosphere__precipitation,
.weather-atmosphere__contrast,
.weather-atmosphere__asset {
  position: absolute;
  display: block;
  pointer-events: none;
}

.weather-atmosphere__wash {
  inset: 0;
  z-index: 1;
  background:
    radial-gradient(
      circle at 18% 20%,
      color-mix(in oklch, var(--weather-detail) 64%, transparent),
      transparent 36%
    );
  opacity: calc(var(--weather-detail-opacity) + var(--weather-haze-opacity) * 0.22);
}

.weather-atmosphere__horizon {
  right: -12%;
  bottom: -34%;
  z-index: 1;
  width: min(36rem, 82vw);
  aspect-ratio: 1;
  border-radius: 999rem;
  background: radial-gradient(circle, var(--weather-horizon), transparent 68%);
  opacity: calc(0.78 + var(--weather-ambient-opacity) * 0.18);
}

.weather-atmosphere__ambient {
  inset: 0;
  z-index: 1;
  background:
    radial-gradient(
      circle at var(--weather-light-x) var(--weather-light-y),
      color-mix(
        in oklch,
        oklch(91% 0.046 118) calc((0.62 - var(--weather-light-warmth) * 0.18) * 100%),
        oklch(88% 0.058 76)
      ),
      transparent 48%
    ),
    linear-gradient(
      180deg,
      color-mix(
        in oklch,
        oklch(88% 0.028 132) calc((0.28 + var(--weather-light-level) * 0.18) * 100%),
        transparent
      ),
      transparent 70%
    );
  opacity: var(--weather-ambient-opacity);
  transition: opacity 260ms var(--motion-ease);
}

.weather-atmosphere__highlight {
  top: calc(var(--weather-light-y) - 8rem);
  left: calc(var(--weather-light-x) - 9rem);
  z-index: 5;
  width: min(18rem, 46vw);
  aspect-ratio: 1;
  border-radius: 999rem;
  background:
    radial-gradient(
      circle,
      color-mix(
        in oklch,
        oklch(95% 0.05 105) calc((0.56 - var(--weather-light-warmth) * 0.16) * 100%),
        oklch(90% 0.07 72)
      ),
      transparent 68%
    );
  opacity: var(--weather-highlight-opacity);
  transition: opacity 260ms var(--motion-ease);
}

.weather-atmosphere__asset {
  inset: 0;
  z-index: 2;
}

.weather-atmosphere__asset--depth {
  inset: -1.5%;
  z-index: 3;
}

.weather-atmosphere__asset--foreground {
  z-index: 4;
}

.weather-atmosphere__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.86;
  user-select: none;
}

.weather-atmosphere__image--base {
  object-position: var(--weather-atmosphere-object-position-desktop);
}

.weather-atmosphere__image--depth {
  object-position: var(--weather-atmosphere-depth-position);
}

.weather-atmosphere__image--foreground {
  object-position: var(--weather-atmosphere-foreground-position);
}

.weather-atmosphere__detail {
  top: 18%;
  right: 10%;
  z-index: 5;
  width: var(--weather-detail-size);
  aspect-ratio: 1.55;
  border-radius: 999rem;
  background:
    radial-gradient(
      ellipse at center,
      color-mix(in oklch, var(--weather-detail) 86%, transparent),
      transparent 68%
    );
  opacity: calc(0.28 + var(--weather-haze-opacity) * 0.7);
}

.weather-atmosphere__precipitation {
  inset: -22%;
  z-index: 6;
  background:
    repeating-linear-gradient(
      var(--weather-precipitation-angle),
      transparent 0 0.72rem,
      var(--weather-rain-layer) 0.72rem 0.78rem
    );
  opacity: max(
    var(--weather-precipitation-opacity),
    var(--weather-lighting-precipitation-opacity)
  );
  transform: translate3d(0, 0, 0);
}

.weather-atmosphere__precipitation::before {
  position: absolute;
  inset: 0;
  display: block;
  content: "";
  background:
    repeating-linear-gradient(
      calc(var(--weather-precipitation-angle) + 4deg),
      transparent 0 1.08rem,
      var(--weather-rain-layer-soft) 1.08rem 1.12rem
    );
  opacity: 0;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
}

.weather-atmosphere__contrast {
  inset: 0;
  z-index: 7;
  background:
    var(--weather-atmosphere-contrast),
    linear-gradient(
      90deg,
      color-mix(
        in oklch,
        oklch(19% 0.025 132) calc((var(--weather-night-depth) * 0.42 + var(--weather-cloud-shadow-opacity) * 0.24) * 100%),
        transparent
      ),
      transparent 70%
    ),
    radial-gradient(
      circle at 76% 82%,
      color-mix(
        in oklch,
        oklch(100% 0 0) calc(var(--weather-snow-light-opacity) * 26%),
        transparent
      ),
      transparent 58%
    ),
    linear-gradient(
      180deg,
      color-mix(
        in oklch,
        oklch(20% 0.02 244) calc(var(--weather-storm-shadow-opacity) * 42%),
        transparent
      ),
      transparent 76%
    );
}

.weather-atmosphere--drift-depth .weather-atmosphere__image--depth {
  animation: weather-atmosphere-depth-drift 42s linear infinite;
  will-change: transform;
}

.weather-atmosphere--motion-clear-glow .weather-atmosphere__detail {
  animation: weather-atmosphere-soft-glow 18s var(--motion-ease) infinite alternate;
  will-change: opacity, transform;
}

.weather-atmosphere--motion-partly-cloudy-gentle .weather-atmosphere__wash {
  animation: weather-atmosphere-haze-drift 42s linear infinite;
  will-change: transform;
}

.weather-atmosphere--motion-partly-cloudy-gentle .weather-atmosphere__highlight {
  animation: weather-atmosphere-soft-glow 18s var(--motion-ease) infinite alternate;
  will-change: opacity, transform;
}

.weather-atmosphere--motion-partly-cloudy-night-gentle .weather-atmosphere__image--base {
  animation: weather-atmosphere-night-base-drift 64s ease-in-out infinite alternate;
  will-change: transform;
}

.weather-atmosphere--motion-partly-cloudy-night-gentle .weather-atmosphere__highlight {
  animation: weather-atmosphere-night-glow 22s var(--motion-ease) infinite alternate;
  will-change: opacity, transform;
}

.weather-atmosphere--motion-overcast-drift .weather-atmosphere__wash {
  animation: weather-atmosphere-haze-drift 42s linear infinite;
  will-change: transform;
}

.weather-atmosphere--motion-fog .weather-atmosphere__detail {
  animation: weather-atmosphere-fog-drift 46s linear infinite;
  will-change: opacity, transform;
}

.weather-atmosphere--motion-storm-shadow .weather-atmosphere__horizon {
  animation: weather-atmosphere-storm-drift 28s var(--motion-ease) infinite alternate;
  will-change: opacity, transform;
}

.weather-atmosphere--motion-rain .weather-atmosphere__precipitation {
  animation: weather-atmosphere-rain-fall 1.28s linear infinite;
  will-change: transform;
}

.weather-atmosphere--motion-rain .weather-atmosphere__precipitation::before {
  animation: weather-atmosphere-rain-fall-soft 1.9s linear infinite;
  opacity: 0.62;
  will-change: transform;
}

.weather-atmosphere--motion-snow .weather-atmosphere__precipitation {
  background:
    radial-gradient(circle at 12% 20%, var(--weather-snow-layer) 0 0.08rem, transparent 0.1rem),
    radial-gradient(circle at 42% 64%, var(--weather-snow-layer-soft) 0 0.06rem, transparent 0.08rem),
    radial-gradient(circle at 74% 34%, var(--weather-snow-layer) 0 0.07rem, transparent 0.09rem),
    radial-gradient(circle at 88% 78%, var(--weather-snow-layer-soft) 0 0.06rem, transparent 0.08rem);
  background-size: 11rem 13rem;
  animation: weather-atmosphere-snow-fall 14s linear infinite;
  will-change: transform;
}

.weather-atmosphere--motion-snow .weather-atmosphere__precipitation::before {
  background:
    radial-gradient(circle at 22% 72%, var(--weather-snow-layer-soft) 0 0.06rem, transparent 0.08rem),
    radial-gradient(circle at 56% 18%, var(--weather-snow-layer) 0 0.07rem, transparent 0.09rem),
    radial-gradient(circle at 83% 52%, var(--weather-snow-layer-soft) 0 0.06rem, transparent 0.08rem);
  background-size: 14rem 15rem;
  opacity: 0.46;
  animation: weather-atmosphere-snow-fall-soft 18s linear infinite;
  will-change: transform;
}

.weather-atmosphere--clear-day {
  --weather-sky-start: oklch(93% 0.032 92);
  --weather-sky-end: oklch(87% 0.044 138);
  --weather-horizon: oklch(78% 0.052 132 / 42%);
  --weather-detail: oklch(88% 0.054 98 / 48%);
  --weather-detail-size: 12rem;
  --weather-detail-opacity: 0.48;
}

.weather-atmosphere--clear-night {
  --weather-sky-start: oklch(33% 0.035 258);
  --weather-sky-end: oklch(23% 0.03 248);
  --weather-horizon: oklch(62% 0.052 145 / 26%);
  --weather-detail: oklch(82% 0.028 86 / 18%);
  --weather-detail-size: 8rem;
  --weather-atmosphere-contrast: linear-gradient(
    90deg,
    oklch(20% 0.02 248 / 48%),
    transparent 62%
  );
}

.weather-atmosphere--partly-cloudy-day {
  --weather-sky-start: oklch(91% 0.027 116);
  --weather-sky-end: oklch(82% 0.034 155);
  --weather-horizon: oklch(72% 0.042 138 / 38%);
  --weather-detail: oklch(95% 0.012 105 / 62%);
  --weather-detail-size: 16rem;
}

.weather-atmosphere--partly-cloudy-night {
  --weather-sky-start: oklch(30% 0.035 258);
  --weather-sky-end: oklch(19% 0.03 248);
  --weather-horizon: oklch(64% 0.038 118 / 20%);
  --weather-detail: oklch(82% 0.018 104 / 16%);
  --weather-detail-size: 15rem;
  --weather-detail-opacity: 0.42;
  --weather-ambient-opacity: 0.2;
  --weather-highlight-opacity: 0.16;
  --weather-haze-opacity: 0.12;
  --weather-cloud-shadow-opacity: 0.32;
  --weather-contrast-strength: 0.54;
  --weather-night-depth: 0.28;
  --weather-atmosphere-contrast: linear-gradient(
    90deg,
    oklch(13% 0.018 244 / 50%),
    oklch(16% 0.02 244 / 24%) 42%,
    transparent 70%
  );
}

.weather-atmosphere--overcast {
  --weather-sky-start: oklch(84% 0.011 121);
  --weather-sky-end: oklch(74% 0.013 129);
  --weather-horizon: oklch(66% 0.025 138 / 34%);
  --weather-detail: oklch(92% 0.01 110 / 48%);
  --weather-detail-size: 18rem;
}

.weather-atmosphere--fog-haze {
  --weather-sky-start: oklch(88% 0.018 98);
  --weather-sky-end: oklch(77% 0.018 116);
  --weather-horizon: oklch(70% 0.026 122 / 34%);
  --weather-detail: oklch(94% 0.01 102 / 58%);
  --weather-detail-size: 20rem;
}

.weather-atmosphere--rain-day {
  --weather-sky-start: oklch(72% 0.018 177);
  --weather-sky-end: oklch(55% 0.022 199);
  --weather-horizon: oklch(58% 0.038 146 / 32%);
  --weather-detail: oklch(90% 0.014 180 / 24%);
  --weather-detail-size: 17rem;
  --weather-precipitation-opacity: 0.16;
  --weather-rain-layer: oklch(96% 0.006 180 / 22%);
  --weather-rain-layer-soft: oklch(96% 0.006 180 / 13%);
}

.weather-atmosphere--rain-night {
  --weather-sky-start: oklch(42% 0.022 214);
  --weather-sky-end: oklch(27% 0.026 238);
  --weather-horizon: oklch(54% 0.046 145 / 28%);
  --weather-detail: oklch(86% 0.016 166 / 16%);
  --weather-detail-size: 17rem;
  --weather-precipitation-opacity: 0.13;
  --weather-rain-layer: oklch(96% 0.006 180 / 18%);
  --weather-rain-layer-soft: oklch(96% 0.006 180 / 10%);
  --weather-atmosphere-contrast: linear-gradient(
    90deg,
    oklch(22% 0.02 232 / 52%),
    transparent 62%
  );
}

.weather-atmosphere--snow {
  --weather-sky-start: oklch(93% 0.01 115);
  --weather-sky-end: oklch(82% 0.012 148);
  --weather-horizon: oklch(72% 0.028 143 / 32%);
  --weather-detail: oklch(99% 0.004 106 / 74%);
  --weather-detail-size: 19rem;
  --weather-precipitation-opacity: 0.18;
  --weather-precipitation-angle: 180deg;
  --weather-snow-layer: oklch(100% 0 0 / 50%);
  --weather-snow-layer-soft: oklch(100% 0 0 / 30%);
}

.weather-atmosphere--thunderstorm {
  --weather-sky-start: oklch(37% 0.028 236);
  --weather-sky-end: oklch(24% 0.025 244);
  --weather-horizon: oklch(54% 0.046 145 / 28%);
  --weather-detail: oklch(86% 0.018 102 / 16%);
  --weather-detail-size: 16rem;
  --weather-precipitation-opacity: 0.12;
  --weather-atmosphere-contrast: linear-gradient(
    90deg,
    oklch(20% 0.02 242 / 52%),
    transparent 62%
  );
}

.weather-atmosphere--neutral {
  --weather-sky-start: var(--color-surface-raised);
  --weather-sky-end: var(--color-surface);
  --weather-horizon: color-mix(in oklch, var(--color-accent) 13%, transparent);
  --weather-detail: color-mix(in oklch, var(--color-accent) 14%, transparent);
}

@keyframes weather-atmosphere-depth-drift {
  from {
    transform: translate3d(-0.35rem, 0, 0);
  }

  to {
    transform: translate3d(0.45rem, -0.16rem, 0);
  }
}

@keyframes weather-atmosphere-soft-glow {
  from {
    opacity: 0.58;
    transform: translate3d(0, 0, 0);
  }

  to {
    opacity: 0.68;
    transform: translate3d(0.32rem, -0.18rem, 0);
  }
}

@keyframes weather-atmosphere-haze-drift {
  from {
    transform: translate3d(-0.5rem, 0, 0);
  }

  to {
    transform: translate3d(0.65rem, 0.12rem, 0);
  }
}

@keyframes weather-atmosphere-night-base-drift {
  from {
    transform: translate3d(-0.08rem, 0, 0) scale(1.004);
  }

  to {
    transform: translate3d(0.14rem, -0.06rem, 0) scale(1.01);
  }
}

@keyframes weather-atmosphere-night-glow {
  from {
    opacity: 0.12;
    transform: translate3d(0, 0, 0);
  }

  to {
    opacity: 0.18;
    transform: translate3d(0.12rem, -0.08rem, 0);
  }
}

@keyframes weather-atmosphere-fog-drift {
  from {
    opacity: 0.62;
    transform: translate3d(-0.45rem, 0, 0);
  }

  to {
    opacity: 0.72;
    transform: translate3d(0.55rem, 0.08rem, 0);
  }
}

@keyframes weather-atmosphere-storm-drift {
  from {
    opacity: 0.82;
    transform: translate3d(-0.28rem, 0.08rem, 0);
  }

  to {
    opacity: 0.68;
    transform: translate3d(0.34rem, -0.08rem, 0);
  }
}

@keyframes weather-atmosphere-rain-fall {
  from {
    transform: translate3d(0, -0.85rem, 0);
  }

  to {
    transform: translate3d(-0.2rem, 0.85rem, 0);
  }
}

@keyframes weather-atmosphere-rain-fall-soft {
  from {
    transform: translate3d(0.15rem, -1rem, 0);
  }

  to {
    transform: translate3d(-0.22rem, 1rem, 0);
  }
}

@keyframes weather-atmosphere-snow-fall {
  from {
    transform: translate3d(0, -1.2rem, 0);
  }

  to {
    transform: translate3d(0.45rem, 1.2rem, 0);
  }
}

@keyframes weather-atmosphere-snow-fall-soft {
  from {
    transform: translate3d(0.32rem, -1rem, 0);
  }

  to {
    transform: translate3d(-0.28rem, 1rem, 0);
  }
}

@media (max-width: 39.9375rem) {
  .weather-atmosphere__image--base {
    object-position: var(--weather-atmosphere-object-position-mobile);
  }

  .weather-atmosphere__contrast {
    background:
      linear-gradient(
        180deg,
        color-mix(in oklch, var(--weather-sky-start) 56%, transparent),
        transparent 64%
      );
  }
}

@media (prefers-reduced-motion: reduce) {
  .weather-atmosphere,
  .weather-atmosphere__wash,
  .weather-atmosphere__horizon,
  .weather-atmosphere__detail,
  .weather-atmosphere__ambient,
  .weather-atmosphere__highlight,
  .weather-atmosphere__precipitation,
  .weather-atmosphere__image {
    animation: none !important;
    transition: none !important;
    will-change: auto !important;
  }

  .weather-atmosphere__precipitation::before {
    animation: none !important;
    transition: none !important;
    will-change: auto !important;
  }
}

@media (forced-colors: active) {
  .weather-atmosphere {
    background: ButtonFace;
  }

  .weather-atmosphere__wash,
  .weather-atmosphere__horizon,
  .weather-atmosphere__ambient,
  .weather-atmosphere__highlight,
  .weather-atmosphere__detail,
  .weather-atmosphere__precipitation,
  .weather-atmosphere__precipitation::before,
  .weather-atmosphere__asset {
    display: none;
  }

  .weather-atmosphere__contrast {
    background: ButtonFace;
  }
}
</style>
