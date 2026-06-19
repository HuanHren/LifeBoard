<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'
import type { WeatherSnapshot } from '@/modules/weather/types/weather'
import {
  formatFullLocalTime,
  formatLocationName,
  formatTemperature,
} from '@/modules/weather/utils/weatherFormatting'
import { localizeWeatherCondition } from '@/modules/weather/utils/weatherI18n'

interface Props {
  weather: WeatherSnapshot
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
    class="weather-hero overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-sm)] sm:p-6"
    aria-labelledby="weather-hero-title"
  >
    <p class="sr-only">
      {{ screenReaderSummary }}
    </p>

    <div class="weather-hero__item flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="text-caption text-[var(--color-text-secondary)]">
          {{ t('weather.hero.locationLabel') }}
        </p>
        <h2
          id="weather-hero-title"
          class="mt-1 max-w-[18rem] truncate text-xl font-semibold text-[var(--color-text-primary)] sm:max-w-none sm:text-2xl"
          :title="fullLocationName"
        >
          {{ locationName }}
        </h2>
      </div>

      <RouterLink
        class="interactive-surface inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] px-4 text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
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
        class="flex items-start text-[var(--color-text-primary)]"
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

    <div
      class="weather-hero__item weather-hero__item--conditions mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-base font-medium text-[var(--color-text-primary)]"
    >
      <span>{{ currentCondition }}</span>
      <span v-if="highTemperature" aria-hidden="true" class="text-[var(--color-text-tertiary)]">
        ·
      </span>
      <span v-if="highTemperature">
        {{ t('weather.hero.high', { temperature: highTemperature }) }}
      </span>
      <span v-if="lowTemperature" aria-hidden="true" class="text-[var(--color-text-tertiary)]">
        ·
      </span>
      <span v-if="lowTemperature">
        {{ t('weather.hero.low', { temperature: lowTemperature }) }}
      </span>
    </div>

    <div
      class="weather-hero__item weather-hero__item--meta mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm leading-6 text-[var(--color-text-secondary)]"
    >
      <span>{{ updatedTime }}</span>
      <span aria-hidden="true" class="text-[var(--color-text-tertiary)]">·</span>
      <span>{{ providerLabel }}</span>
    </div>
  </section>
</template>

<style scoped>
.weather-hero {
  min-height: clamp(16rem, 26vw, 18.75rem);
}

.weather-hero__item {
  animation: weather-hero-enter var(--motion-standard) var(--motion-ease) both;
}

.weather-hero__item--temperature {
  animation-delay: 60ms;
}

.weather-hero__item--conditions {
  animation-delay: 110ms;
}

.weather-hero__item--meta {
  animation-delay: 150ms;
}

@keyframes weather-hero-enter {
  from {
    opacity: 0;
    transform: translateY(0.35rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .weather-hero__item {
    animation: none;
  }
}
</style>
