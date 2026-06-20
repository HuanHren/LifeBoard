<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import LongRangeDayColumn from '@/modules/weather/components/LongRangeDayColumn.vue'
import TemperatureTrendChart from '@/modules/weather/components/TemperatureTrendChart.vue'
import type { DailyForecastItem, WeatherUnits } from '@/modules/weather/types/weather'
import { LONG_RANGE_DAY_WIDTH } from '@/modules/weather/utils/temperatureTrend'

interface Props {
  items: DailyForecastItem[]
  units: WeatherUnits
}

const props = defineProps<Props>()
const { t } = useI18n()
const stripWidth = computed(() =>
  Math.max(LONG_RANGE_DAY_WIDTH, props.items.length * LONG_RANGE_DAY_WIDTH),
)
</script>

<template>
  <section aria-labelledby="long-range-daily-title">
    <div class="max-w-2xl">
      <h2
        id="long-range-daily-title"
        class="text-section-title text-[var(--color-text-primary)]"
      >
        {{ t('weather.longRange.dailyTitle') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ t('weather.longRange.scrollHint') }}
      </p>
    </div>

    <div
      class="forecast-scroll mt-4 overflow-x-auto rounded-[var(--radius-lg)] bg-[var(--color-surface-inset)] p-2 focus-visible:outline focus-visible:outline-[var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--color-focus)]"
      :aria-label="t('weather.longRange.scrollLabel')"
      tabindex="0"
    >
      <div class="min-w-max" :style="{ width: `${stripWidth}px` }">
        <TemperatureTrendChart :items="items" :units="units" />
        <ol class="mt-2 flex" :aria-label="t('weather.longRange.dailyListLabel')">
          <li
            v-for="(item, index) in items"
            :key="item.date"
            class="shrink-0 px-1"
            :style="{ width: `${LONG_RANGE_DAY_WIDTH}px` }"
          >
            <LongRangeDayColumn
              :index="index"
              :item="item"
              :units="units"
            />
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
