<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import ToolPanelHeader from '@/modules/tools/components/ToolPanelHeader.vue'
import ToolTextArea from '@/modules/tools/components/ToolTextArea.vue'
import { getInputLimitError } from '@/modules/tools/constants/tools'
import { countTextMetrics } from '@/modules/tools/utils/textMetrics'
import {
  getToolDefinitionCopy,
  localizeToolsError,
} from '@/modules/tools/utils/toolsI18n'

const { formatNumber, t } = useI18n()
const input = shallowRef('')
const sizeError = computed(() => getInputLimitError(input.value))
const metrics = computed(() =>
  sizeError.value
    ? { words: 0, characters: 0, charactersWithoutWhitespace: 0, lines: 0 }
    : countTextMetrics(input.value),
)
const definition = computed(() => getToolDefinitionCopy('counter', t))
</script>

<template>
  <div class="space-y-6">
    <ToolPanelHeader
      :description="definition.description"
      :title="definition.title"
    />

    <ToolTextArea
      id="counter-input"
      v-model="input"
      :count-metadata="t('tools.common.charactersEntered', { count: formatNumber(input.length) })"
      :error="localizeToolsError(sizeError, t)"
      :helper="t('tools.counter.inputHelper')"
      :label="t('tools.counter.inputLabel')"
      :placeholder="t('tools.counter.inputPlaceholder')"
    />

    <dl class="grid gap-px overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-border-soft)] sm:grid-cols-2 xl:grid-cols-4">
      <div class="bg-[var(--color-surface-raised)] p-4">
        <dt class="text-sm text-[var(--color-text-secondary)]">
          {{ t('tools.counter.words') }}
        </dt>
        <dd class="mt-1 text-xl font-semibold tabular-nums">{{ metrics.words }}</dd>
      </div>
      <div class="bg-[var(--color-surface-raised)] p-4">
        <dt class="text-sm text-[var(--color-text-secondary)]">
          {{ t('tools.counter.characters') }}
        </dt>
        <dd class="mt-1 text-xl font-semibold tabular-nums">{{ metrics.characters }}</dd>
      </div>
      <div class="bg-[var(--color-surface-raised)] p-4">
        <dt class="text-sm text-[var(--color-text-secondary)]">
          {{ t('tools.counter.withoutWhitespace') }}
        </dt>
        <dd class="mt-1 text-xl font-semibold tabular-nums">
          {{ metrics.charactersWithoutWhitespace }}
        </dd>
      </div>
      <div class="bg-[var(--color-surface-raised)] p-4">
        <dt class="text-sm text-[var(--color-text-secondary)]">
          {{ t('tools.counter.lines') }}
        </dt>
        <dd class="mt-1 text-xl font-semibold tabular-nums">{{ metrics.lines }}</dd>
      </div>
    </dl>
    <p class="sr-only" aria-live="polite">
      {{
        t('tools.counter.announcement', {
          words: formatNumber(metrics.words),
          characters: formatNumber(metrics.characters),
          withoutWhitespace: formatNumber(metrics.charactersWithoutWhitespace),
          lines: formatNumber(metrics.lines),
        })
      }}
    </p>
  </div>
</template>
