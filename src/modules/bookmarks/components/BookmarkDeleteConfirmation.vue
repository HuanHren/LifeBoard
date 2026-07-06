<script setup lang="ts">
import { onMounted, useTemplateRef, type ComponentPublicInstance } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'

interface Props {
  bookmarkTitle: string
}

interface Emits {
  confirm: []
  cancel: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
const keepButton = useTemplateRef<ComponentPublicInstance>('keepButton')

onMounted(() => {
  const element = keepButton.value?.$el
  if (element instanceof HTMLButtonElement) element.focus()
})
</script>

<template>
  <div
    class="flex min-h-11 flex-wrap items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-danger-soft)] p-2"
    role="group"
    :aria-label="t('bookmarks.delete.aria', { title: bookmarkTitle })"
    @keydown.esc.stop="emit('cancel')"
  >
    <span class="mr-auto text-sm font-medium text-[var(--color-danger)]">
      {{ t('bookmarks.delete.description', { title: bookmarkTitle }) }}
    </span>
    <BaseButton ref="keepButton" class="min-h-11" size="sm" variant="ghost" @click="emit('cancel')">
      {{ t('bookmarks.delete.cancel') }}
    </BaseButton>
    <BaseButton
      class="min-h-11 border-[var(--color-danger)] text-[var(--color-danger)] hover:border-[var(--color-danger)]"
      size="sm"
      variant="secondary"
      @click="emit('confirm')"
    >
      {{ t('bookmarks.delete.confirm') }}
    </BaseButton>
  </div>
</template>
