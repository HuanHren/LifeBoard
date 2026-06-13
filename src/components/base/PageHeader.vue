<script setup lang="ts">
interface Props {
  title: string
  description: string
}

defineProps<Props>()
</script>

<template>
  <header class="max-w-4xl space-y-3">
    <h1 class="text-page-title text-[var(--color-text-primary)]">
      {{ title }}
    </h1>
    <p class="max-w-2xl text-base leading-7 text-[var(--color-text-secondary)]">
      {{ description }}
    </p>
  </header>
</template>
