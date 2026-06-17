<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import type { BackupImportSummaryData } from '@/modules/settings/types/settings'

interface Props {
  summary: BackupImportSummaryData
}

const props = defineProps<Props>()
const { t, formatDate } = useI18n()

function formatTheme(mode: BackupImportSummaryData['themeMode']) {
  if (mode === 'light') return t('shell.theme.light')
  if (mode === 'dark') return t('shell.theme.dark')
  return t('shell.theme.system')
}

const exportedAt = computed(() =>
  formatDate(new Date(props.summary.exportedAt), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }),
)

const taskLabel = computed(() =>
  props.summary.taskCount === 1
    ? t('settings.backupSummary.taskOne')
    : t('settings.backupSummary.taskMany', {
        count: props.summary.taskCount,
      }),
)

const countdownLabel = computed(() =>
  props.summary.countdownCount === 1
    ? t('settings.backupSummary.countdownOne')
    : t('settings.backupSummary.countdownMany', {
        count: props.summary.countdownCount,
      }),
)

const planningCountsLabel = computed(() =>
  t('settings.backupSummary.planningCounts', {
    tasks: taskLabel.value,
    countdowns: countdownLabel.value,
  }),
)
</script>

<template>
  <div class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4">
    <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
      {{ t('settings.backupSummary.title') }}
    </h3>
    <dl class="mt-3 grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
      <div>
        <dt class="text-[var(--color-text-tertiary)]">
          {{ t('settings.backupSummary.exported') }}
        </dt>
        <dd class="mt-0.5 font-medium text-[var(--color-text-primary)]">
          {{ exportedAt }}
        </dd>
      </div>
      <div>
        <dt class="text-[var(--color-text-tertiary)]">
          {{ t('settings.backupSummary.theme') }}
        </dt>
        <dd class="mt-0.5 font-medium text-[var(--color-text-primary)]">
          {{ formatTheme(summary.themeMode) }}
        </dd>
      </div>
      <div>
        <dt class="text-[var(--color-text-tertiary)]">
          {{ t('settings.backupSummary.weatherCity') }}
        </dt>
        <dd class="mt-0.5 font-medium text-[var(--color-text-primary)]">
          {{ summary.weatherCity ?? t('settings.backupSummary.none') }}
        </dd>
      </div>
      <div>
        <dt class="text-[var(--color-text-tertiary)]">
          {{ t('settings.backupSummary.planningData') }}
        </dt>
        <dd class="mt-0.5 font-medium text-[var(--color-text-primary)]">
          {{ planningCountsLabel }}
        </dd>
      </div>
      <div>
        <dt class="text-[var(--color-text-tertiary)]">
          {{ t('settings.backupSummary.bookmarks') }}
        </dt>
        <dd class="mt-0.5 font-medium text-[var(--color-text-primary)]">
          {{ summary.bookmarkCount }}
        </dd>
      </div>
    </dl>
  </div>
</template>
