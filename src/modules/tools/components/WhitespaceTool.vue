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
          id="whitespace-input"
          v-model="input"
          :count-metadata="t('tools.common.characters', { count: formatNumber(input.length) })"
          :error="localizeToolsError(sizeError, t)"
          :helper="t('tools.whitespace.inputHelper')"
          :label="t('tools.whitespace.inputLabel')"
          :placeholder="t('tools.whitespace.inputPlaceholder')"
        />

        <fieldset class="space-y-1">
          <legend class="mb-1 text-sm font-semibold">
            {{ t('tools.whitespace.options') }}
          </legend>
          <label class="flex min-h-11 items-center gap-3 text-sm">
            <input
              v-model="options.collapseInlineWhitespace"
              class="size-5 accent-[var(--color-accent)]"
              type="checkbox"
            />
            {{ t('tools.whitespace.collapseInline') }}
          </label>
          <label class="flex min-h-11 items-center gap-3 text-sm">
            <input
              v-model="options.collapseBlankLines"
              class="size-5 accent-[var(--color-accent)]"
              type="checkbox"
            />
            {{ t('tools.whitespace.collapseBlank') }}
          </label>
        </fieldset>

        <BaseButton variant="primary" @click="processText">
          {{ t('tools.whitespace.action') }}
        </BaseButton>
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
