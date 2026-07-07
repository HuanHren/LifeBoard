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
  <section class="min-w-0 max-w-full" aria-labelledby="precipitation-timeline-title">
    <div class="min-w-0 max-w-2xl">
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
      class="mt-4 min-w-0 max-w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
    >
      <p class="text-sm font-medium text-pretty text-[var(--color-text-primary)]">
        {{ summary }}
      </p>

      <div
        v-if="hasUsableData"
        class="mt-4 min-w-0 max-w-full scroll-mb-[var(--mobile-nav-clearance)] overflow-x-auto rounded-[var(--radius-md)] bg-[var(--color-surface-inset)] p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
        :aria-label="t('weather.precipitation.listLabel')"
        role="region"
        tabindex="0"
      >
        <ol class="flex w-max gap-2">
          <li
            v-for="(item, index) in firstDayItems"
            :key="item.time"
            class="w-24 shrink-0 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-3 py-3 sm:w-28"
          >
            <time
              :datetime="item.time"
              class="block text-sm font-semibold tabular-nums text-[var(--color-text-primary)]"
            >
              {{ index === 0 ? t('weather.hourly.now') : formatHour(item.time, locale) }}
            </time>
            <div
              class="mt-3 h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-border-soft)]"
              aria-hidden="true"
            >
              <div
                class="h-full rounded-[var(--radius-pill)] bg-[var(--color-accent)]"
                :style="{ width: barWidth(item) }"
              />
            </div>

            <p class="mt-2 text-xs leading-4 tabular-nums text-[var(--color-text-secondary)]">
              {{
                t('weather.precipitation.itemLabel', {
                  chance: formatPercentage(item.precipitationProbability),
                  amount: formatPrecipitation(item.precipitation, units.precipitation),
                })
              }}
            </p>
          </li>
        </ol>
      </div>

      <p
        v-else
        class="mt-4 rounded-[var(--radius-md)] bg-[var(--color-surface-inset)] px-4 py-3 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]"
      >
        {{ t('weather.precipitation.unavailable') }}
      </p>
    </div>
  </section>
</template>
