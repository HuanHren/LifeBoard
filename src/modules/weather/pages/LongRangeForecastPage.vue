<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import BaseError from '@/components/base/BaseError.vue'
import { useI18n } from '@/i18n/useI18n'
import LongRangeForecastStrip from '@/modules/weather/components/LongRangeForecastStrip.vue'
import WeatherAttribution from '@/modules/weather/components/WeatherAttribution.vue'
import { DAILY_FORECAST_LENGTH } from '@/modules/weather/constants/weather'
import { fetchOpenMeteoForecast } from '@/modules/weather/services/openMeteoService'
import { useWeatherStore } from '@/modules/weather/stores/weather'
import type {
  WeatherLocation,
  WeatherRequestStatus,
  WeatherSnapshot,
} from '@/modules/weather/types/weather'
import { createAirQualityLocationId } from '@/modules/weather/utils/airQualityNormalizer'
import { formatLocationName } from '@/modules/weather/utils/weatherFormatting'
import { localizeWeatherError } from '@/modules/weather/utils/weatherI18n'
import { normalizeWeatherForecast } from '@/modules/weather/utils/weatherNormalizer'

const weatherStore = useWeatherStore()
const { t } = useI18n()
const {
  selectedLocation,
  weather,
} = storeToRefs(weatherStore)
const {
  initializeWeather,
} = weatherStore
const headingRef = ref<HTMLHeadingElement | null>(null)
const longRangeWeather = ref<WeatherSnapshot | null>(null)
const longRangeStatus = ref<WeatherRequestStatus>('idle')
const longRangeError = ref<string | null>(null)
const canAutoReloadLongRange = ref(false)
let longRangeController: AbortController | null = null
let longRangeRequestId = 0

const dailyItems = computed(() =>
  longRangeWeather.value?.daily.slice(0, DAILY_FORECAST_LENGTH) ?? [],
)
const hasDailyForecast = computed(() => dailyItems.value.length > 0)
const forecastSnapshot = computed(() =>
  longRangeWeather.value && hasDailyForecast.value ? longRangeWeather.value : null,
)
const sourceLocation = computed<WeatherLocation | null>(
  () => weather.value?.location ?? selectedLocation.value,
)
const activeLocationName = computed(() =>
  longRangeWeather.value
    ? formatLocationName(longRangeWeather.value.location)
    : sourceLocation.value
      ? formatLocationName(sourceLocation.value)
      : '',
)
const sourceLocationId = computed(() =>
  sourceLocation.value ? createAirQualityLocationId(sourceLocation.value) : null,
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
  if (!sourceLocation.value) {
    return t('weather.longRange.noLocationDescription')
  }

  return t('weather.longRange.unavailableDescription')
})

async function loadOpenMeteoLongRange(location = sourceLocation.value) {
  if (!location) {
    longRangeWeather.value = null
    longRangeStatus.value = 'idle'
    longRangeError.value = null
    return false
  }

  const requestLocationId = createAirQualityLocationId(location)

  if (
    weather.value?.provider === 'openMeteo' &&
    createAirQualityLocationId(weather.value.location) === requestLocationId &&
    weather.value.daily.length > 0
  ) {
    longRangeController?.abort()
    longRangeWeather.value = weather.value
    longRangeStatus.value = 'success'
    longRangeError.value = null
    return true
  }

  const requestId = ++longRangeRequestId
  longRangeController?.abort()
  longRangeController = new AbortController()
  longRangeStatus.value = 'loading'
  longRangeError.value = null

  try {
    const response = await fetchOpenMeteoForecast(location, longRangeController.signal)
    const snapshot = normalizeWeatherForecast(response, location)

    if (
      requestId !== longRangeRequestId ||
      sourceLocationId.value !== requestLocationId
    ) {
      return false
    }

    longRangeWeather.value = snapshot
    longRangeStatus.value = 'success'
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return false
    }

    if (
      requestId !== longRangeRequestId ||
      sourceLocationId.value !== requestLocationId
    ) {
      return false
    }

    longRangeError.value =
      error instanceof Error
        ? error.message
        : 'The forecast could not be loaded. Please try again.'
    longRangeStatus.value = 'error'
    return false
  }
}

watch(sourceLocationId, () => {
  if (canAutoReloadLongRange.value) {
    void loadOpenMeteoLongRange()
  }
})

onMounted(async () => {
  await initializeWeather()
  await loadOpenMeteoLongRange()
  canAutoReloadLongRange.value = true
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
      v-if="longRangeStatus === 'loading' && !forecastSnapshot"
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
      v-else-if="longRangeStatus === 'error'"
      :action-label="t('weather.longRange.retry')"
      :message="
        localizeWeatherError(longRangeError, t) ??
        t('weather.longRange.unavailableDescription')
      "
      :title="t('weather.longRange.unavailableTitle')"
      @action="loadOpenMeteoLongRange()"
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
        <WeatherAttribution provider="openMeteo" />
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
