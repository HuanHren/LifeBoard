<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseSurface from '@/components/base/BaseSurface.vue'
import PageLayout from '@/components/base/PageLayout.vue'
import { useI18n } from '@/i18n/useI18n'

const { t } = useI18n()
</script>

<template>
  <PageLayout variant="narrow">
    <BaseSurface
      as="section"
      class="not-found-panel"
      aria-labelledby="not-found-title"
      padding="lg"
      variant="plain"
    >
      <p class="not-found-panel__eyebrow">
        {{ t('notFound.eyebrow') }}
      </p>
      <h1 id="not-found-title" class="not-found-panel__title">
        {{ t('notFound.title') }}
      </h1>
      <p class="not-found-panel__description">
        {{ t('notFound.description') }}
      </p>
      <div class="not-found-panel__actions">
        <RouterLink
          :to="{ name: 'landing' }"
          class="control-focus interactive-surface not-found-panel__button not-found-panel__button--primary"
        >
          {{ t('notFound.landingAction') }}
        </RouterLink>
        <RouterLink
          :to="{ name: 'workspace' }"
          class="control-focus interactive-surface not-found-panel__button not-found-panel__button--secondary"
        >
          {{ t('notFound.workspaceAction') }}
        </RouterLink>
      </div>
    </BaseSurface>
  </PageLayout>
</template>

<style scoped>
.not-found-panel {
  display: grid;
  max-width: 42rem;
  gap: var(--space-4);
  margin-inline: auto;
  background:
    linear-gradient(135deg, var(--color-surface-raised), var(--color-surface)),
    var(--color-surface);
}

.not-found-panel__eyebrow {
  margin: 0;
  color: var(--color-accent-text);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.not-found-panel__title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-page-title);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.not-found-panel__description {
  max-width: 34rem;
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-small);
  line-height: 1.7;
}

.not-found-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.not-found-panel__button {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-control-border);
  border-radius: var(--radius-sm);
  padding: 0 var(--space-4);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.not-found-panel__button--primary {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}

.not-found-panel__button--secondary {
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
}

@media (min-width: 64rem) {
  .not-found-panel {
    margin-top: var(--space-8);
  }
}
</style>
