<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import type { AdviceLevel, WeatherAdvice } from '@/modules/weather/types/weather'
import {
  localizeAdviceItem,
  localizeWeatherNote,
} from '@/modules/weather/utils/weatherI18n'

interface Props {
  advice: WeatherAdvice
}

const { t } = useI18n()

const levelKeys: Record<AdviceLevel, 'weather.advice.level.clear' | 'weather.advice.level.consider' | 'weather.advice.level.caution'> = {
  clear: 'weather.advice.level.clear',
  consider: 'weather.advice.level.consider',
  caution: 'weather.advice.level.caution',
}

const props = defineProps<Props>()
const levelPriority: Record<AdviceLevel, number> = {
  caution: 3,
  consider: 2,
  clear: 1,
}

const primaryAdvice = computed(() =>
  [...props.advice.items].sort(
    (a, b) => levelPriority[b.level] - levelPriority[a.level],
  )[0] ?? null,
)
const firstNote = computed(() => props.advice.notes[0] ?? null)
</script>

<template>
  <section
    class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4 sm:p-5"
    aria-labelledby="weather-advice-title"
  >
    <div class="grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
      <div>
        <h2
          id="weather-advice-title"
          class="text-base font-semibold text-[var(--color-text-primary)]"
        >
          {{ t('weather.advice.title') }}
        </h2>
        <p class="mt-1 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{ t('weather.advice.description') }}
        </p>
      </div>

      <article v-if="primaryAdvice" class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ localizeAdviceItem(primaryAdvice, t).title }}
          </h3>
          <p
            class="inline-flex rounded-[var(--radius-sm)] bg-[var(--color-accent-wash)] px-2 py-1 text-caption font-medium text-[var(--color-accent-text)]"
          >
            {{ t(levelKeys[primaryAdvice.level]) }}
          </p>
        </div>
        <p class="mt-2 text-sm font-semibold leading-6 text-pretty text-[var(--color-text-primary)]">
          {{ localizeAdviceItem(primaryAdvice, t).summary }}
        </p>
        <p class="mt-1 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{ localizeAdviceItem(primaryAdvice, t).detail }}
        </p>
        <p
          v-if="firstNote"
          class="mt-3 border-t border-[var(--color-border-soft)] pt-3 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]"
        >
          {{ localizeWeatherNote(firstNote, t) }}
        </p>
      </article>
    </div>
  </section>
</template>
