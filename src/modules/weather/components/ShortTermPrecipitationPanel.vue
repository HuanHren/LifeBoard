<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import type {
  ShortTermPrecipitation,
  WeatherDataProvider,
  WeatherUnits,
} from '@/modules/weather/types/weather'
import { summarizeShortTermPrecipitation } from '@/modules/weather/utils/precipitationSummary'
import { formatPrecipitation } from '@/modules/weather/utils/weatherFormatting'

interface Props {
  provider: WeatherDataProvider
  shortTerm: ShortTermPrecipitation | null
  units: WeatherUnits
}

const props = defineProps<Props>()
const { t } = useI18n()

const summary = computed(() => summarizeShortTermPrecipitation(props.shortTerm, t))

const visibleItems = computed(() => props.shortTerm?.items.slice(0, 6) ?? [])
</script>

<template>
  <section
    class="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5"
    aria-labelledby="short-term-precipitation-title"
  >
    <div class="max-w-2xl">
      <h2
        id="short-term-precipitation-title"
        class="text-section-title text-balance text-[var(--color-text-primary)]"
      >
        {{ t('weather.shortTerm.title') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ summary }}
      </p>
    </div>

    <p
      v-if="provider === 'openMeteo'"
      class="mt-4 rounded-[var(--radius-md)] bg-[var(--color-surface-inset)] px-4 py-3 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]"
    >
      {{ t('weather.shortTerm.openMeteoLimitation') }}
    </p>

    <ol
      v-else-if="visibleItems.length > 0"
      class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
      :aria-label="t('weather.shortTerm.listLabel')"
    >
      <li
        v-for="(item, index) in visibleItems"
        :key="item.time"
        class="rounded-[var(--radius-md)] bg-[var(--color-surface-inset)] px-4 py-3"
      >
        <p class="text-caption text-[var(--color-text-secondary)]">
          {{ t('weather.shortTerm.minuteOffset', { count: index }) }}
        </p>
        <p class="mt-1 text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
          {{ formatPrecipitation(item.precipitation, units.precipitation) }}
        </p>
      </li>
    </ol>

    <p
      v-else
      class="mt-4 rounded-[var(--radius-md)] bg-[var(--color-surface-inset)] px-4 py-3 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]"
    >
      {{ t('weather.shortTerm.caiyunUnavailable') }}
    </p>
  </section>
</template>
