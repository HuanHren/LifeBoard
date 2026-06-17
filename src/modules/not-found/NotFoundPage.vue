<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'

const { t } = useI18n()
</script>

<template>
  <section
    class="mx-auto max-w-2xl rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-6 sm:p-8"
    aria-labelledby="not-found-title"
  >
    <p class="text-sm font-medium text-[var(--color-accent-text)]">
      {{ t('notFound.eyebrow') }}
    </p>
    <h1
      id="not-found-title"
      class="text-page-title mt-3 text-balance text-[var(--color-text-primary)]"
    >
      {{ t('notFound.title') }}
    </h1>
    <p class="mt-4 max-w-xl text-pretty text-sm leading-6 text-[var(--color-text-secondary)]">
      {{ t('notFound.description') }}
    </p>
    <RouterLink
      :to="{ name: 'home' }"
      class="interactive-surface mt-6 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 text-sm font-medium text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)]"
    >
      {{ t('notFound.action') }}
    </RouterLink>
  </section>
</template>
