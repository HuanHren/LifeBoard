<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'

interface Props {
  title: string
  message: string
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
    class="rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-4 text-[var(--color-text-primary)]"
    role="alert"
  >
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">
        {{ title }}
      </h3>
      <p class="text-sm leading-6">
        {{ message }}
      </p>
      <BaseButton v-if="actionLabel" size="sm" variant="secondary" @click="emit('action')">
        {{ actionLabel }}
      </BaseButton>
    </div>
  </div>
</template>
