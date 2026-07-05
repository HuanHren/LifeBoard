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
  <component
    :is="featured ? 'div' : 'li'"
    class="countdown-item"
    :class="[featured ? 'countdown-item--featured' : '', `countdown-item--${status.state}`]"
  >
    <CountdownForm
      v-if="isEditing"
      :countdown="countdown"
      @cancel="isEditing = false"
      @saved="isEditing = false"
    />
    <div v-else>
      <div class="countdown-item__topline">
        <div class="min-w-0">
          <h3
            class="countdown-item__title"
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
      <div v-else class="countdown-item__actions">
        <BaseButton
          class="countdown-item__action-button"
          size="sm"
          variant="ghost"
          @click="isEditing = true"
        >
          {{ t('todos.tasks.editAction') }}
        </BaseButton>
        <BaseButton
          class="countdown-item__action-button"
          size="sm"
          variant="ghost"
          @click="isConfirmingDelete = true"
        >
          {{ t('todos.tasks.deleteAction') }}
        </BaseButton>
      </div>
    </div>
  </component>
</template>

<style scoped>
.countdown-item {
  padding-block: 0.95rem;
}

.countdown-item:first-child {
  padding-top: 0;
}

.countdown-item:last-child {
  padding-bottom: 0;
}

.countdown-item--featured {
  padding: 0;
}

.countdown-item__topline {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  justify-content: space-between;
}

.countdown-item__title {
  word-break: break-word;
  color: var(--color-text-primary);
  font-weight: 700;
  line-height: 1.4;
}

.countdown-item__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.countdown-item__action-button {
  min-height: 2.75rem;
}

.countdown-item--reached {
  opacity: 0.82;
}

@media (max-width: 520px) {
  .countdown-item__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    justify-content: flex-start;
  }

  .countdown-item__action-button {
    width: 100%;
  }
}
</style>
