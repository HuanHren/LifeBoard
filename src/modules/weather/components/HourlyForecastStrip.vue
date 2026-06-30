<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'
import type { HourlyForecastItem, WeatherUnits } from '@/modules/weather/types/weather'
import {
  formatHour,
  formatPercentage,
  formatPrecipitation,
  formatTemperature,
  formatWind,
} from '@/modules/weather/utils/weatherFormatting'
import { localizeWeatherCondition } from '@/modules/weather/utils/weatherI18n'

interface Props {
  items: HourlyForecastItem[]
  units: WeatherUnits
}

defineProps<Props>()
const { locale, t } = useI18n()
</script>

<template>
  <section class="min-w-0" aria-labelledby="hourly-forecast-title">
    <div class="max-w-2xl">
      <h2
        id="hourly-forecast-title"
        class="text-section-title text-balance text-[var(--color-text-primary)]"
      >
        {{ t('weather.hourly.title') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ t('weather.hourly.description') }}
      </p>
    </div>

    <div
      class="forecast-scroll mt-4 overflow-x-auto rounded-[var(--radius-lg)] bg-[var(--color-surface-inset)] p-2 focus-visible:outline-offset-4"
      :aria-label="t('weather.hourly.scrollLabel')"
      tabindex="0"
    >
      <ol class="flex min-w-max snap-x snap-proximity gap-2">
        <li
          v-for="(item, index) in items"
          :key="item.time"
          class="w-36 shrink-0 snap-start rounded-[var(--radius-md)] px-4 py-4"
          :class="
            index === 0
              ? 'bg-[var(--color-accent-wash)]'
              : 'bg-[var(--color-surface-raised)]'
          "
        >
          <time
            :datetime="item.time"
            class="block text-sm font-semibold text-[var(--color-text-primary)]"
          >
            {{ index === 0 ? t('weather.hourly.now') : formatHour(item.time, locale) }}
          </time>
          <p class="mt-3 text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">
            {{ formatTemperature(item.temperature, units.temperature) }}
          </p>
          <p class="mt-1 min-h-10 text-caption leading-5 text-pretty text-[var(--color-text-secondary)]">
            {{ localizeWeatherCondition(item.condition, t, true) }}
          </p>
          <dl class="mt-4 grid gap-2 border-t border-[var(--color-border-soft)] pt-3">
            <div>
              <dt class="text-caption text-[var(--color-text-secondary)]">
                {{ t('weather.hourly.rainChance') }}
              </dt>
              <dd class="mt-0.5 text-sm font-medium tabular-nums text-[var(--color-text-primary)]">
                {{ formatPercentage(item.precipitationProbability) }}
              </dd>
            </div>
            <div>
              <dt class="text-caption text-[var(--color-text-secondary)]">
                {{ t('weather.hourly.amount') }}
              </dt>
              <dd class="mt-0.5 text-sm font-medium tabular-nums text-[var(--color-text-primary)]">
                {{ formatPrecipitation(item.precipitation, units.precipitation) }}
              </dd>
            </div>
            <div>
              <dt class="text-caption text-[var(--color-text-secondary)]">
                {{ t('weather.current.wind') }}
              </dt>
              <dd class="mt-0.5 text-sm font-medium tabular-nums text-[var(--color-text-primary)]">
                {{ formatWind(item.windSpeed, units.windSpeed) }}
              </dd>
            </div>
          </dl>
        </li>
      </ol>
    </div>
  </section>
</template>
