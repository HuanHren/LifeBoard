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
  <div class="tool-text-area">
    <div class="tool-text-area__header">
      <label :for="id">
        {{ label }}
      </label>
      <span
        v-if="countMetadata"
        class="tool-text-area__count"
      >
        {{ countMetadata }}
      </span>
    </div>
    <textarea
      :id="id"
      v-model="model"
      :aria-describedby="describedBy"
      :aria-invalid="error ? 'true' : 'false'"
      class="tool-text-area__control"
      :placeholder="placeholder"
      spellcheck="false"
      wrap="off"
    />
    <p :id="helperId" class="tool-text-area__helper">
      {{ helper }}
    </p>
    <p
      v-if="error"
      :id="errorId"
      class="tool-text-area__error"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.tool-text-area {
  display: grid;
  min-width: 0;
  gap: var(--space-2);
}

.tool-text-area__header {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-2);
}

.tool-text-area__header label {
  color: var(--color-text-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.tool-text-area__count {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  font-variant-numeric: tabular-nums;
}

.tool-text-area__control {
  display: block;
  width: 100%;
  max-width: 100%;
  min-height: clamp(11rem, 32vh, 20rem);
  resize: vertical;
  overflow: auto;
  border: 1px solid var(--color-control-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-inset);
  color: var(--color-text-primary);
  padding: var(--space-3);
  font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
  font-size: var(--font-size-label);
  line-height: 1.6;
  scrollbar-width: thin;
}

.tool-text-area__control::placeholder {
  color: var(--color-text-tertiary);
}

.tool-text-area__control:hover {
  border-color: var(--color-accent);
}

.tool-text-area__helper {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: 1.5;
}

.tool-text-area__error {
  border: 1px solid color-mix(in oklch, var(--color-danger) 54%, var(--color-border-soft));
  border-radius: var(--radius-sm);
  background: var(--color-danger-soft);
  color: var(--color-danger);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
}

@media (max-width: 40rem) {
  .tool-text-area__control {
    min-height: 12rem;
  }
}
</style>
