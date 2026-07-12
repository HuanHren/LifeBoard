<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import BaseNotice from '@/components/base/BaseNotice.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import { useI18n } from '@/i18n/useI18n'
import BackupImportSummary from '@/modules/settings/components/BackupImportSummary.vue'
import type { BackupImportSummaryData } from '@/modules/settings/types/settings'

interface Props {
  importSummary: BackupImportSummaryData | null
  error: string | null
  success: string | null
  exportDisabled?: boolean
  importDisabled?: boolean
}

interface Emits {
  export: []
  fileSelected: [file: File]
  confirmImport: []
  discardImport: []
}

withDefaults(defineProps<Props>(), {
  exportDisabled: false,
  importDisabled: false,
})
const emit = defineEmits<Emits>()
const { t } = useI18n()

function handleFileSelection(event: Event) {
  const input = event.currentTarget as HTMLInputElement
  const file = input.files?.[0]

  if (file) emit('fileSelected', file)
  input.value = ''
}
</script>

<template>
  <BaseSurface as="div" class="settings-backup-panel" padding="none" variant="plain">
    <div class="grid gap-6 p-5 md:grid-cols-2 md:p-6">
      <div class="space-y-3">
        <div>
          <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
            {{ t('settings.backup.exportTitle') }}
          </h3>
          <p class="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            {{ t('settings.backup.exportDescription') }}
          </p>
        </div>
        <BaseButton variant="primary" :disabled="exportDisabled" @click="emit('export')">
          {{ t('settings.backup.exportAction') }}
        </BaseButton>
      </div>

      <div class="space-y-3 border-t border-[var(--color-border-soft)] pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
        <div>
          <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
            {{ t('settings.backup.importTitle') }}
          </h3>
          <p id="backup-file-help" class="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            {{ t('settings.backup.importDescription') }}
          </p>
        </div>
        <label
          class="interactive-surface inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] px-4 text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
        >
          {{ t('settings.backup.fileAction') }}
          <input
            accept=".json,application/json,text/json"
            aria-describedby="backup-file-help"
            class="sr-only"
            :disabled="importDisabled"
            type="file"
            @change="handleFileSelection"
          />
        </label>
      </div>
    </div>

    <div v-if="error || success || importSummary" class="space-y-4 border-t border-[var(--color-border-soft)] p-5 md:p-6">
      <BaseNotice
        v-if="error"
        tone="danger"
        role="alert"
      >
        {{ error }}
      </BaseNotice>
      <BaseNotice
        v-if="success"
        tone="success"
        aria-live="polite"
      >
        {{ success }}
      </BaseNotice>
      <template v-if="importSummary">
        <BackupImportSummary :summary="importSummary" />
        <div class="flex flex-wrap gap-2">
          <BaseButton variant="primary" @click="emit('confirmImport')">
            {{ t('settings.backup.reviewAction') }}
          </BaseButton>
          <BaseButton variant="ghost" @click="emit('discardImport')">
            {{ t('settings.backup.discardAction') }}
          </BaseButton>
        </div>
      </template>
    </div>
  </BaseSurface>
</template>
