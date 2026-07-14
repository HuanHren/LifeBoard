<script setup lang="ts">
import { computed } from 'vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import { useI18n } from '@/i18n/useI18n'
import type {
  XiaomiChangeDirection,
  XiaomiRecentChangesViewModel,
  XiaomiRecentMetricId,
  XiaomiRecentMetricUnit,
  XiaomiRecentMetricViewModel,
} from '@/modules/weather/extended/xiaomiExtendedWeatherViewModel'
import { formatFullLocalTime } from '@/modules/weather/utils/weatherFormatting'

interface Props {
  model: XiaomiRecentChangesViewModel
}

const props = defineProps<Props>()
const { locale, t } = useI18n()

const metricKeys: Record<XiaomiRecentMetricId, Parameters<typeof t>[0]> = {
  temperature: 'weather.xiaomiExtended.metric.temperature',
  feelsLike: 'weather.xiaomiExtended.metric.feelsLike',
  humidity: 'weather.xiaomiExtended.metric.humidity',
  pressure: 'weather.xiaomiExtended.metric.pressure',
  visibility: 'weather.xiaomiExtended.metric.visibility',
  windSpeed: 'weather.xiaomiExtended.metric.windSpeed',
}

const directionKeys: Record<XiaomiChangeDirection, Parameters<typeof t>[0]> = {
  increase: 'weather.xiaomiExtended.direction.increase',
  decrease: 'weather.xiaomiExtended.direction.decrease',
  unchanged: 'weather.xiaomiExtended.direction.unchanged',
}

const unitLabels: Record<XiaomiRecentMetricUnit, string> = {
  celsius: '°C',
  percent: '%',
  hectopascals: 'hPa',
  kilometres: 'km',
  'kilometres-per-hour': 'km/h',
}

const numberFormatter = computed(() => new Intl.NumberFormat(locale.value, {
  maximumFractionDigits: 1,
}))

function metricLabel(metric: XiaomiRecentMetricViewModel) {
  return t(metricKeys[metric.id])
}

function formatValue(value: number, unit: XiaomiRecentMetricUnit) {
  return `${numberFormatter.value.format(value)} ${unitLabels[unit]}`
}

function formatDelta(metric: XiaomiRecentMetricViewModel) {
  if (metric.direction === 'unchanged') return formatValue(0, metric.unit)
  const sign = metric.delta > 0 ? '+' : '−'
  return `${sign}${formatValue(Math.abs(metric.delta), metric.unit)}`
}

function metricSummary(metric: XiaomiRecentMetricViewModel) {
  return t('weather.xiaomiExtended.recent.metricSummary', {
    label: metricLabel(metric),
    previous: formatValue(metric.previousValue, metric.unit),
    current: formatValue(metric.currentValue, metric.unit),
    direction: t(directionKeys[metric.direction]),
    delta: formatDelta(metric),
  })
}
</script>

<template>
  <BaseSurface as="article" padding="md" variant="muted">
    <div class="max-w-2xl">
      <p class="text-caption font-medium text-[var(--color-accent-text)]">
        {{ t('weather.xiaomiExtended.contextLabel') }}
      </p>
      <h3 class="mt-1 text-card-title font-semibold text-[var(--color-text-primary)]">
        {{ t('weather.xiaomiExtended.recent.title') }}
      </h3>
      <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ t('weather.xiaomiExtended.recent.description', {
          time: formatFullLocalTime(props.model.observedAt, locale),
        }) }}
      </p>
    </div>

    <dl class="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
      <div
        v-for="metric in props.model.metrics"
        :key="metric.id"
        class="min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-3"
        :aria-label="metricSummary(metric)"
      >
        <dt class="text-caption font-medium text-[var(--color-text-secondary)]">
          {{ metricLabel(metric) }}
        </dt>
        <dd class="mt-1 min-w-0">
          <p class="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 tabular-nums">
            <span class="text-sm text-[var(--color-text-tertiary)]">
              {{ formatValue(metric.previousValue, metric.unit) }}
            </span>
            <span aria-hidden="true" class="text-[var(--color-text-tertiary)]">→</span>
            <span class="font-semibold text-[var(--color-text-primary)]">
              {{ formatValue(metric.currentValue, metric.unit) }}
            </span>
          </p>
          <p class="mt-1 text-caption text-[var(--color-text-secondary)]">
            {{ t(directionKeys[metric.direction]) }} · {{ formatDelta(metric) }}
          </p>
        </dd>
      </div>
    </dl>
  </BaseSurface>
</template>
