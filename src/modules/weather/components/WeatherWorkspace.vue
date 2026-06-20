<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
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
import WeatherAttribution from '@/modules/weather/components/WeatherAttribution.vue'
import WeatherDetailsGrid from '@/modules/weather/components/WeatherDetailsGrid.vue'
import WeatherHero from '@/modules/weather/components/WeatherHero.vue'
import WeatherLoadingState from '@/modules/weather/components/WeatherLoadingState.vue'
import WeatherProviderNotice from '@/modules/weather/components/WeatherProviderNotice.vue'
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
  airQuality,
  airQualityStatus,
  airQualityError,
  provider,
  hasCaiyunToken,
} = storeToRefs(weatherStore)
const {
  initializeWeather,
  loadForecast,
  retryAirQuality,
} = weatherStore
const hasShownWeatherHero = ref(false)
const heroMotionMode = computed(() =>
  hasShownWeatherHero.value ? 'snapshot' : 'initial',
)

function openCityManagement() {
  void router.push({ name: 'weather-cities' })
}

watch(weather, async (nextWeather) => {
  if (nextWeather && !hasShownWeatherHero.value) {
    await nextTick()
    window.setTimeout(() => {
      hasShownWeatherHero.value = true
    }, 420)
  }
})

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
      v-if="!selectedLocation && forecastStatus === 'idle'"
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
      v-else-if="selectedLocation && provider === 'caiyun' && !hasCaiyunToken && forecastStatus === 'idle'"
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
      v-else-if="forecastStatus === 'loading'"
      :class="weather ? 'order-2' : 'order-3'"
      aria-labelledby="weather-loading-title"
    >
      <h2 id="weather-loading-title" class="sr-only">
        {{ t('weather.state.loadingTitle') }}
      </h2>
      <WeatherLoadingState />
    </section>

    <section
      v-else-if="forecastStatus === 'error'"
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
          :air-quality="airQuality"
          :motion-mode="heroMotionMode"
          :weather="weather"
        />
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
        :air-quality="airQuality"
        :error="airQualityError"
        :status="airQualityStatus"
        @retry="retryAirQuality"
      />

      <ShortTermPrecipitationPanel
        :provider="weather.provider"
        :short-term="weather.shortTermPrecipitation"
        :units="weather.units"
      />
      <PrecipitationTimeline :items="weather.hourly" :units="weather.units" />
      <HourlyForecastStrip :items="weather.hourly" :units="weather.units" />
      <DailyForecastStrip :items="weather.daily" :units="weather.units" />
      <WeatherAttribution :provider="weather.provider" />
    </div>
  </div>
</template>
