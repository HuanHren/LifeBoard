<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import type { TranslationKey } from '@/i18n/keys'
import { useI18n } from '@/i18n/useI18n'
import type {
  WeatherAmapMessage,
  WeatherAmapStorageError,
} from '@/modules/weather/services/weatherAmapStorage'

interface Props {
  hasAmapKey: boolean
  autoLocationOnHome: boolean
  message: WeatherAmapMessage | null
  error: WeatherAmapStorageError | null
}

interface Emits {
  saveAmapKey: [key: string]
  clearAmapKey: []
  updateAutoLocation: [enabled: boolean]
  clearMessage: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const amapKeyInput = ref('')

const messageKeys: Record<WeatherAmapMessage, TranslationKey> = {
  amapKeySaved: 'settings.locationServices.message.amapKeySaved',
  amapKeyCleared: 'settings.locationServices.message.amapKeyCleared',
  autoLocationSaved: 'settings.locationServices.message.autoLocationSaved',
}

const errorKeys: Record<WeatherAmapStorageError, TranslationKey> = {
  storageUnavailable: 'settings.locationServices.error.storage',
  emptyAmapKey: 'settings.locationServices.error.emptyAmapKey',
}

function saveKey() {
  emit('saveAmapKey', amapKeyInput.value)
  amapKeyInput.value = ''
}
</script>

<template>
  <div class="space-y-6 rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-5 sm:p-6">
    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div>
        <label
          class="text-sm font-semibold text-[var(--color-text-primary)]"
          for="amap-web-service-key"
        >
          {{ t('settings.locationServices.amapKeyLabel') }}
        </label>
        <input
          id="amap-web-service-key"
          v-model="amapKeyInput"
          aria-describedby="amap-key-help amap-key-status"
          autocomplete="off"
          class="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-[border-color,box-shadow] duration-[var(--motion-fast)] focus:border-[var(--color-focus)] focus:ring-[var(--focus-ring-width)] focus:ring-[var(--color-focus)] focus:ring-offset-[var(--focus-ring-offset)] focus:ring-offset-[var(--color-canvas)]"
          type="password"
        />
        <p
          id="amap-key-help"
          class="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]"
        >
          {{ t('settings.locationServices.amapKeyHelper') }}
        </p>
        <p
          id="amap-key-status"
          class="mt-2 text-sm font-medium text-[var(--color-text-primary)]"
        >
          {{
            hasAmapKey
              ? t('settings.locationServices.amapKeySavedState')
              : t('settings.locationServices.amapKeyMissingState')
          }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <BaseButton variant="primary" @click="saveKey">
          {{ t('settings.locationServices.saveAmapKey') }}
        </BaseButton>
        <BaseButton
          :disabled="!props.hasAmapKey"
          class="border-[var(--color-danger)] text-[var(--color-danger)]"
          variant="secondary"
          @click="emit('clearAmapKey')"
        >
          {{ t('settings.locationServices.clearAmapKey') }}
        </BaseButton>
      </div>
    </div>

    <label
      class="interactive-surface flex cursor-pointer gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4"
      for="auto-location-on-home"
    >
      <input
        id="auto-location-on-home"
        class="mt-1 size-4 accent-[var(--color-accent)]"
        type="checkbox"
        :checked="autoLocationOnHome"
        @change="emit('updateAutoLocation', ($event.target as HTMLInputElement).checked)"
      />
      <span>
        <span class="block text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('settings.locationServices.autoLocationLabel') }}
        </span>
        <span class="mt-1 block text-sm leading-6 text-[var(--color-text-secondary)]">
          {{ t('settings.locationServices.autoLocationHelper') }}
        </span>
      </span>
    </label>

    <p class="max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
      {{ t('settings.locationServices.privacy') }}
    </p>

    <div v-if="message || error" class="space-y-2">
      <p
        v-if="error"
        class="rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-3 text-sm font-medium text-[var(--color-text-primary)]"
        role="alert"
      >
        {{ t(errorKeys[error]) }}
      </p>
      <p
        v-if="message"
        class="rounded-[var(--radius-md)] bg-[var(--color-accent-wash)] p-3 text-sm font-medium text-[var(--color-text-primary)]"
        aria-live="polite"
      >
        {{ t(messageKeys[message]) }}
        <button
          class="ml-2 rounded-[var(--radius-xs)] underline decoration-[var(--color-border)] underline-offset-4 hover:text-[var(--color-accent)]"
          type="button"
          @click="emit('clearMessage')"
        >
          {{ t('settings.weatherProvider.dismiss') }}
        </button>
      </p>
    </div>
  </div>
</template>
