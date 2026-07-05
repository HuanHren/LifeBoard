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
  <BaseSurface as="section" class="countdown-section" padding="md" variant="plain">
    <div class="countdown-section__header">
      <div>
        <p class="countdown-section__eyebrow">{{ t('todos.countdowns.eyebrow') }}</p>
        <h2 class="mt-1 text-section-title text-[var(--color-text-primary)]">
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

    <div v-if="isCreating" class="countdown-section__form">
      <CountdownForm @cancel="isCreating = false" @saved="isCreating = false" />
    </div>

    <div class="countdown-section__body">
      <BaseEmpty
        v-if="countdowns.length === 0"
        :action-label="t('todos.countdowns.addAction')"
        :description="t('todos.countdowns.emptyDescription')"
        :title="t('todos.countdowns.emptyTitle')"
        @action="isCreating = true"
      />
      <div v-else class="countdown-section__content">
        <div
          v-if="primaryCountdown"
          class="countdown-section__featured"
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

<style scoped>
.countdown-section {
  min-width: 0;
}

.countdown-section__header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
}

.countdown-section__eyebrow {
  color: var(--color-accent-text);
  font-size: var(--text-caption);
  font-weight: 700;
}

.countdown-section__form,
.countdown-section__body {
  margin-top: 1rem;
  border-top: 1px solid var(--color-border-soft);
  padding-top: 1rem;
}

.countdown-section__content {
  display: grid;
  gap: 1rem;
}

.countdown-section__featured {
  border: 1px solid color-mix(in srgb, var(--color-accent) 42%, var(--color-border-soft));
  border-radius: var(--radius-md);
  background:
    linear-gradient(135deg, var(--color-accent-wash), color-mix(in srgb, var(--color-surface-raised) 70%, transparent)),
    var(--color-surface-raised);
  padding: 1rem;
}

@media (max-width: 640px) {
  .countdown-section__header {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
