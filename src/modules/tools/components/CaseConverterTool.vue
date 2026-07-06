<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import ToolOutput from '@/modules/tools/components/ToolOutput.vue'
import ToolPanelHeader from '@/modules/tools/components/ToolPanelHeader.vue'
import ToolTextArea from '@/modules/tools/components/ToolTextArea.vue'
import { CASE_MODES, getInputLimitError } from '@/modules/tools/constants/tools'
import type { CaseMode } from '@/modules/tools/types/tools'
import { convertCase } from '@/modules/tools/utils/caseTools'
import {
  getCaseModeLabel,
  getToolDefinitionCopy,
  localizeToolsError,
} from '@/modules/tools/utils/toolsI18n'

const { formatNumber, t } = useI18n()
const input = shallowRef('')
const output = shallowRef('')
const mode = shallowRef<CaseMode>('lowercase')
const sizeError = computed(() => getInputLimitError(input.value))
const definition = computed(() => getToolDefinitionCopy('case', t))

function processText() {
  if (sizeError.value) {
    output.value = ''
    return
  }

  output.value = convertCase(input.value, mode.value)
}

function clearInput() {
  input.value = ''
  output.value = ''
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
          id="case-input"
          v-model="input"
          :count-metadata="t('tools.common.characters', { count: formatNumber(input.length) })"
          :error="localizeToolsError(sizeError, t)"
          :helper="t('tools.case.inputHelper')"
          :label="t('tools.case.inputLabel')"
          :placeholder="t('tools.case.inputPlaceholder')"
        />

        <fieldset class="tool-panel__fieldset">
          <legend>
            {{ t('tools.case.outputStyle') }}
          </legend>
          <div class="case-modes">
            <label
              v-for="caseMode in CASE_MODES"
              :key="caseMode.value"
              class="case-modes__item"
              :class="{ 'is-active': mode === caseMode.value }"
            >
              <input
                v-model="mode"
                name="case-mode"
                type="radio"
                :value="caseMode.value"
              />
              {{ getCaseModeLabel(caseMode.value, t) }}
            </label>
          </div>
        </fieldset>

        <div class="tool-panel__actions">
          <BaseButton variant="primary" @click="processText">
            {{ t('tools.case.action') }}
          </BaseButton>
          <BaseButton
            :disabled="input.length === 0 && output.length === 0"
            variant="ghost"
            @click="clearInput"
          >
            {{ t('tools.common.clearInput') }}
          </BaseButton>
        </div>
      </div>

      <ToolOutput
        id="case-output"
        :empty-copy="t('tools.case.emptyOutput')"
        :output="output"
        @clear="output = ''"
      />
    </div>
  </div>
</template>

<style scoped>
.case-modes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.case-modes__item {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-primary);
  padding: 0 var(--space-3);
  font-size: var(--font-size-label);
}

.case-modes__item.is-active {
  border-color: var(--color-accent);
  background: var(--color-accent-wash);
  color: var(--color-accent-text);
  box-shadow: inset 0 -0.1875rem 0 var(--color-accent);
}

.case-modes__item input {
  width: 1rem;
  height: 1rem;
  accent-color: var(--color-accent);
}
</style>
