<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'

interface Props {
  title: string
  description: string
  actionLabel?: string
}

interface Emits {
  action: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div
    class="surface-card border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-left"
    role="status"
  >
    <div class="max-w-xl space-y-3">
      <h3 class="text-section-title text-[var(--color-text-primary)]">
        {{ title }}
      </h3>
      <p class="text-sm leading-6 text-[var(--color-text-secondary)]">
        {{ description }}
      </p>
      <BaseButton v-if="actionLabel" size="sm" variant="primary" @click="emit('action')">
        {{ actionLabel }}
      </BaseButton>
    </div>
  </div>
</template>
