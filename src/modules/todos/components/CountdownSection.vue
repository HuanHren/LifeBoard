<script setup lang="ts">
import { shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import { useI18n } from '@/i18n/useI18n'
import CountdownForm from '@/modules/todos/components/CountdownForm.vue'
import CountdownList from '@/modules/todos/components/CountdownList.vue'
import type { Countdown } from '@/modules/todos/types/todos'

interface Props {
  countdowns: Countdown[]
  today: string
}

defineProps<Props>()
const { t } = useI18n()
const isCreating = shallowRef(false)
</script>

<template>
  <BaseCard as="section">
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
      <CountdownList v-else :countdowns="countdowns" :today="today" />
    </div>
  </BaseCard>
</template>
