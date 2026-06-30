<script setup lang="ts">
import { shallowRef, toRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import CountdownForm from '@/modules/todos/components/CountdownForm.vue'
import InlineDeleteConfirmation from '@/modules/todos/components/InlineDeleteConfirmation.vue'
import { useCountdownStatus } from '@/modules/todos/composables/useCountdownStatus'
import { useTodosStore } from '@/modules/todos/stores/todos'
import type { Countdown } from '@/modules/todos/types/todos'
import { formatReadableDate } from '@/modules/todos/utils/todoDates'

interface Props {
  countdown: Countdown
  featured?: boolean
  today: string
}

const props = withDefaults(defineProps<Props>(), {
  featured: false,
})
const { locale, t } = useI18n()
const todosStore = useTodosStore()
const isEditing = shallowRef(false)
const isConfirmingDelete = shallowRef(false)
const status = useCountdownStatus(
  () => props.countdown.targetDate,
  toRef(props, 'today'),
)

function deleteCountdown() {
  todosStore.deleteCountdown(props.countdown.id)
}
</script>

<template>
  <component :is="featured ? 'div' : 'li'" :class="featured ? '' : 'py-4 first:pt-0 last:pb-0'">
    <CountdownForm
      v-if="isEditing"
      :countdown="countdown"
      @cancel="isEditing = false"
      @saved="isEditing = false"
    />
    <div v-else>
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3
            class="break-words font-semibold text-[var(--color-text-primary)]"
            :class="featured ? 'text-base' : ''"
          >
            {{ countdown.title }}
          </h3>
          <p
            class="mt-1 text-sm font-medium"
            :class="
              status.state === 'reached'
                ? 'text-[var(--color-text-tertiary)]'
                : 'text-[var(--color-accent-text)]'
            "
          >
            {{ status.label }}
          </p>
          <time
            class="mt-1 block text-caption text-[var(--color-text-secondary)]"
            :datetime="countdown.targetDate"
          >
            {{ formatReadableDate(countdown.targetDate, locale) }}
          </time>
        </div>
      </div>

      <InlineDeleteConfirmation
        v-if="isConfirmingDelete"
        class="mt-3"
        :item-name="countdown.title"
        @cancel="isConfirmingDelete = false"
        @confirm="deleteCountdown"
      />
      <div v-else class="mt-2 flex justify-end gap-1">
        <BaseButton size="sm" variant="ghost" @click="isEditing = true">
          {{ t('todos.tasks.editAction') }}
        </BaseButton>
        <BaseButton size="sm" variant="ghost" @click="isConfirmingDelete = true">
          {{ t('todos.tasks.deleteAction') }}
        </BaseButton>
      </div>
    </div>
  </component>
</template>
