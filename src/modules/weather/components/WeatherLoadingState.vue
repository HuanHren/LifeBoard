<template>
  <div class="space-y-8" aria-busy="true" aria-label="Loading weather forecast" role="status">
    <div class="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div
        class="min-h-72 rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6"
      >
        <div class="h-4 w-2/5 rounded-[var(--radius-pill)] bg-[var(--color-surface-inset)]" />
        <div class="mt-7 h-12 w-1/3 rounded-[var(--radius-sm)] bg-[var(--color-surface-inset)]" />
        <div class="mt-4 h-5 w-1/2 rounded-[var(--radius-pill)] bg-[var(--color-surface-inset)]" />
        <div class="mt-16 grid grid-cols-2 gap-4">
          <div class="h-10 rounded-[var(--radius-sm)] bg-[var(--color-surface-inset)]" />
          <div class="h-10 rounded-[var(--radius-sm)] bg-[var(--color-surface-inset)]" />
          <div class="h-10 rounded-[var(--radius-sm)] bg-[var(--color-surface-inset)]" />
          <div class="h-10 rounded-[var(--radius-sm)] bg-[var(--color-surface-inset)]" />
        </div>
      </div>
      <div
        class="min-h-72 rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-6"
      >
        <div class="h-6 w-1/3 rounded-[var(--radius-pill)] bg-[var(--color-surface-inset)]" />
        <div class="mt-8 space-y-6">
          <div v-for="index in 3" :key="index" class="grid gap-3 sm:grid-cols-[9rem_1fr]">
            <div class="h-10 rounded-[var(--radius-sm)] bg-[var(--color-surface-inset)]" />
            <div class="space-y-2">
              <div class="h-4 w-3/4 rounded-[var(--radius-pill)] bg-[var(--color-surface-inset)]" />
              <div class="h-3 w-full rounded-[var(--radius-pill)] bg-[var(--color-surface-inset)]" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-for="index in 2" :key="index" class="space-y-4">
      <div class="h-6 w-40 rounded-[var(--radius-pill)] bg-[var(--color-surface-inset)]" />
      <div
        class="flex gap-1 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4"
      >
        <div
          v-for="item in 6"
          :key="item"
          class="h-32 w-36 shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-surface-inset)]"
        />
      </div>
    </div>
  </div>
</template>
