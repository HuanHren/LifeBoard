<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { storeToRefs } from 'pinia'
import BaseSection from '@/components/base/BaseSection.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import type { TranslationKey } from '@/i18n/keys'
import { useI18n } from '@/i18n/useI18n'
import BackupImportSummary from '@/modules/settings/components/BackupImportSummary.vue'
import BackupPanel from '@/modules/settings/components/BackupPanel.vue'
import ClearOperationSummary from '@/modules/settings/components/ClearOperationSummary.vue'
import DataClearPanel from '@/modules/settings/components/DataClearPanel.vue'
import LocalDataStatus from '@/modules/settings/components/LocalDataStatus.vue'
import LanguageControl from '@/modules/settings/components/LanguageControl.vue'
import PortableExportsPanel from '@/modules/settings/components/PortableExportsPanel.vue'
import PrivacyPanel from '@/modules/settings/components/PrivacyPanel.vue'
import SettingsConfirmationDialog from '@/modules/settings/components/SettingsConfirmationDialog.vue'
import ThemeModeControl from '@/modules/settings/components/ThemeModeControl.vue'
import TranslationExportPanel from '@/modules/settings/components/TranslationExportPanel.vue'
import WeatherProviderPreferences from '@/modules/settings/components/WeatherProviderPreferences.vue'
import WeatherLocationServices from '@/modules/settings/components/WeatherLocationServices.vue'
import {
  createPortableExport,
  downloadPortableExport,
} from '@/modules/settings/services/settingsPortableExports'
import type { PortableExportKind } from '@/modules/settings/types/settingsExports'
import {
  applyLifeBoardBackup,
  clearLifeBoardData,
  clearLifeBoardOperation,
  createLifeBoardBackup,
  downloadLifeBoardBackup,
  loadSettingsSnapshot,
  readBackupFile,
} from '@/modules/settings/services/settingsBackup'
import type {
  BackupImportSummaryData,
  SettingsClearTarget,
  SettingsDataSnapshot,
  SettingsSelectiveClearTarget,
} from '@/modules/settings/types/settings'
import {
  getSettingsClearErrorKey,
  getSettingsImportErrorKey,
  localizeSettingsError,
} from '@/modules/settings/utils/settingsMessages'
import { useBookmarksStore } from '@/modules/bookmarks/stores/bookmarks'
import { useTodosStore } from '@/modules/todos/stores/todos'
import { useWeatherStore } from '@/modules/weather/stores/weather'
import type { WeatherProviderId } from '@/modules/weather/types/weatherProvider'
import { xiaomiWeatherEnabled } from '@/modules/weather/providers/weatherFeatureFlags'
import type {
  ClearOperationKind,
  LifeBoardLocale,
  PortableBackupV1,
  PreparedPortableImport,
} from '@/shared/persistence'
import { createClearOperationPreview } from '@/shared/persistence'
import type { ThemeMode } from '@/shared/types/theme'
import { resolveDefaultLanguage, useLanguageStore } from '@/stores/language'
import { useThemeStore } from '@/stores/theme'

type DialogState =
  | { kind: 'import' }
  | { kind: 'clear'; target: SettingsClearTarget }
  | null

const themeStore = useThemeStore()
const languageStore = useLanguageStore()
const weatherStore = useWeatherStore()
const todosStore = useTodosStore()
const bookmarksStore = useBookmarksStore()
const { locale, t } = useI18n()

watch(locale, weatherStore.setLocale, { immediate: true })

const { mode, persistenceError: themeError } = storeToRefs(themeStore)
const {
  selectedLocation,
  favoriteCities,
  provider,
  effectiveProvider,
  locationResolutionState,
  hasCaiyunToken,
  providerMessage,
  providerPersistenceError,
  hasAmapKey,
  autoLocationOnHome,
  amapMessage,
  amapPersistenceError,
  isInitialized: weatherInitialized,
} = storeToRefs(weatherStore)
const { tasks, countdowns } = storeToRefs(todosStore)
const { bookmarks } = storeToRefs(bookmarksStore)

const statusError = shallowRef<string | null>(null)
const backupError = shallowRef<string | null>(null)
const backupSuccess = shallowRef<TranslationKey | null>(null)
const portableExportError = shallowRef<TranslationKey | null>(null)
const portableExportSuccess = shallowRef<TranslationKey | null>(null)
const isPortableExportBusy = shallowRef(false)
const clearError = shallowRef<string | null>(null)
const clearSuccess = shallowRef<TranslationKey | null>(null)
const pendingBackup = shallowRef<PreparedPortableImport | null>(null)
const dialogState = shallowRef<DialogState>(null)
const isBusy = ref(false)

const taskCount = computed(() => tasks.value.length)
const countdownCount = computed(() => countdowns.value.length)
const bookmarkCount = computed(() => bookmarks.value.length)
const weatherFavoriteCount = computed(() => favoriteCities.value.length)
const weatherCity = computed(() => selectedLocation.value?.name ?? null)
const hasTodosRows = computed(() => taskCount.value + countdownCount.value > 0)
const hasBookmarkRows = computed(() => bookmarkCount.value > 0)
const hasUserContent = computed(() =>
  selectedLocation.value !== null ||
  weatherFavoriteCount.value > 0 ||
  taskCount.value > 0 ||
  countdownCount.value > 0 ||
  bookmarkCount.value > 0,
)
const localizedStatusError = computed(() =>
  localizeSettingsError(statusError.value, t),
)
const localizedBackupError = computed(() =>
  localizeSettingsError(backupError.value, t),
)
const localizedBackupSuccess = computed(() =>
  backupSuccess.value ? t(backupSuccess.value) : null,
)
const localizedPortableExportError = computed(() =>
  portableExportError.value ? t(portableExportError.value) : null,
)
const localizedPortableExportSuccess = computed(() =>
  portableExportSuccess.value ? t(portableExportSuccess.value) : null,
)
const localizedClearError = computed(() =>
  localizeSettingsError(clearError.value, t),
)
const localizedClearSuccess = computed(() =>
  clearSuccess.value ? t(clearSuccess.value) : null,
)
const pendingClearPreview = computed(() => {
  const target = dialogState.value?.kind === 'clear' ? dialogState.value.target : null
  if (target !== 'user-content' && target !== 'factory-reset') return null

  const result = createClearOperationPreview(target, {
    taskCount: taskCount.value,
    countdownCount: countdownCount.value,
    bookmarkCount: bookmarkCount.value,
    favoriteCityCount: weatherFavoriteCount.value,
    hasSavedLocation: selectedLocation.value !== null,
  })
  return result.ok ? result.data : null
})

const importSummary = computed<BackupImportSummaryData | null>(() => {
  if (!pendingBackup.value) return null

  return pendingBackup.value.preview
})

const currentThemeLabel = computed(() => {
  if (mode.value === 'light') return t('shell.theme.light')
  if (mode.value === 'dark') return t('shell.theme.dark')
  return t('shell.theme.system')
})

const currentLanguageLabel = computed(() =>
  locale.value === 'zh-CN'
    ? t('settings.language.chineseName')
    : t('settings.language.englishName'),
)

const providerLabel = computed(() =>
  provider.value === 'caiyun'
    ? t('settings.weatherProvider.caiyunLabel')
    : provider.value === 'xiaomi'
      ? t('settings.weatherProvider.xiaomiLabel')
      : t('settings.weatherProvider.openMeteoLabel'),
)

const heroFacts = computed(() => [
  {
    label: t('settings.hero.factLocal'),
    value: t('settings.hero.factLocalValue'),
  },
  {
    label: t('settings.hero.factTheme'),
    value: currentThemeLabel.value,
  },
  {
    label: t('settings.hero.factLanguage'),
    value: currentLanguageLabel.value,
  },
  {
    label: t('settings.hero.factBackup'),
    value: t('settings.hero.factBackupValue'),
  },
])

const dataSourceFacts = computed(() => [
  {
    label: t('settings.dataSources.summary.preferredForecastProvider'),
    value: providerLabel.value,
  },
  {
    label: t('settings.dataSources.summary.caiyunConfiguration'),
    value: hasCaiyunToken.value
      ? t('settings.dataSources.status.configured')
      : t('settings.dataSources.status.notConfigured'),
  },
  {
    label: t('settings.dataSources.summary.amapConfiguration'),
    value: hasAmapKey.value
      ? t('settings.dataSources.status.configured')
      : t('settings.dataSources.status.notConfigured'),
  },
])

const dialogCopy = computed(() => {
  if (dialogState.value?.kind === 'import') {
    return {
      title: t('settings.dialog.importTitle'),
      description: t('settings.dialog.importDescription'),
      confirmLabel: t('settings.dialog.importConfirm'),
      acknowledgementLabel: undefined,
    }
  }

  const target = dialogState.value?.kind === 'clear' ? dialogState.value.target : null

  if (target === 'weather') {
    return {
      title: t('settings.dialog.weatherTitle'),
      description: t('settings.dialog.weatherDescription'),
      confirmLabel: t('settings.clearData.clearWeather'),
      acknowledgementLabel: undefined,
    }
  }

  if (target === 'todos') {
    return {
      title: t('settings.dialog.todosTitle'),
      description: t('settings.dialog.todosDescription'),
      confirmLabel: t('settings.clearData.clearTodos'),
      acknowledgementLabel: undefined,
    }
  }

  if (target === 'bookmarks') {
    return {
      title: t('settings.dialog.bookmarksTitle'),
      description: t('settings.dialog.bookmarksDescription'),
      confirmLabel: t('settings.clearData.clearBookmarks'),
      acknowledgementLabel: undefined,
    }
  }

  if (target === 'user-content') {
    return {
      title: t('settings.dialog.userContentTitle'),
      description: t('settings.dialog.userContentDescription'),
      confirmLabel: t('settings.clearData.userContentAction'),
      acknowledgementLabel: t('settings.dialog.userContentAcknowledgement'),
    }
  }

  return {
    title: t('settings.dialog.factoryResetTitle'),
    description: t('settings.dialog.factoryResetDescription'),
    confirmLabel: t('settings.clearData.factoryResetAction'),
    acknowledgementLabel: t('settings.dialog.factoryResetAcknowledgement'),
  }
})

function applySnapshotToStores(snapshot: SettingsDataSnapshot, replaceWeather = false) {
  themeStore.synchronizeMode(snapshot.themeMode)

  if (replaceWeather || !weatherInitialized.value) {
    weatherStore.synchronizeLocation(snapshot.weatherLocation)
  }

  weatherStore.synchronizeFavoriteCities(snapshot.weatherFavoriteCities)

  todosStore.synchronizeFromSettings(
    snapshot.todos.tasks,
    snapshot.todos.countdowns,
  )
  bookmarksStore.synchronizeFromSettings(snapshot.bookmarks.bookmarks)
}

interface SettingsMemorySnapshot extends SettingsDataSnapshot {
  language: LifeBoardLocale
  provider: WeatherProviderId
  hasCaiyunToken: boolean
  hasAmapKey: boolean
  autoLocationOnHome: boolean
}

function captureMemorySnapshot(): SettingsMemorySnapshot {
  return {
    themeMode: mode.value,
    language: locale.value,
    provider: provider.value,
    hasCaiyunToken: hasCaiyunToken.value,
    hasAmapKey: hasAmapKey.value,
    autoLocationOnHome: autoLocationOnHome.value,
    weatherLocation: selectedLocation.value,
    weatherFavoriteCities: [...favoriteCities.value],
    todos: {
      version: 1,
      tasks: [...tasks.value],
      countdowns: [...countdowns.value],
    },
    bookmarks: {
      version: 1,
      bookmarks: [...bookmarks.value],
    },
  }
}

function hydratePortableBackup(backup: PortableBackupV1) {
  todosStore.synchronizeFromSettings(
    [...backup.data.todos.payload.tasks],
    [...backup.data.todos.payload.countdowns],
  )
  bookmarksStore.synchronizeFromSettings([...backup.data.bookmarks.payload.bookmarks])
  weatherStore.synchronizeLocation(backup.data.weather.payload.selectedLocation)
  weatherStore.synchronizeFavoriteCities([...backup.data.weather.payload.favoriteCities])
  themeStore.synchronizeMode(backup.data.settings.payload.themeMode)
  languageStore.synchronizeLanguage(backup.data.settings.payload.language)
}

function restoreMemorySnapshot(snapshot: SettingsMemorySnapshot) {
  todosStore.synchronizeFromSettings(snapshot.todos.tasks, snapshot.todos.countdowns)
  bookmarksStore.synchronizeFromSettings(snapshot.bookmarks.bookmarks)
  weatherStore.synchronizeLocation(snapshot.weatherLocation)
  weatherStore.synchronizeFavoriteCities(snapshot.weatherFavoriteCities)
  themeStore.synchronizeMode(snapshot.themeMode)
  languageStore.synchronizeLanguage(snapshot.language)
  weatherStore.initializeProviderPreferences()
  weatherStore.initializeAmapPreferences()
}

const sameData = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)

function verifyPortableHydration(backup: PortableBackupV1) {
  return mode.value === backup.data.settings.payload.themeMode &&
    locale.value === backup.data.settings.payload.language &&
    sameData(selectedLocation.value, backup.data.weather.payload.selectedLocation) &&
    sameData(favoriteCities.value, backup.data.weather.payload.favoriteCities) &&
    sameData(tasks.value, backup.data.todos.payload.tasks) &&
    sameData(countdowns.value, backup.data.todos.payload.countdowns) &&
    sameData(bookmarks.value, backup.data.bookmarks.payload.bookmarks)
}

function verifyMemorySnapshot(snapshot: SettingsMemorySnapshot) {
  return mode.value === snapshot.themeMode &&
    locale.value === snapshot.language &&
    sameData(selectedLocation.value, snapshot.weatherLocation) &&
    sameData(favoriteCities.value, snapshot.weatherFavoriteCities) &&
    sameData(tasks.value, snapshot.todos.tasks) &&
    sameData(countdowns.value, snapshot.todos.countdowns) &&
    sameData(bookmarks.value, snapshot.bookmarks.bookmarks) &&
    provider.value === snapshot.provider &&
    hasCaiyunToken.value === snapshot.hasCaiyunToken &&
    hasAmapKey.value === snapshot.hasAmapKey &&
    autoLocationOnHome.value === snapshot.autoLocationOnHome
}

function hydrateClearOperation(kind: ClearOperationKind) {
  todosStore.synchronizeFromSettings([], [])
  bookmarksStore.synchronizeFromSettings([])
  weatherStore.synchronizeLocation(null)
  weatherStore.synchronizeFavoriteCities([])

  if (kind === 'factory-reset') {
    themeStore.synchronizeMode('system')
    languageStore.synchronizeDefaultLanguage()
    weatherStore.synchronizeProviderPreferences('openMeteo')
    weatherStore.initializeAmapPreferences()
  }
}

function verifyClearOperation(kind: ClearOperationKind, previous: SettingsMemorySnapshot) {
  const contentCleared = selectedLocation.value === null &&
    favoriteCities.value.length === 0 &&
    tasks.value.length === 0 &&
    countdowns.value.length === 0 &&
    bookmarks.value.length === 0

  if (!contentCleared) return false
  if (kind === 'factory-reset') {
    return mode.value === 'system' &&
      locale.value === resolveDefaultLanguage() &&
      provider.value === 'openMeteo' &&
      !hasCaiyunToken.value &&
      !hasAmapKey.value &&
      !autoLocationOnHome.value
  }

  return mode.value === previous.themeMode &&
    locale.value === previous.language &&
    provider.value === previous.provider &&
    hasCaiyunToken.value === previous.hasCaiyunToken &&
    hasAmapKey.value === previous.hasAmapKey &&
    autoLocationOnHome.value === previous.autoLocationOnHome
}

function changeTheme(nextMode: ThemeMode) {
  backupSuccess.value = null
  clearSuccess.value = null
  themeStore.setMode(nextMode)
}

function changeWeatherProvider(nextProvider: WeatherProviderId) {
  backupSuccess.value = null
  clearSuccess.value = null
  weatherStore.setProvider(nextProvider)
}

function exportBackup() {
  backupError.value = null
  backupSuccess.value = null

  try {
    const backup = createLifeBoardBackup({ themeMode: mode.value, language: locale.value })
    if (!backup.ok) {
      backupError.value = 'settings.message.backupDownloadFailed'
      return
    }
    downloadLifeBoardBackup(backup.data.download)
    backupSuccess.value = 'settings.message.backupDownloaded'
  } catch {
    backupSuccess.value = null
    backupError.value = 'settings.message.backupDownloadFailed'
  }
}

function exportPortableData(kind: PortableExportKind) {
  if (isPortableExportBusy.value) return
  portableExportError.value = null
  portableExportSuccess.value = null
  isPortableExportBusy.value = true

  try {
    const exportResult = createPortableExport(kind, {
      tasks: [...tasks.value],
      countdowns: [...countdowns.value],
      bookmarks: [...bookmarks.value],
      locale: locale.value,
      generatedAt: new Date(),
    })

    if (!exportResult.ok) {
      portableExportError.value = exportResult.error.userMessageKey
      return
    }
    const downloadResult = downloadPortableExport(exportResult.data)
    if (!downloadResult.ok) {
      portableExportError.value = downloadResult.error.userMessageKey
      return
    }
    portableExportSuccess.value = 'settings.exports.success'
  } catch {
    portableExportSuccess.value = null
    portableExportError.value = 'settings.exports.errorSerialization'
  } finally {
    isPortableExportBusy.value = false
  }
}

async function selectBackupFile(file: File) {
  backupError.value = null
  backupSuccess.value = null
  clearError.value = null
  clearSuccess.value = null
  pendingBackup.value = null
  isBusy.value = true

  const result = await readBackupFile(file, {
    language: locale.value,
    themeMode: mode.value,
  })
  isBusy.value = false

  if (!result.ok) {
    backupError.value = getSettingsImportErrorKey(result.error.code)
    return
  }

  pendingBackup.value = result.data
}

function discardImport() {
  pendingBackup.value = null
  backupError.value = null
}

function openImportConfirmation() {
  if (pendingBackup.value) dialogState.value = { kind: 'import' }
}

function openClearConfirmation(target: SettingsClearTarget) {
  clearError.value = null
  clearSuccess.value = null
  dialogState.value = { kind: 'clear', target }
}

function closeDialog() {
  dialogState.value = null
}

function confirmImport() {
  if (!pendingBackup.value) return

  const previous = captureMemorySnapshot()
  const result = applyLifeBoardBackup(pendingBackup.value, {
    hydrate(backup) {
      hydratePortableBackup(backup)
    },
    verify: verifyPortableHydration,
    restore() {
      restoreMemorySnapshot(previous)
    },
    verifyRestore() {
      return verifyMemorySnapshot(previous)
    },
  })

  if (!result.ok) {
    backupError.value = getSettingsImportErrorKey(result.error.code)
    closeDialog()
    return
  }
  pendingBackup.value = null
  clearError.value = null
  clearSuccess.value = null
  backupSuccess.value = 'settings.message.backupImported'
  closeDialog()
}

function confirmClear() {
  if (dialogState.value?.kind !== 'clear') return
  const target = dialogState.value.target
  if (isBusy.value) return
  isBusy.value = true

  if (target === 'user-content' || target === 'factory-reset') {
    const previous = captureMemorySnapshot()
    const result = clearLifeBoardOperation(target, {
      hydrate: hydrateClearOperation,
      verify(kind) {
        return verifyClearOperation(kind, previous)
      },
      restore() {
        restoreMemorySnapshot(previous)
      },
      verifyRestore() {
        return verifyMemorySnapshot(previous)
      },
    })
    isBusy.value = false

    if (!result.ok) {
      clearError.value = getSettingsClearErrorKey(result.error.code)
      closeDialog()
      return
    }

    backupError.value = null
    backupSuccess.value = null
    pendingBackup.value = null
    clearSuccess.value = target === 'user-content'
      ? 'settings.message.userContentCleared'
      : 'settings.message.factoryResetComplete'
    closeDialog()
    return
  }

  const selectiveTarget: SettingsSelectiveClearTarget = target
  const result = clearLifeBoardData(selectiveTarget)
  isBusy.value = false

  if (!result.ok) {
    clearError.value = result.error
    closeDialog()
    return
  }

  if (target === 'weather') {
    weatherStore.synchronizeLocation(null)
    weatherStore.synchronizeFavoriteCities([])
  }

  if (target === 'todos') {
    todosStore.synchronizeFromSettings([], [])
  }

  if (target === 'bookmarks') {
    bookmarksStore.synchronizeFromSettings([])
  }

  backupError.value = null
  backupSuccess.value = null
  pendingBackup.value = null
  const labels: Record<SettingsSelectiveClearTarget, TranslationKey> = {
    weather: 'settings.message.weatherCleared',
    todos: 'settings.message.todosCleared',
    bookmarks: 'settings.message.bookmarksCleared',
  }
  clearSuccess.value = labels[selectiveTarget]
  closeDialog()
}

function confirmDialogAction() {
  if (dialogState.value?.kind === 'import') confirmImport()
  else confirmClear()
}

onMounted(() => {
  weatherStore.initializeProviderPreferences()
  const result = loadSettingsSnapshot()

  if (!result.ok) {
    statusError.value = result.error
    return
  }

  applySnapshotToStores(result.data)
})
</script>

<template>
  <div class="settings-workspace">
    <BaseSurface
      as="section"
      class="settings-hero"
      aria-labelledby="settings-title"
      padding="lg"
      variant="raised"
    >
      <div class="settings-hero__copy">
        <p class="settings-hero__eyebrow">
          {{ t('settings.hero.eyebrow') }}
        </p>
        <h1 id="settings-title" class="settings-hero__title">
          {{ t('settings.page.title') }}
        </h1>
        <p class="settings-hero__description">
          {{ t('settings.page.description') }}
        </p>
        <div class="settings-hero__actions" :aria-label="t('settings.hero.actionsLabel')">
          <a class="control-focus settings-button settings-button--primary" href="#settings-preferences">
            {{ t('settings.hero.primaryAction') }}
          </a>
          <RouterLink
            class="control-focus settings-button settings-button--secondary"
            :to="{ name: 'settings-data-sources' }"
          >
            {{ t('settings.hero.secondaryAction') }}
          </RouterLink>
        </div>
      </div>
      <dl class="settings-hero__facts" :aria-label="t('settings.hero.factsLabel')">
        <div
          v-for="fact in heroFacts"
          :key="fact.label"
        >
          <dt>{{ fact.label }}</dt>
          <dd>{{ fact.value }}</dd>
        </div>
      </dl>
    </BaseSurface>

    <div class="settings-grid">
      <div class="settings-grid__main" aria-labelledby="settings-preferences">
        <BaseSection
          id="settings-preferences"
          :title="t('settings.section.preferences.title')"
          :description="t('settings.section.preferences.description')"
        >
          <BaseSurface as="div" class="settings-panel settings-panel--stack" padding="md" variant="plain">
            <ThemeModeControl
              :model-value="mode"
              :error="themeError"
              @update:model-value="changeTheme"
            />
            <div class="settings-divider" />
            <LanguageControl />
            <TranslationExportPanel />
          </BaseSurface>
        </BaseSection>

        <BaseSection
          :title="t('settings.section.backup.title')"
          :description="t('settings.section.backup.description')"
        >
          <BackupPanel
            :import-summary="importSummary"
            :error="localizedBackupError"
            :success="localizedBackupSuccess"
            :export-disabled="isBusy || Boolean(statusError)"
            :import-disabled="isBusy"
            @export="exportBackup"
            @file-selected="selectBackupFile"
            @confirm-import="openImportConfirmation"
            @discard-import="discardImport"
          />
        </BaseSection>

        <BaseSection
          :title="t('settings.section.exports.title')"
          :description="t('settings.section.exports.description')"
        >
          <PortableExportsPanel
            :has-todos-rows="hasTodosRows"
            :has-bookmark-rows="hasBookmarkRows"
            :disabled="isPortableExportBusy"
            :error="localizedPortableExportError"
            :success="localizedPortableExportSuccess"
            @export-requested="exportPortableData"
          />
        </BaseSection>

        <BaseSection
          :title="t('settings.section.clearData.title')"
          :description="t('settings.section.clearData.description')"
        >
          <DataClearPanel
            :has-weather="selectedLocation !== null || weatherFavoriteCount > 0"
            :task-count="taskCount"
            :countdown-count="countdownCount"
            :bookmark-count="bookmarkCount"
            :has-user-content="hasUserContent"
            :busy="isBusy"
            :error="localizedClearError"
            :success="localizedClearSuccess"
            @request-clear="openClearConfirmation"
          />
        </BaseSection>
      </div>

      <aside class="settings-grid__side" :aria-label="t('settings.accessibility.sideControls')">
        <BaseSection
          :title="t('settings.section.localData.title')"
          :description="t('settings.section.localData.description')"
        >
          <LocalDataStatus
            :weather-city="weatherCity"
            :task-count="taskCount"
            :countdown-count="countdownCount"
            :bookmark-count="bookmarkCount"
            :error="localizedStatusError"
          />
        </BaseSection>

        <BaseSection
          :title="t('settings.section.dataSources.title')"
          :description="t('settings.section.dataSources.description')"
        >
          <BaseSurface as="div" class="settings-panel settings-panel--compact" padding="md" variant="plain">
            <div>
              <h3 class="settings-card-title">
                {{ t('settings.dataSources.entryTitle') }}
              </h3>
              <p class="settings-card-copy">
                {{ t('settings.dataSources.entryDescription') }}
              </p>
            </div>
            <dl class="settings-source-facts">
              <div v-for="fact in dataSourceFacts" :key="fact.label">
                <dt>{{ fact.label }}</dt>
                <dd>{{ fact.value }}</dd>
              </div>
            </dl>
            <RouterLink
              class="control-focus settings-button settings-button--secondary settings-button--full"
              :to="{ name: 'settings-data-sources' }"
            >
              {{ t('settings.dataSources.entryAction') }}
            </RouterLink>
          </BaseSurface>
        </BaseSection>

        <BaseSection
          :title="t('settings.section.weatherProvider.title')"
          :description="t('settings.section.weatherProvider.description')"
        >
          <WeatherProviderPreferences
            :error="providerPersistenceError"
            :effective-provider="effectiveProvider"
            :has-caiyun-token="hasCaiyunToken"
            :location-resolution-required="locationResolutionState === 'required'"
            :message="providerMessage"
            :provider="provider"
            :xiaomi-enabled="xiaomiWeatherEnabled"
            :xiaomi-locale-supported="locale === 'zh-CN'"
            @clear-message="weatherStore.clearProviderMessage"
            @clear-token="weatherStore.clearCaiyunToken"
            @save-token="weatherStore.saveCaiyunToken"
            @update-provider="changeWeatherProvider"
          />
        </BaseSection>

        <BaseSection
          :title="t('settings.section.locationServices.title')"
          :description="t('settings.section.locationServices.description')"
        >
          <WeatherLocationServices
            :auto-location-on-home="autoLocationOnHome"
            :error="amapPersistenceError"
            :has-amap-key="hasAmapKey"
            :message="amapMessage"
            @clear-amap-key="weatherStore.clearAmapKey"
            @clear-message="weatherStore.clearAmapMessage"
            @save-amap-key="weatherStore.saveAmapKey"
            @update-auto-location="weatherStore.setAutoLocationOnHome"
          />
        </BaseSection>

        <BaseSection
          :title="t('settings.section.privacy.title')"
          :description="t('settings.section.privacy.description')"
        >
          <PrivacyPanel />
        </BaseSection>
      </aside>
    </div>

    <SettingsConfirmationDialog
      :open="dialogState !== null"
      :title="dialogCopy.title"
      :description="dialogCopy.description"
      :confirm-label="dialogCopy.confirmLabel"
      :acknowledgement-label="dialogCopy.acknowledgementLabel"
      :busy="isBusy"
      @confirm="confirmDialogAction"
      @cancel="closeDialog"
    >
      <BackupImportSummary
        v-if="dialogState?.kind === 'import' && importSummary"
        :summary="importSummary"
      />
      <ClearOperationSummary
        v-else-if="pendingClearPreview"
        :summary="pendingClearPreview"
      />
    </SettingsConfirmationDialog>
  </div>
</template>

<style scoped>
.settings-workspace {
  display: grid;
  gap: clamp(1.25rem, 3vw, 2.5rem);
}

.settings-hero {
  display: grid;
  gap: clamp(1rem, 2vw, 1.5rem);
  background:
    linear-gradient(135deg, var(--color-surface-raised), var(--color-surface)),
    var(--color-surface-raised);
}

.settings-hero__copy {
  min-width: 0;
  max-width: 48rem;
}

.settings-hero__eyebrow {
  margin: 0 0 var(--space-3);
  color: var(--color-accent-text);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.settings-hero__title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-page-title);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0;
  line-height: var(--line-height-tight);
}

.settings-hero__description,
.settings-card-copy {
  margin: var(--space-3) 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-small);
  line-height: 1.7;
}

.settings-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.settings-button {
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

.settings-button--primary {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}

.settings-button--secondary {
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
}

.settings-button--full {
  width: 100%;
}

.settings-hero__facts,
.settings-source-facts {
  display: grid;
  gap: var(--space-2);
  margin: 0;
}

.settings-hero__facts {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid var(--color-border-soft);
  padding-top: var(--space-4);
}

.settings-hero__facts div {
  min-width: 0;
  border-radius: var(--radius-sm);
  background: color-mix(in oklch, var(--color-surface) 78%, transparent);
  padding: var(--space-2) var(--space-3);
}

.settings-hero__facts dt {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-caption);
  line-height: var(--line-height-label);
}

.settings-hero__facts dd {
  margin: var(--space-1) 0 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-label);
  overflow-wrap: anywhere;
}

.settings-source-facts div {
  min-width: 0;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: var(--space-3);
}

.settings-source-facts dt {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-caption);
}

.settings-source-facts dd {
  margin: var(--space-1) 0 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
  overflow-wrap: anywhere;
}

.settings-grid {
  display: grid;
  gap: clamp(1.25rem, 3vw, 2rem);
}

.settings-grid__main,
.settings-grid__side {
  display: grid;
  align-content: start;
  gap: clamp(1.25rem, 3vw, 2rem);
  min-width: 0;
}

.settings-panel {
  min-width: 0;
}

.settings-panel--stack {
  display: grid;
  gap: var(--space-5);
}

.settings-panel--compact {
  display: grid;
  gap: var(--space-4);
}

.settings-divider {
  height: 1px;
  background: var(--color-border-soft);
}

.settings-card-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-semibold);
}

@media (min-width: 48rem) {
  .settings-hero__facts {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 70rem) {
  .settings-workspace {
    gap: var(--space-8);
  }

  .settings-hero {
    grid-template-columns: minmax(0, 1.15fr) minmax(24rem, 0.85fr);
    align-items: center;
    padding: var(--space-6) var(--space-8);
  }

  .settings-hero__facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-1);
    padding-top: var(--space-3);
  }

  .settings-hero__facts div {
    background: transparent;
    padding: var(--space-2) var(--space-3);
  }

  .settings-hero__actions {
    margin-top: var(--space-5);
  }

  .settings-grid__main,
  .settings-grid__side {
    gap: var(--space-6);
  }

  .settings-grid {
    grid-template-columns: minmax(0, 1.35fr) minmax(23rem, 0.82fr);
  }

  .settings-panel--stack {
    gap: var(--space-4);
  }
}

@media (max-width: 40rem) {
  .settings-hero {
    gap: var(--space-4);
    padding: var(--space-5);
  }

  .settings-hero__eyebrow {
    margin-bottom: var(--space-2);
  }

  .settings-hero__description {
    line-height: 1.55;
  }

  .settings-hero__actions {
    gap: var(--space-2);
    margin-top: var(--space-4);
  }
}
</style>
