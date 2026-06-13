<script setup lang="ts">
interface Props {
  weatherCity: string | null
  taskCount: number
  countdownCount: number
  bookmarkCount: number
  error?: string | null
}

defineProps<Props>()

function countLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}
</script>

<template>
  <div class="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-soft)]">
    <div
      v-if="error"
      class="border-b border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-4"
      role="alert"
    >
      <p class="text-sm font-medium text-[var(--color-text-primary)]">{{ error }}</p>
    </div>

    <dl class="divide-y divide-[var(--color-border-soft)] bg-[var(--color-surface-raised)]">
      <div class="grid gap-1 px-4 py-4 sm:grid-cols-[10rem_1fr] sm:items-center sm:px-5">
        <dt class="text-sm font-semibold text-[var(--color-text-primary)]">Weather</dt>
        <dd class="text-sm text-[var(--color-text-secondary)]">
          {{ weatherCity ? `Selected city: ${weatherCity}` : 'No selected city saved.' }}
        </dd>
      </div>
      <div class="grid gap-1 px-4 py-4 sm:grid-cols-[10rem_1fr] sm:items-center sm:px-5">
        <dt class="text-sm font-semibold text-[var(--color-text-primary)]">Todos</dt>
        <dd class="text-sm text-[var(--color-text-secondary)]">
          {{ countLabel(taskCount, 'task') }} and
          {{ countLabel(countdownCount, 'countdown') }} saved.
        </dd>
      </div>
      <div class="grid gap-1 px-4 py-4 sm:grid-cols-[10rem_1fr] sm:items-center sm:px-5">
        <dt class="text-sm font-semibold text-[var(--color-text-primary)]">Bookmarks</dt>
        <dd class="text-sm text-[var(--color-text-secondary)]">
          {{ countLabel(bookmarkCount, 'bookmark') }} saved.
        </dd>
      </div>
      <div class="grid gap-1 px-4 py-4 sm:grid-cols-[10rem_1fr] sm:items-center sm:px-5">
        <dt class="text-sm font-semibold text-[var(--color-text-primary)]">Tools</dt>
        <dd class="text-sm text-[var(--color-text-secondary)]">
          Tool input is not saved.
        </dd>
      </div>
    </dl>
  </div>
</template>
