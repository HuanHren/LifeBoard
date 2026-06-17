<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'
import type {
  CurrentConditions,
  WeatherLocation,
  WeatherUnits,
} from '@/modules/weather/types/weather'
import {
  formatFullLocalTime,
  formatLocationName,
  formatPercentage,
  formatTemperature,
  formatWind,
  formatWindDirection,
} from '@/modules/weather/utils/weatherFormatting'
import { localizeWeatherCondition } from '@/modules/weather/utils/weatherI18n'

interface Props {
  location: WeatherLocation
  current: CurrentConditions
  units: WeatherUnits
  timezoneAbbreviation: string
}

defineProps<Props>()
const { locale, t } = useI18n()
</script>

<template>
  <section
    class="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-accent-wash)] p-5 sm:p-6"
    aria-labelledby="current-weather-title"
  >
    <header>
      <h2
        id="current-weather-title"
        class="text-section-title text-balance text-[var(--color-text-primary)]"
      >
        {{ t('weather.current.title') }}
      </h2>
      <p class="mt-1.5 text-sm font-medium text-[var(--color-accent-text)]">
        {{ formatLocationName(location) }}
      </p>
      <p class="mt-1 text-caption text-pretty text-[var(--color-text-secondary)]">
        {{
          t('weather.current.updated', {
            time: formatFullLocalTime(current.time, locale),
            timezone: timezoneAbbreviation,
          })
        }}
      </p>
    </header>

    <div class="mt-6 flex flex-wrap items-end gap-x-5 gap-y-2">
      <p class="text-5xl font-semibold leading-none tabular-nums text-[var(--color-text-primary)]">
        {{ formatTemperature(current.temperature, units.temperature) }}
      </p>
      <div class="pb-0.5">
        <p class="text-lg font-semibold text-balance text-[var(--color-text-primary)]">
          {{ localizeWeatherCondition(current.condition, t) }}
        </p>
        <p class="mt-0.5 text-sm text-[var(--color-text-secondary)]">
          {{
            t('weather.current.feelsLike', {
              temperature: formatTemperature(
                current.apparentTemperature,
                units.temperature,
              ),
            })
          }}
        </p>
      </div>
    </div>

    <dl
      class="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-[var(--color-border-soft)] pt-5 sm:grid-cols-4"
    >
      <div>
        <dt class="text-caption text-[var(--color-text-secondary)]">
          {{ t('weather.current.humidity') }}
        </dt>
        <dd class="mt-1 text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
          {{ formatPercentage(current.relativeHumidity) }}
        </dd>
      </div>
      <div>
        <dt class="text-caption text-[var(--color-text-secondary)]">
          {{ t('weather.current.wind') }}
        </dt>
        <dd class="mt-1 text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
          {{ formatWindDirection(current.windDirection, t) }}
          {{ formatWind(current.windSpeed, units.windSpeed) }}
        </dd>
      </div>
      <div>
        <dt class="text-caption text-[var(--color-text-secondary)]">
          {{ t('weather.current.gusts') }}
        </dt>
        <dd class="mt-1 text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
          {{ formatWind(current.windGusts, units.windSpeed) }}
        </dd>
      </div>
      <div>
        <dt class="text-caption text-[var(--color-text-secondary)]">
          {{ t('weather.current.cloudCover') }}
        </dt>
        <dd class="mt-1 text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
          {{ formatPercentage(current.cloudCover) }}
        </dd>
      </div>
    </dl>
  </section>
</template>
