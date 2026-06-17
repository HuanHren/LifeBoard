<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import CopyButton from '@/modules/tools/components/CopyButton.vue'

interface Props {
  id: string
  output: string
  emptyCopy: string
  label?: string
  allowClear?: boolean
}

interface Emits {
  clear: []
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  allowClear: true,
})
const emit = defineEmits<Emits>()
const { t } = useI18n()
</script>

<template>
  <div class="min-w-0 space-y-2">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <label class="text-sm font-semibold text-[var(--color-text-primary)]" :for="id">
        {{ props.label ?? t('tools.common.output') }}
      </label>
      <div class="flex flex-wrap items-start gap-2">
        <CopyButton :content="output" />
        <BaseButton
          v-if="allowClear"
          :disabled="output.length === 0"
          size="sm"
          variant="ghost"
          @click="emit('clear')"
        >
          {{ t('tools.common.clearOutput') }}
        </BaseButton>
      </div>
    </div>
    <textarea
      :id="id"
      class="block min-h-56 w-full max-w-full resize-y overflow-auto rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 font-mono text-sm leading-6 text-[var(--color-text-primary)]"
      :placeholder="emptyCopy"
      readonly
      :value="output"
      wrap="off"
    />
  </div>
</template>
