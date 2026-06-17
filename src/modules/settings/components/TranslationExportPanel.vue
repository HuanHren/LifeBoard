<script setup lang="ts">
import { shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { downloadTranslationSource } from '@/i18n/translationExport'
import { useI18n } from '@/i18n/useI18n'

const { t } = useI18n()
const success = shallowRef<string | null>(null)
const error = shallowRef<string | null>(null)

function exportTranslations() {
  success.value = null
  error.value = null

  try {
    downloadTranslationSource()
    success.value = t('settings.translationExport.success')
  } catch {
    error.value = t('settings.translationExport.error')
  }
}
</script>

<template>
  <div class="border-t border-[var(--color-border-soft)] pt-5">
    <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
      {{ t('settings.translationExport.title') }}
    </h3>
    <p class="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
      {{ t('settings.translationExport.description') }}
    </p>
    <p class="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-tertiary)]">
      {{ t('settings.translationExport.privacy') }}
    </p>

    <BaseButton class="mt-4" variant="ghost" @click="exportTranslations">
      {{ t('settings.translationExport.action') }}
    </BaseButton>

    <p
      v-if="error"
      class="mt-3 text-sm font-medium text-[var(--color-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
    <p
      v-if="success"
      class="mt-3 text-sm text-[var(--color-text-secondary)]"
      aria-live="polite"
    >
      {{ success }}
    </p>
  </div>
</template>
