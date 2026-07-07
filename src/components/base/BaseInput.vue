<script setup lang="ts">
import { useTemplateRef } from 'vue'
import BaseIcon, { type BaseIconName } from '@/components/base/BaseIcon.vue'

interface Props {
  id?: string
  modelValue: string
  type?: 'text' | 'search' | 'url' | 'email' | 'password'
  placeholder?: string
  disabled?: boolean
  autocomplete?: string
  ariaLabel?: string
  inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
  name?: string
  maxlength?: number
  required?: boolean
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
  autocomplete: undefined,
  ariaLabel: undefined,
  inputmode: undefined,
  name: undefined,
  maxlength: undefined,
  required: false,
  leadingIcon: undefined,
  trailingIcon: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<Emits>()
const input = useTemplateRef<HTMLInputElement>('input')

function focus() {
  input.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div
    class="control-focus flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] px-3 text-[var(--color-text-primary)] transition-[background-color,border-color] duration-[var(--motion-fast)] focus-within:border-[var(--color-accent)]"
    :class="disabled ? 'opacity-55' : ''"
  >
    <BaseIcon v-if="leadingIcon" :name="leadingIcon" size="sm" class="text-[var(--color-text-tertiary)]" />
    <input
      :id="id"
      ref="input"
      :aria-describedby="ariaDescribedby"
      :aria-invalid="ariaInvalid"
      :aria-label="ariaLabel"
      :autocomplete="autocomplete"
      class="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-[var(--color-muted-foreground)] disabled:cursor-not-allowed"
      :disabled="disabled"
      :inputmode="inputmode"
      :maxlength="maxlength"
      :name="name"
      :placeholder="placeholder"
      :required="required"
      :type="type"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <BaseIcon v-if="trailingIcon" :name="trailingIcon" size="sm" class="text-[var(--color-text-tertiary)]" />
  </div>
</template>
