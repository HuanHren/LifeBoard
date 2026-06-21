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
import { localizeWeatherError } from '@/modules/weather/utils/weatherI18n'

const weatherStore = useWeatherStore()
const router = useRouter()
const { t } = useI18n()
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
} = storeToRefs(weatherStore)
const {
  initializeWeather,
  loadForecast,
  retryAirQuality,
} = weatherStore
const compactDailyForecast = computed(() =>
  weather.value?.provider === 'caiyun'
    ? weather.value.daily.slice(0, Math.min(3, COMPACT_DAILY_FORECAST_LENGTH))
    : [],
)
const showPreviousForecastError = computed(
  () => Boolean(weather.value) && forecastStatus.value === 'error' && Boolean(forecastError.value),
)

function openCityManagement() {
  void router.push({ name: 'weather-cities' })
}

onMounted(() => {
  void initializeWeather()
})
</script>

<template>
  <div class="flex flex-col gap-6 pb-[var(--mobile-nav-clearance)] lg:pb-0">
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

    <div v-else-if="weather" class="order-1 space-y-10">
      <p class="sr-only" role="status">
        {{ t('weather.state.loaded', { city: weather.location.name }) }}
      </p>

      <div class="space-y-4">
        <WeatherHero
          :air-quality="displayAirQuality"
          :weather="weather"
        />
        <WeatherAlertSection :alerts="weather.alerts" />
        <DailyForecastStrip
          v-if="compactDailyForecast.length > 0"
          :description="t('weather.daily.caiyunDescription')"
          :items="compactDailyForecast"
          :scroll-label="t('weather.daily.caiyunScrollLabel')"
          :title="t('weather.daily.caiyunTitle')"
          :units="weather.units"
        />
        <p
          v-else
          class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]"
        >
          {{ t('weather.daily.caiyunUnavailable') }}
        </p>
        <p
          v-if="showPreviousForecastError"
          class="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]"
          role="status"
        >
          {{ t('weather.state.updateFailed') }}
          {{ localizeWeatherError(forecastError, t) ?? t('weather.state.errorFallback') }}
        </p>
        <WeatherProviderNotice
          :has-caiyun-token="hasCaiyunToken"
          :provider="weather.provider"
        />
      </div>
    </div>

    <div v-if="weather" class="order-4 space-y-10">
      <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <WeatherAdvicePanel :advice="weather.advice" />
        <WeatherDetailsGrid :weather="weather" />
      </div>

      <AirQualityPanel
        :air-quality="displayAirQuality"
        :error="displayAirQualityError"
        :status="displayAirQualityStatus"
        @retry="retryAirQuality"
      />

      <ShortTermPrecipitationPanel
        :provider="weather.provider"
        :short-term="weather.shortTermPrecipitation"
        :units="weather.units"
      />
      <PrecipitationTimeline :items="weather.hourly" :units="weather.units" />
      <HourlyForecastStrip :items="weather.hourly" :units="weather.units" />
      <RouterLink
        v-if="weather.daily.length > 0"
        class="inline-flex w-fit items-center rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2 text-sm font-medium text-[var(--color-accent-text)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-wash)] focus-visible:outline focus-visible:outline-[var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--color-focus)]"
        :to="{ name: 'weather-15-day' }"
      >
        {{ t('weather.longRange.viewAction') }}
      </RouterLink>
      <WeatherAttribution :provider="weather.provider" />
    </div>
  </div>
</template>
