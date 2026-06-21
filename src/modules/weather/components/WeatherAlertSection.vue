<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import type { WeatherAlert } from '@/modules/weather/types/weatherAlert'
import { formatFullLocalTime } from '@/modules/weather/utils/weatherFormatting'

interface Props {
  alerts: WeatherAlert[]
}

const props = defineProps<Props>()
const { locale, t } = useI18n()

const activeAlerts = computed(() => props.alerts.filter((alert) => alert.provider === 'caiyun'))

function issuedAtLabel(alert: WeatherAlert) {
  if (!alert.issuedAt) {
    return null
  }

  return t('weather.alert.issuedAt', {
    time: formatFullLocalTime(alert.issuedAt, locale.value),
  })
}
</script>

<template>
  <section
    v-if="activeAlerts.length > 0"
    aria-labelledby="weather-alert-title"
    class="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-xs)] sm:p-5"
  >
    <div class="max-w-2xl">
      <h2
        id="weather-alert-title"
        class="text-section-title text-balance text-[var(--color-text-primary)]"
      >
        {{ t('weather.alert.title') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ t('weather.alert.description') }}
      </p>
    </div>

    <ul class="mt-4 space-y-3" :aria-label="t('weather.alert.listLabel')">
      <li
        v-for="alert in activeAlerts"
        :key="alert.id"
        class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4"
      >
        <div class="flex flex-wrap items-center gap-2">
          <p class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ alert.title }}
          </p>
          <span
            v-if="alert.status || alert.severityLabel"
            class="rounded-[var(--radius-pill)] border border-[var(--color-border)] px-2 py-0.5 text-caption text-[var(--color-text-secondary)]"
          >
            {{ alert.status ?? alert.severityLabel }}
          </span>
        </div>
        <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{ alert.description }}
        </p>
        <dl class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-caption text-[var(--color-text-tertiary)]">
          <div v-if="alert.issuingAuthority">
            <dt class="sr-only">{{ t('weather.alert.authority') }}</dt>
            <dd>{{ alert.issuingAuthority }}</dd>
          </div>
          <div v-if="issuedAtLabel(alert)">
            <dt class="sr-only">{{ t('weather.alert.issuedTime') }}</dt>
            <dd>{{ issuedAtLabel(alert) }}</dd>
          </div>
          <div>
            <dt class="sr-only">{{ t('weather.alert.transportSource') }}</dt>
            <dd>{{ t('weather.alert.source') }}</dd>
          </div>
        </dl>
      </li>
    </ul>
  </section>
</template>
