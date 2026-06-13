<script setup lang="ts">
import { onMounted, useTemplateRef, type ComponentPublicInstance } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'

interface Props {
  itemName: string
}

interface Emits {
  confirm: []
  cancel: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const cancelButton = useTemplateRef<ComponentPublicInstance>('cancelButton')

onMounted(() => {
  const element = cancelButton.value?.$el

  if (element instanceof HTMLButtonElement) {
    element.focus()
  }
})
</script>

<template>
  <div
    class="flex min-h-11 flex-wrap items-center justify-end gap-2"
    role="group"
    :aria-label="`Confirm deletion of ${itemName}`"
    @keydown.esc.stop="emit('cancel')"
  >
    <span class="mr-auto text-sm font-medium text-[var(--color-danger)]">Delete this item?</span>
    <BaseButton ref="cancelButton" size="sm" variant="ghost" @click="emit('cancel')">
      Keep
    </BaseButton>
    <BaseButton
      class="border-[var(--color-danger)] text-[var(--color-danger)] hover:border-[var(--color-danger)]"
      size="sm"
      variant="secondary"
      @click="emit('confirm')"
    >
      Delete
    </BaseButton>
  </div>
</template>
