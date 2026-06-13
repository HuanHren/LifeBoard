<script setup lang="ts">
interface Props {
  as?: 'article' | 'section' | 'div'
  elevated?: boolean
}

withDefaults(defineProps<Props>(), {
  as: 'article',
  elevated: false,
})
</script>

<template>
  <component
    :is="as"
    :class="[
      'rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-5',
      elevated ? 'shadow-[var(--shadow-soft)]' : '',
    ]"
  >
    <slot />
  </component>
</template>
