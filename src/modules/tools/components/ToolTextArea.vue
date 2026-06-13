<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  id: string
  label: string
  helper: string
  error?: string | null
  countMetadata?: string | null
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  error: null,
  countMetadata: null,
  placeholder: '',
})
const model = defineModel<string>({ required: true })

const helperId = computed(() => `${props.id}-helper`)
const errorId = computed(() => `${props.id}-error`)
const describedBy = computed(() =>
  props.error ? `${helperId.value} ${errorId.value}` : helperId.value,
)
</script>

<template>
  <div class="min-w-0 space-y-2">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <label class="text-sm font-semibold text-[var(--color-text-primary)]" :for="id">
        {{ label }}
      </label>
      <span
        v-if="countMetadata"
        class="text-caption tabular-nums text-[var(--color-text-secondary)]"
      >
        {{ countMetadata }}
      </span>
    </div>
    <textarea
      :id="id"
      v-model="model"
      :aria-describedby="describedBy"
      :aria-invalid="error ? 'true' : 'false'"
      class="block min-h-56 w-full max-w-full resize-y overflow-auto rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] p-3 font-mono text-sm leading-6 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]"
      :placeholder="placeholder"
      spellcheck="false"
      wrap="off"
    />
    <p :id="helperId" class="text-caption leading-5 text-pretty text-[var(--color-text-secondary)]">
      {{ helper }}
    </p>
    <p
      v-if="error"
      :id="errorId"
      class="text-sm font-medium leading-6 text-pretty text-[var(--color-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
