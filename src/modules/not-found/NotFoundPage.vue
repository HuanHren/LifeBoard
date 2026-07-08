<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import PageLayout from '@/components/base/PageLayout.vue'
import { useI18n } from '@/i18n/useI18n'

const { t } = useI18n()
</script>

<template>
  <PageLayout variant="narrow">
    <section aria-labelledby="not-found-title">
      <p class="mb-3 text-sm font-medium text-[var(--color-accent-text)]">
        {{ t('notFound.eyebrow') }}
      </p>
      <BaseEmpty
        :description="t('notFound.description')"
        :title="t('notFound.title')"
        title-as="h1"
      >
        <template #actions>
          <RouterLink
            :to="{ name: 'landing' }"
            class="control-focus interactive-surface inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 text-sm font-medium text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)]"
          >
            {{ t('notFound.landingAction') }}
          </RouterLink>
          <RouterLink
            :to="{ name: 'workspace' }"
            class="control-focus interactive-surface inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-interactive)]"
          >
            {{ t('notFound.workspaceAction') }}
          </RouterLink>
        </template>
      </BaseEmpty>
    </section>
  </PageLayout>
</template>
