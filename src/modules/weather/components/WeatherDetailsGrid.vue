<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import WeatherDetailCard from '@/modules/weather/components/WeatherDetailCard.vue'
import type { WeatherSnapshot } from '@/modules/weather/types/weather'
import {
  describeHumidity,
  describeUvIndex,
  describeWind,
  toneForUvIndex,
  toneForWind,
  type WeatherDetailItem,
} from '@/modules/weather/utils/weatherDetails'
import {
  formatFullLocalTime,
  formatPercentage,
  formatPressure,
  formatTemperature,
  formatUvIndex,
  formatWind,
  formatWindDirection,
} from '@/modules/weather/utils/weatherFormatting'

interface Props {
  weather: WeatherSnapshot
}

const props = defineProps<Props>()
const { locale, t } = useI18n()

const unavailableLabel = computed(() => t('weather.details.unavailable'))

const details = computed<WeatherDetailItem[]>(() => {
  const { current, daily, units } = props.weather
  const today = daily[0]
  const sunrise = today?.sunrise
    ? formatFullLocalTime(today.sunrise, locale.value)
    : unavailableLabel.value
  const sunset = today?.sunset
    ? formatFullLocalTime(today.sunset, locale.value)
    : unavailableLabel.value

  return [
    {
      id: 'uv',
      label: t('weather.details.uv.label'),
      value:
        current.uvIndex === null
          ? unavailableLabel.value
          : formatUvIndex(current.uvIndex),
      helper: describeUvIndex(current.uvIndex, t),
      tone: toneForUvIndex(current.uvIndex),
    },
    {
      id: 'humidity',
      label: t('weather.details.humidity.label'),
      value: formatPercentage(current.relativeHumidity),
      helper: describeHumidity(current.relativeHumidity, t),
      tone: 'neutral',
    },
    {
      id: 'feels-like',
      label: t('weather.details.feelsLike.label'),
      value: formatTemperature(current.apparentTemperature, units.temperature),
      helper: t('weather.details.feelsLike.helper'),
      tone: 'neutral',
    },
    {
      id: 'wind',
      label: t('weather.details.wind.label'),
      value: `${formatWindDirection(current.windDirection, t)} ${formatWind(
        current.windSpeed,
        units.windSpeed,
      )}`,
      helper: describeWind(current.windSpeed, t),
      tone: toneForWind(current.windSpeed),
    },
    {
      id: 'sun',
      label: t('weather.details.sun.label'),
      value: t('weather.details.sun.value', { sunrise, sunset }),
      helper: t('weather.details.sun.helper'),
      tone: 'neutral',
    },
    {
      id: 'pressure',
      label: t('weather.details.pressure.label'),
      value:
        current.pressure === null
          ? unavailableLabel.value
          : formatPressure(current.pressure, units.pressure),
      helper: t('weather.details.pressure.helper'),
      tone: 'neutral',
    },
  ]
})
</script>

<template>
  <section aria-labelledby="weather-details-title">
    <div class="max-w-2xl">
      <h2
        id="weather-details-title"
        class="text-section-title text-balance text-[var(--color-text-primary)]"
      >
        {{ t('weather.details.title') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ t('weather.details.description') }}
      </p>
    </div>

    <dl class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <WeatherDetailCard
        v-for="item in details"
        :key="item.id"
        :helper="item.helper"
        :label="item.label"
        :tone="item.tone"
        :value="item.value"
      />
    </dl>
  </section>
</template>
