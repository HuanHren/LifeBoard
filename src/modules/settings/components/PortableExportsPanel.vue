<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import type { PortableExportKind } from '@/modules/settings/types/settingsExports'

interface Props {
  hasTodosRows: boolean
  hasBookmarkRows: boolean
  error: string | null
  success: string | null
}

interface Emits {
  exportRequested: [kind: PortableExportKind]
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
</script>

<template>
  <div class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface)]">
    <div class="space-y-3 border-b border-[var(--color-border-soft)] p-5 sm:p-6">
      <p class="max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
        {{ t('settings.exports.description') }}
      </p>
      <p class="max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
        {{ t('settings.exports.privacy') }}
      </p>
    </div>

    <div class="divide-y divide-[var(--color-border-soft)]">
      <section class="space-y-4 p-5 sm:p-6" aria-labelledby="portable-export-todos">
        <div>
          <h3 id="portable-export-todos" class="text-base font-semibold text-[var(--color-text-primary)]">
            {{ t('settings.exports.todosTitle') }}
          </h3>
          <p class="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            {{ t('settings.exports.todosDescription') }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <BaseButton variant="secondary" @click="emit('exportRequested', 'todosMarkdown')">
            {{ t('settings.exports.markdownAction') }}
          </BaseButton>
          <BaseButton
            variant="secondary"
            :disabled="!hasTodosRows"
            @click="emit('exportRequested', 'todosCsv')"
          >
            {{ t('settings.exports.csvAction') }}
          </BaseButton>
        </div>
        <p v-if="!hasTodosRows" class="text-sm text-[var(--color-text-secondary)]">
          {{ t('settings.exports.emptyTodosCsv') }}
        </p>
      </section>

      <section class="space-y-4 p-5 sm:p-6" aria-labelledby="portable-export-bookmarks">
        <div>
          <h3 id="portable-export-bookmarks" class="text-base font-semibold text-[var(--color-text-primary)]">
            {{ t('settings.exports.bookmarksTitle') }}
          </h3>
          <p class="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            {{ t('settings.exports.bookmarksDescription') }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <BaseButton variant="secondary" @click="emit('exportRequested', 'bookmarksMarkdown')">
            {{ t('settings.exports.markdownAction') }}
          </BaseButton>
          <BaseButton
            variant="secondary"
            :disabled="!hasBookmarkRows"
            @click="emit('exportRequested', 'bookmarksCsv')"
          >
            {{ t('settings.exports.csvAction') }}
          </BaseButton>
        </div>
        <p v-if="!hasBookmarkRows" class="text-sm text-[var(--color-text-secondary)]">
          {{ t('settings.exports.emptyBookmarksCsv') }}
        </p>
      </section>

      <section class="space-y-4 p-5 sm:p-6" aria-labelledby="portable-export-summary">
        <div>
          <h3 id="portable-export-summary" class="text-base font-semibold text-[var(--color-text-primary)]">
            {{ t('settings.exports.summaryTitle') }}
          </h3>
          <p class="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            {{ t('settings.exports.summaryDescription') }}
          </p>
        </div>
        <BaseButton variant="secondary" @click="emit('exportRequested', 'summaryMarkdown')">
          {{ t('settings.exports.markdownAction') }}
        </BaseButton>
      </section>
    </div>

    <div
      v-if="success || error"
      class="border-t border-[var(--color-border-soft)] px-5 py-4 text-sm sm:px-6"
    >
      <p v-if="success" class="font-medium text-[var(--color-accent-text)]" aria-live="polite">
        {{ success }}
      </p>
      <p v-if="error" class="font-medium text-[var(--color-danger)]" role="alert">
        {{ error }}
      </p>
    </div>
  </div>
</template>
