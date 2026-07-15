<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'
import type { DailyForecastItem, WeatherUnits } from '@/modules/weather/types/weather'
import {
  formatDateLabel,
  formatDay,
  formatOptionalWind,
  formatPercentage,
  formatTemperature,
} from '@/modules/weather/utils/weatherFormatting'
import { localizeWeatherCondition } from '@/modules/weather/utils/weatherI18n'

interface Props {
  items: DailyForecastItem[]
  title?: string
  description?: string
  scrollLabel?: string
  units: WeatherUnits
}

const props = defineProps<Props>()
const { locale, t } = useI18n()
</script>

<template>
  <section class="min-w-0 max-w-full" aria-labelledby="daily-forecast-title">
    <div class="min-w-0 max-w-2xl">
      <h2
        id="daily-forecast-title"
        class="text-section-title text-balance text-[var(--color-text-primary)]"
      >
        {{ props.title ?? t('weather.daily.title') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ props.description ?? t('weather.daily.description') }}
      </p>
    </div>

    <div
      class="mt-4 min-w-0 max-w-full rounded-[var(--radius-lg)] bg-[var(--color-surface-inset)] p-2"
      :aria-label="props.scrollLabel ?? t('weather.daily.scrollLabel')"
    >
      <ol class="daily-forecast-grid grid min-w-0 max-w-full gap-2">
        <li
          v-for="(item, index) in items"
          :key="item.date"
          class="min-w-0 rounded-[var(--radius-md)] px-4 py-4"
          :class="
            index === 0
              ? 'bg-[var(--color-accent-wash)]'
              : 'bg-[var(--color-surface-raised)]'
          "
        >
          <time :datetime="item.date" class="flex items-baseline justify-between gap-3">
            <span class="block text-sm font-semibold text-[var(--color-text-primary)]">
              {{ formatDay(item.date, index, locale, t) }}
            </span>
            <span class="block text-caption text-[var(--color-text-secondary)]">
              {{ formatDateLabel(item.date, locale) }}
            </span>
          </time>
          <p
            class="mt-4 min-h-10 text-sm font-medium leading-5 text-pretty text-[var(--color-text-primary)]"
          >
            {{ localizeWeatherCondition(item.condition, t, true) }}
          </p>
          <p class="mt-3 flex items-baseline gap-2 tabular-nums text-[var(--color-text-primary)]">
            <span class="text-xl font-semibold">
              {{ formatTemperature(item.temperatureMax, units.temperature) }}
            </span>
            <span class="text-sm text-[var(--color-text-secondary)]">
              {{ formatTemperature(item.temperatureMin, units.temperature) }}
            </span>
          </p>
          <dl
            v-if="item.precipitationProbabilityMax !== null || item.windGustsMax !== null"
            class="mt-4 grid gap-3 border-t border-[var(--color-border-soft)] pt-3"
            :class="item.precipitationProbabilityMax !== null && item.windGustsMax !== null
              ? 'grid-cols-2'
              : 'grid-cols-1'"
          >
            <div v-if="item.precipitationProbabilityMax !== null">
              <dt class="text-caption text-[var(--color-text-secondary)]">
                {{ t('weather.hourly.rainChance') }}
              </dt>
              <dd class="mt-0.5 text-sm font-medium tabular-nums text-[var(--color-text-primary)]">
                {{ formatPercentage(item.precipitationProbabilityMax) }}
              </dd>
            </div>
            <div v-if="item.windGustsMax !== null">
              <dt class="text-caption text-[var(--color-text-secondary)]">
                {{ t('weather.daily.peakGust') }}
              </dt>
              <dd class="mt-0.5 text-sm font-medium tabular-nums text-[var(--color-text-primary)]">
                {{
                  formatOptionalWind(
                    item.windGustsMax,
                    units.windSpeed,
                    t('weather.value.unavailable'),
                  )
                }}
              </dd>
            </div>
          </dl>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.daily-forecast-grid {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
}
</style>
