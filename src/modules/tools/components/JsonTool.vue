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
          id="json-input"
          v-model="input"
          :count-metadata="inputCount"
          :error="localizeToolsError(inputError, t)"
          :helper="t('tools.json.inputHelper')"
          :label="t('tools.json.inputLabel')"
          placeholder='{"name":"LifeBoard"}'
          @update:model-value="processingError = null"
        />

        <fieldset class="space-y-2">
          <legend class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ t('tools.json.indentation') }}
          </legend>
          <div class="flex flex-wrap gap-4">
            <label class="flex min-h-11 items-center gap-2 text-sm">
              <input
                v-model="indentation"
                class="size-5 accent-[var(--color-accent)]"
                name="json-indentation"
                :value="2"
                type="radio"
              />
              {{ t('tools.json.spaces', { count: 2 }) }}
            </label>
            <label class="flex min-h-11 items-center gap-2 text-sm">
              <input
                v-model="indentation"
                class="size-5 accent-[var(--color-accent)]"
                name="json-indentation"
                :value="4"
                type="radio"
              />
              {{ t('tools.json.spaces', { count: 4 }) }}
            </label>
          </div>
        </fieldset>

        <div class="flex flex-wrap gap-2">
          <BaseButton variant="primary" @click="processJson('format')">
            {{ t('tools.json.format') }}
          </BaseButton>
          <BaseButton variant="secondary" @click="processJson('minify')">
            {{ t('tools.json.minify') }}
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
