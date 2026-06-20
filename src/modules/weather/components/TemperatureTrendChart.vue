<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import type { DailyForecastItem, WeatherUnits } from '@/modules/weather/types/weather'
import { formatTemperature } from '@/modules/weather/utils/weatherFormatting'
import {
  LONG_RANGE_DAY_WIDTH,
  TEMPERATURE_TREND_HEIGHT,
  createTemperatureTrendPoints,
  createTemperatureTrendSegments,
  polylinePoints,
} from '@/modules/weather/utils/temperatureTrend'

interface Props {
  items: DailyForecastItem[]
  units: WeatherUnits
}

const props = defineProps<Props>()
const { t } = useI18n()

const chartWidth = computed(() =>
  Math.max(LONG_RANGE_DAY_WIDTH, props.items.length * LONG_RANGE_DAY_WIDTH),
)
const highSeries = computed(() =>
  props.items.map((item, index) => ({
    index,
    value: item.temperatureMax,
  })),
)
const lowSeries = computed(() =>
  props.items.map((item, index) => ({
    index,
    value: item.temperatureMin,
  })),
)
const highSegments = computed(() =>
  createTemperatureTrendSegments(highSeries.value, chartWidth.value),
)
const lowSegments = computed(() =>
  createTemperatureTrendSegments(lowSeries.value, chartWidth.value),
)
const highPoints = computed(() =>
  createTemperatureTrendPoints(highSeries.value, chartWidth.value),
)
const lowPoints = computed(() =>
  createTemperatureTrendPoints(lowSeries.value, chartWidth.value),
)
const summary = computed(() => {
  const highs = props.items.map((item) => item.temperatureMax)
  const lows = props.items.map((item) => item.temperatureMin)
  const highest = Math.max(...highs)
  const lowest = Math.min(...lows)

  return t('weather.longRange.trendSummary', {
    count: props.items.length,
    high: formatTemperature(highest, props.units.temperature),
    low: formatTemperature(lowest, props.units.temperature),
  })
})
</script>

<template>
  <section
    class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4"
    aria-labelledby="long-range-trend-title"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2
          id="long-range-trend-title"
          class="text-section-title text-[var(--color-text-primary)]"
        >
          {{ t('weather.longRange.trendTitle') }}
        </h2>
        <p class="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
          {{ summary }}
        </p>
      </div>
      <dl class="flex gap-3 text-caption text-[var(--color-text-secondary)]">
        <div class="flex items-center gap-2">
          <dt class="font-medium text-[var(--color-text-primary)]">
            {{ t('weather.longRange.maxTemperatureShort') }}
          </dt>
          <dd class="h-0.5 w-8 bg-[var(--color-accent)]" aria-hidden="true" />
        </div>
        <div class="flex items-center gap-2">
          <dt class="font-medium text-[var(--color-text-primary)]">
            {{ t('weather.longRange.minTemperatureShort') }}
          </dt>
          <dd class="h-0.5 w-8 border-t border-dashed border-[var(--color-text-secondary)]" aria-hidden="true" />
        </div>
      </dl>
    </div>

    <svg
      class="mt-4 block overflow-visible"
      :aria-labelledby="'long-range-chart-title long-range-chart-desc'"
      role="img"
      :style="{ width: `${chartWidth}px`, height: `${TEMPERATURE_TREND_HEIGHT}px` }"
      :viewBox="`0 0 ${chartWidth} ${TEMPERATURE_TREND_HEIGHT}`"
    >
      <title id="long-range-chart-title">
        {{ t('weather.longRange.trendTitle') }}
      </title>
      <desc id="long-range-chart-desc">
        {{ summary }}
      </desc>
      <g aria-hidden="true">
        <line
          x1="0"
          :x2="chartWidth"
          :y1="TEMPERATURE_TREND_HEIGHT - 28"
          :y2="TEMPERATURE_TREND_HEIGHT - 28"
          stroke="var(--color-border-soft)"
          stroke-width="1"
        />
        <polyline
          v-for="(segment, index) in lowSegments"
          :key="`low-${index}`"
          fill="none"
          :points="polylinePoints(segment)"
          stroke="var(--color-text-secondary)"
          stroke-dasharray="5 5"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        />
        <polyline
          v-for="(segment, index) in highSegments"
          :key="`high-${index}`"
          fill="none"
          :points="polylinePoints(segment)"
          stroke="var(--color-accent)"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
        />
        <g v-for="point in lowPoints" :key="`low-point-${point.index}`">
          <circle
            :cx="point.x"
            :cy="point.y"
            fill="var(--color-surface-raised)"
            r="3.5"
            stroke="var(--color-text-secondary)"
            stroke-width="1.5"
          />
          <text
            :x="point.x"
            :y="point.y + 20"
            fill="var(--color-text-secondary)"
            font-size="12"
            text-anchor="middle"
          >
            {{ formatTemperature(point.value, units.temperature) }}
          </text>
        </g>
        <g v-for="point in highPoints" :key="`high-point-${point.index}`">
          <circle
            :cx="point.x"
            :cy="point.y"
            fill="var(--color-surface-raised)"
            r="4"
            stroke="var(--color-accent)"
            stroke-width="2"
          />
          <text
            :x="point.x"
            :y="point.y - 10"
            fill="var(--color-accent-text)"
            font-size="12"
            font-weight="650"
            text-anchor="middle"
          >
            {{ formatTemperature(point.value, units.temperature) }}
          </text>
        </g>
      </g>
    </svg>
  </section>
</template>
