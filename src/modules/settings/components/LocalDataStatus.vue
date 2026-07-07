<script setup lang="ts">
import { computed } from 'vue'
import BaseNotice from '@/components/base/BaseNotice.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
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
  <BaseSurface as="div" class="local-data-status" padding="none" variant="plain">
    <div
      v-if="error"
      class="local-data-status__notice"
    >
      <BaseNotice tone="danger" role="alert">{{ error }}</BaseNotice>
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
  </BaseSurface>
</template>

<style scoped>
.local-data-status {
  overflow: hidden;
}

.local-data-status__notice {
  border-bottom: 1px solid var(--color-border-soft);
  padding: var(--space-3);
}
</style>
