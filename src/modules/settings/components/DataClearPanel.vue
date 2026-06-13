<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import type { SettingsClearTarget } from '@/modules/settings/types/settings'

interface Props {
  hasWeather: boolean
  taskCount: number
  countdownCount: number
  bookmarkCount: number
  hasAnyData: boolean
  error: string | null
  success: string | null
}

interface Emits {
  requestClear: [target: SettingsClearTarget, trigger: HTMLElement]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function requestClear(target: SettingsClearTarget, event: MouseEvent) {
  emit('requestClear', target, event.currentTarget as HTMLElement)
}
</script>

<template>
  <div class="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)]">
    <div class="divide-y divide-[var(--color-border-soft)]">
      <div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">Weather</h3>
          <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
            Remove the selected city and current in-memory forecast.
          </p>
        </div>
        <BaseButton
          v-if="hasWeather"
          class="border-[var(--color-danger)] text-[var(--color-danger)]"
          @click="requestClear('weather', $event)"
        >
          Clear Weather
        </BaseButton>
        <span v-else class="text-sm text-[var(--color-text-tertiary)]">Nothing saved</span>
      </div>

      <div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">Todos</h3>
          <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
            Remove {{ taskCount }} tasks and {{ countdownCount }} countdowns.
          </p>
        </div>
        <BaseButton
          v-if="taskCount + countdownCount > 0"
          class="border-[var(--color-danger)] text-[var(--color-danger)]"
          @click="requestClear('todos', $event)"
        >
          Clear Todos
        </BaseButton>
        <span v-else class="text-sm text-[var(--color-text-tertiary)]">Nothing saved</span>
      </div>

      <div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">Bookmarks</h3>
          <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
            Remove {{ bookmarkCount }} saved bookmarks.
          </p>
        </div>
        <BaseButton
          v-if="bookmarkCount > 0"
          class="border-[var(--color-danger)] text-[var(--color-danger)]"
          @click="requestClear('bookmarks', $event)"
        >
          Clear Bookmarks
        </BaseButton>
        <span v-else class="text-sm text-[var(--color-text-tertiary)]">Nothing saved</span>
      </div>

      <div class="p-4 sm:px-5">
        <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">Tools</h3>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
          No saved tool input to clear.
        </p>
      </div>
    </div>

    <div class="border-t border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-4 sm:p-5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
            Clear all LifeBoard data
          </h3>
          <p class="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Remove the theme preference, selected city, tasks, countdowns, and bookmarks stored by LifeBoard.
          </p>
        </div>
        <BaseButton
          :disabled="!hasAnyData"
          class="border-[var(--color-danger)] text-[var(--color-danger)]"
          @click="requestClear('all', $event)"
        >
          Clear all data
        </BaseButton>
      </div>
    </div>

    <div v-if="error || success" class="space-y-3 border-t border-[var(--color-border-soft)] p-4 sm:p-5">
      <p v-if="error" class="text-sm font-medium text-[var(--color-danger)]" role="alert">
        {{ error }}
      </p>
      <p v-if="success" class="text-sm font-medium text-[var(--color-text-primary)]" aria-live="polite">
        {{ success }}
      </p>
    </div>
  </div>
</template>
