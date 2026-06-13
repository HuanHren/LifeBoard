<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ToolOutput from '@/modules/tools/components/ToolOutput.vue'
import ToolPanelHeader from '@/modules/tools/components/ToolPanelHeader.vue'
import ToolTextArea from '@/modules/tools/components/ToolTextArea.vue'
import { getInputLimitError } from '@/modules/tools/constants/tools'
import type { DeduplicateResult } from '@/modules/tools/types/tools'
import { deduplicateLines } from '@/modules/tools/utils/deduplicateTools'

const input = shallowRef('')
const result = shallowRef<DeduplicateResult | null>(null)
const options = reactive({
  caseInsensitive: false,
  trimForComparison: false,
  removeBlankLines: false,
})
const sizeError = computed(() => getInputLimitError(input.value))

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
</script>

<template>
  <div class="space-y-6">
    <ToolPanelHeader
      description="Keep the first occurrence of each line and preserve the original order."
      title="Deduplicate lines"
    />

    <div class="grid min-w-0 gap-6 xl:grid-cols-2">
      <div class="min-w-0 space-y-4">
        <ToolTextArea
          id="deduplicate-input"
          v-model="input"
          :count-metadata="`${input.length.toLocaleString()} characters`"
          :error="sizeError"
          helper="Comparison options affect matching only; retained lines keep their original text."
          label="Lines to check"
          placeholder="Paste one item per line."
        />

        <fieldset class="space-y-1">
          <legend class="mb-1 text-sm font-semibold">Comparison options</legend>
          <label class="flex min-h-11 items-center gap-3 text-sm">
            <input
              v-model="options.caseInsensitive"
              class="size-5 accent-[var(--color-accent)]"
              type="checkbox"
            />
            Ignore letter case
          </label>
          <label class="flex min-h-11 items-center gap-3 text-sm">
            <input
              v-model="options.trimForComparison"
              class="size-5 accent-[var(--color-accent)]"
              type="checkbox"
            />
            Ignore outer whitespace when comparing
          </label>
          <label class="flex min-h-11 items-center gap-3 text-sm">
            <input
              v-model="options.removeBlankLines"
              class="size-5 accent-[var(--color-accent)]"
              type="checkbox"
            />
            Remove blank lines
          </label>
        </fieldset>

        <BaseButton variant="primary" @click="processLines">Remove duplicates</BaseButton>
      </div>

      <div class="min-w-0 space-y-3">
        <dl
          v-if="result"
          class="grid grid-cols-3 gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 text-center"
        >
          <div>
            <dt class="text-caption text-[var(--color-text-secondary)]">Source lines</dt>
            <dd class="mt-1 font-semibold tabular-nums">{{ result.sourceLines }}</dd>
          </div>
          <div>
            <dt class="text-caption text-[var(--color-text-secondary)]">Result lines</dt>
            <dd class="mt-1 font-semibold tabular-nums">{{ result.resultLines }}</dd>
          </div>
          <div>
            <dt class="text-caption text-[var(--color-text-secondary)]">Duplicates removed</dt>
            <dd class="mt-1 font-semibold tabular-nums">{{ result.removedDuplicates }}</dd>
          </div>
        </dl>
        <ToolOutput
          id="deduplicate-output"
          empty-copy="Unique lines will appear here."
          :output="result?.output ?? ''"
          @clear="clearOutput"
        />
      </div>
    </div>
  </div>
</template>
