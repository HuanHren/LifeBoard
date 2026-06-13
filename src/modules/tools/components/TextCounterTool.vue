<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import ToolPanelHeader from '@/modules/tools/components/ToolPanelHeader.vue'
import ToolTextArea from '@/modules/tools/components/ToolTextArea.vue'
import { getInputLimitError } from '@/modules/tools/constants/tools'
import { countTextMetrics } from '@/modules/tools/utils/textMetrics'

const input = shallowRef('')
const sizeError = computed(() => getInputLimitError(input.value))
const metrics = computed(() =>
  sizeError.value
    ? { words: 0, characters: 0, charactersWithoutWhitespace: 0, lines: 0 }
    : countTextMetrics(input.value),
)
</script>

<template>
  <div class="space-y-6">
    <ToolPanelHeader
      description="Count text locally as you type, without assigning a score or interpretation."
      title="Word and character counter"
    />

    <ToolTextArea
      id="counter-input"
      v-model="input"
      :count-metadata="`${input.length.toLocaleString()} characters entered`"
      :error="sizeError"
      helper="Character counts use Unicode code points. Line count is zero while the input is empty."
      label="Text to count"
      placeholder="Start typing or paste text."
    />

    <dl class="grid gap-px overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-border-soft)] sm:grid-cols-2 xl:grid-cols-4">
      <div class="bg-[var(--color-surface-raised)] p-4">
        <dt class="text-sm text-[var(--color-text-secondary)]">Words</dt>
        <dd class="mt-1 text-xl font-semibold tabular-nums">{{ metrics.words }}</dd>
      </div>
      <div class="bg-[var(--color-surface-raised)] p-4">
        <dt class="text-sm text-[var(--color-text-secondary)]">Characters</dt>
        <dd class="mt-1 text-xl font-semibold tabular-nums">{{ metrics.characters }}</dd>
      </div>
      <div class="bg-[var(--color-surface-raised)] p-4">
        <dt class="text-sm text-[var(--color-text-secondary)]">Without whitespace</dt>
        <dd class="mt-1 text-xl font-semibold tabular-nums">
          {{ metrics.charactersWithoutWhitespace }}
        </dd>
      </div>
      <div class="bg-[var(--color-surface-raised)] p-4">
        <dt class="text-sm text-[var(--color-text-secondary)]">Lines</dt>
        <dd class="mt-1 text-xl font-semibold tabular-nums">{{ metrics.lines }}</dd>
      </div>
    </dl>
    <p class="sr-only" aria-live="polite">
      {{ metrics.words }} words, {{ metrics.characters }} characters,
      {{ metrics.charactersWithoutWhitespace }} characters excluding whitespace, and
      {{ metrics.lines }} lines.
    </p>
  </div>
</template>
