<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'

interface Props {
  title: string
  description: string
}

defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <header class="max-w-3xl">
    <h2 class="text-section-title text-balance text-[var(--color-text-primary)]">
      {{ title }}
    </h2>
    <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
      {{ description }}
    </p>
    <p class="mt-2 text-caption text-[var(--color-text-tertiary)]">
      {{ t('tools.privacy') }}
    </p>
  </header>
</template>
