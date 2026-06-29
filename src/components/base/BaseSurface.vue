<script setup lang="ts">
interface Props {
  as?: 'article' | 'section' | 'div' | 'aside'
  variant?: 'plain' | 'muted' | 'interactive' | 'raised' | 'danger'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  as: 'div',
  variant: 'plain',
  padding: 'md',
})
</script>

<template>
  <component
    :is="as"
    :class="[
      'rounded-[var(--radius-lg)] border',
      variant === 'plain' ? 'border-[var(--color-border-soft)] bg-[var(--color-surface-raised)]' : '',
      variant === 'muted' ? 'border-[var(--color-border-soft)] bg-[var(--color-surface-muted)]' : '',
      variant === 'interactive' ? 'interactive-surface border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] hover:border-[var(--color-control-border)] hover:bg-[var(--color-surface-interactive)]' : '',
      variant === 'raised' ? 'border-[var(--color-border-soft)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-raised)]' : '',
      variant === 'danger' ? 'border-[var(--color-danger)] bg-[var(--color-danger-soft)]' : '',
      padding === 'none' ? 'p-0' : '',
      padding === 'sm' ? 'p-4' : '',
      padding === 'md' ? 'p-[var(--panel-padding)]' : '',
      padding === 'lg' ? 'p-6 sm:p-8' : '',
    ]"
  >
    <slot />
  </component>
</template>
