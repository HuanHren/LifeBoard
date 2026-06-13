<script setup lang="ts">
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

const options: Array<{ value: ThemeMode; label: string; description: string }> = [
  {
    value: 'system',
    label: 'System',
    description: 'Follow this device preference.',
  },
  {
    value: 'light',
    label: 'Light',
    description: 'Use the light LifeBoard palette.',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Use the dark LifeBoard palette.',
  },
]
</script>

<template>
  <fieldset aria-describedby="theme-mode-help theme-mode-error" class="space-y-4">
    <div>
      <legend class="text-base font-semibold text-[var(--color-text-primary)]">
        Theme mode
      </legend>
      <p id="theme-mode-help" class="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
        Choose how LifeBoard appears on this browser.
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
            {{ option.label }}
          </span>
          <span class="mt-1 block text-sm leading-5 text-[var(--color-text-secondary)]">
            {{ option.description }}
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
      {{ error }}
    </p>
  </fieldset>
</template>
