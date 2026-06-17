<script setup lang="ts">
import type { TranslationKey } from '@/i18n/keys'
import { useI18n } from '@/i18n/useI18n'
import type { ThemeMode } from '@/shared/types/theme'

interface Props {
  modelValue: ThemeMode
  error?: string | null
}

interface Emits {
  'update:modelValue': [mode: ThemeMode]
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const options: Array<{
  value: ThemeMode
  labelKey: TranslationKey
  descriptionKey: TranslationKey
}> = [
  {
    value: 'system',
    labelKey: 'shell.theme.system',
    descriptionKey: 'settings.theme.systemDescription',
  },
  {
    value: 'light',
    labelKey: 'shell.theme.light',
    descriptionKey: 'settings.theme.lightDescription',
  },
  {
    value: 'dark',
    labelKey: 'shell.theme.dark',
    descriptionKey: 'settings.theme.darkDescription',
  },
]
</script>

<template>
  <fieldset
    :aria-describedby="error ? 'theme-mode-help theme-mode-error' : 'theme-mode-help'"
    class="space-y-4"
  >
    <div>
      <legend class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('settings.theme.legend') }}
      </legend>
      <p id="theme-mode-help" class="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
        {{ t('settings.theme.helper') }}
      </p>
    </div>

    <div class="grid gap-2 sm:grid-cols-3">
      <label
        v-for="option in options"
        :key="option.value"
        class="interactive-surface flex min-h-20 cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border p-3"
        :class="
          modelValue === option.value
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-wash)]'
            : 'border-[var(--color-border-soft)] bg-[var(--color-surface)] hover:border-[var(--color-control-border)]'
        "
      >
        <input
          :checked="modelValue === option.value"
          class="mt-1 size-4 shrink-0 accent-[var(--color-accent)]"
          name="theme-mode"
          type="radio"
          :value="option.value"
          @change="emit('update:modelValue', option.value)"
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

    <p
      v-if="error"
      id="theme-mode-error"
      class="text-sm font-medium text-[var(--color-danger)]"
      role="alert"
    >
      {{ t('settings.theme.storageError') }}
    </p>
  </fieldset>
</template>
