<script setup lang="ts">
import type { WeatherDetailTone } from '@/modules/weather/utils/weatherDetails'

interface Props {
  label: string
  value: string
  helper: string
  tone?: WeatherDetailTone
}

withDefaults(defineProps<Props>(), {
  tone: 'neutral',
})
</script>

<template>
  <div
    class="min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-2.5 sm:p-4"
  >
    <dt class="truncate text-caption text-[var(--color-text-secondary)]">
      {{ label }}
    </dt>
    <dd class="mt-1.5 sm:mt-2">
      <p
        class="break-words text-sm font-semibold leading-5 tabular-nums text-[var(--color-text-primary)] sm:text-lg sm:leading-7"
      >
        {{ value }}
      </p>
      <p
        class="mt-1 line-clamp-2 text-caption leading-4 text-pretty sm:line-clamp-none sm:leading-5"
        :class="
          tone === 'caution'
            ? 'text-[var(--color-danger)]'
            : tone === 'consider'
              ? 'text-[var(--color-accent-text)]'
              : 'text-[var(--color-text-secondary)]'
        "
      >
        {{ helper }}
      </p>
    </dd>
  </div>
</template>
