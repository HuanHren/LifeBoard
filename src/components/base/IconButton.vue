<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon, { type BaseIconName } from '@/components/base/BaseIcon.vue'

interface Props {
  ariaLabel: string
  icon: BaseIconName
  variant?: 'ghost' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'ghost',
  size: 'md',
  type: 'button',
  disabled: false,
})

const classes = computed(() => [
  'control-focus inline-flex items-center justify-center rounded-[var(--radius-sm)] border font-medium',
  'transition-[background-color,border-color,color,transform] duration-[var(--motion-fast)] ease-[var(--motion-ease)]',
  'active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50',
  props.size === 'sm' ? 'size-9' : props.size === 'lg' ? 'size-12' : 'size-11',
  props.variant === 'ghost'
    ? 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-interactive)] hover:text-[var(--color-text-primary)]'
    : '',
  props.variant === 'secondary'
    ? 'border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] hover:border-[var(--color-control-border)] hover:bg-[var(--color-surface-interactive)]'
    : '',
  props.variant === 'danger'
    ? 'border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)] hover:bg-[var(--color-surface-raised)]'
    : '',
])
</script>

<template>
  <button :aria-label="ariaLabel" :class="classes" :disabled="disabled" :type="type">
    <BaseIcon :name="icon" />
  </button>
</template>
