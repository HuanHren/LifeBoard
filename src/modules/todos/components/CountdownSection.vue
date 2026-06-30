<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import { useI18n } from '@/i18n/useI18n'
import CountdownForm from '@/modules/todos/components/CountdownForm.vue'
import CountdownItem from '@/modules/todos/components/CountdownItem.vue'
import CountdownList from '@/modules/todos/components/CountdownList.vue'
import { differenceInCalendarDays } from '@/modules/todos/utils/todoDates'
import type { Countdown } from '@/modules/todos/types/todos'

interface Props {
  countdowns: Countdown[]
  today: string
}

const props = defineProps<Props>()
const { t } = useI18n()
const isCreating = shallowRef(false)
const primaryCountdown = computed(
  () =>
    props.countdowns.find(
      (countdown) => differenceInCalendarDays(countdown.targetDate, props.today) >= 0,
    ) ?? props.countdowns[0] ?? null,
)
const secondaryCountdowns = computed(() =>
  props.countdowns.filter((countdown) => countdown.id !== primaryCountdown.value?.id),
)
</script>

<template>
  <BaseSurface as="section" class="min-w-0" padding="md" variant="plain">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-section-title text-[var(--color-text-primary)]">
          {{ t('todos.countdowns.title') }}
        </h2>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
          {{ t('todos.countdowns.description') }}
        </p>
      </div>
      <BaseButton
        v-if="!isCreating"
        class="shrink-0"
        size="sm"
        variant="secondary"
        @click="isCreating = true"
      >
        {{ t('todos.countdowns.addAction') }}
      </BaseButton>
    </div>

    <div
      v-if="isCreating"
      class="mt-5 border-t border-[var(--color-border-soft)] pt-5"
    >
      <CountdownForm @cancel="isCreating = false" @saved="isCreating = false" />
    </div>

    <div class="mt-5 border-t border-[var(--color-border-soft)] pt-5">
      <BaseEmpty
        v-if="countdowns.length === 0"
        :action-label="t('todos.countdowns.addAction')"
        :description="t('todos.countdowns.emptyDescription')"
        :title="t('todos.countdowns.emptyTitle')"
        @action="isCreating = true"
      />
      <div v-else class="space-y-4">
        <div
          v-if="primaryCountdown"
          class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-accent-wash)] px-4 py-3"
        >
          <CountdownItem :countdown="primaryCountdown" featured :today="today" />
        </div>
        <CountdownList
          v-if="secondaryCountdowns.length > 0"
          :countdowns="secondaryCountdowns"
          :today="today"
        />
      </div>
    </div>
  </BaseSurface>
</template>
