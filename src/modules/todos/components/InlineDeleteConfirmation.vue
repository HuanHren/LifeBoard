<script setup lang="ts">
import { onMounted, useTemplateRef, type ComponentPublicInstance } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'

interface Props {
  itemName: string
}

interface Emits {
  confirm: []
  cancel: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
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
    :aria-label="t('todos.delete.aria', { name: itemName })"
    @keydown.esc.stop="emit('cancel')"
  >
    <span class="mr-auto text-sm font-medium text-[var(--color-danger)]">
      {{ t('todos.delete.prompt') }}
    </span>
    <BaseButton ref="cancelButton" size="sm" variant="ghost" @click="emit('cancel')">
      {{ t('todos.delete.cancel') }}
    </BaseButton>
    <BaseButton
      class="border-[var(--color-danger)] text-[var(--color-danger)] hover:border-[var(--color-danger)]"
      size="sm"
      variant="secondary"
      @click="emit('confirm')"
    >
      {{ t('todos.tasks.deleteAction') }}
    </BaseButton>
  </div>
</template>
