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

defineSlots<{
  actions(): unknown
}>()
</script>

<template>
  <div
    class="surface-card surface-card--danger rounded-[var(--radius-md)] p-4 text-[var(--color-text-primary)]"
    role="alert"
  >
    <div class="space-y-2">
      <h3 class="text-sm font-semibold">
        {{ title }}
      </h3>
      <p class="text-sm leading-6">
        {{ message }}
      </p>
      <div v-if="actionLabel || $slots.actions" class="flex flex-wrap gap-2">
        <slot name="actions">
          <BaseButton size="sm" variant="secondary" @click="emit('action')">
            {{ actionLabel }}
          </BaseButton>
        </slot>
      </div>
    </div>
  </div>
</template>
