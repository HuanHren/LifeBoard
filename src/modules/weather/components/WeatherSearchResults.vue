<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'
import type { WeatherLocation } from '@/modules/weather/types/weather'
import { formatLocationName } from '@/modules/weather/utils/weatherFormatting'
import { localizeLocationKind } from '@/modules/weather/utils/weatherI18n'

interface Props {
  query: string
  results: WeatherLocation[]
}

interface Emits {
  select: [location: WeatherLocation]
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
</script>

<template>
  <section
    class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4 sm:p-5"
    aria-labelledby="weather-search-results-title"
  >
    <h2
      id="weather-search-results-title"
      class="text-base font-semibold text-[var(--color-text-primary)]"
    >
      {{
        results.length > 0
          ? t('weather.results.chooseTitle')
          : t('weather.results.emptyTitle')
      }}
    </h2>
    <p class="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]" aria-live="polite">
      {{
        results.length > 0
          ? t('weather.results.matches', { count: results.length, query })
          : t('weather.results.noMatches', { query })
      }}
    </p>

    <ul v-if="results.length > 0" class="mt-4 grid gap-2 sm:grid-cols-2">
      <li v-for="location in results" :key="location.id">
        <button
          class="interactive-surface min-h-14 w-full rounded-[var(--radius-md)] border border-[var(--color-text-tertiary)] bg-[var(--color-surface-raised)] px-3 py-2 text-left hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-wash)]"
          type="button"
          @click="emit('select', location)"
        >
          <span class="block text-sm font-semibold text-[var(--color-text-primary)]">
            {{ location.name }}
          </span>
          <span class="mt-1 block text-caption text-[var(--color-text-secondary)]">
            {{ localizeLocationKind(location.kind, t) }} · {{ formatLocationName(location) }}
          </span>
        </button>
      </li>
    </ul>
  </section>
</template>
