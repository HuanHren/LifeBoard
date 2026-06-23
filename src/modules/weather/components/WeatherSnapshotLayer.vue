<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import AirQualityBadge from '@/modules/weather/components/AirQualityBadge.vue'
import WeatherAtmosphere from '@/modules/weather/components/WeatherAtmosphere.vue'
import type { WeatherArtworkReadiness } from '@/modules/weather/composables/useWeatherSnapshotTransition'
import type { WeatherLighting } from '@/modules/weather/types/weatherLighting'
import type { WeatherSolarPhaseResult } from '@/modules/weather/types/weatherSolarPhase'
import type { WeatherVisualSnapshot } from '@/modules/weather/types/weatherVisualSnapshot'
import {
  formatFullLocalTime,
  formatLocationName,
  formatTemperature,
} from '@/modules/weather/utils/weatherFormatting'
import { localizeWeatherCondition } from '@/modules/weather/utils/weatherI18n'

interface Props {
  snapshot: WeatherVisualSnapshot
  active?: boolean
  lightingResult?: WeatherLighting
  solarPhaseResult?: WeatherSolarPhaseResult
  visualState: 'stable' | 'outgoing' | 'incoming'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  baseArtworkReady: [readiness: WeatherArtworkReadiness]
}>()
const { locale, t } = useI18n()

function isConciseLabel(value: string) {
  return value.trim().length > 0 && value.trim().length <= 28
}

function firstUsefulAddressParts(value: string) {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !['China', 'CN'].includes(part))
}

function compactChineseAddress(value: string, cityName: string) {
  const cityIndex = value.indexOf(cityName)

  if (cityIndex === -1) {
    return null
  }

  const afterCity = value.slice(cityIndex + cityName.length)
  const district = afterCity.match(/[^省市区县]+[区县市]/)?.[0] ?? null

  return district && district !== cityName ? `${district} / ${cityName}` : cityName
}

function compactLocationName() {
  const { displayLabel, name, admin1, country, source } = props.snapshot.weather.location
  const fallbackCurrentLocation = t('home.weather.currentLocationLabel')
  const fallbackLabel = name.trim() || fallbackCurrentLocation
  const label = displayLabel?.trim() ?? ''

  if (
    source === 'amap-geolocation' &&
    label.length > 0 &&
    label !== fallbackCurrentLocation
  ) {
    const compactChinese = compactChineseAddress(label, fallbackLabel)

    if (compactChinese) {
      return compactChinese
    }

    const addressParts = firstUsefulAddressParts(label)

    if (addressParts.length >= 2) {
      return `${addressParts[0]} / ${addressParts[1]}`
    }

    if (isConciseLabel(label)) {
      return label
    }
  }

  if (label.length > 0 && label !== fallbackCurrentLocation && isConciseLabel(label)) {
    return label
  }

  if (admin1 && admin1 !== fallbackLabel) {
    return `${fallbackLabel}, ${admin1}`
  }

  if (country && country !== fallbackLabel) {
    return `${fallbackLabel}, ${country}`
  }

  return fallbackLabel
}

const today = computed(() => props.snapshot.weather.daily[0] ?? null)
const currentCondition = computed(() =>
  localizeWeatherCondition(props.snapshot.weather.current.condition, t),
)
const locationName = computed(() => compactLocationName())
const fullLocationName = computed(() => formatLocationName(props.snapshot.weather.location))
const currentTemperatureValue = computed(() =>
  String(Math.round(props.snapshot.weather.current.temperature)),
)
const currentTemperatureUnit = computed(() => props.snapshot.weather.units.temperature)
const currentTemperature = computed(
  () => `${currentTemperatureValue.value}${currentTemperatureUnit.value}`,
)
const highTemperature = computed(() =>
  today.value
    ? formatTemperature(today.value.temperatureMax, props.snapshot.weather.units.temperature)
    : null,
)
const lowTemperature = computed(() =>
  today.value
    ? formatTemperature(today.value.temperatureMin, props.snapshot.weather.units.temperature)
    : null,
)
const updatedTime = computed(() =>
  t('weather.hero.updated', {
    time: formatFullLocalTime(props.snapshot.weather.current.time, locale.value),
    timezone: props.snapshot.weather.timezoneAbbreviation,
  }),
)
const providerLabel = computed(() =>
  props.snapshot.weather.provider === 'caiyun'
    ? t('weather.hero.provider.caiyun')
    : t('weather.hero.provider.openMeteo'),
)
const screenReaderSummary = computed(() =>
  t('weather.hero.summary', {
    location: locationName.value,
    temperature: currentTemperature.value,
    condition: currentCondition.value,
    high: highTemperature.value ?? t('weather.value.unavailable'),
    low: lowTemperature.value ?? t('weather.value.unavailable'),
  }),
)
const effectiveSolarPhase = computed(
  () => props.solarPhaseResult ?? props.snapshot.solarPhase,
)
const effectiveLighting = computed(
  () => props.lightingResult ?? props.snapshot.lighting,
)
</script>

<template>
  <div
    class="weather-snapshot-layer"
    :aria-hidden="active ? undefined : 'true'"
    :data-atmosphere="snapshot.atmosphere"
    :data-content-tone="snapshot.visual.contentTone"
    :data-solar-phase="effectiveSolarPhase.phase"
    :data-solar-phase-source="effectiveSolarPhase.source"
    :data-visual-state="visualState"
  >
    <WeatherAtmosphere
      :atmosphere="snapshot.atmosphere"
      :lighting="effectiveLighting"
      :visual="snapshot.visual"
      :visual-state="visualState"
      @base-ready="emit('baseArtworkReady', $event)"
    />

    <p v-if="active" class="sr-only">
      {{ screenReaderSummary }}
    </p>

    <div class="weather-snapshot-layer__content relative z-10">
      <div class="weather-snapshot-layer__item">
        <div class="min-w-0 pr-24 sm:pr-40">
          <p class="text-caption text-[var(--weather-hero-muted)]">
            {{ t('weather.hero.locationLabel') }}
          </p>
          <h2
            :id="active ? 'weather-hero-title' : undefined"
            class="mt-1 max-w-[18rem] truncate text-xl font-semibold text-[var(--weather-hero-text)] sm:max-w-none sm:text-2xl"
            :title="fullLocationName"
          >
            {{ locationName }}
          </h2>
        </div>
      </div>

      <div class="weather-snapshot-layer__item weather-snapshot-layer__item--temperature mt-7 sm:mt-8">
        <p
          class="flex items-start text-[var(--weather-hero-text)]"
          :aria-label="currentTemperature"
        >
          <span
            class="text-[clamp(4.25rem,14vw,7rem)] font-semibold leading-[0.88] tracking-normal tabular-nums"
          >
            {{ currentTemperatureValue }}
          </span>
          <span
            class="mt-1.5 text-[clamp(1.5rem,4vw,2.35rem)] font-semibold leading-none tracking-normal sm:mt-2"
            aria-hidden="true"
          >
            {{ currentTemperatureUnit }}
          </span>
        </p>
      </div>

      <AirQualityBadge :air-quality="snapshot.airQuality" />

      <div
        class="weather-snapshot-layer__item weather-snapshot-layer__item--conditions mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-base font-medium text-[var(--weather-hero-text)]"
      >
        <span>{{ currentCondition }}</span>
        <span
          v-if="highTemperature"
          aria-hidden="true"
          class="text-[var(--weather-hero-subtle)]"
        >
          /
        </span>
        <span v-if="highTemperature">
          {{ t('weather.hero.high', { temperature: highTemperature }) }}
        </span>
        <span
          v-if="lowTemperature"
          aria-hidden="true"
          class="text-[var(--weather-hero-subtle)]"
        >
          /
        </span>
        <span v-if="lowTemperature">
          {{ t('weather.hero.low', { temperature: lowTemperature }) }}
        </span>
      </div>

      <div
        class="weather-snapshot-layer__item weather-snapshot-layer__item--meta mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm leading-6 text-[var(--weather-hero-muted)]"
      >
        <span>{{ updatedTime }}</span>
        <span aria-hidden="true" class="text-[var(--weather-hero-subtle)]">/</span>
        <span>{{ providerLabel }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weather-snapshot-layer {
  --weather-hero-text: var(--color-text-primary);
  --weather-hero-muted: var(--color-text-secondary);
  --weather-hero-subtle: var(--color-text-tertiary);
  --weather-hero-control-bg: color-mix(
    in oklch,
    var(--color-surface-raised) 88%,
    transparent
  );
  --weather-hero-control-border: color-mix(
    in oklch,
    var(--color-control-border) 78%,
    transparent
  );

  position: relative;
  min-height: inherit;
  overflow: hidden;
  pointer-events: none;
}

.weather-snapshot-layer[data-atmosphere='clear-night'],
.weather-snapshot-layer[data-atmosphere='partly-cloudy-night'],
.weather-snapshot-layer[data-atmosphere='rain-day'],
.weather-snapshot-layer[data-atmosphere='rain-night'],
.weather-snapshot-layer[data-atmosphere='thunderstorm'] {
  --weather-hero-text: oklch(97% 0.006 95);
  --weather-hero-muted: oklch(88% 0.015 100);
  --weather-hero-subtle: oklch(78% 0.02 112);
  --weather-hero-control-bg: oklch(100% 0 0 / 12%);
  --weather-hero-control-border: oklch(100% 0 0 / 22%);
}

.weather-snapshot-layer[data-atmosphere='overcast'],
.weather-snapshot-layer[data-atmosphere='fog-haze'] {
  --weather-hero-text: oklch(23% 0.025 118);
  --weather-hero-muted: oklch(38% 0.024 118);
  --weather-hero-subtle: oklch(51% 0.023 118);
  --weather-hero-control-bg: oklch(100% 0 0 / 42%);
  --weather-hero-control-border: oklch(47% 0.035 126 / 28%);
}

.weather-snapshot-layer[data-atmosphere='snow'] {
  --weather-hero-text: oklch(24% 0.024 136);
  --weather-hero-muted: oklch(39% 0.023 136);
  --weather-hero-subtle: oklch(52% 0.024 136);
  --weather-hero-control-bg: oklch(100% 0 0 / 48%);
  --weather-hero-control-border: oklch(47% 0.036 138 / 26%);
}

.weather-snapshot-layer__content {
  padding: 1.25rem;
}

.weather-snapshot-layer__item {
  animation: none;
}

.weather-snapshot-layer[data-visual-state='incoming'] .weather-snapshot-layer__content {
  animation: weather-snapshot-content-settle 200ms var(--motion-ease) both;
}

@keyframes weather-snapshot-content-settle {
  from {
    opacity: 0.92;
    transform: translate3d(0, 0.25rem, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@media (min-width: 40rem) {
  .weather-snapshot-layer__content {
    padding: 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .weather-snapshot-layer__content {
    animation: none !important;
    transition: none !important;
  }
}

@media (forced-colors: active) {
  .weather-snapshot-layer {
    --weather-hero-text: CanvasText;
    --weather-hero-muted: CanvasText;
    --weather-hero-subtle: CanvasText;
    --weather-hero-control-bg: ButtonFace;
    --weather-hero-control-border: ButtonText;
  }
}
</style>
