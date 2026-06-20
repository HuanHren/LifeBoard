<script setup lang="ts">
import { computed } from 'vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import { useI18n } from '@/i18n/useI18n'
import type { TranslationKey } from '@/i18n/keys'
import {
  getAirQualityApiSource,
  getAirQualityModelSource,
} from '@/modules/weather/constants/weatherSources'
import type {
  AirQualityErrorKind,
  AirQualitySnapshot,
  AirQualityCategoryResult,
} from '@/modules/weather/types/airQuality'
import type { WeatherRequestStatus } from '@/modules/weather/types/weather'
import {
  formatAirQualityValue,
  getAirQualityCategory,
} from '@/modules/weather/utils/airQuality'
import { formatFullLocalTime } from '@/modules/weather/utils/weatherFormatting'

interface Props {
  airQuality: AirQualitySnapshot | null
  status: WeatherRequestStatus
  error: AirQualityErrorKind | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  retry: []
}>()
const { locale, t, formatNumber } = useI18n()

const apiSource = getAirQualityApiSource()
const modelSource = getAirQualityModelSource()

const categoryKeys = {
  'us-aqi': {
    good: 'weather.airQuality.category.us-aqi.good',
    moderate: 'weather.airQuality.category.us-aqi.moderate',
    sensitive: 'weather.airQuality.category.us-aqi.sensitive',
    unhealthy: 'weather.airQuality.category.us-aqi.unhealthy',
    veryUnhealthy: 'weather.airQuality.category.us-aqi.veryUnhealthy',
    hazardous: 'weather.airQuality.category.us-aqi.hazardous',
  },
  'european-aqi': {
    good: 'weather.airQuality.category.european-aqi.good',
    fair: 'weather.airQuality.category.european-aqi.fair',
    moderate: 'weather.airQuality.category.european-aqi.moderate',
    poor: 'weather.airQuality.category.european-aqi.poor',
    veryPoor: 'weather.airQuality.category.european-aqi.veryPoor',
    extremelyPoor: 'weather.airQuality.category.european-aqi.extremelyPoor',
  },
} as const satisfies Record<string, Record<string, TranslationKey>>

const guidanceKeys = {
  'us-aqi': {
    good: 'weather.airQuality.guidance.us-aqi.good',
    moderate: 'weather.airQuality.guidance.us-aqi.moderate',
    sensitive: 'weather.airQuality.guidance.us-aqi.sensitive',
    unhealthy: 'weather.airQuality.guidance.us-aqi.unhealthy',
    veryUnhealthy: 'weather.airQuality.guidance.us-aqi.veryUnhealthy',
    hazardous: 'weather.airQuality.guidance.us-aqi.hazardous',
  },
  'european-aqi': {
    good: 'weather.airQuality.guidance.european-aqi.good',
    fair: 'weather.airQuality.guidance.european-aqi.fair',
    moderate: 'weather.airQuality.guidance.european-aqi.moderate',
    poor: 'weather.airQuality.guidance.european-aqi.poor',
    veryPoor: 'weather.airQuality.guidance.european-aqi.veryPoor',
    extremelyPoor: 'weather.airQuality.guidance.european-aqi.extremelyPoor',
  },
} as const satisfies Record<string, Record<string, TranslationKey>>

const errorKeys = {
  network: 'weather.airQuality.error.network',
  unreadable: 'weather.airQuality.error.unreadable',
  status: 'weather.airQuality.error.status',
  serviceRejected: 'weather.airQuality.error.serviceRejected',
  incomplete: 'weather.airQuality.error.incomplete',
} as const satisfies Record<AirQualityErrorKind, TranslationKey>

function categoryTranslationKey(category: AirQualityCategoryResult) {
  return category.scale === 'us-aqi'
    ? categoryKeys['us-aqi'][category.categoryId]
    : categoryKeys['european-aqi'][category.categoryId]
}

function guidanceTranslationKey(category: AirQualityCategoryResult) {
  return category.scale === 'us-aqi'
    ? guidanceKeys['us-aqi'][category.categoryId]
    : guidanceKeys['european-aqi'][category.categoryId]
}

const primaryScale = computed(() => {
  if (!props.airQuality) {
    return null
  }

  return props.airQuality.usAqi !== null ? 'us-aqi' : 'european-aqi'
})
const primaryValue = computed(() => {
  if (!props.airQuality || !primaryScale.value) {
    return null
  }

  return primaryScale.value === 'us-aqi'
    ? props.airQuality.usAqi
    : props.airQuality.europeanAqi
})
const primaryCategory = computed(() =>
  primaryScale.value ? getAirQualityCategory(primaryScale.value, primaryValue.value) : null,
)
const secondaryCategory = computed(() =>
  props.airQuality?.europeanAqi !== null && props.airQuality?.europeanAqi !== undefined
    ? getAirQualityCategory('european-aqi', props.airQuality.europeanAqi)
    : null,
)
const primaryScaleLabel = computed(() =>
  primaryScale.value === 'us-aqi'
    ? t('weather.airQuality.scale.us')
    : t('weather.airQuality.scale.european'),
)
const observedTime = computed(() =>
  props.airQuality
    ? t('weather.airQuality.observedAt', {
        time: formatFullLocalTime(props.airQuality.observedAt, locale.value),
        timezone: props.airQuality.timezone,
      })
    : '',
)
const errorMessage = computed(() =>
  props.error
    ? t(errorKeys[props.error])
    : t('weather.airQuality.error.network'),
)
const apiSourceLinkLabel = computed(() =>
  t('weather.airQuality.sourceLinkLabel', {
    provider: apiSource.displayName,
  }),
)
const modelSourceLinkLabel = computed(() =>
  t('weather.airQuality.modelLinkLabel', {
    provider: modelSource.displayName,
  }),
)
const licenceLinkLabel = computed(() =>
  apiSource.licenceLabel
    ? t('weather.attribution.licenceLinkLabel', {
        licence: apiSource.licenceLabel,
      })
    : '',
)

function categoryLabel(category: AirQualityCategoryResult | null) {
  return category
    ? t(categoryTranslationKey(category))
    : t('weather.airQuality.unavailable')
}

function guidanceLabel(category: AirQualityCategoryResult | null) {
  return category
    ? t(guidanceTranslationKey(category))
    : t('weather.airQuality.guidance.unavailable')
}

function formatPollutantValue(value: number | null, unit: string | null) {
  if (value === null) {
    return t('weather.airQuality.pollutantUnavailable')
  }

  const formatted = formatNumber(value, {
    maximumFractionDigits: value < 10 ? 1 : 0,
  })

  return unit ? `${formatted} ${unit}` : formatted
}

const pollutantRows = computed(() => {
  if (!props.airQuality) {
    return []
  }

  const { airQuality } = props

  return [
    {
      id: 'pm25',
      label: t('weather.airQuality.pollutant.pm25'),
      value: formatPollutantValue(airQuality.pm25, airQuality.units.pm25),
    },
    {
      id: 'pm10',
      label: t('weather.airQuality.pollutant.pm10'),
      value: formatPollutantValue(airQuality.pm10, airQuality.units.pm10),
    },
    {
      id: 'ozone',
      label: t('weather.airQuality.pollutant.ozone'),
      value: formatPollutantValue(airQuality.ozone, airQuality.units.ozone),
    },
    {
      id: 'nitrogen-dioxide',
      label: t('weather.airQuality.pollutant.nitrogenDioxide'),
      value: formatPollutantValue(
        airQuality.nitrogenDioxide,
        airQuality.units.nitrogenDioxide,
      ),
    },
    {
      id: 'sulphur-dioxide',
      label: t('weather.airQuality.pollutant.sulphurDioxide'),
      value: formatPollutantValue(
        airQuality.sulphurDioxide,
        airQuality.units.sulphurDioxide,
      ),
    },
    {
      id: 'carbon-monoxide',
      label: t('weather.airQuality.pollutant.carbonMonoxide'),
      value: formatPollutantValue(
        airQuality.carbonMonoxide,
        airQuality.units.carbonMonoxide,
      ),
    },
  ]
})
</script>

<template>
  <section
    v-if="status !== 'idle'"
    aria-labelledby="weather-air-quality-title"
    class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-xs)] sm:p-5"
  >
    <div class="max-w-2xl">
      <h2
        id="weather-air-quality-title"
        class="text-section-title text-balance text-[var(--color-text-primary)]"
      >
        {{ t('weather.airQuality.title') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ t('weather.airQuality.description') }}
      </p>
    </div>

    <div
      v-if="status === 'loading'"
      class="mt-5"
      aria-live="polite"
    >
      <p class="sr-only">{{ t('weather.airQuality.loading') }}</p>
      <BaseSkeleton class="h-32 rounded-[var(--radius-md)]" />
    </div>

    <div
      v-else-if="status === 'error'"
      class="mt-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      role="status"
    >
      <p class="text-sm font-medium text-[var(--color-text-primary)]">
        {{ t('weather.airQuality.unavailableTitle') }}
      </p>
      <p class="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
        {{ errorMessage }}
      </p>
      <button
        class="interactive-surface mt-4 inline-flex min-h-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] px-4 text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
        type="button"
        @click="emit('retry')"
      >
        {{ t('weather.airQuality.retry') }}
      </button>
    </div>

    <div v-else-if="airQuality" class="mt-5 space-y-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-caption text-[var(--color-text-secondary)]">
            {{ primaryScaleLabel }}
          </p>
          <p class="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span class="text-3xl font-semibold tabular-nums text-[var(--color-text-primary)]">
              {{ formatAirQualityValue(primaryValue) ?? t('weather.airQuality.unavailable') }}
            </span>
            <span class="text-base font-medium text-[var(--color-text-primary)]">
              {{ categoryLabel(primaryCategory) }}
            </span>
          </p>
        </div>
        <p
          v-if="airQuality.europeanAqi !== null"
          class="text-sm leading-6 text-[var(--color-text-secondary)]"
        >
          {{ t('weather.airQuality.europeanSummary', {
            value: formatAirQualityValue(airQuality.europeanAqi) ?? t('weather.airQuality.unavailable'),
            category: categoryLabel(secondaryCategory),
          }) }}
        </p>
      </div>

      <p class="max-w-2xl text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ guidanceLabel(primaryCategory) }}
      </p>

      <p class="text-caption text-[var(--color-text-tertiary)]">
        {{ observedTime }}
      </p>

      <dl class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="item in pollutantRows"
          :key="item.id"
          class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-3"
        >
          <dt class="text-caption text-[var(--color-text-secondary)]">
            {{ item.label }}
          </dt>
          <dd class="mt-1 text-sm font-medium text-[var(--color-text-primary)]">
            {{ item.value }}
          </dd>
        </div>
      </dl>

      <p class="border-t border-[var(--color-border-soft)] pt-4 text-caption leading-5 text-pretty text-[var(--color-text-secondary)]">
        {{ t('weather.airQuality.sourcePrefix') }}
        <a
          v-if="apiSource.officialUrl"
          class="font-medium text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
          :aria-label="apiSourceLinkLabel"
          :href="apiSource.officialUrl"
          rel="noreferrer"
          target="_blank"
        >
          {{ apiSource.displayName }}
        </a>
        <template v-if="apiSource.licenceLabel && apiSource.licenceUrl">
          {{ t('weather.attribution.licencePrefix') }}
          <a
            class="font-medium text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
            :aria-label="licenceLinkLabel"
            :href="apiSource.licenceUrl"
            rel="noreferrer"
            target="_blank"
          >
            {{ apiSource.licenceLabel }}
          </a>
        </template>
        {{ t('weather.airQuality.modelPrefix') }}
        <a
          v-if="modelSource.officialUrl"
          class="font-medium text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
          :aria-label="modelSourceLinkLabel"
          :href="modelSource.officialUrl"
          rel="noreferrer"
          target="_blank"
        >
          {{ modelSource.displayName }}
        </a>
      </p>
    </div>
  </section>
</template>
