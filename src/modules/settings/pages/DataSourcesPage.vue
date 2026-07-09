<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { storeToRefs } from 'pinia'
import PageLayout from '@/components/base/PageLayout.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import SectionHeader from '@/components/base/SectionHeader.vue'
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

const heroFacts = computed(() => [
  {
    label: openMeteoSource.displayName,
    value: providerStatus('openMeteo'),
  },
  {
    label: caiyunSource.displayName,
    value: caiyunCredentialStatus.value,
  },
  {
    label: amapSource.displayName,
    value: amapCredentialStatus.value,
  },
  {
    label: t('settings.dataSources.hero.localStorage'),
    value: t('settings.dataSources.hero.localStorageValue'),
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
  <PageLayout variant="wide" gap="md">
    <div class="data-sources-workspace">
      <RouterLink
        class="control-focus data-sources-back"
        :to="{ name: 'settings' }"
      >
        {{ t('settings.dataSources.backToSettings') }}
      </RouterLink>

      <BaseSurface
        as="header"
        class="data-sources-hero"
        aria-labelledby="data-sources-title"
        padding="lg"
        variant="info"
      >
        <div class="data-sources-hero__copy">
          <p class="data-sources-hero__eyebrow">
            {{ t('settings.dataSources.hero.eyebrow') }}
          </p>
          <h1 id="data-sources-title" class="data-sources-hero__title">
            {{ t('settings.dataSources.pageTitle') }}
          </h1>
          <p class="data-sources-hero__description">
            {{ t('settings.dataSources.pageDescription') }}
          </p>
          <div class="data-sources-hero__actions">
            <RouterLink class="control-focus interactive-surface data-sources-button data-sources-button--primary" :to="{ name: 'settings' }">
              {{ t('settings.dataSources.backToSettings') }}
            </RouterLink>
            <RouterLink class="control-focus interactive-surface data-sources-button data-sources-button--secondary" :to="{ name: 'weather' }">
              {{ t('settings.dataSources.openWeather') }}
            </RouterLink>
          </div>
        </div>
        <dl class="data-sources-hero__facts" :aria-label="t('settings.dataSources.hero.factsLabel')">
          <div
            v-for="fact in heroFacts"
            :key="fact.label"
          >
            <dt>{{ fact.label }}</dt>
            <dd>{{ fact.value }}</dd>
          </div>
        </dl>
      </BaseSurface>

      <BaseSurface as="section" class="data-sources-note" aria-labelledby="data-sources-privacy-title" padding="md">
        <h2 id="data-sources-privacy-title">
          {{ t('settings.dataSources.privacyTitle') }}
        </h2>
        <p>
          {{ t('settings.dataSources.privacyDescription') }}
        </p>
      </BaseSurface>

      <BaseSurface as="section" class="data-sources-section" aria-labelledby="data-sources-active-title" padding="md">
        <SectionHeader
          :description="t('settings.dataSources.section.activeDescription')"
          :title="t('settings.dataSources.section.active')"
          title-id="data-sources-active-title"
        />

        <dl class="data-sources-summary">
          <div
            v-for="item in activeConfigurationItems"
            :key="item.label"
          >
            <dt>{{ item.label }}</dt>
            <dd>
              <RouterLink
                v-if="item.to"
                class="control-focus data-sources-inline-link"
                :to="item.to"
              >
                {{ item.value }}
              </RouterLink>
              <span v-else>{{ item.value }}</span>
            </dd>
          </div>
        </dl>
      </BaseSurface>

      <BaseSurface as="section" class="data-sources-section" aria-labelledby="data-sources-forecast-title" padding="md">
        <SectionHeader
          :description="t('settings.dataSources.section.forecastDescription')"
          :title="t('settings.dataSources.section.forecast')"
          title-id="data-sources-forecast-title"
        />

        <div class="data-sources-stack">
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
      </BaseSurface>

      <div class="data-sources-two-column">
        <BaseSurface as="section" class="data-sources-section" aria-labelledby="data-sources-air-quality-title" padding="md">
          <SectionHeader
            :description="t('settings.dataSources.section.airQualityDescription')"
            :title="t('settings.dataSources.section.airQuality')"
            title-id="data-sources-air-quality-title"
          />

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
        </BaseSurface>

        <BaseSurface as="section" class="data-sources-section" aria-labelledby="data-sources-location-title" padding="md">
          <SectionHeader
            :description="t('settings.dataSources.section.locationDescription')"
            :title="t('settings.dataSources.section.location')"
            title-id="data-sources-location-title"
          />

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
        </BaseSurface>
      </div>

      <BaseSurface as="section" class="data-sources-section" aria-labelledby="data-sources-alert-title" padding="md">
        <SectionHeader
          :description="t('settings.dataSources.section.alertsDescription')"
          :title="t('settings.dataSources.section.alerts')"
          title-id="data-sources-alert-title"
        />

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
      </BaseSurface>

      <BaseSurface
        as="section"
        class="data-sources-note"
        aria-labelledby="data-sources-licence-title"
        padding="md"
      >
        <h2 id="data-sources-licence-title">
          {{ t('settings.dataSources.section.licences') }}
        </h2>
        <p>
          {{ t('settings.dataSources.licenceDescription') }}
        </p>
      </BaseSurface>
    </div>
  </PageLayout>
</template>

<style scoped>
.data-sources-workspace {
  display: grid;
  gap: clamp(1rem, 2.5vw, 2rem);
}

.data-sources-back,
.data-sources-inline-link {
  width: fit-content;
  border-radius: var(--radius-sm);
  color: var(--color-accent-text);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
  text-decoration: underline;
  text-decoration-color: var(--color-border);
  text-underline-offset: 0.25rem;
}

.data-sources-back:hover,
.data-sources-inline-link:hover {
  text-decoration-color: var(--color-accent);
}

.data-sources-hero {
  display: grid;
  gap: clamp(1rem, 2vw, 1.5rem);
  background:
    linear-gradient(135deg, var(--color-surface-raised), var(--color-accent-wash)),
    var(--color-surface-raised);
}

.data-sources-hero__copy {
  max-width: 50rem;
  min-width: 0;
}

.data-sources-hero__eyebrow {
  margin: 0 0 var(--space-3);
  color: var(--color-accent-text);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.data-sources-hero__title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-page-title);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0;
  line-height: var(--line-height-tight);
}

.data-sources-hero__description,
.data-sources-section__header p,
.data-sources-note p {
  margin: var(--space-3) 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-small);
  line-height: 1.7;
}

.data-sources-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.data-sources-button {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-control-border);
  border-radius: var(--radius-sm);
  padding: 0 var(--space-4);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.data-sources-button--primary {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}

.data-sources-button--secondary {
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
}

.data-sources-button:hover {
  border-color: var(--color-border);
}

.data-sources-hero__facts,
.data-sources-summary {
  display: grid;
  gap: var(--space-2);
  margin: 0;
}

.data-sources-hero__facts {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid var(--color-border-soft);
  padding-top: var(--space-4);
}

.data-sources-hero__facts div {
  min-width: 0;
  border-radius: var(--radius-sm);
  background: color-mix(in oklch, var(--color-surface) 78%, transparent);
  padding: var(--space-2) var(--space-3);
}

.data-sources-summary div {
  min-width: 0;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: var(--space-3);
}

.data-sources-hero__facts dt,
.data-sources-summary dt {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-caption);
}

.data-sources-hero__facts dd,
.data-sources-summary dd {
  margin: var(--space-1) 0 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
  overflow-wrap: anywhere;
}

.data-sources-section {
  display: grid;
  gap: var(--space-4);
  min-width: 0;
}

.data-sources-note {
  display: grid;
  gap: var(--space-2);
  min-width: 0;
}

.data-sources-section__header {
  max-width: 50rem;
}

.data-sources-section__header h2,
.data-sources-note h2 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-section-title);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.data-sources-stack {
  display: grid;
  gap: var(--space-3);
}

.data-sources-two-column {
  display: grid;
  gap: clamp(1rem, 2vw, 1.5rem);
}

@media (min-width: 48rem) {
  .data-sources-hero__facts {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .data-sources-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 70rem) {
  .data-sources-hero {
    grid-template-columns: minmax(0, 1.1fr) minmax(24rem, 0.9fr);
    align-items: end;
  }

  .data-sources-two-column {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .data-sources-summary {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 40rem) {
  .data-sources-workspace {
    gap: var(--space-4);
  }

  .data-sources-hero {
    gap: var(--space-4);
    padding: var(--space-5);
  }

  .data-sources-hero__eyebrow {
    margin-bottom: var(--space-2);
  }

  .data-sources-hero__description {
    line-height: 1.55;
  }

  .data-sources-hero__actions {
    gap: var(--space-2);
    margin-top: var(--space-4);
  }
}
</style>
