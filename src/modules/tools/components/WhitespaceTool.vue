<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ToolOutput from '@/modules/tools/components/ToolOutput.vue'
import ToolPanelHeader from '@/modules/tools/components/ToolPanelHeader.vue'
import ToolTextArea from '@/modules/tools/components/ToolTextArea.vue'
import { getInputLimitError } from '@/modules/tools/constants/tools'
import { cleanWhitespace } from '@/modules/tools/utils/whitespaceTools'

const input = shallowRef('')
const output = shallowRef('')
const options = reactive({
  collapseInlineWhitespace: false,
  collapseBlankLines: false,
})
const sizeError = computed(() => getInputLimitError(input.value))

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
      description="Trim outer whitespace and choose which repeated spacing should be normalized."
      title="Whitespace cleaner"
    />

    <div class="grid min-w-0 gap-6 xl:grid-cols-2">
      <div class="min-w-0 space-y-4">
        <ToolTextArea
          id="whitespace-input"
          v-model="input"
          :count-metadata="`${input.length.toLocaleString()} characters`"
          :error="sizeError"
          helper="Line endings are normalized. Other line structure stays intact unless selected below."
          label="Text input"
          placeholder="Paste text with spacing to clean."
        />

        <fieldset class="space-y-1">
          <legend class="mb-1 text-sm font-semibold">Cleanup options</legend>
          <label class="flex min-h-11 items-center gap-3 text-sm">
            <input
              v-model="options.collapseInlineWhitespace"
              class="size-5 accent-[var(--color-accent)]"
              type="checkbox"
            />
            Collapse repeated spaces and tabs
          </label>
          <label class="flex min-h-11 items-center gap-3 text-sm">
            <input
              v-model="options.collapseBlankLines"
              class="size-5 accent-[var(--color-accent)]"
              type="checkbox"
            />
            Limit repeated blank lines to one
          </label>
        </fieldset>

        <BaseButton variant="primary" @click="processText">Clean whitespace</BaseButton>
      </div>

      <ToolOutput
        id="whitespace-output"
        empty-copy="Cleaned text will appear here."
        :output="output"
        @clear="output = ''"
      />
    </div>
  </div>
</template>
