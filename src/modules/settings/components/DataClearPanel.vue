<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
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

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const todosDescription = computed(() => {
  const parameters = {
    taskCount: props.taskCount,
    countdownCount: props.countdownCount,
  }

  if (props.taskCount === 1 && props.countdownCount === 1) {
    return t('settings.clearData.todosOneOne')
  }
  if (props.taskCount === 1) {
    return t('settings.clearData.todosOneMany', parameters)
  }
  if (props.countdownCount === 1) {
    return t('settings.clearData.todosManyOne', parameters)
  }
  return t('settings.clearData.todosManyMany', parameters)
})

const bookmarksDescription = computed(() =>
  props.bookmarkCount === 1
    ? t('settings.clearData.bookmarkOne')
    : t('settings.clearData.bookmarkMany', { count: props.bookmarkCount }),
)

function requestClear(target: SettingsClearTarget, event: MouseEvent) {
  emit('requestClear', target, event.currentTarget as HTMLElement)
}
</script>

<template>
  <div class="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)]">
    <div class="divide-y divide-[var(--color-border-soft)]">
      <div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ t('settings.common.weather') }}
          </h3>
          <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
            {{ t('settings.clearData.weatherDescription') }}
          </p>
        </div>
        <BaseButton
          v-if="hasWeather"
          class="border-[var(--color-danger)] text-[var(--color-danger)]"
          @click="requestClear('weather', $event)"
        >
          {{ t('settings.clearData.clearWeather') }}
        </BaseButton>
        <span v-else class="text-sm text-[var(--color-text-tertiary)]">
          {{ t('settings.clearData.nothingSaved') }}
        </span>
      </div>

      <div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ t('settings.common.todos') }}
          </h3>
          <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
            {{ todosDescription }}
          </p>
        </div>
        <BaseButton
          v-if="taskCount + countdownCount > 0"
          class="border-[var(--color-danger)] text-[var(--color-danger)]"
          @click="requestClear('todos', $event)"
        >
          {{ t('settings.clearData.clearTodos') }}
        </BaseButton>
        <span v-else class="text-sm text-[var(--color-text-tertiary)]">
          {{ t('settings.clearData.nothingSaved') }}
        </span>
      </div>

      <div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ t('settings.common.bookmarks') }}
          </h3>
          <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
            {{ bookmarksDescription }}
          </p>
        </div>
        <BaseButton
          v-if="bookmarkCount > 0"
          class="border-[var(--color-danger)] text-[var(--color-danger)]"
          @click="requestClear('bookmarks', $event)"
        >
          {{ t('settings.clearData.clearBookmarks') }}
        </BaseButton>
        <span v-else class="text-sm text-[var(--color-text-tertiary)]">
          {{ t('settings.clearData.nothingSaved') }}
        </span>
      </div>

      <div class="p-4 sm:px-5">
        <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('settings.common.tools') }}
        </h3>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
          {{ t('settings.clearData.toolsDescription') }}
        </p>
      </div>
    </div>

    <div class="border-t border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-4 sm:p-5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ t('settings.clearData.allTitle') }}
          </h3>
          <p class="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
            {{ t('settings.clearData.allDescription') }}
          </p>
        </div>
        <BaseButton
          :disabled="!hasAnyData"
          class="border-[var(--color-danger)] text-[var(--color-danger)]"
          @click="requestClear('all', $event)"
        >
          {{ t('settings.clearData.allAction') }}
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
