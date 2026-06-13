<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useClipboardFeedback } from '@/modules/tools/composables/useClipboardFeedback'

interface Props {
  content: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Copy output',
})
const { copyStatus, copyError, copy } = useClipboardFeedback(() => props.content)
const buttonLabel = computed(() => {
  if (copyStatus.value === 'copied') return 'Copied'
  if (copyStatus.value === 'copying') return 'Copying'
  return props.label
})
</script>

<template>
  <div>
    <BaseButton
      :aria-busy="copyStatus === 'copying'"
      :disabled="content.length === 0 || copyStatus === 'copying'"
      size="sm"
      variant="secondary"
      @click="copy"
    >
      {{ buttonLabel }}
    </BaseButton>
    <p class="sr-only" aria-live="polite">
      {{ copyStatus === 'copied' ? 'Output copied to clipboard.' : '' }}
    </p>
    <p
      v-if="copyError"
      class="mt-2 max-w-sm text-sm leading-6 text-[var(--color-danger)]"
      role="alert"
    >
      {{ copyError }}
    </p>
  </div>
</template>
