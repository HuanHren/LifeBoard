<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseNotice from '@/components/base/BaseNotice.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import type { TranslationKey } from '@/i18n/keys'
import { useI18n } from '@/i18n/useI18n'
import type {
  WeatherProviderId,
  WeatherProviderMessage,
  WeatherProviderStorageError,
} from '@/modules/weather/types/weatherProvider'

interface Props {
  provider: WeatherProviderId
  effectiveProvider: WeatherProviderId
  hasCaiyunToken: boolean
  xiaomiEnabled: boolean
  xiaomiLocaleSupported: boolean
  locationResolutionRequired: boolean
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

const providerOptions = computed<Array<{
  id: WeatherProviderId
  labelKey: TranslationKey
  descriptionKey: TranslationKey
  disabled?: boolean
}>>(() => [
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
  ...(props.xiaomiEnabled
    ? [{
        id: 'xiaomi' as const,
        labelKey: 'settings.weatherProvider.xiaomiLabel' as const,
        descriptionKey: (
          props.xiaomiLocaleSupported
            ? 'settings.weatherProvider.xiaomiDescription'
            : 'settings.weatherProvider.xiaomiUnsupportedLocale'
        ) as TranslationKey,
        disabled: !props.xiaomiLocaleSupported,
      }]
    : []),
])

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
  <BaseSurface as="div" class="weather-provider-preferences" padding="md" variant="plain">
    <fieldset class="space-y-4">
      <legend class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('settings.weatherProvider.legend') }}
      </legend>
      <p class="max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
        {{
          t(
            props.xiaomiEnabled
              ? 'settings.weatherProvider.helperWithXiaomi'
              : 'settings.weatherProvider.helper',
          )
        }}
      </p>

      <div class="grid gap-3 sm:grid-cols-2">
        <label
          v-for="option in providerOptions"
          :key="option.id"
          class="interactive-surface flex min-h-24 gap-3 rounded-[var(--radius-md)] border p-4"
          :class="
            option.disabled
              ? 'cursor-not-allowed border-[var(--color-border-soft)] bg-[var(--color-surface-inset)] opacity-75'
              : provider === option.id
              ? 'border-[var(--color-accent)] bg-[var(--color-accent-wash)]'
              : 'cursor-pointer border-[var(--color-border-soft)] bg-[var(--color-surface)] hover:border-[var(--color-control-border)]'
          "
        >
          <input
            class="mt-1 size-4 accent-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            name="weather-provider"
            type="radio"
            :checked="provider === option.id"
            :disabled="option.disabled"
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

      <BaseNotice
        v-if="provider === 'xiaomi' && effectiveProvider !== 'xiaomi'"
        tone="info"
        aria-live="polite"
      >
        {{
          locationResolutionRequired
            ? t('settings.weatherProvider.xiaomiLocationRequired')
            : t('settings.weatherProvider.xiaomiEffectiveOpenMeteo')
        }}
      </BaseNotice>
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
        <BaseNotice
          v-if="error"
          tone="danger"
          role="alert"
        >
          {{ t(errorKeys[error]) }}
        </BaseNotice>
        <BaseNotice
          v-if="message"
          tone="success"
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
        </BaseNotice>
      </div>
    </div>
  </BaseSurface>
</template>

<style scoped>
.weather-provider-preferences {
  display: grid;
  gap: var(--space-6);
}
</style>
