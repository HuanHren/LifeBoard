<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ToolOutput from '@/modules/tools/components/ToolOutput.vue'
import ToolPanelHeader from '@/modules/tools/components/ToolPanelHeader.vue'
import ToolTextArea from '@/modules/tools/components/ToolTextArea.vue'
import { CASE_MODES, getInputLimitError } from '@/modules/tools/constants/tools'
import type { CaseMode } from '@/modules/tools/types/tools'
import { convertCase } from '@/modules/tools/utils/caseTools'

const input = shallowRef('')
const output = shallowRef('')
const mode = shallowRef<CaseMode>('lowercase')
const sizeError = computed(() => getInputLimitError(input.value))

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
      description="Convert text into common writing and identifier case styles."
      title="Case converter"
    />

    <div class="grid min-w-0 gap-6 xl:grid-cols-2">
      <div class="min-w-0 space-y-4">
        <ToolTextArea
          id="case-input"
          v-model="input"
          :count-metadata="`${input.length.toLocaleString()} characters`"
          :error="sizeError"
          helper="Punctuation and acronym handling are intentionally conservative."
          label="Text input"
          placeholder="Paste text to convert."
        />

        <fieldset class="space-y-2">
          <legend class="text-sm font-semibold">Output style</legend>
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
              {{ caseMode.label }}
            </label>
          </div>
        </fieldset>

        <BaseButton variant="primary" @click="processText">Convert case</BaseButton>
      </div>

      <ToolOutput
        id="case-output"
        empty-copy="Converted text will appear here."
        :output="output"
        @clear="output = ''"
      />
    </div>
  </div>
</template>
