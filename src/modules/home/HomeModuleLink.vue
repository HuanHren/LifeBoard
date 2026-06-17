<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'

interface Props {
  title: string
  description: string
  marker: string
  to: RouteLocationRaw
  prominence?: 'feature' | 'standard'
  statusLabel?: string
  actionLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  prominence: 'standard',
})
const { t } = useI18n()
const resolvedStatusLabel = computed(
  () => props.statusLabel ?? t('shared.status.connected'),
)
const resolvedActionLabel = computed(
  () => props.actionLabel ?? t('shared.action.openModule'),
)
</script>

<template>
  <RouterLink
    :to="to"
    :class="[
      'interactive-surface group flex min-h-48 flex-col justify-between rounded-[var(--radius-lg)] border p-5 focus-visible:outline-offset-4',
      prominence === 'feature'
        ? 'border-[var(--color-border)] bg-[var(--color-accent-wash)] shadow-[var(--shadow-soft)]'
        : 'border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] hover:border-[var(--color-border)] hover:shadow-[var(--shadow-soft)]',
    ]"
  >
    <div class="flex items-start justify-between gap-4">
      <span
        class="flex size-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent-soft)] text-xs font-semibold text-[var(--color-accent-text)]"
        aria-hidden="true"
      >
        {{ marker }}
      </span>
      <span class="text-caption font-medium text-[var(--color-text-secondary)]">
        {{ resolvedStatusLabel }}
      </span>
    </div>

    <div class="mt-8">
      <h3 class="text-lg font-semibold text-[var(--color-text-primary)]">{{ title }}</h3>
      <p class="mt-2 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
        {{ description }}
      </p>
      <span
        class="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-[var(--color-accent-text)]"
      >
        {{ resolvedActionLabel }}
        <span
          class="ml-2 transition-transform duration-[var(--motion-fast)] group-hover:translate-x-1"
          aria-hidden="true"
        >
          &rarr;
        </span>
      </span>
    </div>
  </RouterLink>
</template>
