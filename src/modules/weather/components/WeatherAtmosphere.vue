<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  getWeatherAtmosphereAssets,
  type WeatherAtmosphereAssetSource,
} from '@/modules/weather/constants/weatherAtmosphereAssets'
import type { WeatherAtmosphere } from '@/modules/weather/utils/weatherAtmosphere'

interface Props {
  atmosphere: WeatherAtmosphere
}

type AtmosphereLayer = 'base' | 'depth' | 'foreground'

const props = defineProps<Props>()
const failedLayers = ref<Set<AtmosphereLayer>>(new Set())

const assetSet = computed(() => getWeatherAtmosphereAssets(props.atmosphere))
const baseDesktopSource = computed(() => assetSet.value.base?.desktop)
const baseMobileSource = computed(() => assetSet.value.base?.mobile)
const baseFallbackSource = computed(
  () =>
    baseDesktopSource.value?.webp ??
    baseDesktopSource.value?.avif ??
    baseDesktopSource.value?.png ??
    baseMobileSource.value?.webp ??
    baseMobileSource.value?.avif ??
    baseMobileSource.value?.png ??
    null,
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
const canDriftDepth = computed(
  () => Boolean(assetSet.value.shouldDriftDepth) && hasDepthAsset.value,
)
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
}))

function hasLayerSource(source: WeatherAtmosphereAssetSource | undefined) {
  return Boolean(source?.webp || source?.avif || source?.png)
}

function markLayerFailed(layer: AtmosphereLayer) {
  failedLayers.value = new Set(failedLayers.value).add(layer)
}
</script>

<template>
  <div
    aria-hidden="true"
    class="weather-atmosphere"
    :class="[
      assetSet.fallbackClass,
      {
        'weather-atmosphere--has-assets': hasAnyAsset,
        'weather-atmosphere--drift-depth': canDriftDepth,
      },
    ]"
    :data-atmosphere="atmosphere"
    :style="atmosphereStyle"
  >
    <span class="weather-atmosphere__wash" />
    <span class="weather-atmosphere__horizon" />

    <picture
      v-if="hasBaseAsset"
      class="weather-atmosphere__asset weather-atmosphere__asset--base"
    >
      <source
        v-if="baseMobileSource?.avif"
        :srcset="baseMobileSource.avif"
        media="(max-width: 639px)"
        type="image/avif"
      >
      <source
        v-if="baseMobileSource?.webp"
        :srcset="baseMobileSource.webp"
        media="(max-width: 639px)"
        type="image/webp"
      >
      <source
        v-if="baseMobileSource?.png"
        :srcset="baseMobileSource.png"
        media="(max-width: 639px)"
        type="image/png"
      >
      <source
        v-if="baseDesktopSource?.avif"
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
        alt=""
        class="weather-atmosphere__image weather-atmosphere__image--base"
        decoding="async"
        fetchpriority="high"
        :src="baseFallbackSource ?? ''"
        @error="markLayerFailed('base')"
      >
    </picture>

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
  --weather-precipitation-angle: 168deg;
  --weather-atmosphere-object-position-desktop: center center;
  --weather-atmosphere-object-position-mobile: center center;
  --weather-atmosphere-depth-position: center center;
  --weather-atmosphere-foreground-position: center bottom;
  --weather-atmosphere-contrast: linear-gradient(
    90deg,
    color-mix(in oklch, var(--weather-sky-start) 74%, transparent),
    transparent 58%
  );

  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    linear-gradient(140deg, var(--weather-sky-start), var(--weather-sky-end));
}

.weather-atmosphere__wash,
.weather-atmosphere__horizon,
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
      circle at 14% 18%,
      color-mix(in oklch, var(--weather-detail) 64%, transparent),
      transparent 36%
    );
  opacity: var(--weather-detail-opacity);
}

.weather-atmosphere__horizon {
  right: -12%;
  bottom: -34%;
  z-index: 1;
  width: min(36rem, 82vw);
  aspect-ratio: 1;
  border-radius: 999rem;
  background: radial-gradient(circle, var(--weather-horizon), transparent 68%);
}

.weather-atmosphere__asset {
  inset: 0;
  z-index: 2;
}

.weather-atmosphere__asset--depth {
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
  opacity: 0.72;
}

.weather-atmosphere__precipitation {
  inset: -18%;
  z-index: 6;
  background:
    repeating-linear-gradient(
      var(--weather-precipitation-angle),
      transparent 0 0.72rem,
      color-mix(in oklch, var(--color-text-inverse) 38%, transparent) 0.72rem 0.78rem
    );
  opacity: var(--weather-precipitation-opacity);
  transform: translate3d(0, 0, 0);
}

.weather-atmosphere__contrast {
  inset: 0;
  z-index: 7;
  background: var(--weather-atmosphere-contrast);
}

.weather-atmosphere--drift-depth .weather-atmosphere__image--depth {
  animation: weather-atmosphere-depth-drift 16s var(--motion-ease) infinite alternate;
}

.weather-atmosphere--clear-day {
  --weather-sky-start: oklch(93% 0.032 92);
  --weather-sky-end: oklch(87% 0.044 138);
  --weather-horizon: oklch(78% 0.052 132 / 42%);
  --weather-detail: oklch(88% 0.054 98 / 48%);
  --weather-detail-size: 12rem;
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
  --weather-sky-start: oklch(36% 0.033 250);
  --weather-sky-end: oklch(25% 0.027 242);
  --weather-horizon: oklch(58% 0.048 144 / 24%);
  --weather-detail: oklch(78% 0.018 104 / 18%);
  --weather-detail-size: 15rem;
  --weather-atmosphere-contrast: linear-gradient(
    90deg,
    oklch(21% 0.02 244 / 48%),
    transparent 62%
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
}

.weather-atmosphere--rain-night {
  --weather-sky-start: oklch(42% 0.022 214);
  --weather-sky-end: oklch(27% 0.026 238);
  --weather-horizon: oklch(54% 0.046 145 / 28%);
  --weather-detail: oklch(86% 0.016 166 / 16%);
  --weather-detail-size: 17rem;
  --weather-precipitation-opacity: 0.13;
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
  --weather-precipitation-opacity: 0.12;
  --weather-precipitation-angle: 180deg;
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
    transform: translate3d(-0.4rem, 0, 0) scale(1.01);
  }

  to {
    transform: translate3d(0.45rem, -0.2rem, 0) scale(1.015);
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
  .weather-atmosphere__precipitation,
  .weather-atmosphere__image {
    animation: none !important;
    transition: none !important;
  }
}

@media (forced-colors: active) {
  .weather-atmosphere {
    background: ButtonFace;
  }

  .weather-atmosphere__wash,
  .weather-atmosphere__horizon,
  .weather-atmosphere__detail,
  .weather-atmosphere__precipitation,
  .weather-atmosphere__asset {
    display: none;
  }

  .weather-atmosphere__contrast {
    background: ButtonFace;
  }
}
</style>
