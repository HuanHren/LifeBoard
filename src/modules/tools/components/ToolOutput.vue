<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import CopyButton from '@/modules/tools/components/CopyButton.vue'

interface Props {
  id: string
  output: string
  emptyCopy: string
  label?: string
  allowClear?: boolean
}

interface Emits {
  clear: []
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  allowClear: true,
})
const emit = defineEmits<Emits>()
const { t } = useI18n()
</script>

<template>
  <div class="tool-output">
    <div class="tool-output__header">
      <div>
        <label :for="id">
          {{ props.label ?? t('tools.common.output') }}
        </label>
        <p>
          {{
            output.length > 0
              ? t('tools.common.outputReady')
              : t('tools.common.outputEmpty')
          }}
        </p>
      </div>
      <div class="tool-output__actions">
        <CopyButton :content="output" :label="t('tools.common.copyOutput')" />
        <BaseButton
          v-if="allowClear"
          :disabled="output.length === 0"
          :aria-label="t('tools.common.clearOutput')"
          size="sm"
          variant="ghost"
          @click="emit('clear')"
        >
          {{ t('tools.common.clearOutput') }}
        </BaseButton>
      </div>
    </div>
    <textarea
      :id="id"
      class="tool-output__control"
      :placeholder="emptyCopy"
      readonly
      :value="output"
      wrap="off"
    />
  </div>
</template>

<style scoped>
.tool-output {
  display: grid;
  min-width: 0;
  gap: var(--space-2);
}

.tool-output__header {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-3);
}

.tool-output__header label {
  color: var(--color-text-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.tool-output__header p {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: 1.45;
}

.tool-output__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tool-output__control {
  display: block;
  width: 100%;
  max-width: 100%;
  min-height: clamp(11rem, 32vh, 20rem);
  resize: vertical;
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  padding: var(--space-3);
  font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
  font-size: var(--font-size-label);
  line-height: 1.6;
  scrollbar-width: thin;
}

.tool-output__control::placeholder {
  color: var(--color-text-tertiary);
}

@media (max-width: 40rem) {
  .tool-output__control {
    min-height: 12rem;
  }
}
</style>
