<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import BaseError from '@/components/base/BaseError.vue'
import { useI18n } from '@/i18n/useI18n'
import AirQualityPanel from '@/modules/weather/components/AirQualityPanel.vue'
import DailyForecastStrip from '@/modules/weather/components/DailyForecastStrip.vue'
import HourlyForecastStrip from '@/modules/weather/components/HourlyForecastStrip.vue'
import PrecipitationTimeline from '@/modules/weather/components/PrecipitationTimeline.vue'
import ShortTermPrecipitationPanel from '@/modules/weather/components/ShortTermPrecipitationPanel.vue'
import WeatherAdvicePanel from '@/modules/weather/components/WeatherAdvicePanel.vue'
import WeatherAlertSection from '@/modules/weather/components/WeatherAlertSection.vue'
import WeatherAttribution from '@/modules/weather/components/WeatherAttribution.vue'
import WeatherDetailsGrid from '@/modules/weather/components/WeatherDetailsGrid.vue'
import WeatherHero from '@/modules/weather/components/WeatherHero.vue'
import WeatherLoadingState from '@/modules/weather/components/WeatherLoadingState.vue'
import WeatherProviderNotice from '@/modules/weather/components/WeatherProviderNotice.vue'
import { COMPACT_DAILY_FORECAST_LENGTH } from '@/modules/weather/constants/weather'
import { useWeatherStore } from '@/modules/weather/stores/weather'
import {
  formatFullLocalTime,
  formatLocationName,
} from '@/modules/weather/utils/weatherFormatting'
import { resolveWeatherAlertStatus } from '@/modules/weather/utils/weatherAlerts'
import { localizeWeatherError } from '@/modules/weather/utils/weatherI18n'

const weatherStore = useWeatherStore()
const router = useRouter()
const { locale, t } = useI18n()
const {
  selectedLocation,
  weather,
  forecastStatus,
  forecastError,
  displayAirQuality,
  displayAirQualityStatus,
  displayAirQualityError,
  provider,
  hasCaiyunToken,
  forecastCacheState,
  forecastCacheUpdatedAt,
} = storeToRefs(weatherStore)
const {
  initializeWeather,
  loadForecast,
  retryAirQuality,
} = weatherStore
const compactDailyForecast = computed(() =>
  weather.value?.daily.slice(0, COMPACT_DAILY_FORECAST_LENGTH) ?? [],
)
const activeLocationLabel = computed(() => {
  const location = weather.value?.location ?? selectedLocation.value

  return location ? formatLocationName(location) : t('weather.page.noCity')
})
const showPreviousForecastError = computed(
  () => Boolean(weather.value) && forecastStatus.value === 'error' && Boolean(forecastError.value),
)
const weatherAlertStatus = computed(() => resolveWeatherAlertStatus(weather.value))
const cacheStatusMessage = computed(() => {
  if (!weather.value) return null

  const time = forecastCacheUpdatedAt.value
    ? formatFullLocalTime(forecastCacheUpdatedAt.value, locale.value)
    : ''

  if (forecastCacheState.value === 'refreshing') {
    return t('weather.cache.refreshing', { time })
  }

  if (forecastCacheState.value === 'stale') {
    return t('weather.cache.stale', { time })
  }

  if (forecastCacheState.value === 'offline-stale') {
    return t('weather.cache.offlineStale', { time })
  }

  return null
})

function openCityManagement() {
  void router.push({ name: 'weather-cities' })
}

onMounted(() => {
  void initializeWeather()
})
</script>

<template>
  <div class="flex flex-col gap-6 pb-[var(--mobile-nav-clearance)] lg:pb-0">
    <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-3xl space-y-3">
        <p class="text-sm font-medium text-[var(--color-text-secondary)]">
          {{ t('weather.page.cityContext', { city: activeLocationLabel }) }}
        </p>
        <h1 class="text-page-title text-balance text-[var(--color-text-primary)]">
          {{ t('weather.page.title') }}
        </h1>
        <p class="max-w-2xl text-base leading-7 text-pretty text-[var(--color-text-secondary)]">
          {{ t('weather.page.description') }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <RouterLink
          class="control-focus interactive-surface inline-flex min-h-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] px-3 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-interactive)]"
          :to="{ name: 'weather-15-day' }"
        >
          {{ t('weather.longRange.viewAction') }}
        </RouterLink>
        <RouterLink
          class="control-focus interactive-surface inline-flex min-h-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-primary)] bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-foreground)] transition hover:bg-[var(--color-accent-hover)]"
          :to="{ name: 'weather-cities' }"
        >
          {{ t('weather.hero.manageCities') }}
        </RouterLink>
      </div>
    </header>

    <div v-if="!weather" class="order-1">
      <WeatherProviderNotice
        :has-caiyun-token="hasCaiyunToken"
        :provider="provider"
      />
    </div>

    <section
      v-if="!weather && !selectedLocation && forecastStatus === 'idle'"
      :class="weather ? 'order-2' : 'order-3'"
      aria-labelledby="weather-setup-title"
    >
      <h2 id="weather-setup-title" class="sr-only">
        {{ t('weather.state.setupTitle') }}
      </h2>
      <BaseEmpty
        :action-label="t('weather.state.setupAction')"
        :description="t('weather.state.setupDescription')"
        :title="t('weather.state.setupHeading')"
        @action="openCityManagement"
      />
    </section>

    <section
      v-else-if="!weather && selectedLocation && provider === 'caiyun' && !hasCaiyunToken && forecastStatus === 'idle'"
      :class="weather ? 'order-2' : 'order-3'"
      aria-labelledby="weather-provider-setup-title"
    >
      <h2 id="weather-provider-setup-title" class="sr-only">
        {{ t('weather.state.providerSetupTitle') }}
      </h2>
      <BaseEmpty
        :description="t('weather.state.caiyunTokenMissingDescription')"
        :title="t('weather.state.caiyunTokenMissingHeading')"
      />
    </section>

    <section
      v-else-if="!weather && forecastStatus === 'loading'"
      :class="weather ? 'order-2' : 'order-3'"
      aria-labelledby="weather-loading-title"
    >
      <h2 id="weather-loading-title" class="sr-only">
        {{ t('weather.state.loadingTitle') }}
      </h2>
      <WeatherLoadingState />
    </section>

    <section
      v-else-if="!weather && forecastStatus === 'error'"
      :class="weather ? 'order-2' : 'order-3'"
      aria-labelledby="weather-error-title"
    >
      <h2 id="weather-error-title" class="sr-only">
        {{ t('weather.state.errorTitle') }}
      </h2>
      <BaseError
        :action-label="t('weather.state.retry')"
        :message="
          localizeWeatherError(forecastError, t) ??
          t('weather.state.errorFallback')
        "
        :title="t('weather.state.errorHeading')"
        @action="loadForecast()"
      />
    </section>

    <div v-else-if="weather" class="order-1 space-y-6">
      <p class="sr-only" role="status">
        {{ t('weather.state.loaded', { city: weather.location.name }) }}
      </p>

      <WeatherHero
        :air-quality="displayAirQuality"
        :weather="weather"
      />
      <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <WeatherAdvicePanel :advice="weather.advice" />
        <div class="space-y-3">
          <p
            v-if="cacheStatusMessage"
            class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]"
            role="status"
          >
            {{ cacheStatusMessage }}
          </p>
          <p
            v-if="showPreviousForecastError"
            class="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]"
            role="status"
          >
            {{ t('weather.state.updateFailed') }}
            {{ localizeWeatherError(forecastError, t) ?? t('weather.state.errorFallback') }}
          </p>
        </div>
      </div>
      <WeatherAlertSection
        :alerts="weather.alerts"
        :status="weatherAlertStatus"
      />
    </div>

    <div v-if="weather" class="order-4 space-y-8">
      <HourlyForecastStrip :items="weather.hourly" :units="weather.units" />

      <DailyForecastStrip
        v-if="compactDailyForecast.length > 0"
        :description="
          weather.provider === 'caiyun'
            ? t('weather.daily.caiyunDescription')
            : undefined
        "
        :items="compactDailyForecast"
        :scroll-label="
          weather.provider === 'caiyun'
            ? t('weather.daily.caiyunScrollLabel')
            : undefined
        "
        :title="
          weather.provider === 'caiyun'
            ? t('weather.daily.caiyunTitle')
            : undefined
        "
        :units="weather.units"
      />
      <p
        v-else
        class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]"
      >
        {{ t('weather.daily.caiyunUnavailable') }}
      </p>

      <div class="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
        <WeatherDetailsGrid :weather="weather" />
        <AirQualityPanel
          :air-quality="displayAirQuality"
          :error="displayAirQualityError"
          :status="displayAirQualityStatus"
          @retry="retryAirQuality"
        />
      </div>

      <div class="grid min-w-0 items-start gap-4 xl:grid-cols-2">
        <ShortTermPrecipitationPanel
          :provider="weather.provider"
          :short-term="weather.shortTermPrecipitation"
          :units="weather.units"
        />
        <PrecipitationTimeline :items="weather.hourly" :units="weather.units" />
      </div>

      <div class="space-y-3">
        <WeatherProviderNotice
          :has-caiyun-token="hasCaiyunToken"
          :provider="weather.provider"
        />
        <WeatherAttribution :provider="weather.provider" />
      </div>
    </div>
  </div>
</template>
