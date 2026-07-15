<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import type { CurrentLocationDialogMode } from '@/modules/weather/composables/useCurrentLocationWeather'
import type { RankedXiaomiLocationCandidate } from '@/modules/weather/types/currentLocationResolution'
import { formatLocationName } from '@/modules/weather/utils/weatherFormatting'

interface Props {
  open: boolean
  mode: CurrentLocationDialogMode | null
  candidates: RankedXiaomiLocationCandidate[]
  selectedIndex: number | null
  errorMessage?: string | null
}

interface Emits {
  cancel: []
  continue: []
  confirm: []
  select: [index: number]
  manual: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
const dialog = ref<HTMLDialogElement | null>(null)
let returnFocus: HTMLElement | null = null

function handleCancel() {
  if (props.mode === 'resolving') return
  emit('cancel')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !dialog.value) return
  const focusable = Array.from(dialog.value.querySelectorAll<HTMLElement>(
    'button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
  ))
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

function focusDialogControl() {
  if (props.mode === 'candidates') {
    dialog.value?.querySelector<HTMLInputElement>('input[type="radio"]')?.focus()
    return
  }
  if (props.mode === 'error') {
    dialog.value?.querySelector<HTMLElement>('[data-qa="xiaomi-current-location-manual"]')?.focus()
    return
  }
  if (props.mode === 'consent') {
    dialog.value?.querySelector<HTMLElement>('[data-qa="xiaomi-current-location-continue"]')?.focus()
    return
  }
  dialog.value?.querySelector<HTMLElement>('[data-qa="xiaomi-current-location-cancel"]')?.focus()
}

watch(
  () => [props.open, props.mode] as const,
  async ([open], previous) => {
    if (open) {
      if (!previous?.[0]) {
        returnFocus = document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
        dialog.value?.showModal()
      }
      await nextTick()
      focusDialogControl()
      return
    }

    if (dialog.value?.open) dialog.value.close()
    await nextTick()
    if (returnFocus?.isConnected) returnFocus.focus()
  },
)

function formatDistance(distanceKm: number | undefined) {
  if (distanceKm === undefined || !Number.isFinite(distanceKm)) return null
  const distance = distanceKm < 1 ? '<1' : String(Math.round(distanceKm))
  return t('weather.currentLocation.distance', { distance })
}
</script>

<template>
  <dialog
    ref="dialog"
    aria-describedby="xiaomi-current-location-description"
    aria-labelledby="xiaomi-current-location-title"
    class="m-auto max-h-[min(44rem,calc(100%-2rem))] w-[min(36rem,calc(100%-2rem))] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-0 text-[var(--color-text-primary)] shadow-[var(--shadow-soft)] backdrop:bg-[color-mix(in_oklch,var(--color-text-primary)_35%,transparent)]"
    data-qa="xiaomi-current-location-dialog"
    :aria-busy="mode === 'resolving' || undefined"
    @cancel.prevent="handleCancel"
    @keydown="handleKeydown"
  >
    <div class="p-5 sm:p-6">
      <h2 id="xiaomi-current-location-title" class="text-section-title">
        {{
          mode === 'consent'
            ? t('weather.currentLocation.consentTitle')
            : t('weather.currentLocation.confirmTitle')
        }}
      </h2>
      <p
        id="xiaomi-current-location-description"
        class="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]"
      >
        {{
          mode === 'consent'
            ? t('weather.currentLocation.consentDescription')
            : mode === 'candidates'
              ? t('weather.currentLocation.confirmDescription')
              : mode === 'resolving'
                ? t('weather.currentLocation.resolvingDescription')
                : t('weather.currentLocation.errorDescription')
        }}
      </p>

      <p
        v-if="mode === 'resolving'"
        class="mt-5 rounded-[var(--radius-md)] bg-[var(--color-surface-inset)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]"
        aria-live="polite"
      >
        {{ t('weather.currentLocation.resolvingStatus') }}
      </p>

      <fieldset v-else-if="mode === 'candidates'" class="mt-5 min-w-0">
        <legend class="text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('weather.currentLocation.candidateLegend') }}
        </legend>
        <div class="mt-3 grid gap-2">
          <label
            v-for="(candidate, index) in candidates"
            :key="`${candidate.location.id}-${index}`"
            class="control-focus flex min-w-0 cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-3 has-[:checked]:border-[var(--color-accent)] has-[:checked]:bg-[var(--color-accent-wash)]"
          >
            <input
              class="mt-1 size-4 shrink-0 accent-[var(--color-accent)]"
              :data-qa="`xiaomi-current-location-candidate-${index}`"
              :checked="selectedIndex === index"
              name="xiaomi-current-location-candidate"
              type="radio"
              @change="emit('select', index)"
            />
            <span class="min-w-0 flex-1">
              <span class="flex flex-wrap items-center gap-2">
                <span class="font-semibold text-[var(--color-text-primary)]">
                  {{ candidate.location.name }}
                </span>
                <span
                  v-if="candidate.recommended"
                  class="rounded-[var(--radius-pill)] bg-[var(--color-accent-wash)] px-2 py-0.5 text-caption font-medium text-[var(--color-accent-text)]"
                >
                  {{ t('weather.currentLocation.recommended') }}
                </span>
              </span>
              <span class="mt-1 block break-words text-caption leading-5 text-[var(--color-text-secondary)]">
                {{ formatLocationName(candidate.location) }}
              </span>
              <span
                v-if="formatDistance(candidate.distanceKm)"
                class="mt-1 block text-caption text-[var(--color-text-secondary)]"
              >
                {{ formatDistance(candidate.distanceKm) }}
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <p
        v-else-if="mode === 'error' && errorMessage"
        class="mt-5 rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm font-medium leading-6 text-[var(--color-danger)]"
        role="alert"
      >
        {{ errorMessage }}
      </p>

      <p
        v-if="mode === 'consent'"
        class="mt-4 text-caption leading-5 text-[var(--color-text-secondary)]"
      >
        {{ t('weather.currentLocation.providerAttribution') }}
      </p>

      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <BaseButton
          data-qa="xiaomi-current-location-cancel"
          :disabled="mode === 'resolving'"
          variant="secondary"
          @click="handleCancel"
        >
          {{ t('weather.currentLocation.cancel') }}
        </BaseButton>
        <BaseButton
          v-if="mode === 'consent'"
          data-qa="xiaomi-current-location-continue"
          variant="primary"
          @click="emit('continue')"
        >
          {{ t('weather.currentLocation.continue') }}
        </BaseButton>
        <BaseButton
          v-if="mode === 'candidates'"
          data-qa="xiaomi-current-location-manual"
          variant="secondary"
          @click="emit('manual')"
        >
          {{ t('weather.currentLocation.chooseOther') }}
        </BaseButton>
        <BaseButton
          v-if="mode === 'candidates'"
          data-qa="xiaomi-current-location-confirm"
          :disabled="selectedIndex === null"
          variant="primary"
          @click="emit('confirm')"
        >
          {{ t('weather.currentLocation.confirm') }}
        </BaseButton>
        <BaseButton
          v-if="mode === 'error'"
          data-qa="xiaomi-current-location-manual"
          variant="primary"
          @click="emit('manual')"
        >
          {{ t('weather.currentLocation.manualSearch') }}
        </BaseButton>
      </div>
    </div>
  </dialog>
</template>
