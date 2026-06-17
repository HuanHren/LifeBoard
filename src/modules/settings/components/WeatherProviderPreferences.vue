<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import type { TranslationKey } from '@/i18n/keys'
import { useI18n } from '@/i18n/useI18n'
import type {
  WeatherProviderId,
  WeatherProviderMessage,
  WeatherProviderStorageError,
} from '@/modules/weather/types/weatherProvider'

interface Props {
  provider: WeatherProviderId
  hasCaiyunToken: boolean
  message: WeatherProviderMessage | null
  error: WeatherProviderStorageError | null
}

interface Emits {
  updateProvider: [provider: WeatherProviderId]
  saveToken: [token: string]
  clearToken: []
  clearMessage: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const tokenInput = ref('')

const providerOptions: Array<{
  id: WeatherProviderId
  labelKey: TranslationKey
  descriptionKey: TranslationKey
}> = [
  {
    id: 'openMeteo',
    labelKey: 'settings.weatherProvider.openMeteoLabel',
    descriptionKey: 'settings.weatherProvider.openMeteoDescription',
  },
  {
    id: 'caiyun',
    labelKey: 'settings.weatherProvider.caiyunLabel',
    descriptionKey: 'settings.weatherProvider.caiyunDescription',
  },
]

const messageKeys: Record<WeatherProviderMessage, TranslationKey> = {
  providerSaved: 'settings.weatherProvider.message.providerSaved',
  tokenSaved: 'settings.weatherProvider.message.tokenSaved',
  tokenCleared: 'settings.weatherProvider.message.tokenCleared',
}

const errorKeys: Record<WeatherProviderStorageError, TranslationKey> = {
  storageUnavailable: 'settings.weatherProvider.error.storage',
  emptyToken: 'settings.weatherProvider.error.emptyToken',
  invalidProvider: 'settings.weatherProvider.error.invalidProvider',
}

function saveToken() {
  emit('saveToken', tokenInput.value)
  tokenInput.value = ''
}
</script>

<template>
  <div class="space-y-6 rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-5 sm:p-6">
    <fieldset class="space-y-4">
      <legend class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('settings.weatherProvider.legend') }}
      </legend>
      <p class="max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
        {{ t('settings.weatherProvider.helper') }}
      </p>

      <div class="grid gap-3 sm:grid-cols-2">
        <label
          v-for="option in providerOptions"
          :key="option.id"
          class="interactive-surface flex min-h-24 cursor-pointer gap-3 rounded-[var(--radius-md)] border p-4"
          :class="
            provider === option.id
              ? 'border-[var(--color-accent)] bg-[var(--color-accent-wash)]'
              : 'border-[var(--color-border-soft)] bg-[var(--color-surface)] hover:border-[var(--color-control-border)]'
          "
        >
          <input
            class="mt-1 size-4 accent-[var(--color-accent)]"
            name="weather-provider"
            type="radio"
            :checked="provider === option.id"
            @change="emit('updateProvider', option.id)"
          />
          <span>
            <span class="block text-sm font-semibold text-[var(--color-text-primary)]">
              {{ t(option.labelKey) }}
            </span>
            <span class="mt-1 block text-sm leading-6 text-[var(--color-text-secondary)]">
              {{ t(option.descriptionKey) }}
            </span>
          </span>
        </label>
      </div>
    </fieldset>

    <div class="space-y-4 border-t border-[var(--color-border-soft)] pt-5">
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <label
            class="text-sm font-semibold text-[var(--color-text-primary)]"
            for="caiyun-token"
          >
            {{ t('settings.weatherProvider.tokenLabel') }}
          </label>
          <input
            id="caiyun-token"
            v-model="tokenInput"
            aria-describedby="caiyun-token-help caiyun-token-status"
            class="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-[border-color,box-shadow] duration-[var(--motion-fast)] focus:border-[var(--color-focus)] focus:ring-[var(--focus-ring-width)] focus:ring-[var(--color-focus)] focus:ring-offset-[var(--focus-ring-offset)] focus:ring-offset-[var(--color-canvas)]"
            autocomplete="off"
            type="password"
          />
          <p
            id="caiyun-token-help"
            class="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]"
          >
            {{ t('settings.weatherProvider.tokenHelper') }}
          </p>
          <p
            id="caiyun-token-status"
            class="mt-2 text-sm font-medium text-[var(--color-text-primary)]"
          >
            {{
              hasCaiyunToken
                ? t('settings.weatherProvider.tokenSavedState')
                : t('settings.weatherProvider.tokenMissingState')
            }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <BaseButton variant="primary" @click="saveToken">
            {{ t('settings.weatherProvider.saveToken') }}
          </BaseButton>
          <BaseButton
            :disabled="!props.hasCaiyunToken"
            class="border-[var(--color-danger)] text-[var(--color-danger)]"
            variant="secondary"
            @click="emit('clearToken')"
          >
            {{ t('settings.weatherProvider.clearToken') }}
          </BaseButton>
        </div>
      </div>

      <p class="max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
        {{ t('settings.weatherProvider.privacy') }}
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
  </div>
</template>
