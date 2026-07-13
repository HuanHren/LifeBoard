<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'
import type { ClearOperationPreview } from '@/shared/persistence'

defineProps<{ summary: ClearOperationPreview }>()
const { t } = useI18n()
</script>

<template>
  <div
    class="rounded-[var(--radius-sm)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4"
    data-qa="settings-clear-preview"
  >
    <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
      {{ t('settings.clearPreview.title') }}
    </h3>
    <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      <div>
        <dt class="text-[var(--color-text-tertiary)]">{{ t('settings.clearPreview.tasks') }}</dt>
        <dd class="font-medium text-[var(--color-text-primary)]">{{ summary.taskCount }}</dd>
      </div>
      <div>
        <dt class="text-[var(--color-text-tertiary)]">{{ t('settings.clearPreview.countdowns') }}</dt>
        <dd class="font-medium text-[var(--color-text-primary)]">{{ summary.countdownCount }}</dd>
      </div>
      <div>
        <dt class="text-[var(--color-text-tertiary)]">{{ t('settings.clearPreview.bookmarks') }}</dt>
        <dd class="font-medium text-[var(--color-text-primary)]">{{ summary.bookmarkCount }}</dd>
      </div>
      <div>
        <dt class="text-[var(--color-text-tertiary)]">{{ t('settings.clearPreview.favoriteCities') }}</dt>
        <dd class="font-medium text-[var(--color-text-primary)]">{{ summary.favoriteCityCount }}</dd>
      </div>
      <div>
        <dt class="text-[var(--color-text-tertiary)]">{{ t('settings.clearPreview.savedLocation') }}</dt>
        <dd class="font-medium text-[var(--color-text-primary)]">
          {{ summary.hasSavedLocation ? t('settings.clearPreview.present') : t('settings.clearPreview.none') }}
        </dd>
      </div>
      <div>
        <dt class="text-[var(--color-text-tertiary)]">{{ t('settings.clearPreview.storageKeys') }}</dt>
        <dd class="font-medium text-[var(--color-text-primary)]">{{ summary.targetKeyCount }}</dd>
      </div>
    </dl>
    <p class="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
      {{ summary.preservesPreferences
        ? t('settings.clearPreview.preferencesPreserved')
        : t('settings.clearPreview.preferencesReset') }}
    </p>
    <p class="mt-2 text-sm font-medium leading-6 text-[var(--color-danger)]">
      {{ t('settings.clearPreview.noAutomaticBackup') }}
    </p>
  </div>
</template>
