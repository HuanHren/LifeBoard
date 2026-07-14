<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'
import type {
  WeatherProviderAvailabilityReason,
  WeatherProviderId,
} from '@/modules/weather/types/weatherProvider'

interface Props {
  provider: WeatherProviderId
  preferredProvider?: WeatherProviderId
  availabilityReason?: WeatherProviderAvailabilityReason
  hasCaiyunToken: boolean
}

const props = defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <aside
    class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]"
    aria-live="polite"
  >
    <p>
      {{
        props.preferredProvider === 'xiaomi' && provider !== 'xiaomi'
          ? availabilityReason === 'unsupported-locale'
            ? t('weather.providerNotice.xiaomiUnsupportedLocale')
            : availabilityReason === 'missing-provider-location'
              ? t('weather.providerNotice.xiaomiLocationRequired')
              : t('weather.providerNotice.xiaomiDisabled')
          : provider === 'xiaomi'
            ? t('weather.providerNotice.xiaomiActive')
            : provider === 'caiyun' && !hasCaiyunToken
          ? t('weather.providerNotice.caiyunMissingToken')
          : provider === 'caiyun'
            ? t('weather.providerNotice.caiyunActive')
            : t('weather.providerNotice.openMeteoActive')
      }}
    </p>
  </aside>
</template>
