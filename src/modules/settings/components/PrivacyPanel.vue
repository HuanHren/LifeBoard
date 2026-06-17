<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'

const { t } = useI18n()
</script>

<template>
  <div class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5 sm:p-6">
    <ul class="grid gap-4 text-sm leading-6 text-[var(--color-text-secondary)] sm:grid-cols-2" role="list">
      <li>
        <strong class="block font-semibold text-[var(--color-text-primary)]">
          {{ t('settings.privacy.weatherTitle') }}
        </strong>
        {{ t('settings.privacy.weatherDescription') }}
      </li>
      <li>
        <strong class="block font-semibold text-[var(--color-text-primary)]">
          {{ t('settings.privacy.localTitle') }}
        </strong>
        {{ t('settings.privacy.localDescription') }}
      </li>
      <li>
        <strong class="block font-semibold text-[var(--color-text-primary)]">
          {{ t('settings.privacy.toolsTitle') }}
        </strong>
        {{ t('settings.privacy.toolsDescription') }}
      </li>
      <li>
        <strong class="block font-semibold text-[var(--color-text-primary)]">
          {{ t('settings.privacy.backupTitle') }}
        </strong>
        {{ t('settings.privacy.backupDescription') }}
      </li>
    </ul>
  </div>
</template>
