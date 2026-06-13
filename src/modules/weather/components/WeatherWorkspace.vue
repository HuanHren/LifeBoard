<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import BaseError from '@/components/base/BaseError.vue'
import CurrentWeatherSummary from '@/modules/weather/components/CurrentWeatherSummary.vue'
import DailyForecastStrip from '@/modules/weather/components/DailyForecastStrip.vue'
import HourlyForecastStrip from '@/modules/weather/components/HourlyForecastStrip.vue'
import WeatherAdvicePanel from '@/modules/weather/components/WeatherAdvicePanel.vue'
import WeatherAttribution from '@/modules/weather/components/WeatherAttribution.vue'
import WeatherLoadingState from '@/modules/weather/components/WeatherLoadingState.vue'
import WeatherSearchForm from '@/modules/weather/components/WeatherSearchForm.vue'
import WeatherSearchResults from '@/modules/weather/components/WeatherSearchResults.vue'
import type { WeatherLocation } from '@/modules/weather/types/weather'
import { useWeatherStore } from '@/modules/weather/stores/weather'

const weatherStore = useWeatherStore()
const {
  selectedLocation,
  searchQuery,
  searchResults,
  weather,
  searchStatus,
  forecastStatus,
  searchError,
  forecastError,
} = storeToRefs(weatherStore)
const { initializeWeather, searchCities, selectLocation, loadForecast } = weatherStore

function handleSelectLocation(location: WeatherLocation) {
  void selectLocation(location)
}

function focusCitySearch() {
  document.getElementById('weather-city-search')?.focus()
}

onMounted(() => {
  void initializeWeather()
})
</script>

<template>
  <div class="space-y-8">
    <WeatherSearchForm
      :compact="Boolean(weather)"
      :service-error="searchError"
      :status="searchStatus"
      @search="searchCities"
    />

    <WeatherSearchResults
      v-if="searchStatus === 'success'"
      :query="searchQuery"
      :results="searchResults"
      @select="handleSelectLocation"
    />

    <section
      v-if="!selectedLocation && forecastStatus === 'idle' && searchStatus !== 'success'"
      aria-labelledby="weather-setup-title"
    >
      <h2 id="weather-setup-title" class="sr-only">Weather setup</h2>
      <BaseEmpty
        action-label="Focus city search"
        description="Choose a city to load real conditions, practical guidance, and forecast details."
        title="Start with your city"
        @action="focusCitySearch"
      />
    </section>

    <section v-else-if="forecastStatus === 'loading'" aria-labelledby="weather-loading-title">
      <h2 id="weather-loading-title" class="sr-only">Loading weather</h2>
      <WeatherLoadingState />
    </section>

    <section v-else-if="forecastStatus === 'error'" aria-labelledby="weather-error-title">
      <h2 id="weather-error-title" class="sr-only">Weather loading error</h2>
      <BaseError
        action-label="Retry forecast"
        :message="forecastError ?? 'The forecast could not be loaded.'"
        title="Weather unavailable"
        @action="loadForecast()"
      />
    </section>

    <div v-else-if="weather" class="space-y-10">
      <p class="sr-only" role="status">
        Weather loaded for {{ weather.location.name }}.
      </p>
      <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <CurrentWeatherSummary
          :current="weather.current"
          :location="weather.location"
          :timezone-abbreviation="weather.timezoneAbbreviation"
          :units="weather.units"
        />
        <WeatherAdvicePanel :advice="weather.advice" />
      </div>

      <HourlyForecastStrip :items="weather.hourly" :units="weather.units" />
      <DailyForecastStrip :items="weather.daily" :units="weather.units" />
      <WeatherAttribution />
    </div>
  </div>
</template>
