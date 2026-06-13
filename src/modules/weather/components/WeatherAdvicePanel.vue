<script setup lang="ts">
import type { AdviceLevel, WeatherAdvice } from '@/modules/weather/types/weather'

interface Props {
  advice: WeatherAdvice
}

defineProps<Props>()

const levelLabels: Record<AdviceLevel, string> = {
  clear: 'Looks clear',
  consider: 'Plan ahead',
  caution: 'Use caution',
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
        Plan your day
      </h2>
      <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        Practical guidance based on the current conditions and near-term forecast.
      </p>
    </div>

    <div class="mt-5 divide-y divide-[var(--color-border-soft)]">
      <article v-for="item in advice.items" :key="item.kind" class="py-4 first:pt-0 last:pb-0">
        <div class="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-5">
          <div>
            <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
              {{ item.title }}
            </h3>
            <p
              class="mt-1.5 inline-flex rounded-[var(--radius-sm)] bg-[var(--color-accent-wash)] px-2 py-1 text-caption font-medium text-[var(--color-accent-text)]"
            >
              {{ levelLabels[item.level] }}
            </p>
          </div>
          <div>
            <p class="text-sm font-semibold leading-6 text-pretty text-[var(--color-text-primary)]">
              {{ item.summary }}
            </p>
            <p class="mt-1 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
              {{ item.detail }}
            </p>
          </div>
        </div>
      </article>
    </div>

    <div
      v-if="advice.notes.length > 0"
      class="mt-5 border-t border-[var(--color-border-soft)] pt-4"
    >
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">Worth noting</h3>
      <ul class="mt-2 space-y-1.5">
        <li
          v-for="note in advice.notes"
          :key="note"
          class="text-sm leading-6 text-pretty text-[var(--color-text-secondary)]"
        >
          {{ note }}
        </li>
      </ul>
    </div>
  </section>
</template>
