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
      'surface-card p-5',
      elevated ? 'surface-card--elevated' : '',
    ]"
  >
    <slot />
  </component>
</template>
