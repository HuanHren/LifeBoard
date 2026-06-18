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
    class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4"
  >
    <dt class="text-caption text-[var(--color-text-secondary)]">
      {{ label }}
    </dt>
    <dd class="mt-2">
      <p class="text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">
        {{ value }}
      </p>
      <p
        class="mt-1 text-caption leading-5 text-pretty"
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
