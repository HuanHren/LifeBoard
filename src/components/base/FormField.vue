<script setup lang="ts">
interface Props {
  id: string
  label: string
  description?: string
  error?: string | null
  required?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-2">
    <label class="block text-label text-[var(--color-text-primary)]" :for="id">
      {{ label }}
      <span v-if="required" class="text-[var(--color-danger)]" aria-hidden="true">*</span>
    </label>
    <slot
      :aria-describedby="[
        description ? `${id}-description` : '',
        error ? `${id}-error` : '',
      ].filter(Boolean).join(' ') || undefined"
      :aria-invalid="error ? 'true' : undefined"
    />
    <p
      v-if="description"
      :id="`${id}-description`"
      class="text-caption text-[var(--color-text-secondary)]"
    >
      {{ description }}
    </p>
    <p
      v-if="error"
      :id="`${id}-error`"
      class="text-caption font-medium text-[var(--color-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
