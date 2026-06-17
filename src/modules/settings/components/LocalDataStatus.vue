<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n/useI18n'

interface Props {
  weatherCity: string | null
  taskCount: number
  countdownCount: number
  bookmarkCount: number
  error?: string | null
}

const props = defineProps<Props>()
const { t } = useI18n()

const planningStatus = computed(() => {
  const parameters = {
    taskCount: props.taskCount,
    countdownCount: props.countdownCount,
  }

  if (props.taskCount === 1 && props.countdownCount === 1) {
    return t('settings.localData.taskOneCountdownOne')
  }
  if (props.taskCount === 1) {
    return t('settings.localData.taskOneCountdownMany', parameters)
  }
  if (props.countdownCount === 1) {
    return t('settings.localData.taskManyCountdownOne', parameters)
  }
  return t('settings.localData.taskManyCountdownMany', parameters)
})

const bookmarkStatus = computed(() =>
  props.bookmarkCount === 1
    ? t('settings.localData.bookmarkOne')
    : t('settings.localData.bookmarkMany', { count: props.bookmarkCount }),
)
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
        <dt class="text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('settings.common.weather') }}
        </dt>
        <dd class="text-sm text-[var(--color-text-secondary)]">
          {{
            weatherCity
              ? t('settings.localData.selectedCity', { city: weatherCity })
              : t('settings.localData.noCity')
          }}
        </dd>
      </div>
      <div class="grid gap-1 px-4 py-4 sm:grid-cols-[10rem_1fr] sm:items-center sm:px-5">
        <dt class="text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('settings.common.todos') }}
        </dt>
        <dd class="text-sm text-[var(--color-text-secondary)]">
          {{ planningStatus }}
        </dd>
      </div>
      <div class="grid gap-1 px-4 py-4 sm:grid-cols-[10rem_1fr] sm:items-center sm:px-5">
        <dt class="text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('settings.common.bookmarks') }}
        </dt>
        <dd class="text-sm text-[var(--color-text-secondary)]">
          {{ bookmarkStatus }}
        </dd>
      </div>
      <div class="grid gap-1 px-4 py-4 sm:grid-cols-[10rem_1fr] sm:items-center sm:px-5">
        <dt class="text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('settings.common.tools') }}
        </dt>
        <dd class="text-sm text-[var(--color-text-secondary)]">
          {{ t('settings.localData.toolsNotSaved') }}
        </dd>
      </div>
    </dl>
  </div>
</template>
