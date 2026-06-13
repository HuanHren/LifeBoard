<script setup lang="ts">
interface Props {
  title: string
  description: string
}

defineProps<Props>()
</script>

<template>
  <header class="max-w-3xl">
    <h2 class="text-section-title text-balance text-[var(--color-text-primary)]">
      {{ title }}
    </h2>
    <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
      {{ description }}
    </p>
    <p class="mt-2 text-caption text-[var(--color-text-tertiary)]">
      Processed only in this browser. Input is not saved or sent anywhere.
    </p>
  </header>
</template>
