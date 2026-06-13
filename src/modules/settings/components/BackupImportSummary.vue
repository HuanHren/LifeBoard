<script setup lang="ts">
import type { BackupImportSummaryData } from '@/modules/settings/types/settings'

interface Props {
  summary: BackupImportSummaryData
}

defineProps<Props>()

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatTheme(mode: BackupImportSummaryData['themeMode']) {
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

function countLabel(count: number, singular: string) {
  return `${count} ${count === 1 ? singular : `${singular}s`}`
}
</script>

<template>
  <div class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4">
    <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">Backup ready to review</h3>
    <dl class="mt-3 grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
      <div>
        <dt class="text-[var(--color-text-tertiary)]">Exported</dt>
        <dd class="mt-0.5 font-medium text-[var(--color-text-primary)]">
          {{ dateFormatter.format(new Date(summary.exportedAt)) }}
        </dd>
      </div>
      <div>
        <dt class="text-[var(--color-text-tertiary)]">Theme</dt>
        <dd class="mt-0.5 font-medium text-[var(--color-text-primary)]">
          {{ formatTheme(summary.themeMode) }}
        </dd>
      </div>
      <div>
        <dt class="text-[var(--color-text-tertiary)]">Weather city</dt>
        <dd class="mt-0.5 font-medium text-[var(--color-text-primary)]">
          {{ summary.weatherCity ?? 'None' }}
        </dd>
      </div>
      <div>
        <dt class="text-[var(--color-text-tertiary)]">Planning data</dt>
        <dd class="mt-0.5 font-medium text-[var(--color-text-primary)]">
          {{ countLabel(summary.taskCount, 'task') }},
          {{ countLabel(summary.countdownCount, 'countdown') }}
        </dd>
      </div>
      <div>
        <dt class="text-[var(--color-text-tertiary)]">Bookmarks</dt>
        <dd class="mt-0.5 font-medium text-[var(--color-text-primary)]">
          {{ summary.bookmarkCount }}
        </dd>
      </div>
    </dl>
  </div>
</template>
