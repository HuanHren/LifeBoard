<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import ToolOutput from '@/modules/tools/components/ToolOutput.vue'
import ToolPanelHeader from '@/modules/tools/components/ToolPanelHeader.vue'
import ToolTextArea from '@/modules/tools/components/ToolTextArea.vue'
import { getInputLimitError } from '@/modules/tools/constants/tools'
import type {
  JsonAction,
  JsonIndentation,
} from '@/modules/tools/types/tools'
import { transformJson } from '@/modules/tools/utils/jsonTools'
import {
  getToolDefinitionCopy,
  localizeToolsError,
} from '@/modules/tools/utils/toolsI18n'

const { formatNumber, t } = useI18n()
const input = shallowRef('')
const output = shallowRef('')
const processingError = shallowRef<string | null>(null)
const indentation = shallowRef<JsonIndentation>(2)
const sizeError = computed(() => getInputLimitError(input.value))
const inputError = computed(() => sizeError.value ?? processingError.value)
const inputCount = computed(() =>
  t('tools.common.characters', { count: formatNumber(input.value.length) }),
)
const definition = computed(() => getToolDefinitionCopy('json', t))

function processJson(action: JsonAction) {
  processingError.value = null

  if (sizeError.value) {
    output.value = ''
    return
  }

  const result = transformJson(input.value, action, indentation.value)
  output.value = result.output
  processingError.value = result.error
}

function clearInput() {
  input.value = ''
  output.value = ''
  processingError.value = null
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
          id="json-input"
          v-model="input"
          :count-metadata="inputCount"
          :error="localizeToolsError(inputError, t)"
          :helper="t('tools.json.inputHelper')"
          :label="t('tools.json.inputLabel')"
          placeholder='{"name":"LifeBoard"}'
          @update:model-value="processingError = null"
        />

        <fieldset class="tool-panel__fieldset">
          <legend>
            {{ t('tools.json.indentation') }}
          </legend>
          <div class="tool-panel__options">
            <label>
              <input
                v-model="indentation"
                name="json-indentation"
                :value="2"
                type="radio"
              />
              {{ t('tools.json.spaces', { count: 2 }) }}
            </label>
            <label>
              <input
                v-model="indentation"
                name="json-indentation"
                :value="4"
                type="radio"
              />
              {{ t('tools.json.spaces', { count: 4 }) }}
            </label>
          </div>
        </fieldset>

        <div class="tool-panel__actions">
          <BaseButton variant="primary" @click="processJson('format')">
            {{ t('tools.json.format') }}
          </BaseButton>
          <BaseButton variant="secondary" @click="processJson('minify')">
            {{ t('tools.json.minify') }}
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
        id="json-output"
        :empty-copy="t('tools.json.emptyOutput')"
        :output="output"
        @clear="output = ''"
      />
    </div>
  </div>
</template>
