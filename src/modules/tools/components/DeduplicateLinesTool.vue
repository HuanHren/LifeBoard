<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import ToolOutput from '@/modules/tools/components/ToolOutput.vue'
import ToolPanelHeader from '@/modules/tools/components/ToolPanelHeader.vue'
import ToolTextArea from '@/modules/tools/components/ToolTextArea.vue'
import { getInputLimitError } from '@/modules/tools/constants/tools'
import type { DeduplicateResult } from '@/modules/tools/types/tools'
import { deduplicateLines } from '@/modules/tools/utils/deduplicateTools'
import {
  getToolDefinitionCopy,
  localizeToolsError,
} from '@/modules/tools/utils/toolsI18n'

const { formatNumber, t } = useI18n()
const input = shallowRef('')
const result = shallowRef<DeduplicateResult | null>(null)
const options = reactive({
  caseInsensitive: false,
  trimForComparison: false,
  removeBlankLines: false,
})
const sizeError = computed(() => getInputLimitError(input.value))
const definition = computed(() => getToolDefinitionCopy('deduplicate', t))

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
      :description="definition.description"
      :title="definition.title"
    />

    <div class="grid min-w-0 gap-6 xl:grid-cols-2">
      <div class="min-w-0 space-y-4">
        <ToolTextArea
          id="deduplicate-input"
          v-model="input"
          :count-metadata="t('tools.common.characters', { count: formatNumber(input.length) })"
          :error="localizeToolsError(sizeError, t)"
          :helper="t('tools.deduplicate.inputHelper')"
          :label="t('tools.deduplicate.inputLabel')"
          :placeholder="t('tools.deduplicate.inputPlaceholder')"
        />

        <fieldset class="space-y-1">
          <legend class="mb-1 text-sm font-semibold">
            {{ t('tools.deduplicate.options') }}
          </legend>
          <label class="flex min-h-11 items-center gap-3 text-sm">
            <input
              v-model="options.caseInsensitive"
              class="size-5 accent-[var(--color-accent)]"
              type="checkbox"
            />
            {{ t('tools.deduplicate.ignoreCase') }}
          </label>
          <label class="flex min-h-11 items-center gap-3 text-sm">
            <input
              v-model="options.trimForComparison"
              class="size-5 accent-[var(--color-accent)]"
              type="checkbox"
            />
            {{ t('tools.deduplicate.ignoreWhitespace') }}
          </label>
          <label class="flex min-h-11 items-center gap-3 text-sm">
            <input
              v-model="options.removeBlankLines"
              class="size-5 accent-[var(--color-accent)]"
              type="checkbox"
            />
            {{ t('tools.deduplicate.removeBlank') }}
          </label>
        </fieldset>

        <BaseButton variant="primary" @click="processLines">
          {{ t('tools.deduplicate.action') }}
        </BaseButton>
      </div>

      <div class="min-w-0 space-y-3">
        <dl
          v-if="result"
          class="grid grid-cols-3 gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 text-center"
        >
          <div>
            <dt class="text-caption text-[var(--color-text-secondary)]">
              {{ t('tools.deduplicate.sourceLines') }}
            </dt>
            <dd class="mt-1 font-semibold tabular-nums">{{ result.sourceLines }}</dd>
          </div>
          <div>
            <dt class="text-caption text-[var(--color-text-secondary)]">
              {{ t('tools.deduplicate.resultLines') }}
            </dt>
            <dd class="mt-1 font-semibold tabular-nums">{{ result.resultLines }}</dd>
          </div>
          <div>
            <dt class="text-caption text-[var(--color-text-secondary)]">
              {{ t('tools.deduplicate.removed') }}
            </dt>
            <dd class="mt-1 font-semibold tabular-nums">{{ result.removedDuplicates }}</dd>
          </div>
        </dl>
        <ToolOutput
          id="deduplicate-output"
          :empty-copy="t('tools.deduplicate.emptyOutput')"
          :output="result?.output ?? ''"
          @clear="clearOutput"
        />
      </div>
    </div>
  </div>
</template>
