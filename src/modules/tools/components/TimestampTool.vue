<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import CopyButton from '@/modules/tools/components/CopyButton.vue'
import ToolPanelHeader from '@/modules/tools/components/ToolPanelHeader.vue'
import { getInputLimitError } from '@/modules/tools/constants/tools'
import type { TimestampConversion } from '@/modules/tools/types/tools'
import { convertTimestamp } from '@/modules/tools/utils/timestampTools'
import {
  getTimestampTypeLabel,
  getToolDefinitionCopy,
  localizeToolsError,
} from '@/modules/tools/utils/toolsI18n'

const { locale, t } = useI18n()
const input = shallowRef('')
const result = shallowRef<TimestampConversion | null>(null)
const processingError = shallowRef<string | null>(null)
const sizeError = computed(() => getInputLimitError(input.value))
const inputError = computed(() => sizeError.value ?? processingError.value)
const describedBy = computed(() =>
  inputError.value
    ? 'timestamp-input-helper timestamp-input-error'
    : 'timestamp-input-helper',
)
const copyContent = computed(() => {
  if (!result.value) return ''

  return [
    `${t('tools.timestamp.interpretedAs')}: ${getTimestampTypeLabel(result.value.interpretedAs, t)}`,
    `${t('tools.timestamp.localDateTime')}: ${result.value.localDateTime}`,
    `${t('tools.timestamp.utcDateTime')}: ${result.value.utcDateTime}`,
    `${t('tools.timestamp.iso')}: ${result.value.iso}`,
    `${t('tools.timestamp.unixSeconds')}: ${result.value.unixSeconds}`,
    `${t('tools.timestamp.unixMilliseconds')}: ${result.value.unixMilliseconds}`,
  ].join('\n')
})
const definition = computed(() => getToolDefinitionCopy('timestamp', t))

function processTimestamp() {
  processingError.value = null

  if (sizeError.value) {
    result.value = null
    return
  }

  const conversion = convertTimestamp(input.value, locale.value)

  if (!conversion.ok) {
    result.value = null
    processingError.value = conversion.error
    return
  }

  result.value = conversion.value
}

function clearInput() {
  input.value = ''
  result.value = null
  processingError.value = null
}
</script>

<template>
  <div class="tool-panel">
    <ToolPanelHeader
      :description="definition.description"
      :title="definition.title"
    />

    <div class="tool-panel__grid">
      <div class="tool-panel__input">
        <div class="timestamp-input">
          <label for="timestamp-input">
          {{ t('tools.timestamp.inputLabel') }}
        </label>
        <input
          id="timestamp-input"
          v-model="input"
          :aria-describedby="describedBy"
          :aria-invalid="inputError ? 'true' : 'false'"
          autocomplete="off"
          class="timestamp-input__control"
          :placeholder="t('tools.timestamp.inputPlaceholder')"
          type="text"
          @input="processingError = null"
        />
        <p id="timestamp-input-helper" class="timestamp-input__helper">
          {{ t('tools.timestamp.inputHelper') }}
        </p>
        <p
          v-if="inputError"
          id="timestamp-input-error"
          class="timestamp-input__error"
          role="alert"
        >
          {{ localizeToolsError(inputError, t) }}
        </p>
      </div>

        <div class="tool-panel__actions">
          <BaseButton variant="primary" @click="processTimestamp">
            {{ t('tools.timestamp.convert') }}
          </BaseButton>
          <BaseButton
            :disabled="input.length === 0 && !result"
            variant="ghost"
            @click="clearInput"
          >
            {{ t('tools.common.clearInput') }}
          </BaseButton>
        </div>
      </div>

      <section class="timestamp-results" aria-labelledby="timestamp-results-title">
        <div class="timestamp-results__header">
          <div>
            <h3 id="timestamp-results-title">
              {{ t('tools.timestamp.resultsTitle') }}
            </h3>
            <p>
              {{ result ? t('tools.common.outputReady') : t('tools.common.outputEmpty') }}
            </p>
          </div>
          <CopyButton :content="copyContent" />
        </div>

        <div v-if="result" class="timestamp-results__table">
          <dl>
            <div>
              <dt>
              {{ t('tools.timestamp.interpretedAs') }}
            </dt>
              <dd class="timestamp-results__strong">
              {{ getTimestampTypeLabel(result.interpretedAs, t) }}
            </dd>
          </div>
            <div>
              <dt>
              {{ t('tools.timestamp.localDateTime') }}
            </dt>
              <dd>
              <time :datetime="result.iso">{{ result.localDateTime }}</time>
            </dd>
          </div>
            <div>
              <dt>
              {{ t('tools.timestamp.utcDateTime') }}
            </dt>
              <dd>
              <time :datetime="result.iso">{{ result.utcDateTime }}</time>
            </dd>
          </div>
            <div>
              <dt>
              {{ t('tools.timestamp.iso') }}
            </dt>
              <dd class="timestamp-results__mono">
              <time :datetime="result.iso">{{ result.iso }}</time>
            </dd>
          </div>
            <div>
              <dt>
              {{ t('tools.timestamp.unixSeconds') }}
            </dt>
              <dd class="timestamp-results__mono">{{ result.unixSeconds }}</dd>
          </div>
            <div>
              <dt>
              {{ t('tools.timestamp.unixMilliseconds') }}
            </dt>
              <dd class="timestamp-results__mono">{{ result.unixMilliseconds }}</dd>
          </div>
        </dl>
      </div>
      <p
        v-else
          class="tool-panel__empty"
      >
        {{ t('tools.timestamp.emptyOutput') }}
      </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.timestamp-input {
  display: grid;
  min-width: 0;
  gap: var(--space-2);
}

.timestamp-input label,
.timestamp-results h3 {
  color: var(--color-text-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.timestamp-input__control {
  min-height: 2.75rem;
  width: 100%;
  min-width: 0;
  border: 1px solid var(--color-control-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-inset);
  color: var(--color-text-primary);
  padding: 0 var(--space-3);
  font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
  font-size: var(--font-size-label);
}

.timestamp-input__control::placeholder {
  color: var(--color-text-tertiary);
}

.timestamp-input__control:hover {
  border-color: var(--color-accent);
}

.timestamp-input__helper {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: 1.5;
}

.timestamp-input__error {
  border-left: 0.1875rem solid var(--color-danger);
  color: var(--color-danger);
  padding-left: var(--space-3);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
}

.timestamp-results {
  display: grid;
  min-width: 0;
  gap: var(--space-3);
}

.timestamp-results__header {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-3);
}

.timestamp-results__header p {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.timestamp-results__table {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.timestamp-results__table dl {
  margin: 0;
}

.timestamp-results__table div {
  display: grid;
  min-width: 0;
  gap: var(--space-1);
  border-top: 1px solid var(--color-border-soft);
  padding: var(--space-3) var(--space-4);
}

.timestamp-results__table div:first-child {
  border-top: 0;
}

.timestamp-results__table dt {
  color: var(--color-text-secondary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-medium);
}

.timestamp-results__table dd {
  min-width: 0;
  margin: 0;
  color: var(--color-text-primary);
  overflow-wrap: anywhere;
  font-size: var(--font-size-label);
}

.timestamp-results__strong {
  font-weight: var(--font-weight-semibold);
}

.timestamp-results__mono {
  font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
  font-variant-numeric: tabular-nums;
}

@media (min-width: 40rem) {
  .timestamp-results__table div {
    grid-template-columns: 10rem minmax(0, 1fr);
  }
}
</style>
