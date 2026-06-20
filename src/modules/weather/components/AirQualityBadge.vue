<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import type { TranslationKey } from '@/i18n/keys'
import type {
  AirQualityCategoryResult,
  AirQualitySnapshot,
} from '@/modules/weather/types/airQuality'
import {
  formatAirQualityValue,
  getAirQualityCategory,
} from '@/modules/weather/utils/airQuality'

interface Props {
  airQuality: AirQualitySnapshot | null
}

const props = defineProps<Props>()
const { t } = useI18n()

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

function categoryTranslationKey(category: AirQualityCategoryResult) {
  return category.scale === 'us-aqi'
    ? categoryKeys['us-aqi'][category.categoryId]
    : categoryKeys['european-aqi'][category.categoryId]
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
const category = computed(() =>
  primaryScale.value ? getAirQualityCategory(primaryScale.value, primaryValue.value) : null,
)
const valueLabel = computed(() => formatAirQualityValue(primaryValue.value))
const scaleLabel = computed(() =>
  primaryScale.value === 'us-aqi'
    ? t('weather.airQuality.scale.us')
    : t('weather.airQuality.scale.european'),
)
const categoryLabel = computed(() =>
  category.value
    ? t(categoryTranslationKey(category.value))
    : '',
)
const accessibleSummary = computed(() =>
  valueLabel.value && category.value
    ? t('weather.airQuality.badgeSummary', {
        scale: scaleLabel.value,
        value: valueLabel.value,
        category: categoryLabel.value,
      })
    : '',
)
</script>

<template>
  <p
    v-if="valueLabel && category"
    class="weather-air-quality-badge weather-hero__item mt-4 inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-[var(--radius-md)] border border-[var(--weather-hero-control-border)] bg-[var(--weather-hero-control-bg)] px-3 py-2 text-sm font-medium text-[var(--weather-hero-text)]"
    :aria-label="accessibleSummary"
  >
    <span>{{ scaleLabel }}</span>
    <span class="tabular-nums">{{ valueLabel }}</span>
    <span aria-hidden="true" class="text-[var(--weather-hero-subtle)]">·</span>
    <span>{{ categoryLabel }}</span>
  </p>
</template>
