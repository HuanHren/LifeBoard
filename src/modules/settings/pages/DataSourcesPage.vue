<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { storeToRefs } from 'pinia'
import PageHeader from '@/components/base/PageHeader.vue'
import PageLayout from '@/components/base/PageLayout.vue'
import type { TranslationKey } from '@/i18n/keys'
import { useI18n } from '@/i18n/useI18n'
import DataSourceRow from '@/modules/settings/components/DataSourceRow.vue'
import {
  getAirQualityApiSource,
  getAirQualityModelSource,
  getForecastSourceForProvider,
  WEATHER_SOURCE_METADATA,
} from '@/modules/weather/constants/weatherSources'
import { loadSettingsSnapshot } from '@/modules/settings/services/settingsBackup'
import type { SettingsDataSnapshot } from '@/modules/settings/types/settings'
import type { WeatherDataDomain } from '@/modules/weather/types/weatherSources'
import type {
  WeatherDataProvider,
  WeatherLocation,
} from '@/modules/weather/types/weather'
import { useWeatherStore } from '@/modules/weather/stores/weather'
import {
  formatFullLocalTime,
  formatLocationName,
} from '@/modules/weather/utils/weatherFormatting'

interface SummaryItem {
  label: string
  value: string
  to?: { name: string }
}

interface SourceDetail {
  label: string
  value: string
  to?: { name: string }
}

const { locale, t, formatNumber } = useI18n()
const weatherStore = useWeatherStore()
const {
  selectedLocation,
  weather,
  provider,
  hasCaiyunToken,
  hasAmapKey,
  airQuality,
  airQualityStatus,
} = storeToRefs(weatherStore)

const settingsSnapshot = shallowRef<SettingsDataSnapshot | null>(null)

const openMeteoSource = WEATHER_SOURCE_METADATA.openMeteo
const caiyunSource = WEATHER_SOURCE_METADATA.caiyun
const amapSource = WEATHER_SOURCE_METADATA.amap
const airQualityApiSource = getAirQualityApiSource()
const airQualityModelSource = getAirQualityModelSource()

const domainLabels = {
  forecast: 'settings.dataSources.domain.forecast',
  current: 'settings.dataSources.domain.current',
  'precipitation-nowcast': 'settings.dataSources.domain.precipitationNowcast',
  'air-quality': 'settings.dataSources.domain.airQuality',
  alerts: 'settings.dataSources.domain.alerts',
  'long-range': 'settings.dataSources.domain.longRange',
  'temperature-normal': 'settings.dataSources.domain.temperatureNormal',
  location: 'settings.dataSources.domain.location',
} as const satisfies Record<WeatherDataDomain, TranslationKey>

const preferredForecastSource = computed(() =>
  getForecastSourceForProvider(provider.value),
)
const loadedForecastSource = computed(() =>
  weather.value ? getForecastSourceForProvider(weather.value.provider) : null,
)
const selectedWeatherLocation = computed<WeatherLocation | null>(
  () => selectedLocation.value ?? settingsSnapshot.value?.weatherLocation ?? null,
)
const selectedLocationLabel = computed(() =>
  selectedWeatherLocation.value
    ? formatLocationName(selectedWeatherLocation.value)
    : t('settings.dataSources.status.notConfigured'),
)
const loadedProviderLabel = computed(() =>
  loadedForecastSource.value?.displayName ?? t('settings.dataSources.status.notChecked'),
)
const longRangeDayCount = computed(() => weather.value?.daily.length ?? 0)
const longRangeStatus = computed(() =>
  longRangeDayCount.value > 0
    ? t('settings.dataSources.status.currentResponseDays', {
        count: formatNumber(longRangeDayCount.value),
      })
    : t('settings.dataSources.status.notChecked'),
)
const caiyunCredentialStatus = computed(() =>
  hasCaiyunToken.value
    ? t('settings.dataSources.status.configured')
    : t('settings.dataSources.status.notConfigured'),
)
const amapCredentialStatus = computed(() =>
  hasAmapKey.value
    ? t('settings.dataSources.status.configured')
    : t('settings.dataSources.status.notConfigured'),
)
const alertCapabilityStatus = computed(() =>
  hasCaiyunToken.value
    ? t('settings.dataSources.status.notChecked')
    : t('settings.dataSources.status.caiyunNotConfigured'),
)
const airQualityState = computed(() => {
  if (airQualityStatus.value === 'success' && airQuality.value) {
    return t('settings.dataSources.status.currentlyLoaded')
  }

  if (airQualityStatus.value === 'error') {
    return t('settings.dataSources.status.dataUnavailable')
  }

  return t('settings.dataSources.status.notChecked')
})
const primaryAirQualityScale = computed(() => {
  if (!airQuality.value) return t('settings.dataSources.status.notChecked')

  if (airQuality.value.usAqi !== null) {
    return 'US AQI'
  }

  if (airQuality.value.europeanAqi !== null) {
    return 'European AQI'
  }

  return t('settings.dataSources.status.dataUnavailable')
})
const airQualityAvailability = computed(() => {
  if (!airQuality.value) return t('settings.dataSources.status.notChecked')

  const availableScales = [
    airQuality.value.usAqi !== null ? 'US AQI' : null,
    airQuality.value.europeanAqi !== null ? 'European AQI' : null,
  ].filter(Boolean)

  return availableScales.length > 0
    ? availableScales.join(', ')
    : t('settings.dataSources.status.dataUnavailable')
})
const airQualityObservedAt = computed(() =>
  airQuality.value
    ? t('settings.dataSources.status.observedAt', {
        time: formatFullLocalTime(airQuality.value.observedAt, locale.value),
        timezone: airQuality.value.timezone,
      })
    : t('settings.dataSources.status.notChecked'),
)

const activeConfigurationItems = computed<SummaryItem[]>(() => [
  {
    label: t('settings.dataSources.summary.preferredForecastProvider'),
    value: preferredForecastSource.value.displayName,
  },
  {
    label: t('settings.dataSources.summary.loadedForecastProvider'),
    value: loadedProviderLabel.value,
  },
  {
    label: t('settings.dataSources.summary.selectedLocation'),
    value: selectedLocationLabel.value,
  },
  {
    label: t('settings.dataSources.summary.caiyunConfiguration'),
    value: caiyunCredentialStatus.value,
  },
  {
    label: t('settings.dataSources.summary.amapConfiguration'),
    value: amapCredentialStatus.value,
  },
  {
    label: t('settings.dataSources.summary.airQualitySource'),
    value: `${airQualityApiSource.displayName} / ${airQualityModelSource.displayName}`,
  },
  {
    label: t('settings.dataSources.summary.alertCapability'),
    value: alertCapabilityStatus.value,
  },
  {
    label: t('settings.dataSources.summary.longRangeLength'),
    value: longRangeStatus.value,
    to: longRangeDayCount.value > 0 ? { name: 'weather-15-day' } : undefined,
  },
])

function providerStatus(sourceProvider: WeatherDataProvider) {
  if (weather.value?.provider === sourceProvider) {
    return weather.value.provider === provider.value
      ? t('settings.dataSources.status.currentlyLoaded')
      : t('settings.dataSources.status.fallbackActive')
  }

  if (provider.value === sourceProvider) {
    return t('settings.dataSources.status.active')
  }

  return t('settings.dataSources.status.available')
}

function domainList(domains: readonly WeatherDataDomain[]) {
  return domains.map((domain) => t(domainLabels[domain])).join(', ')
}

function externalLabel(providerName: string) {
  return t('settings.dataSources.externalLabel', {
    provider: providerName,
  })
}

function licenceLabel(licence: string) {
  return t('settings.dataSources.licenceLinkLabel', {
    licence,
  })
}

const openMeteoDetails = computed<SourceDetail[]>(() => [
  {
    label: t('settings.dataSources.detail.role'),
    value: t('settings.dataSources.openMeteo.role'),
  },
  {
    label: t('settings.dataSources.detail.domains'),
    value: domainList(openMeteoSource.domains),
  },
  {
    label: t('settings.dataSources.detail.forecastStatus'),
    value: providerStatus('openMeteo'),
  },
  {
    label: t('settings.dataSources.detail.longRange'),
    value:
      weather.value?.provider === 'openMeteo'
        ? longRangeStatus.value
        : t('settings.dataSources.status.notChecked'),
    to:
      weather.value?.provider === 'openMeteo' && longRangeDayCount.value > 0
        ? { name: 'weather-15-day' }
        : undefined,
  },
])

const caiyunDetails = computed<SourceDetail[]>(() => [
  {
    label: t('settings.dataSources.detail.role'),
    value: t('settings.dataSources.caiyun.role'),
  },
  {
    label: t('settings.dataSources.detail.domains'),
    value: domainList(caiyunSource.domains),
  },
  {
    label: t('settings.dataSources.detail.credential'),
    value: caiyunCredentialStatus.value,
  },
  {
    label: t('settings.dataSources.detail.forecastStatus'),
    value: providerStatus('caiyun'),
  },
  {
    label: t('settings.dataSources.detail.longRange'),
    value:
      weather.value?.provider === 'caiyun'
        ? longRangeStatus.value
        : t('settings.dataSources.status.notChecked'),
    to:
      weather.value?.provider === 'caiyun' && longRangeDayCount.value > 0
        ? { name: 'weather-15-day' }
        : undefined,
  },
])

const airQualityDetails = computed<SourceDetail[]>(() => [
  {
    label: t('settings.dataSources.detail.apiSurface'),
    value: airQualityApiSource.displayName,
  },
  {
    label: t('settings.dataSources.detail.underlyingModel'),
    value: airQualityModelSource.displayName,
  },
  {
    label: t('settings.dataSources.detail.status'),
    value: airQualityState.value,
  },
  {
    label: t('settings.dataSources.detail.currentScale'),
    value: primaryAirQualityScale.value,
  },
  {
    label: t('settings.dataSources.detail.availableScales'),
    value: airQualityAvailability.value,
  },
  {
    label: t('settings.dataSources.detail.observedAt'),
    value: airQualityObservedAt.value,
  },
])

const locationDetails = computed<SourceDetail[]>(() => [
  {
    label: t('settings.dataSources.detail.role'),
    value: t('settings.dataSources.amap.role'),
  },
  {
    label: t('settings.dataSources.detail.domains'),
    value: domainList(amapSource.domains),
  },
  {
    label: t('settings.dataSources.detail.credential'),
    value: amapCredentialStatus.value,
  },
  {
    label: t('settings.dataSources.detail.status'),
    value: hasAmapKey.value
      ? t('settings.dataSources.status.configured')
      : t('settings.dataSources.status.notConfigured'),
  },
])

const alertDetails = computed<SourceDetail[]>(() => [
  {
    label: t('settings.dataSources.detail.source'),
    value: caiyunSource.displayName,
  },
  {
    label: t('settings.dataSources.detail.credential'),
    value: caiyunCredentialStatus.value,
  },
  {
    label: t('settings.dataSources.detail.status'),
    value: alertCapabilityStatus.value,
  },
  {
    label: t('settings.dataSources.detail.note'),
    value: t('settings.dataSources.alert.note'),
  },
])

onMounted(() => {
  weatherStore.initializeProviderPreferences()
  weatherStore.initializeAmapPreferences()

  const snapshot = loadSettingsSnapshot()
  if (snapshot.ok) {
    settingsSnapshot.value = snapshot.data
  }
})
</script>

<template>
  <PageLayout>
    <RouterLink
      class="interactive-surface inline-flex rounded-[var(--radius-sm)] text-sm font-medium text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
      :to="{ name: 'settings' }"
    >
      {{ t('settings.dataSources.backToSettings') }}
    </RouterLink>

    <PageHeader
      :title="t('settings.dataSources.pageTitle')"
      :description="t('settings.dataSources.pageDescription')"
    />

    <section
      class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-accent-wash)] p-5 sm:p-6"
      aria-labelledby="data-sources-privacy-title"
    >
      <h2
        id="data-sources-privacy-title"
        class="text-section-title text-balance text-[var(--color-text-primary)]"
      >
        {{ t('settings.dataSources.privacyTitle') }}
      </h2>
      <p class="mt-2 max-w-3xl text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ t('settings.dataSources.privacyDescription') }}
      </p>
    </section>

    <section aria-labelledby="data-sources-active-title">
      <div class="max-w-3xl">
        <h2
          id="data-sources-active-title"
          class="text-section-title text-balance text-[var(--color-text-primary)]"
        >
          {{ t('settings.dataSources.section.active') }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{ t('settings.dataSources.section.activeDescription') }}
        </p>
      </div>

      <dl class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="item in activeConfigurationItems"
          :key="item.label"
          class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4"
        >
          <dt class="text-caption text-[var(--color-text-tertiary)]">
            {{ item.label }}
          </dt>
          <dd class="mt-1 text-sm font-medium leading-6 text-[var(--color-text-primary)]">
            <RouterLink
              v-if="item.to"
              class="interactive-surface rounded-[var(--radius-sm)] text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
              :to="item.to"
            >
              {{ item.value }}
            </RouterLink>
            <span v-else>{{ item.value }}</span>
          </dd>
        </div>
      </dl>
    </section>

    <section aria-labelledby="data-sources-forecast-title">
      <div class="max-w-3xl">
        <h2
          id="data-sources-forecast-title"
          class="text-section-title text-balance text-[var(--color-text-primary)]"
        >
          {{ t('settings.dataSources.section.forecast') }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{ t('settings.dataSources.section.forecastDescription') }}
        </p>
      </div>

      <div class="mt-4 space-y-3">
        <DataSourceRow
          :title="openMeteoSource.displayName"
          :description="t('settings.dataSources.openMeteo.description')"
          :status="providerStatus('openMeteo')"
          :details="openMeteoDetails"
          :official-link="{
            label: t('settings.dataSources.officialSource'),
            href: openMeteoSource.officialUrl,
            ariaLabel: externalLabel(openMeteoSource.displayName),
          }"
          :licence-link="openMeteoSource.licenceUrl && openMeteoSource.licenceLabel ? {
            label: openMeteoSource.licenceLabel,
            href: openMeteoSource.licenceUrl,
            ariaLabel: licenceLabel(openMeteoSource.licenceLabel),
          } : null"
          :secondary-link="longRangeDayCount > 0 && weather?.provider === 'openMeteo' ? {
            label: t('settings.dataSources.viewLongRange'),
            to: { name: 'weather-15-day' },
          } : null"
        />

        <DataSourceRow
          :title="caiyunSource.displayName"
          :description="t('settings.dataSources.caiyun.description')"
          :status="providerStatus('caiyun')"
          :details="caiyunDetails"
          :official-link="{
            label: t('settings.dataSources.officialSource'),
            href: caiyunSource.officialUrl,
            ariaLabel: externalLabel(caiyunSource.displayName),
          }"
          :configure-link="{
            label: t('settings.dataSources.configureService'),
            to: { name: 'settings' },
          }"
          :secondary-link="longRangeDayCount > 0 && weather?.provider === 'caiyun' ? {
            label: t('settings.dataSources.viewLongRange'),
            to: { name: 'weather-15-day' },
          } : null"
        />
      </div>
    </section>

    <section aria-labelledby="data-sources-air-quality-title">
      <div class="max-w-3xl">
        <h2
          id="data-sources-air-quality-title"
          class="text-section-title text-balance text-[var(--color-text-primary)]"
        >
          {{ t('settings.dataSources.section.airQuality') }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{ t('settings.dataSources.section.airQualityDescription') }}
        </p>
      </div>

      <div class="mt-4">
        <DataSourceRow
          :title="`${airQualityApiSource.displayName} / ${airQualityModelSource.displayName}`"
          :description="t('settings.dataSources.airQuality.description')"
          :status="airQualityState"
          :details="airQualityDetails"
          :official-link="{
            label: t('settings.dataSources.openMeteoAirQualitySource'),
            href: airQualityApiSource.officialUrl,
            ariaLabel: externalLabel(airQualityApiSource.displayName),
          }"
          :licence-link="airQualityApiSource.licenceUrl && airQualityApiSource.licenceLabel ? {
            label: airQualityApiSource.licenceLabel,
            href: airQualityApiSource.licenceUrl,
            ariaLabel: licenceLabel(airQualityApiSource.licenceLabel),
          } : null"
          :secondary-link="{
            label: t('settings.dataSources.camsOfficialSource'),
            to: undefined,
            href: airQualityModelSource.officialUrl,
            ariaLabel: externalLabel(airQualityModelSource.displayName),
          }"
        />
      </div>
    </section>

    <section aria-labelledby="data-sources-location-title">
      <div class="max-w-3xl">
        <h2
          id="data-sources-location-title"
          class="text-section-title text-balance text-[var(--color-text-primary)]"
        >
          {{ t('settings.dataSources.section.location') }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{ t('settings.dataSources.section.locationDescription') }}
        </p>
      </div>

      <div class="mt-4">
        <DataSourceRow
          :title="amapSource.displayName"
          :description="t('settings.dataSources.amap.description')"
          :status="amapCredentialStatus"
          :details="locationDetails"
          :official-link="{
            label: t('settings.dataSources.officialSource'),
            href: amapSource.officialUrl,
            ariaLabel: externalLabel(amapSource.displayName),
          }"
          :configure-link="{
            label: t('settings.dataSources.configureService'),
            to: { name: 'settings' },
          }"
        />
      </div>
    </section>

    <section aria-labelledby="data-sources-alert-title">
      <div class="max-w-3xl">
        <h2
          id="data-sources-alert-title"
          class="text-section-title text-balance text-[var(--color-text-primary)]"
        >
          {{ t('settings.dataSources.section.alerts') }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{ t('settings.dataSources.section.alertsDescription') }}
        </p>
      </div>

      <div class="mt-4">
        <DataSourceRow
          :title="t('settings.dataSources.alert.title')"
          :description="t('settings.dataSources.alert.description')"
          :status="alertCapabilityStatus"
          :details="alertDetails"
          :official-link="{
            label: t('settings.dataSources.officialSource'),
            href: caiyunSource.officialUrl,
            ariaLabel: externalLabel(caiyunSource.displayName),
          }"
          :configure-link="{
            label: t('settings.dataSources.configureService'),
            to: { name: 'settings' },
          }"
        />
      </div>
    </section>

    <section
      class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-5 sm:p-6"
      aria-labelledby="data-sources-licence-title"
    >
      <h2
        id="data-sources-licence-title"
        class="text-section-title text-balance text-[var(--color-text-primary)]"
      >
        {{ t('settings.dataSources.section.licences') }}
      </h2>
      <p class="mt-2 max-w-3xl text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ t('settings.dataSources.licenceDescription') }}
      </p>
    </section>
  </PageLayout>
</template>
