<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import { useClipboardFeedback } from '@/modules/tools/composables/useClipboardFeedback'
import { localizeToolsError } from '@/modules/tools/utils/toolsI18n'

interface Props {
  content: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
})
const { t } = useI18n()
const { copyStatus, copyError, copy } = useClipboardFeedback(() => props.content)
const buttonLabel = computed(() => {
  if (copyStatus.value === 'copied') return t('tools.common.copied')
  if (copyStatus.value === 'copying') return t('tools.common.copying')
  return props.label ?? t('tools.common.copyOutput')
})
</script>

<template>
  <div class="copy-button">
    <BaseButton
      :aria-label="label ?? t('tools.common.copyOutput')"
      :aria-busy="copyStatus === 'copying'"
      :disabled="content.length === 0 || copyStatus === 'copying'"
      size="sm"
      variant="secondary"
      @click="copy"
    >
      {{ buttonLabel }}
    </BaseButton>
    <p class="sr-only" aria-live="polite">
      {{ copyStatus === 'copied' ? t('tools.common.copyAnnouncement') : '' }}
    </p>
    <p
      v-if="copyError"
      class="copy-button__error"
      role="alert"
    >
      {{ localizeToolsError(copyError, t) }}
    </p>
  </div>
</template>

<style scoped>
.copy-button {
  display: grid;
  gap: var(--space-2);
}

.copy-button__error {
  max-width: 18rem;
  color: var(--color-danger);
  font-size: var(--font-size-caption);
  line-height: 1.45;
}
</style>
