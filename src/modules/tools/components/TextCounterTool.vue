<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import CopyButton from '@/modules/tools/components/CopyButton.vue'
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
const copyContent = computed(() =>
  input.value.length === 0
    ? ''
    : [
        `${t('tools.counter.words')}: ${formatNumber(metrics.value.words)}`,
        `${t('tools.counter.characters')}: ${formatNumber(metrics.value.characters)}`,
        `${t('tools.counter.withoutWhitespace')}: ${formatNumber(metrics.value.charactersWithoutWhitespace)}`,
        `${t('tools.counter.lines')}: ${formatNumber(metrics.value.lines)}`,
      ].join('\n'),
)
</script>

<template>
  <div class="tool-panel">
    <ToolPanelHeader
      :description="definition.description"
      :title="definition.title"
    />

    <div class="counter-workspace">
      <div class="tool-panel__input">
        <ToolTextArea
          id="counter-input"
          v-model="input"
          :count-metadata="t('tools.common.charactersEntered', { count: formatNumber(input.length) })"
          :error="localizeToolsError(sizeError, t)"
          :helper="t('tools.counter.inputHelper')"
          :label="t('tools.counter.inputLabel')"
          :placeholder="t('tools.counter.inputPlaceholder')"
        />
        <div class="tool-panel__actions">
          <BaseButton
            :disabled="input.length === 0"
            variant="ghost"
            @click="input = ''"
          >
            {{ t('tools.common.clearInput') }}
          </BaseButton>
        </div>
      </div>

      <section class="counter-results" aria-labelledby="counter-results-title">
        <div class="counter-results__header">
          <div>
            <h3 id="counter-results-title">{{ t('tools.counter.resultsTitle') }}</h3>
            <p>{{ input.length > 0 ? t('tools.common.outputReady') : t('tools.common.outputEmpty') }}</p>
          </div>
          <CopyButton :content="copyContent" />
        </div>

        <dl class="counter-results__metrics">
          <div>
            <dt>{{ t('tools.counter.words') }}</dt>
            <dd>{{ metrics.words }}</dd>
          </div>
          <div>
            <dt>{{ t('tools.counter.characters') }}</dt>
            <dd>{{ metrics.characters }}</dd>
          </div>
          <div>
            <dt>{{ t('tools.counter.withoutWhitespace') }}</dt>
            <dd>{{ metrics.charactersWithoutWhitespace }}</dd>
          </div>
          <div>
            <dt>{{ t('tools.counter.lines') }}</dt>
            <dd>{{ metrics.lines }}</dd>
          </div>
        </dl>
      </section>
    </div>
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

<style scoped>
.counter-workspace {
  display: grid;
  min-width: 0;
  gap: var(--space-5);
}

.counter-results {
  display: grid;
  min-width: 0;
  gap: var(--space-3);
  align-content: start;
}

.counter-results__header {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-3);
}

.counter-results__header h3 {
  color: var(--color-text-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.counter-results__header p {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.counter-results__metrics {
  display: grid;
  min-width: 0;
  gap: var(--space-2);
  margin: 0;
}

.counter-results__metrics div {
  min-width: 0;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: var(--space-4);
}

.counter-results__metrics dt {
  color: var(--color-text-secondary);
  font-size: var(--font-size-label);
}

.counter-results__metrics dd {
  margin: var(--space-1) 0 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-numeric-medium);
  font-weight: var(--font-weight-semibold);
  font-variant-numeric: tabular-nums;
  line-height: var(--line-height-tight);
}

@media (min-width: 40rem) {
  .counter-results__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 80rem) {
  .counter-workspace {
    grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.62fr);
  }
}
</style>
