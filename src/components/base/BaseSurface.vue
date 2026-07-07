<script setup lang="ts">
interface Props {
  as?: 'article' | 'section' | 'div' | 'aside' | 'header'
  variant?: 'plain' | 'muted' | 'interactive' | 'raised' | 'danger' | 'info'
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
      'surface-card',
      variant === 'muted' ? 'surface-card--muted' : '',
      variant === 'interactive' ? 'interactive-surface surface-card--interactive' : '',
      variant === 'raised' ? 'surface-card--elevated' : '',
      variant === 'danger' ? 'surface-card--danger' : '',
      variant === 'info' ? 'surface-card--info' : '',
      padding === 'none' ? 'p-0' : '',
      padding === 'sm' ? 'p-4' : '',
      padding === 'md' ? 'p-[var(--panel-padding)]' : '',
      padding === 'lg' ? 'p-6 sm:p-8' : '',
    ]"
  >
    <slot />
  </component>
</template>
