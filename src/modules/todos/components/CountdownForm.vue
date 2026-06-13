<script setup lang="ts">
import { shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { COUNTDOWN_TITLE_MAX_LENGTH } from '@/modules/todos/constants/todos'
import { useTodosStore } from '@/modules/todos/stores/todos'
import type {
  Countdown,
  CountdownDraft,
  ValidationResult,
} from '@/modules/todos/types/todos'
import {
  hasValidationErrors,
  validateCountdownDraft,
} from '@/modules/todos/utils/todoValidation'

interface Props {
  countdown?: Countdown | null
}

interface Emits {
  saved: []
  cancel: []
}

const props = withDefaults(defineProps<Props>(), {
  countdown: null,
})
const emit = defineEmits<Emits>()
const todosStore = useTodosStore()
const title = shallowRef(props.countdown?.title ?? '')
const targetDate = shallowRef(props.countdown?.targetDate ?? '')
const errors = shallowRef<ValidationResult>({ title: null, date: null, label: null })

function saveCountdown() {
  const draft: CountdownDraft = {
    title: title.value,
    targetDate: targetDate.value,
  }
  const nextErrors = validateCountdownDraft(draft)
  errors.value = nextErrors

  if (hasValidationErrors(nextErrors)) return

  const saved = props.countdown
    ? todosStore.updateCountdown(props.countdown.id, draft)
    : todosStore.addCountdown(draft)

  if (saved) emit('saved')
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="saveCountdown">
    <div class="space-y-2">
      <label class="block text-sm font-semibold" :for="`countdown-title-${countdown?.id ?? 'new'}`">
        Countdown title
      </label>
      <input
        :id="`countdown-title-${countdown?.id ?? 'new'}`"
        v-model="title"
        :aria-describedby="
          errors.title ? `countdown-title-error-${countdown?.id ?? 'new'}` : undefined
        "
        :aria-invalid="errors.title ? 'true' : 'false'"
        autocomplete="off"
        class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 placeholder:text-[var(--color-text-tertiary)]"
        :maxlength="COUNTDOWN_TITLE_MAX_LENGTH"
        placeholder="What are you looking ahead to?"
        type="text"
      />
      <p
        v-if="errors.title"
        :id="`countdown-title-error-${countdown?.id ?? 'new'}`"
        class="text-sm font-medium text-[var(--color-danger)]"
        role="alert"
      >
        {{ errors.title }}
      </p>
    </div>
    <div class="space-y-2">
      <label class="block text-sm font-semibold" :for="`countdown-date-${countdown?.id ?? 'new'}`">
        Target date
      </label>
      <input
        :id="`countdown-date-${countdown?.id ?? 'new'}`"
        v-model="targetDate"
        :aria-describedby="
          errors.date ? `countdown-date-error-${countdown?.id ?? 'new'}` : undefined
        "
        :aria-invalid="errors.date ? 'true' : 'false'"
        class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3"
        type="date"
      />
      <p
        v-if="errors.date"
        :id="`countdown-date-error-${countdown?.id ?? 'new'}`"
        class="text-sm font-medium text-[var(--color-danger)]"
        role="alert"
      >
        {{ errors.date }}
      </p>
    </div>
    <div class="flex flex-wrap justify-end gap-2">
      <BaseButton size="sm" variant="ghost" @click="emit('cancel')">Cancel</BaseButton>
      <BaseButton size="sm" type="submit" variant="primary">
        {{ countdown ? 'Save countdown' : 'Add countdown' }}
      </BaseButton>
    </div>
  </form>
</template>
