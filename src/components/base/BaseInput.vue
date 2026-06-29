<script setup lang="ts">
import BaseIcon, { type BaseIconName } from '@/components/base/BaseIcon.vue'

interface Props {
  id?: string
  modelValue: string
  type?: 'text' | 'search' | 'url' | 'email' | 'password'
  placeholder?: string
  disabled?: boolean
  leadingIcon?: BaseIconName
  trailingIcon?: BaseIconName
  ariaDescribedby?: string
  ariaInvalid?: 'true' | 'false'
}

interface Emits {
  'update:modelValue': [value: string]
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: undefined,
  disabled: false,
  leadingIcon: undefined,
  trailingIcon: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<Emits>()
</script>

<template>
  <div
    class="control-focus flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] px-3 text-[var(--color-text-primary)] transition-[background-color,border-color] duration-[var(--motion-fast)] focus-within:border-[var(--color-accent)]"
    :class="disabled ? 'opacity-55' : ''"
  >
    <BaseIcon v-if="leadingIcon" :name="leadingIcon" size="sm" class="text-[var(--color-text-tertiary)]" />
    <input
      :id="id"
      :aria-describedby="ariaDescribedby"
      :aria-invalid="ariaInvalid"
      class="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-[var(--color-muted-foreground)] disabled:cursor-not-allowed"
      :disabled="disabled"
      :placeholder="placeholder"
      :type="type"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <BaseIcon v-if="trailingIcon" :name="trailingIcon" size="sm" class="text-[var(--color-text-tertiary)]" />
  </div>
</template>
