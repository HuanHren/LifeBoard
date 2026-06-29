<script setup lang="ts">
interface Props {
  variant?: 'default' | 'wide' | 'narrow'
  gap?: 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  gap: 'lg',
})
</script>

<template>
  <div
    :class="[
      variant === 'wide' ? 'page-container-wide' : 'page-container',
      variant === 'narrow' ? '!max-w-4xl' : '',
      gap === 'md' ? 'space-y-6' : 'space-y-[var(--section-gap)]',
    ]"
  >
    <slot />
  </div>
</template>
