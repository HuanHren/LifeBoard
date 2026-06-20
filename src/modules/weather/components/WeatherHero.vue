<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'
import AirQualityBadge from '@/modules/weather/components/AirQualityBadge.vue'
import WeatherAtmosphere from '@/modules/weather/components/WeatherAtmosphere.vue'
import type { AirQualitySnapshot } from '@/modules/weather/types/airQuality'
import type { WeatherSnapshot } from '@/modules/weather/types/weather'
import {
  getWeatherAtmosphere,
  type WeatherAtmosphere as WeatherAtmosphereName,
} from '@/modules/weather/utils/weatherAtmosphere'
import {
  formatFullLocalTime,
  formatLocationName,
  formatTemperature,
} from '@/modules/weather/utils/weatherFormatting'
import { localizeWeatherCondition } from '@/modules/weather/utils/weatherI18n'

interface Props {
  weather: WeatherSnapshot
  airQuality?: AirQualitySnapshot | null
  motionMode?: 'initial' | 'snapshot'
}

const props = defineProps<Props>()
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

  return district && district !== cityName ? `${district} · ${cityName}` : cityName
}

function compactLocationName() {
  const { displayLabel, name, admin1, country, source } = props.weather.location
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
      return `${addressParts[0]} · ${addressParts[1]}`
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

const today = computed(() => props.weather.daily[0] ?? null)
const atmosphere = computed<WeatherAtmosphereName>(() => getWeatherAtmosphere(props.weather))
const currentCondition = computed(() =>
  localizeWeatherCondition(props.weather.current.condition, t),
)
const locationName = computed(() => compactLocationName())
const fullLocationName = computed(() => formatLocationName(props.weather.location))
const currentTemperatureValue = computed(() =>
  String(Math.round(props.weather.current.temperature)),
)
const currentTemperatureUnit = computed(() => props.weather.units.temperature)
const currentTemperature = computed(
  () => `${currentTemperatureValue.value}${currentTemperatureUnit.value}`,
)
const highTemperature = computed(() =>
  today.value
    ? formatTemperature(today.value.temperatureMax, props.weather.units.temperature)
    : null,
)
const lowTemperature = computed(() =>
  today.value
    ? formatTemperature(today.value.temperatureMin, props.weather.units.temperature)
    : null,
)
const updatedTime = computed(() =>
  t('weather.hero.updated', {
    time: formatFullLocalTime(props.weather.current.time, locale.value),
    timezone: props.weather.timezoneAbbreviation,
  }),
)
const providerLabel = computed(() =>
  props.weather.provider === 'caiyun'
    ? t('weather.hero.provider.caiyun')
    : t('weather.hero.provider.openMeteo'),
)
const heroSnapshotKey = computed(() =>
  [
    props.weather.provider,
    props.weather.location.id,
    props.weather.location.latitude,
    props.weather.location.longitude,
    props.weather.current.time,
    props.weather.current.condition.code,
    props.weather.current.isDay ? 'day' : 'night',
  ].join('|'),
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
</script>

<template>
  <section
    class="weather-hero relative isolate overflow-hidden rounded-[var(--radius-xl)] border border-[var(--weather-hero-border)] p-5 shadow-[var(--shadow-sm)] sm:p-6"
    aria-labelledby="weather-hero-title"
    :data-atmosphere="atmosphere"
    :data-motion="motionMode ?? 'initial'"
  >
    <WeatherAtmosphere :atmosphere="atmosphere" />

    <p class="sr-only">
      {{ screenReaderSummary }}
    </p>

    <div
      :key="heroSnapshotKey"
      class="weather-hero__content relative z-10"
    >
      <div class="weather-hero__item flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="text-caption text-[var(--weather-hero-muted)]">
            {{ t('weather.hero.locationLabel') }}
          </p>
          <h2
            id="weather-hero-title"
            class="mt-1 max-w-[18rem] truncate text-xl font-semibold text-[var(--weather-hero-text)] sm:max-w-none sm:text-2xl"
            :title="fullLocationName"
          >
            {{ locationName }}
          </h2>
        </div>

        <RouterLink
          class="interactive-surface inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--weather-hero-control-border)] bg-[var(--weather-hero-control-bg)] px-4 text-sm font-medium text-[var(--weather-hero-text)] hover:border-[var(--weather-hero-control-hover)] hover:bg-[var(--weather-hero-control-hover-bg)]"
          :to="{ name: 'weather-cities' }"
        >
          <span aria-hidden="true" class="text-lg leading-none">+</span>
          <span class="sr-only sm:not-sr-only sm:ml-2">
            {{ t('weather.hero.manageCities') }}
          </span>
        </RouterLink>
      </div>

      <div class="weather-hero__item weather-hero__item--temperature mt-7 sm:mt-8">
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

      <AirQualityBadge :air-quality="airQuality ?? null" />

      <div
        class="weather-hero__item weather-hero__item--conditions mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-base font-medium text-[var(--weather-hero-text)]"
      >
        <span>{{ currentCondition }}</span>
        <span
          v-if="highTemperature"
          aria-hidden="true"
          class="text-[var(--weather-hero-subtle)]"
        >
          ·
        </span>
        <span v-if="highTemperature">
          {{ t('weather.hero.high', { temperature: highTemperature }) }}
        </span>
        <span
          v-if="lowTemperature"
          aria-hidden="true"
          class="text-[var(--weather-hero-subtle)]"
        >
          ·
        </span>
        <span v-if="lowTemperature">
          {{ t('weather.hero.low', { temperature: lowTemperature }) }}
        </span>
      </div>

      <div
        class="weather-hero__item weather-hero__item--meta mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm leading-6 text-[var(--weather-hero-muted)]"
      >
        <span>{{ updatedTime }}</span>
        <span aria-hidden="true" class="text-[var(--weather-hero-subtle)]">·</span>
        <span>{{ providerLabel }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.weather-hero {
  --weather-hero-text: var(--color-text-primary);
  --weather-hero-muted: var(--color-text-secondary);
  --weather-hero-subtle: var(--color-text-tertiary);
  --weather-hero-border: var(--color-border-soft);
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
  --weather-hero-control-hover: var(--color-accent);
  --weather-hero-control-hover-bg: color-mix(
    in oklch,
    var(--color-surface-raised) 82%,
    var(--color-accent)
  );

  min-height: clamp(16rem, 26vw, 18.75rem);
  background: var(--color-surface-raised);
  transition:
    border-color var(--motion-base) var(--motion-ease),
    color var(--motion-base) var(--motion-ease);
}

.weather-hero[data-atmosphere='clear-night'],
.weather-hero[data-atmosphere='partly-cloudy-night'],
.weather-hero[data-atmosphere='rain-day'],
.weather-hero[data-atmosphere='rain-night'],
.weather-hero[data-atmosphere='thunderstorm'] {
  --weather-hero-text: oklch(97% 0.006 95);
  --weather-hero-muted: oklch(88% 0.015 100);
  --weather-hero-subtle: oklch(78% 0.02 112);
  --weather-hero-border: oklch(72% 0.04 140 / 26%);
  --weather-hero-control-bg: oklch(100% 0 0 / 12%);
  --weather-hero-control-border: oklch(100% 0 0 / 22%);
  --weather-hero-control-hover: oklch(91% 0.055 136);
  --weather-hero-control-hover-bg: oklch(100% 0 0 / 18%);
}

.weather-hero[data-atmosphere='overcast'],
.weather-hero[data-atmosphere='fog-haze'] {
  --weather-hero-text: oklch(23% 0.025 118);
  --weather-hero-muted: oklch(38% 0.024 118);
  --weather-hero-subtle: oklch(51% 0.023 118);
  --weather-hero-control-bg: oklch(100% 0 0 / 42%);
  --weather-hero-control-border: oklch(47% 0.035 126 / 28%);
}

.weather-hero[data-atmosphere='snow'] {
  --weather-hero-text: oklch(24% 0.024 136);
  --weather-hero-muted: oklch(39% 0.023 136);
  --weather-hero-subtle: oklch(52% 0.024 136);
  --weather-hero-control-bg: oklch(100% 0 0 / 48%);
  --weather-hero-control-border: oklch(47% 0.036 138 / 26%);
}

.weather-hero__item {
  animation: none;
}

.weather-hero[data-motion='initial'] .weather-hero__item {
  animation: weather-hero-enter 360ms var(--motion-ease) both;
}

.weather-hero[data-motion='initial'] .weather-hero__item--temperature {
  animation-delay: 45ms;
}

.weather-hero[data-motion='initial'] .weather-hero__item--conditions {
  animation-delay: 80ms;
}

.weather-hero[data-motion='initial'] .weather-hero__item--meta {
  animation-delay: 110ms;
}

.weather-hero[data-motion='snapshot'] .weather-hero__content {
  animation: weather-hero-snapshot var(--motion-base) var(--motion-ease) both;
}

@keyframes weather-hero-enter {
  from {
    opacity: 0;
    transform: translateY(0.28rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes weather-hero-snapshot {
  from {
    opacity: 0.78;
    transform: translateY(0.12rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .weather-hero,
  .weather-hero__content,
  .weather-hero__item {
    animation: none !important;
    transition: none !important;
  }
}
</style>
