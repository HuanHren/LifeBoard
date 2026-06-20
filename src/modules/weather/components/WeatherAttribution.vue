<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'
import { getForecastSourceForProvider } from '@/modules/weather/constants/weatherSources'
import type { WeatherDataProvider } from '@/modules/weather/types/weather'

interface Props {
  provider: WeatherDataProvider
}

const props = defineProps<Props>()
const { t } = useI18n()

const source = computed(() => getForecastSourceForProvider(props.provider))
const sourceLinkLabel = computed(() =>
  t('weather.attribution.sourceLinkLabel', {
    provider: source.value.displayName,
  }),
)
const licenceLinkLabel = computed(() =>
  source.value.licenceLabel
    ? t('weather.attribution.licenceLinkLabel', {
        licence: source.value.licenceLabel,
      })
    : '',
)
</script>

<template>
  <p
    class="border-t border-[var(--color-border-soft)] pt-4 text-caption leading-5 text-pretty text-[var(--color-text-secondary)]"
  >
    {{ t('weather.attribution.forecastPrefix') }}
    <a
      v-if="source.officialUrl"
      class="font-medium text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
      :href="source.officialUrl"
      :aria-label="sourceLinkLabel"
      rel="noreferrer"
      target="_blank"
    >
      {{ source.displayName }}
    </a>
    <span v-else>{{ source.displayName }}</span>
    <template v-if="source.licenceLabel && source.licenceUrl">
      {{ t('weather.attribution.licencePrefix') }}
      <a
        class="font-medium text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
        :href="source.licenceUrl"
        :aria-label="licenceLinkLabel"
        rel="noreferrer"
        target="_blank"
      >
        {{ source.licenceLabel }}
      </a>
    </template>
    {{ t('settings.dataSources.weatherAttributionPrefix') }}
    <RouterLink
      class="font-medium text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
      :to="{ name: 'settings-data-sources' }"
    >
      {{ t('settings.dataSources.weatherAttributionLink') }}
    </RouterLink>
  </p>
</template>
