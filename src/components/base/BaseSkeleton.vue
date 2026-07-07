<script setup lang="ts">
interface Props {
  label?: string
}

withDefaults(defineProps<Props>(), {
  label: 'Loading content',
})
</script>

<template>
  <div
    aria-busy="true"
    :aria-label="label"
    class="surface-card surface-card--muted overflow-hidden rounded-[var(--radius-md)] p-4"
    role="status"
  >
    <div class="space-y-3">
      <div class="h-4 w-1/3 rounded-[var(--radius-pill)] bg-[var(--color-surface-inset)]" />
      <div class="h-3 w-full rounded-[var(--radius-pill)] bg-[var(--color-surface-inset)]" />
      <div class="h-3 w-5/6 rounded-[var(--radius-pill)] bg-[var(--color-surface-inset)]" />
    </div>
  </div>
</template>
