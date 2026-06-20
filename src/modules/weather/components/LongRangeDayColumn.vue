<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import type { DailyForecastItem, WeatherUnits } from '@/modules/weather/types/weather'
import {
  formatDateLabel,
  formatDay,
  formatPercentage,
  formatPrecipitation,
  formatTemperature,
  formatWind,
  formatWindDirection,
} from '@/modules/weather/utils/weatherFormatting'
import { localizeWeatherCondition } from '@/modules/weather/utils/weatherI18n'
import { LONG_RANGE_DAY_WIDTH } from '@/modules/weather/utils/temperatureTrend'

interface Props {
  item: DailyForecastItem
  index: number
  units: WeatherUnits
}

const props = defineProps<Props>()
const { locale, t } = useI18n()

const conditionLabel = computed(() =>
  localizeWeatherCondition(props.item.condition, t, true),
)
const windLabel = computed(() => {
  const speed = formatWind(props.item.windSpeedMax, props.units.windSpeed)

  if (props.item.windDirectionDominant === null) {
    return speed
  }

  return `${formatWindDirection(props.item.windDirectionDominant, t)} ${speed}`
})
</script>

<template>
  <article
    class="h-full rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-3 py-4"
    :class="index === 0 ? 'bg-[var(--color-accent-wash)]' : ''"
    :style="{ width: `${LONG_RANGE_DAY_WIDTH}px` }"
    :aria-label="
      t('weather.longRange.daySummary', {
        day: formatDay(item.date, index, locale, t),
        date: formatDateLabel(item.date, locale),
        condition: conditionLabel,
        high: formatTemperature(item.temperatureMax, units.temperature),
        low: formatTemperature(item.temperatureMin, units.temperature),
      })
    "
  >
    <div class="min-h-16">
      <p
        v-if="index === 0"
        class="mb-2 inline-flex rounded-[var(--radius-pill)] bg-[var(--color-accent-soft)] px-2 py-0.5 text-caption font-medium text-[var(--color-accent-text)]"
      >
        {{ t('weather.longRange.today') }}
      </p>
      <time :datetime="item.date" class="block">
        <span class="block text-sm font-semibold text-[var(--color-text-primary)]">
          {{ formatDay(item.date, index, locale, t) }}
        </span>
        <span class="mt-0.5 block text-caption text-[var(--color-text-secondary)]">
          {{ formatDateLabel(item.date, locale) }}
        </span>
      </time>
    </div>

    <p class="mt-3 min-h-10 text-sm font-medium leading-5 text-pretty text-[var(--color-text-primary)]">
      {{ conditionLabel }}
    </p>

    <dl class="mt-4 space-y-3 text-sm">
      <div>
        <dt class="text-caption text-[var(--color-text-secondary)]">
          {{ t('weather.longRange.maxTemperature') }}
        </dt>
        <dd class="mt-0.5 text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">
          {{ formatTemperature(item.temperatureMax, units.temperature) }}
        </dd>
      </div>
      <div>
        <dt class="text-caption text-[var(--color-text-secondary)]">
          {{ t('weather.longRange.minTemperature') }}
        </dt>
        <dd class="mt-0.5 font-medium tabular-nums text-[var(--color-text-primary)]">
          {{ formatTemperature(item.temperatureMin, units.temperature) }}
        </dd>
      </div>
      <div>
        <dt class="text-caption text-[var(--color-text-secondary)]">
          {{ t('weather.longRange.precipitationProbability') }}
        </dt>
        <dd class="mt-0.5 font-medium tabular-nums text-[var(--color-text-primary)]">
          {{ formatPercentage(item.precipitationProbabilityMax) }}
        </dd>
      </div>
      <div>
        <dt class="text-caption text-[var(--color-text-secondary)]">
          {{ t('weather.longRange.precipitationAmount') }}
        </dt>
        <dd class="mt-0.5 font-medium tabular-nums text-[var(--color-text-primary)]">
          {{ formatPrecipitation(item.precipitationSum, units.precipitation) }}
        </dd>
      </div>
      <div>
        <dt class="text-caption text-[var(--color-text-secondary)]">
          {{ t('weather.longRange.wind') }}
        </dt>
        <dd class="mt-0.5 font-medium tabular-nums text-[var(--color-text-primary)]">
          {{ windLabel }}
        </dd>
      </div>
    </dl>
  </article>
</template>
