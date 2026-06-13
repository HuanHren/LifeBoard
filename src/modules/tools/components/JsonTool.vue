<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ToolOutput from '@/modules/tools/components/ToolOutput.vue'
import ToolPanelHeader from '@/modules/tools/components/ToolPanelHeader.vue'
import ToolTextArea from '@/modules/tools/components/ToolTextArea.vue'
import { getInputLimitError } from '@/modules/tools/constants/tools'
import type {
  JsonAction,
  JsonIndentation,
} from '@/modules/tools/types/tools'
import { transformJson } from '@/modules/tools/utils/jsonTools'

const input = shallowRef('')
const output = shallowRef('')
const processingError = shallowRef<string | null>(null)
const indentation = shallowRef<JsonIndentation>(2)
const sizeError = computed(() => getInputLimitError(input.value))
const inputError = computed(() => sizeError.value ?? processingError.value)
const inputCount = computed(() => `${input.value.length.toLocaleString()} characters`)

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
      description="Validate any JSON value, then format it for reading or minify it for compact use."
      title="JSON formatter and minifier"
    />

    <div class="grid min-w-0 gap-6 xl:grid-cols-2">
      <div class="min-w-0 space-y-4">
        <ToolTextArea
          id="json-input"
          v-model="input"
          :count-metadata="inputCount"
          :error="inputError"
          helper="Accepts objects, arrays, strings, numbers, booleans, and null."
          label="JSON input"
          placeholder='{"name":"LifeBoard"}'
          @update:model-value="processingError = null"
        />

        <fieldset class="space-y-2">
          <legend class="text-sm font-semibold text-[var(--color-text-primary)]">
            Format indentation
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
              Two spaces
            </label>
            <label class="flex min-h-11 items-center gap-2 text-sm">
              <input
                v-model="indentation"
                class="size-5 accent-[var(--color-accent)]"
                name="json-indentation"
                :value="4"
                type="radio"
              />
              Four spaces
            </label>
          </div>
        </fieldset>

        <div class="flex flex-wrap gap-2">
          <BaseButton variant="primary" @click="processJson('format')">Format JSON</BaseButton>
          <BaseButton variant="secondary" @click="processJson('minify')">Minify JSON</BaseButton>
        </div>
      </div>

      <ToolOutput
        id="json-output"
        empty-copy="Processed JSON will appear here."
        :output="output"
        @clear="output = ''"
      />
    </div>
  </div>
</template>
