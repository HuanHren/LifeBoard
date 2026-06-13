<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'

interface Props {
  title: string
  description: string
}

defineProps<Props>()
</script>

<template>
  <BaseCard as="section">
    <div class="space-y-3">
      <h3 class="text-section-title text-[var(--color-text-primary)]">
        {{ title }}
      </h3>
      <p class="max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
        {{ description }}
      </p>
    </div>
  </BaseCard>
</template>
