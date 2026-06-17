<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useI18n } from '@/i18n/useI18n'

interface Props {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  acknowledgementLabel?: string
}

interface Emits {
  confirm: []
  cancel: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
const dialog = ref<HTMLDialogElement | null>(null)
const cancelButton = ref<HTMLButtonElement | null>(null)
const acknowledged = ref(false)
let returnFocus: HTMLElement | null = null

function cancel() {
  emit('cancel')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !dialog.value) return

  const focusable = Array.from(
    dialog.value.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
    ),
  )
  const first = focusable[0]
  const last = focusable.at(-1)

  if (!first || !last) return

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      returnFocus = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
      acknowledged.value = false
      dialog.value?.showModal()
      await nextTick()
      cancelButton.value?.focus()
      return
    }

    if (dialog.value?.open) dialog.value.close()
    await nextTick()

    if (returnFocus?.isConnected) {
      returnFocus.focus()
      return
    }

    const pageHeading = document.querySelector<HTMLElement>('main h1')

    if (pageHeading) {
      pageHeading.tabIndex = -1
      pageHeading.focus()
      pageHeading.addEventListener(
        'blur',
        () => pageHeading.removeAttribute('tabindex'),
        { once: true },
      )
    }
  },
)
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto w-[min(32rem,calc(100%-2rem))] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-0 text-[var(--color-text-primary)] shadow-[var(--shadow-soft)] backdrop:bg-[color-mix(in_oklch,var(--color-text-primary)_35%,transparent)]"
    @cancel.prevent="cancel"
    @keydown="handleKeydown"
  >
    <div class="p-5 sm:p-6">
      <h2 class="text-section-title">{{ title }}</h2>
      <p class="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
        {{ description }}
      </p>

      <div class="mt-4">
        <slot />
      </div>

      <label
        v-if="acknowledgementLabel"
        class="mt-5 flex min-h-11 cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] bg-[var(--color-danger-soft)] p-3 text-sm leading-6"
      >
        <input
          v-model="acknowledged"
          class="mt-1 size-4 shrink-0 accent-[var(--color-danger)]"
          type="checkbox"
        />
        <span>{{ acknowledgementLabel }}</span>
      </label>

      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          ref="cancelButton"
          class="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] px-4 text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
          type="button"
          @click="cancel"
        >
          {{ t('settings.common.cancel') }}
        </button>
        <button
          class="border-[var(--color-danger)] bg-[var(--color-danger)] text-[var(--color-text-inverse)] hover:border-[var(--color-danger)]"
          :class="[
            'inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] border px-4 text-sm font-medium',
            'disabled:cursor-not-allowed disabled:opacity-55',
          ]"
          :disabled="Boolean(acknowledgementLabel) && !acknowledged"
          type="button"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </dialog>
</template>
