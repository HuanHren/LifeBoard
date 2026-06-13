<script setup lang="ts">
interface Props {
  title?: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <section class="space-y-4">
    <div v-if="title || description" class="max-w-3xl space-y-2">
      <h2 v-if="title" class="text-section-title text-[var(--color-text-primary)]">
        {{ title }}
      </h2>
      <p v-if="description" class="text-sm leading-6 text-[var(--color-text-secondary)]">
        {{ description }}
      </p>
    </div>
    <slot />
  </section>
</template>
