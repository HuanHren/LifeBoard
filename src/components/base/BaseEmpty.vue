<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'

interface Props {
  title: string
  description: string
  actionLabel?: string
  titleAs?: 'h1' | 'h2' | 'h3'
}

interface Emits {
  action: []
}

withDefaults(defineProps<Props>(), {
  titleAs: 'h3',
})
const emit = defineEmits<Emits>()

defineSlots<{
  actions(): unknown
}>()
</script>

<template>
  <div
    class="surface-card border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-left"
    role="status"
  >
    <div class="max-w-xl space-y-3">
      <component
        :is="titleAs"
        class="text-section-title text-[var(--color-text-primary)]"
      >
        {{ title }}
      </component>
      <p class="text-sm leading-6 text-[var(--color-text-secondary)]">
        {{ description }}
      </p>
      <div v-if="actionLabel || $slots.actions" class="flex flex-wrap gap-2">
        <slot name="actions">
          <BaseButton size="sm" variant="primary" @click="emit('action')">
            {{ actionLabel }}
          </BaseButton>
        </slot>
      </div>
    </div>
  </div>
</template>
