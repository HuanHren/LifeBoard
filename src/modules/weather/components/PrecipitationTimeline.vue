<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import type { HourlyForecastItem, WeatherUnits } from '@/modules/weather/types/weather'
import { summarizeHourlyPrecipitation } from '@/modules/weather/utils/precipitationSummary'
import {
  formatHour,
  formatPercentage,
  formatPrecipitation,
} from '@/modules/weather/utils/weatherFormatting'

interface Props {
  items: HourlyForecastItem[]
  units: WeatherUnits
}

const props = defineProps<Props>()
const { locale, t } = useI18n()

const firstDayItems = computed(() => props.items.slice(0, 24))
const summary = computed(() => summarizeHourlyPrecipitation(firstDayItems.value, t))
const hasUsableData = computed(() => firstDayItems.value.length > 0)

function barWidth(item: HourlyForecastItem) {
  const probabilityWidth = Math.max(6, Math.min(100, item.precipitationProbability))
  const amountWidth = Math.max(8, Math.min(100, item.precipitation * 18))
  return `${Math.max(probabilityWidth, amountWidth)}%`
}
</script>

<template>
  <section aria-labelledby="precipitation-timeline-title">
    <div class="max-w-2xl">
      <h2
        id="precipitation-timeline-title"
        class="text-section-title text-balance text-[var(--color-text-primary)]"
      >
        {{ t('weather.precipitation.title') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ t('weather.precipitation.description') }}
      </p>
    </div>

    <div
      class="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
    >
      <p class="text-sm font-medium text-pretty text-[var(--color-text-primary)]">
        {{ summary }}
      </p>

      <ol
        v-if="hasUsableData"
        class="mt-4 grid gap-2"
        :aria-label="t('weather.precipitation.listLabel')"
      >
        <li
          v-for="(item, index) in firstDayItems"
          :key="item.time"
          class="grid gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface-inset)] px-3 py-3 sm:grid-cols-[5rem_minmax(0,1fr)_9rem] sm:items-center"
        >
          <time
            :datetime="item.time"
            class="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]"
          >
            {{ index === 0 ? t('weather.hourly.now') : formatHour(item.time, locale) }}
          </time>

          <div
            class="h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-border-soft)]"
            aria-hidden="true"
          >
            <div
              class="h-full rounded-[var(--radius-pill)] bg-[var(--color-accent)]"
              :style="{ width: barWidth(item) }"
            />
          </div>

          <p
            class="text-sm leading-5 tabular-nums text-[var(--color-text-secondary)] sm:text-right"
          >
            {{
              t('weather.precipitation.itemLabel', {
                chance: formatPercentage(item.precipitationProbability),
                amount: formatPrecipitation(item.precipitation, units.precipitation),
              })
            }}
          </p>
        </li>
      </ol>

      <p
        v-else
        class="mt-4 rounded-[var(--radius-md)] bg-[var(--color-surface-inset)] px-4 py-3 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]"
      >
        {{ t('weather.precipitation.unavailable') }}
      </p>
    </div>
  </section>
</template>
