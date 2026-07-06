<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import ToolOutput from '@/modules/tools/components/ToolOutput.vue'
import ToolPanelHeader from '@/modules/tools/components/ToolPanelHeader.vue'
import ToolTextArea from '@/modules/tools/components/ToolTextArea.vue'
import { getInputLimitError } from '@/modules/tools/constants/tools'
import type { DeduplicateResult } from '@/modules/tools/types/tools'
import { deduplicateLines } from '@/modules/tools/utils/deduplicateTools'
import {
  getToolDefinitionCopy,
  localizeToolsError,
} from '@/modules/tools/utils/toolsI18n'

const { formatNumber, t } = useI18n()
const input = shallowRef('')
const result = shallowRef<DeduplicateResult | null>(null)
const options = reactive({
  caseInsensitive: false,
  trimForComparison: false,
  removeBlankLines: false,
})
const sizeError = computed(() => getInputLimitError(input.value))
const definition = computed(() => getToolDefinitionCopy('deduplicate', t))

function processLines() {
  if (sizeError.value) {
    result.value = null
    return
  }

  result.value = deduplicateLines(input.value, options)
}

function clearOutput() {
  result.value = null
}

function clearInput() {
  input.value = ''
  result.value = null
}
</script>

<template>
  <div class="tool-panel">
    <ToolPanelHeader
      :description="definition.description"
      :title="definition.title"
    />

    <div class="tool-panel__grid">
      <div class="tool-panel__input">
        <ToolTextArea
          id="deduplicate-input"
          v-model="input"
          :count-metadata="t('tools.common.characters', { count: formatNumber(input.length) })"
          :error="localizeToolsError(sizeError, t)"
          :helper="t('tools.deduplicate.inputHelper')"
          :label="t('tools.deduplicate.inputLabel')"
          :placeholder="t('tools.deduplicate.inputPlaceholder')"
        />

        <fieldset class="tool-panel__fieldset">
          <legend>
            {{ t('tools.deduplicate.options') }}
          </legend>
          <div class="tool-panel__options">
          <label>
            <input
              v-model="options.caseInsensitive"
              type="checkbox"
            />
            {{ t('tools.deduplicate.ignoreCase') }}
          </label>
          <label>
            <input
              v-model="options.trimForComparison"
              type="checkbox"
            />
            {{ t('tools.deduplicate.ignoreWhitespace') }}
          </label>
          <label>
            <input
              v-model="options.removeBlankLines"
              type="checkbox"
            />
            {{ t('tools.deduplicate.removeBlank') }}
          </label>
          </div>
        </fieldset>

        <div class="tool-panel__actions">
          <BaseButton variant="primary" @click="processLines">
            {{ t('tools.deduplicate.action') }}
          </BaseButton>
          <BaseButton
            :disabled="input.length === 0 && !result"
            variant="ghost"
            @click="clearInput"
          >
            {{ t('tools.common.clearInput') }}
          </BaseButton>
        </div>
      </div>

      <div class="deduplicate-output">
        <dl
          v-if="result"
          class="deduplicate-output__metrics"
        >
          <div>
            <dt>
              {{ t('tools.deduplicate.sourceLines') }}
            </dt>
            <dd>{{ result.sourceLines }}</dd>
          </div>
          <div>
            <dt>
              {{ t('tools.deduplicate.resultLines') }}
            </dt>
            <dd>{{ result.resultLines }}</dd>
          </div>
          <div>
            <dt>
              {{ t('tools.deduplicate.removed') }}
            </dt>
            <dd>{{ result.removedDuplicates }}</dd>
          </div>
        </dl>
        <ToolOutput
          id="deduplicate-output"
          :empty-copy="t('tools.deduplicate.emptyOutput')"
          :output="result?.output ?? ''"
          @clear="clearOutput"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.deduplicate-output {
  display: grid;
  min-width: 0;
  gap: var(--space-3);
  align-content: start;
}

.deduplicate-output__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  margin: 0;
}

.deduplicate-output__metrics div {
  min-width: 0;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: var(--space-3);
}

.deduplicate-output__metrics dt {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: var(--line-height-label);
}

.deduplicate-output__metrics dd {
  margin: var(--space-1) 0 0;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
  font-variant-numeric: tabular-nums;
}
</style>
