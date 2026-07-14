<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import PageLayout from '@/components/base/PageLayout.vue'
import { useI18n } from '@/i18n/useI18n'
import WeatherFavoritesBar from '@/modules/weather/components/WeatherFavoritesBar.vue'
import WeatherSearchForm from '@/modules/weather/components/WeatherSearchForm.vue'
import WeatherSearchResults from '@/modules/weather/components/WeatherSearchResults.vue'
import { MIN_SEARCH_LENGTH } from '@/modules/weather/constants/weather'
import { useWeatherStore } from '@/modules/weather/stores/weather'
import type { WeatherLocation } from '@/modules/weather/types/weather'
import type { WeatherFavoriteCity } from '@/modules/weather/types/weatherFavorites'
import { formatLocationName } from '@/modules/weather/utils/weatherFormatting'

type CurrentLocationStatus = 'idle' | 'loading'

const router = useRouter()
const weatherStore = useWeatherStore()
const { locale, t } = useI18n()
const {
  selectedLocation,
  searchQuery,
  searchResults,
  searchStatus,
  searchError,
  searchNotice,
  favoriteCities,
  favoriteMessage,
  hasSelectedFavorite,
} = storeToRefs(weatherStore)
const {
  initializeWeather,
  searchCities,
  selectLocation,
  selectFavoriteCity,
  addSelectedLocationToFavorites,
  removeFavoriteCity,
  clearFavoriteMessage,
  clearSearchResults,
  selectCurrentCoordinates,
  setLocale,
} = weatherStore

const currentLocationStatus = shallowRef<CurrentLocationStatus>('idle')
const pageMessage = shallowRef<string | null>(null)
const pageError = shallowRef<string | null>(null)
const titleElement = shallowRef<HTMLHeadingElement | null>(null)
const searchSection = useTemplateRef<HTMLElement>('searchSection')
const searchResultsComponent = useTemplateRef<{
  focusFirstResult: () => void
}>('searchResultsComponent')
const searchDebounceTimer = shallowRef<number | null>(null)

const selectedLocationLabel = computed(() =>
  selectedLocation.value ? formatLocationName(selectedLocation.value) : null,
)
const currentResolvedLocationLabel = computed(() => {
  if (selectedLocation.value?.source !== 'amap-geolocation') {
    return null
  }

  return formatLocationName(selectedLocation.value)
})

function isLocationSecureContext() {
  return (
    window.isSecureContext ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  )
}

function geolocationPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 300000,
      timeout: 10000,
    })
  })
}

function clearSearchDebounce() {
  if (searchDebounceTimer.value === null) {
    return
  }

  window.clearTimeout(searchDebounceTimer.value)
  searchDebounceTimer.value = null
}

function closeSearchResults() {
  clearSearchDebounce()
  clearSearchResults()
}

function handleSearchSubmit(query: string) {
  clearSearchDebounce()
  void searchCities(query, locale.value)
}

function handleSearchQueryChange(query: string) {
  clearSearchDebounce()
  const normalizedQuery = query.trim()

  if (normalizedQuery.length < MIN_SEARCH_LENGTH) {
    if (normalizedQuery.length === 0) {
      closeSearchResults()
    }
    return
  }

  searchDebounceTimer.value = window.setTimeout(() => {
    searchDebounceTimer.value = null
    void searchCities(normalizedQuery, locale.value)
  }, 350)
}

async function focusSearchResults() {
  await nextTick()
  searchResultsComponent.value?.focusFirstResult()
}

function handleDocumentPointerdown(event: PointerEvent) {
  const target = event.target

  if (target instanceof Node && searchSection.value?.contains(target)) {
    return
  }

  closeSearchResults()
}

async function returnToWeather() {
  await router.push({ name: 'weather', hash: '#weather-hero-title' })
}

async function useCurrentLocationWeather() {
  pageMessage.value = null
  pageError.value = null

  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    pageError.value = t('weather.cities.currentLocationUnsupported')
    return
  }

  if (!isLocationSecureContext()) {
    pageError.value = t('weather.cities.currentLocationSecureContext')
    return
  }

  if (typeof navigator.geolocation?.getCurrentPosition !== 'function') {
    pageError.value = t('weather.cities.currentLocationUnsupported')
    return
  }

  currentLocationStatus.value = 'loading'

  try {
    const position = await geolocationPosition()
    const selected = await selectCurrentCoordinates({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      locale: locale.value,
      fallbackName: t('home.weather.currentLocationLabel'),
    })

    if (!selected) {
      pageError.value = t('weather.cities.selectionFailed')
      return
    }

    await returnToWeather()
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 1
    ) {
      pageError.value = t('weather.cities.currentLocationDenied')
    } else {
      pageError.value = t('weather.cities.currentLocationUnavailable')
    }
  } finally {
    currentLocationStatus.value = 'idle'
  }
}

async function handleSelectLocation(location: WeatherLocation) {
  pageMessage.value = null
  pageError.value = null
  const selected = await selectLocation(location)

  if (!selected) {
    pageError.value = t('weather.cities.selectionFailed')
    return
  }

  await returnToWeather()
}

async function handleSelectFavorite(favorite: WeatherFavoriteCity) {
  pageMessage.value = null
  pageError.value = null
  const selected = await selectFavoriteCity(favorite)

  if (!selected) {
    pageError.value = t('weather.cities.selectionFailed')
    return
  }

  await returnToWeather()
}

function handleSaveSelected() {
  const saved = addSelectedLocationToFavorites()

  if (!saved) {
    pageMessage.value = t('weather.cities.alreadySaved')
    return
  }

  pageMessage.value = t('weather.cities.savedSelected')
}

onMounted(() => {
  void initializeWeather()
  void nextTick(() => {
    titleElement.value?.focus()
  })
  document.addEventListener('pointerdown', handleDocumentPointerdown)
})

onBeforeUnmount(() => {
  clearSearchDebounce()
  document.removeEventListener('pointerdown', handleDocumentPointerdown)
})

watch(locale, setLocale, { immediate: true })
</script>

<template>
  <PageLayout variant="wide" gap="md">
    <header class="max-w-4xl space-y-3">
      <RouterLink
        class="interactive-surface inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-accent-wash)]"
        :to="{ name: 'weather' }"
      >
        <span aria-hidden="true" class="mr-2">&larr;</span>
        {{ t('weather.cities.backToWeather') }}
      </RouterLink>
      <h1
        id="weather-cities-title"
        ref="titleElement"
        class="text-page-title text-[var(--color-text-primary)]"
        tabindex="-1"
      >
        {{ t('weather.cities.title') }}
      </h1>
      <p class="max-w-2xl text-base leading-7 text-[var(--color-text-secondary)]">
        {{ t('weather.cities.description') }}
      </p>
    </header>

    <p
      v-if="pageMessage"
      class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]"
      role="status"
    >
      {{ pageMessage }}
    </p>
    <p
      v-if="pageError"
      class="rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm font-medium leading-6 text-[var(--color-danger)]"
      role="alert"
    >
      {{ pageError }}
    </p>

    <section
      class="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
    >
      <article
        class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4 sm:p-5"
        aria-labelledby="weather-current-location-title"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              id="weather-current-location-title"
              class="text-base font-semibold text-[var(--color-text-primary)]"
            >
              {{ t('weather.cities.currentLocationTitle') }}
            </h2>
            <p class="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
              {{ t('weather.cities.currentLocationDescription') }}
            </p>
          </div>
          <BaseButton
            :aria-busy="currentLocationStatus === 'loading'"
            :disabled="currentLocationStatus === 'loading'"
            size="sm"
            variant="primary"
            @click="useCurrentLocationWeather"
          >
            {{
              currentLocationStatus === 'loading'
                ? t('weather.cities.currentLocationLoading')
                : t('weather.cities.useCurrentLocation')
            }}
          </BaseButton>
        </div>
        <p
          v-if="currentResolvedLocationLabel"
          class="mt-4 rounded-[var(--radius-md)] bg-[var(--color-surface-inset)] px-3 py-2 text-sm leading-6 text-[var(--color-text-secondary)]"
        >
          {{ t('weather.cities.currentResolved', { city: currentResolvedLocationLabel }) }}
        </p>
      </article>

      <article
        class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4 sm:p-5"
        aria-labelledby="weather-selected-city-title"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              id="weather-selected-city-title"
              class="text-base font-semibold text-[var(--color-text-primary)]"
            >
              {{ t('weather.cities.selectedCityTitle') }}
            </h2>
            <p class="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
              {{ t('weather.cities.selectedCityDescription') }}
            </p>
          </div>
          <BaseButton
            v-if="selectedLocation"
            :disabled="hasSelectedFavorite"
            size="sm"
            variant="secondary"
            @click="handleSaveSelected"
          >
            {{
              hasSelectedFavorite
                ? t('weather.cities.alreadySaved')
                : t('weather.cities.saveSelected')
            }}
          </BaseButton>
        </div>

        <div
          v-if="selectedLocationLabel"
          class="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-3 py-3"
          aria-current="location"
        >
          <p class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ selectedLocation?.name }}
          </p>
          <p class="mt-1 text-caption text-[var(--color-text-secondary)]">
            {{ selectedLocationLabel }}
          </p>
          <p class="mt-2 text-caption font-medium text-[var(--color-accent-text)]">
            {{ t('weather.cities.selectedStatus') }}
          </p>
        </div>

        <BaseEmpty
          v-else
          class="mt-4"
          :description="t('weather.cities.noSelectedDescription')"
          :title="t('weather.cities.noSelectedTitle')"
        />
      </article>
    </section>

    <section
      ref="searchSection"
      aria-labelledby="weather-city-search-section-title"
    >
      <div class="mb-3 max-w-2xl">
        <h2
          id="weather-city-search-section-title"
          class="text-section-title text-[var(--color-text-primary)]"
        >
          {{ t('weather.cities.searchTitle') }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          {{ t('weather.cities.searchDescription') }}
        </p>
      </div>
      <div class="space-y-4">
        <WeatherSearchForm
          :notice="searchNotice"
          :service-error="searchError"
          :status="searchStatus"
          @close-results="closeSearchResults"
          @focus-results="focusSearchResults"
          @query-change="handleSearchQueryChange"
          @search="handleSearchSubmit"
        />

        <WeatherSearchResults
          v-if="searchStatus === 'success'"
          ref="searchResultsComponent"
          :query="searchQuery"
          :results="searchResults"
          @close="closeSearchResults"
          @select="handleSelectLocation"
        />
      </div>
    </section>

    <WeatherFavoritesBar
      :favorite-cities="favoriteCities"
      :has-selected-favorite="hasSelectedFavorite"
      :message="favoriteMessage"
      :selected-location="selectedLocation"
      @add-selected="handleSaveSelected"
      @clear-message="clearFavoriteMessage"
      @remove="removeFavoriteCity"
      @select="handleSelectFavorite"
    />
  </PageLayout>
</template>
