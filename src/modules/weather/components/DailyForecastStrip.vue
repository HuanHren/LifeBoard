<script setup lang="ts">
import type { DailyForecastItem, WeatherUnits } from '@/modules/weather/types/weather'
import {
  formatDateLabel,
  formatDay,
  formatPercentage,
  formatTemperature,
  formatWind,
} from '@/modules/weather/utils/weatherFormatting'

interface Props {
  items: DailyForecastItem[]
  units: WeatherUnits
}

defineProps<Props>()
</script>

<template>
  <section aria-labelledby="daily-forecast-title">
    <div class="max-w-2xl">
      <h2
        id="daily-forecast-title"
        class="text-section-title text-balance text-[var(--color-text-primary)]"
      >
        Next 7 days
      </h2>
      <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        A compact outlook for temperature, rain, and wind.
      </p>
    </div>

    <div
      class="forecast-scroll mt-4 overflow-x-auto rounded-[var(--radius-lg)] bg-[var(--color-surface-inset)] p-2 focus-visible:outline-offset-4"
      aria-label="Scrollable 7-day weather forecast"
      tabindex="0"
    >
      <ol class="flex min-w-max snap-x snap-proximity gap-2">
        <li
          v-for="(item, index) in items"
          :key="item.date"
          class="w-48 shrink-0 snap-start rounded-[var(--radius-md)] px-4 py-4"
          :class="
            index === 0
              ? 'bg-[var(--color-accent-wash)]'
              : 'bg-[var(--color-surface-raised)]'
          "
        >
          <time :datetime="item.date" class="flex items-baseline justify-between gap-3">
            <span class="block text-sm font-semibold text-[var(--color-text-primary)]">
              {{ formatDay(item.date, index) }}
            </span>
            <span class="block text-caption text-[var(--color-text-secondary)]">
              {{ formatDateLabel(item.date) }}
            </span>
          </time>
          <p
            class="mt-4 min-h-10 text-sm font-medium leading-5 text-pretty text-[var(--color-text-primary)]"
          >
            {{ item.condition.shortLabel }}
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
            class="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--color-border-soft)] pt-3"
          >
            <div>
              <dt class="text-caption text-[var(--color-text-secondary)]">Rain chance</dt>
              <dd class="mt-0.5 text-sm font-medium tabular-nums text-[var(--color-text-primary)]">
                {{ formatPercentage(item.precipitationProbabilityMax) }}
              </dd>
            </div>
            <div>
              <dt class="text-caption text-[var(--color-text-secondary)]">Peak gust</dt>
              <dd class="mt-0.5 text-sm font-medium tabular-nums text-[var(--color-text-primary)]">
                {{ formatWind(item.windGustsMax, units.windSpeed) }}
              </dd>
            </div>
          </dl>
        </li>
      </ol>
    </div>
  </section>
</template>
