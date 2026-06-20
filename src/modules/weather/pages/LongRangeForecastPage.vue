<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import BaseError from '@/components/base/BaseError.vue'
import { useI18n } from '@/i18n/useI18n'
import LongRangeForecastStrip from '@/modules/weather/components/LongRangeForecastStrip.vue'
import WeatherAttribution from '@/modules/weather/components/WeatherAttribution.vue'
import { DAILY_FORECAST_LENGTH } from '@/modules/weather/constants/weather'
import { useWeatherStore } from '@/modules/weather/stores/weather'
import { formatLocationName } from '@/modules/weather/utils/weatherFormatting'
import { localizeWeatherError } from '@/modules/weather/utils/weatherI18n'

const weatherStore = useWeatherStore()
const { t } = useI18n()
const {
  selectedLocation,
  weather,
  forecastStatus,
  forecastError,
  provider,
  hasCaiyunToken,
} = storeToRefs(weatherStore)
const {
  initializeWeather,
  loadForecast,
} = weatherStore
const headingRef = ref<HTMLHeadingElement | null>(null)

const dailyItems = computed(() =>
  weather.value?.daily.slice(0, DAILY_FORECAST_LENGTH) ?? [],
)
const hasDailyForecast = computed(() => dailyItems.value.length > 0)
const forecastSnapshot = computed(() =>
  weather.value && hasDailyForecast.value ? weather.value : null,
)
const selectedLocationName = computed(() =>
  selectedLocation.value ? formatLocationName(selectedLocation.value) : '',
)
const activeLocationName = computed(() =>
  weather.value ? formatLocationName(weather.value.location) : selectedLocationName.value,
)
const availableDaysMessage = computed(() => {
  const count = dailyItems.value.length

  if (count >= DAILY_FORECAST_LENGTH) {
    return t('weather.longRange.availableDays', { count })
  }

  return t('weather.longRange.fewerDays', {
    count,
    target: DAILY_FORECAST_LENGTH,
  })
})
const unavailableDescription = computed(() => {
  if (selectedLocation.value && provider.value === 'caiyun' && !hasCaiyunToken.value) {
    return t('weather.state.caiyunTokenMissingDescription')
  }

  if (!selectedLocation.value) {
    return t('weather.longRange.noLocationDescription')
  }

  return t('weather.longRange.unavailableDescription')
})

onMounted(async () => {
  void initializeWeather()
  await nextTick()
  headingRef.value?.focus()
})
</script>

<template>
  <div class="space-y-6 pb-[var(--mobile-nav-clearance)] lg:pb-0">
    <RouterLink
      class="inline-flex w-fit items-center rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2 text-sm font-medium text-[var(--color-accent-text)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-wash)] focus-visible:outline focus-visible:outline-[var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--color-focus)]"
      :to="{ name: 'weather' }"
    >
      {{ t('weather.longRange.backToWeather') }}
    </RouterLink>

    <header class="max-w-4xl space-y-3">
      <p
        v-if="activeLocationName"
        class="text-sm font-medium text-[var(--color-text-secondary)]"
      >
        {{ activeLocationName }}
      </p>
      <h1
        ref="headingRef"
        class="text-page-title text-balance text-[var(--color-text-primary)] outline-none"
        tabindex="-1"
      >
        {{ t('weather.longRange.title') }}
      </h1>
      <p class="max-w-2xl text-base leading-7 text-pretty text-[var(--color-text-secondary)]">
        {{ t('weather.longRange.description') }}
      </p>
    </header>

    <section
      v-if="forecastStatus === 'loading' && !weather"
      aria-labelledby="long-range-loading-title"
      class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-6"
    >
      <h2
        id="long-range-loading-title"
        class="text-section-title text-[var(--color-text-primary)]"
      >
        {{ t('weather.longRange.loadingTitle') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]" role="status">
        {{ t('weather.longRange.loadingDescription') }}
      </p>
    </section>

    <BaseError
      v-else-if="forecastStatus === 'error'"
      :action-label="t('weather.longRange.retry')"
      :message="
        localizeWeatherError(forecastError, t) ??
        t('weather.longRange.unavailableDescription')
      "
      :title="t('weather.longRange.unavailableTitle')"
      @action="loadForecast()"
    />

    <div v-else-if="forecastSnapshot" class="space-y-6">
      <p
        class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]"
      >
        {{ availableDaysMessage }}
      </p>

      <LongRangeForecastStrip
        :items="dailyItems"
        :units="forecastSnapshot.units"
      />

      <div class="space-y-3">
        <WeatherAttribution :provider="forecastSnapshot.provider" />
        <p class="text-caption leading-5 text-[var(--color-text-secondary)]">
          {{ t('weather.longRange.sourceLength', { count: dailyItems.length }) }}
        </p>
      </div>
    </div>

    <BaseEmpty
      v-else
      :description="unavailableDescription"
      :title="t('weather.longRange.unavailableTitle')"
    />
  </div>
</template>
