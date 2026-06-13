<script setup lang="ts">
import { shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import CountdownForm from '@/modules/todos/components/CountdownForm.vue'
import CountdownList from '@/modules/todos/components/CountdownList.vue'
import type { Countdown } from '@/modules/todos/types/todos'

interface Props {
  countdowns: Countdown[]
  today: string
}

defineProps<Props>()
const isCreating = shallowRef(false)
</script>

<template>
  <BaseCard as="section">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-section-title text-[var(--color-text-primary)]">Countdowns</h2>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
          Keep important dates close without turning them into tasks.
        </p>
      </div>
      <BaseButton
        v-if="!isCreating"
        class="shrink-0"
        size="sm"
        variant="secondary"
        @click="isCreating = true"
      >
        Add
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
        action-label="Add a countdown"
        description="Add a date you want to keep in view."
        title="No countdowns yet"
        @action="isCreating = true"
      />
      <CountdownList v-else :countdowns="countdowns" :today="today" />
    </div>
  </BaseCard>
</template>
