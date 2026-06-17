<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'
import type { AdviceLevel, WeatherAdvice } from '@/modules/weather/types/weather'
import {
  localizeAdviceItem,
  localizeWeatherNote,
} from '@/modules/weather/utils/weatherI18n'

interface Props {
  advice: WeatherAdvice
}

defineProps<Props>()
const { t } = useI18n()

const levelKeys: Record<AdviceLevel, 'weather.advice.level.clear' | 'weather.advice.level.consider' | 'weather.advice.level.caution'> = {
  clear: 'weather.advice.level.clear',
  consider: 'weather.advice.level.consider',
  caution: 'weather.advice.level.caution',
}
</script>

<template>
  <section
    class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-5 sm:p-6"
    aria-labelledby="weather-advice-title"
  >
    <div class="max-w-2xl">
      <h2
        id="weather-advice-title"
        class="text-section-title text-balance text-[var(--color-text-primary)]"
      >
        {{ t('weather.advice.title') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ t('weather.advice.description') }}
      </p>
    </div>

    <div class="mt-5 divide-y divide-[var(--color-border-soft)]">
      <article v-for="item in advice.items" :key="item.kind" class="py-4 first:pt-0 last:pb-0">
        <div class="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-5">
          <div>
            <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
              {{ localizeAdviceItem(item, t).title }}
            </h3>
            <p
              class="mt-1.5 inline-flex rounded-[var(--radius-sm)] bg-[var(--color-accent-wash)] px-2 py-1 text-caption font-medium text-[var(--color-accent-text)]"
            >
              {{ t(levelKeys[item.level]) }}
            </p>
          </div>
          <div>
            <p class="text-sm font-semibold leading-6 text-pretty text-[var(--color-text-primary)]">
              {{ localizeAdviceItem(item, t).summary }}
            </p>
            <p class="mt-1 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
              {{ localizeAdviceItem(item, t).detail }}
            </p>
          </div>
        </div>
      </article>
    </div>

    <div
      v-if="advice.notes.length > 0"
      class="mt-5 border-t border-[var(--color-border-soft)] pt-4"
    >
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
        {{ t('weather.advice.notesTitle') }}
      </h3>
      <ul class="mt-2 space-y-1.5">
        <li
          v-for="note in advice.notes"
          :key="note"
          class="text-sm leading-6 text-pretty text-[var(--color-text-secondary)]"
        >
          {{ localizeWeatherNote(note, t) }}
        </li>
      </ul>
    </div>
  </section>
</template>
