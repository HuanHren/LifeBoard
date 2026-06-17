<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'
import type { WeatherProviderId } from '@/modules/weather/types/weatherProvider'

interface Props {
  provider: WeatherProviderId
  hasCaiyunToken: boolean
}

defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <aside
    class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]"
    aria-live="polite"
  >
    <p>
      {{
        provider === 'caiyun' && !hasCaiyunToken
          ? t('weather.providerNotice.caiyunMissingToken')
          : provider === 'caiyun'
            ? t('weather.providerNotice.caiyunActive')
            : t('weather.providerNotice.openMeteoActive')
      }}
    </p>
  </aside>
</template>
