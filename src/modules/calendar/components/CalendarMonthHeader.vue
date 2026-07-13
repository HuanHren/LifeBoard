<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'

interface Props {
  monthLabel: string
}

interface Emits {
  previous: []
  today: []
  next: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
</script>

<template>
  <div class="calendar-month-header">
    <h2 id="calendar-month-title" class="calendar-month-header__title">
      {{ monthLabel }}
    </h2>
    <div class="calendar-month-header__actions" :aria-label="t('calendar.controls.label')">
      <BaseButton data-qa="calendar-previous" size="sm" variant="secondary" @click="emit('previous')">
        {{ t('calendar.controls.previous') }}
      </BaseButton>
      <BaseButton data-qa="calendar-today" size="sm" variant="ghost" @click="emit('today')">
        {{ t('calendar.controls.today') }}
      </BaseButton>
      <BaseButton data-qa="calendar-next" size="sm" variant="secondary" @click="emit('next')">
        {{ t('calendar.controls.next') }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.calendar-month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.calendar-month-header__title {
  min-width: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-section-title);
  font-weight: var(--font-weight-semibold);
}

.calendar-month-header__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
}

@media (max-width: 540px) {
  .calendar-month-header {
    align-items: stretch;
    flex-direction: column;
  }

  .calendar-month-header__actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
