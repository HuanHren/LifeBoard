<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'md',
  type: 'button',
  disabled: false,
})

const buttonClasses = computed(() => [
  'inline-flex items-center justify-center rounded-[var(--radius-sm)] font-medium',
  'transition-[background-color,border-color,color,transform] duration-[var(--motion-fast)] ease-[var(--motion-ease)]',
  'active:scale-[0.96] disabled:opacity-55',
  props.size === 'sm' ? 'min-h-11 px-3 text-sm' : 'min-h-11 px-4 text-sm',
  props.variant === 'primary'
    ? 'border border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)]'
    : '',
  props.variant === 'secondary'
    ? 'border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)]'
    : '',
  props.variant === 'ghost'
    ? 'border border-transparent bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]'
    : '',
])
</script>

<template>
  <button :class="buttonClasses" :disabled="disabled" :type="type">
    <slot />
  </button>
</template>
