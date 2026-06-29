<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
})

const buttonClasses = computed(() => [
  'control-focus inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border font-medium',
  'transition-[background-color,border-color,color,transform] duration-[var(--motion-fast)] ease-[var(--motion-ease)]',
  'active:scale-[0.96] disabled:pointer-events-none disabled:opacity-55',
  props.size === 'sm' ? 'min-h-9 px-3 text-sm' : '',
  props.size === 'md' ? 'min-h-11 px-4 text-sm' : '',
  props.size === 'lg' ? 'min-h-12 px-5 text-sm' : '',
  props.size === 'icon' ? 'size-11 px-0 text-sm' : '',
  props.variant === 'primary'
    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-accent-hover)]'
    : '',
  props.variant === 'secondary'
    ? 'border-[var(--color-control-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-interactive)]'
    : '',
  props.variant === 'ghost'
    ? 'border-transparent bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-interactive)] hover:text-[var(--color-text-primary)]'
    : '',
  props.variant === 'danger'
    ? 'border-[var(--color-danger)] bg-[var(--color-danger)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]'
    : '',
])
</script>

<template>
  <button
    :aria-busy="loading || undefined"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
  >
    <span
      v-if="loading"
      class="size-3.5 animate-spin rounded-[var(--radius-pill)] border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>
