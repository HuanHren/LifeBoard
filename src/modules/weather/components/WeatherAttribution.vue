<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'
import type { WeatherDataProvider } from '@/modules/weather/types/weather'

interface Props {
  provider: WeatherDataProvider
}

defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <p
    class="border-t border-[var(--color-border-soft)] pt-4 text-caption leading-5 text-pretty text-[var(--color-text-secondary)]"
  >
    <template v-if="provider === 'caiyun'">
      {{ t('weather.attribution.caiyunPrefix') }}
      <a
        class="font-medium text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
        href="https://www.caiyunapp.com/"
        rel="noreferrer"
        target="_blank"
      >
        {{ t('weather.attribution.caiyunLink') }}
      </a>
      {{ t('weather.attribution.caiyunSuffix') }}
    </template>
    <template v-else>
      {{ t('weather.attribution.prefix') }}
      <a
        class="font-medium text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
        href="https://open-meteo.com/"
        rel="noreferrer"
        target="_blank"
      >
        {{ t('weather.attribution.dataLink') }}
      </a>
      {{ t('weather.attribution.under') }}
      <a
        class="font-medium text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
        href="https://creativecommons.org/licenses/by/4.0/"
        rel="noreferrer"
        target="_blank"
      >
        CC BY 4.0.
      </a>
    </template>
  </p>
</template>
