<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { shallowRef } from 'vue'
import BaseNotice from '@/components/base/BaseNotice.vue'
import type { TranslationKey } from '@/i18n/keys'
import { useI18n } from '@/i18n/useI18n'
import type { AppLocale } from '@/i18n/types'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const { locale, persistenceError } = storeToRefs(languageStore)
const { setLanguage } = languageStore
const { t } = useI18n()
const announcement = shallowRef<string | null>(null)

const options: Array<{
  value: AppLocale
  labelKey: TranslationKey
  descriptionKey:
    | 'settings.language.chineseDescription'
    | 'settings.language.englishDescription'
}> = [
  {
    value: 'zh-CN',
    labelKey: 'settings.language.chineseName',
    descriptionKey: 'settings.language.chineseDescription',
  },
  {
    value: 'en-US',
    labelKey: 'settings.language.englishName',
    descriptionKey: 'settings.language.englishDescription',
  },
]

function languageName(value: AppLocale) {
  const option = options.find((item) => item.value === value)
  return option ? t(option.labelKey) : value
}

function changeLanguage(nextLocale: AppLocale) {
  announcement.value = null

  if (!setLanguage(nextLocale)) return

  announcement.value = t('settings.language.saved', {
    language: languageName(nextLocale),
  })
}
</script>

<template>
  <fieldset
    :aria-describedby="
      persistenceError
        ? 'language-help language-error'
        : 'language-help language-status'
    "
    class="space-y-4"
  >
    <div>
      <legend class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('settings.language.legend') }}
      </legend>
      <p
        id="language-help"
        class="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]"
      >
        {{ t('settings.language.helper') }}
      </p>
    </div>

    <div class="grid gap-2 sm:grid-cols-2">
      <label
        v-for="option in options"
        :key="option.value"
        class="interactive-surface flex min-h-20 cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border p-3"
        :class="
          locale === option.value
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-wash)]'
            : 'border-[var(--color-border-soft)] bg-[var(--color-surface)] hover:border-[var(--color-control-border)]'
        "
      >
        <input
          :checked="locale === option.value"
          class="mt-1 size-4 shrink-0 accent-[var(--color-accent)]"
          name="interface-language"
          type="radio"
          :value="option.value"
          @change="changeLanguage(option.value)"
        />
        <span class="min-w-0">
          <span class="block text-sm font-semibold text-[var(--color-text-primary)]">
            {{ t(option.labelKey) }}
          </span>
          <span class="mt-1 block text-sm leading-5 text-[var(--color-text-secondary)]">
            {{ t(option.descriptionKey) }}
          </span>
        </span>
      </label>
    </div>

    <BaseNotice
      v-if="persistenceError"
      id="language-error"
      tone="danger"
      role="alert"
    >
      {{ t('settings.language.storageError') }}
    </BaseNotice>
    <p
      v-else
      id="language-status"
      class="min-h-5 text-sm text-[var(--color-text-secondary)]"
      aria-live="polite"
    >
      {{ announcement }}
    </p>
  </fieldset>
</template>
