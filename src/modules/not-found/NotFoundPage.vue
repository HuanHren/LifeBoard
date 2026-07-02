<script setup lang="ts">
import { RouterLink } from 'vue-router'
import PageLayout from '@/components/base/PageLayout.vue'
import { useI18n } from '@/i18n/useI18n'

const { t } = useI18n()
</script>

<template>
  <PageLayout variant="narrow">
    <section
      class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-6 sm:p-8"
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
      <div class="mt-6 flex flex-wrap gap-3">
        <RouterLink
          :to="{ name: 'landing' }"
          class="interactive-surface inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 text-sm font-medium text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)]"
        >
          {{ t('notFound.landingAction') }}
        </RouterLink>
        <RouterLink
          :to="{ name: 'workspace' }"
          class="interactive-surface inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-interactive)]"
        >
          {{ t('notFound.workspaceAction') }}
        </RouterLink>
      </div>
    </section>
  </PageLayout>
</template>
