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
</script>

<template>
  <div class="space-y-6">
    <ToolPanelHeader
      :description="definition.description"
      :title="definition.title"
    />

    <div class="max-w-3xl space-y-4">
      <div class="space-y-2">
        <label class="block text-sm font-semibold" for="timestamp-input">
          {{ t('tools.timestamp.inputLabel') }}
        </label>
        <input
          id="timestamp-input"
          v-model="input"
          :aria-describedby="describedBy"
          :aria-invalid="inputError ? 'true' : 'false'"
          autocomplete="off"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 font-mono text-sm placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]"
          :placeholder="t('tools.timestamp.inputPlaceholder')"
          type="text"
          @input="processingError = null"
        />
        <p id="timestamp-input-helper" class="text-caption leading-5 text-[var(--color-text-secondary)]">
          {{ t('tools.timestamp.inputHelper') }}
        </p>
        <p
          v-if="inputError"
          id="timestamp-input-error"
          class="text-sm font-medium leading-6 text-[var(--color-danger)]"
          role="alert"
        >
          {{ localizeToolsError(inputError, t) }}
        </p>
      </div>

      <BaseButton variant="primary" @click="processTimestamp">
        {{ t('tools.timestamp.convert') }}
      </BaseButton>
    </div>

    <section aria-labelledby="timestamp-results-title">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 id="timestamp-results-title" class="text-lg font-semibold">
          {{ t('tools.timestamp.resultsTitle') }}
        </h3>
        <CopyButton :content="copyContent" />
      </div>

      <div
        v-if="result"
        class="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface)]"
      >
        <dl class="divide-y divide-[var(--color-border-soft)]">
          <div class="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <dt class="text-sm font-medium text-[var(--color-text-secondary)]">
              {{ t('tools.timestamp.interpretedAs') }}
            </dt>
            <dd class="text-sm font-semibold">
              {{ getTimestampTypeLabel(result.interpretedAs, t) }}
            </dd>
          </div>
          <div class="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <dt class="text-sm font-medium text-[var(--color-text-secondary)]">
              {{ t('tools.timestamp.localDateTime') }}
            </dt>
            <dd class="min-w-0 break-words text-sm">
              <time :datetime="result.iso">{{ result.localDateTime }}</time>
            </dd>
          </div>
          <div class="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <dt class="text-sm font-medium text-[var(--color-text-secondary)]">
              {{ t('tools.timestamp.utcDateTime') }}
            </dt>
            <dd class="min-w-0 break-words text-sm">
              <time :datetime="result.iso">{{ result.utcDateTime }}</time>
            </dd>
          </div>
          <div class="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <dt class="text-sm font-medium text-[var(--color-text-secondary)]">
              {{ t('tools.timestamp.iso') }}
            </dt>
            <dd class="min-w-0 break-all font-mono text-sm">
              <time :datetime="result.iso">{{ result.iso }}</time>
            </dd>
          </div>
          <div class="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <dt class="text-sm font-medium text-[var(--color-text-secondary)]">
              {{ t('tools.timestamp.unixSeconds') }}
            </dt>
            <dd class="font-mono text-sm tabular-nums">{{ result.unixSeconds }}</dd>
          </div>
          <div class="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <dt class="text-sm font-medium text-[var(--color-text-secondary)]">
              {{ t('tools.timestamp.unixMilliseconds') }}
            </dt>
            <dd class="font-mono text-sm tabular-nums">{{ result.unixMilliseconds }}</dd>
          </div>
        </dl>
      </div>
      <p
        v-else
        class="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-text-secondary)]"
      >
        {{ t('tools.timestamp.emptyOutput') }}
      </p>
    </section>
  </div>
</template>
