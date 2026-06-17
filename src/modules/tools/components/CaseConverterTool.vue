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
</script>

<template>
  <div class="space-y-6">
    <ToolPanelHeader
      :description="definition.description"
      :title="definition.title"
    />

    <div class="grid min-w-0 gap-6 xl:grid-cols-2">
      <div class="min-w-0 space-y-4">
        <ToolTextArea
          id="case-input"
          v-model="input"
          :count-metadata="t('tools.common.characters', { count: formatNumber(input.length) })"
          :error="localizeToolsError(sizeError, t)"
          :helper="t('tools.case.inputHelper')"
          :label="t('tools.case.inputLabel')"
          :placeholder="t('tools.case.inputPlaceholder')"
        />

        <fieldset class="space-y-2">
          <legend class="text-sm font-semibold">
            {{ t('tools.case.outputStyle') }}
          </legend>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="caseMode in CASE_MODES"
              :key="caseMode.value"
              class="flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border-soft)] px-3 text-sm"
              :class="
                mode === caseMode.value
                  ? 'bg-[var(--color-accent-wash)] text-[var(--color-accent-text)]'
                  : 'bg-[var(--color-surface)]'
              "
            >
              <input
                v-model="mode"
                class="size-4 accent-[var(--color-accent)]"
                name="case-mode"
                type="radio"
                :value="caseMode.value"
              />
              {{ getCaseModeLabel(caseMode.value, t) }}
            </label>
          </div>
        </fieldset>

        <BaseButton variant="primary" @click="processText">
          {{ t('tools.case.action') }}
        </BaseButton>
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
