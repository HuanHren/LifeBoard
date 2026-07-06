<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import ToolOutput from '@/modules/tools/components/ToolOutput.vue'
import ToolPanelHeader from '@/modules/tools/components/ToolPanelHeader.vue'
import ToolTextArea from '@/modules/tools/components/ToolTextArea.vue'
import { getInputLimitError } from '@/modules/tools/constants/tools'
import { cleanWhitespace } from '@/modules/tools/utils/whitespaceTools'
import {
  getToolDefinitionCopy,
  localizeToolsError,
} from '@/modules/tools/utils/toolsI18n'

const { formatNumber, t } = useI18n()
const input = shallowRef('')
const output = shallowRef('')
const options = reactive({
  collapseInlineWhitespace: false,
  collapseBlankLines: false,
})
const sizeError = computed(() => getInputLimitError(input.value))
const definition = computed(() => getToolDefinitionCopy('whitespace', t))

function processText() {
  if (sizeError.value) {
    output.value = ''
    return
  }

  output.value = cleanWhitespace(input.value, options)
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
          id="whitespace-input"
          v-model="input"
          :count-metadata="t('tools.common.characters', { count: formatNumber(input.length) })"
          :error="localizeToolsError(sizeError, t)"
          :helper="t('tools.whitespace.inputHelper')"
          :label="t('tools.whitespace.inputLabel')"
          :placeholder="t('tools.whitespace.inputPlaceholder')"
        />

        <fieldset class="tool-panel__fieldset">
          <legend>
            {{ t('tools.whitespace.options') }}
          </legend>
          <div class="tool-panel__options">
          <label>
            <input
              v-model="options.collapseInlineWhitespace"
              type="checkbox"
            />
            {{ t('tools.whitespace.collapseInline') }}
          </label>
          <label>
            <input
              v-model="options.collapseBlankLines"
              type="checkbox"
            />
            {{ t('tools.whitespace.collapseBlank') }}
          </label>
          </div>
        </fieldset>

        <div class="tool-panel__actions">
          <BaseButton variant="primary" @click="processText">
            {{ t('tools.whitespace.action') }}
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
        id="whitespace-output"
        :empty-copy="t('tools.whitespace.emptyOutput')"
        :output="output"
        @clear="output = ''"
      />
    </div>
  </div>
</template>
