<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { storeToRefs } from 'pinia'
import BaseSection from '@/components/base/BaseSection.vue'
import type { TranslationKey } from '@/i18n/keys'
import { useI18n } from '@/i18n/useI18n'
import BackupImportSummary from '@/modules/settings/components/BackupImportSummary.vue'
import BackupPanel from '@/modules/settings/components/BackupPanel.vue'
import DataClearPanel from '@/modules/settings/components/DataClearPanel.vue'
import LocalDataStatus from '@/modules/settings/components/LocalDataStatus.vue'
import LanguageControl from '@/modules/settings/components/LanguageControl.vue'
import PortableExportsPanel from '@/modules/settings/components/PortableExportsPanel.vue'
import PrivacyPanel from '@/modules/settings/components/PrivacyPanel.vue'
import SettingsConfirmationDialog from '@/modules/settings/components/SettingsConfirmationDialog.vue'
import ThemeModeControl from '@/modules/settings/components/ThemeModeControl.vue'
import TranslationExportPanel from '@/modules/settings/components/TranslationExportPanel.vue'
import WeatherProviderPreferences from '@/modules/settings/components/WeatherProviderPreferences.vue'
import {
  createPortableExport,
  downloadPortableExport,
} from '@/modules/settings/services/settingsPortableExports'
import type { PortableExportKind } from '@/modules/settings/types/settingsExports'
import {
  applyLifeBoardBackup,
  clearLifeBoardData,
  createLifeBoardBackup,
  downloadLifeBoardBackup,
  loadSettingsSnapshot,
  readBackupFile,
} from '@/modules/settings/services/settingsBackup'
import type {
  BackupImportSummaryData,
  LifeBoardBackup,
  SettingsClearTarget,
  SettingsDataSnapshot,
} from '@/modules/settings/types/settings'
import { localizeSettingsError } from '@/modules/settings/utils/settingsMessages'
import { BOOKMARKS_STORAGE_VERSION } from '@/modules/bookmarks/constants/bookmarks'
import { useBookmarksStore } from '@/modules/bookmarks/stores/bookmarks'
import { TODOS_STORAGE_VERSION } from '@/modules/todos/constants/todos'
import { useTodosStore } from '@/modules/todos/stores/todos'
import { useWeatherStore } from '@/modules/weather/stores/weather'
import type { ThemeMode } from '@/shared/types/theme'
import { useThemeStore } from '@/stores/theme'

type DialogState =
  | { kind: 'import' }
  | { kind: 'clear'; target: SettingsClearTarget }
  | null

const themeStore = useThemeStore()
const weatherStore = useWeatherStore()
const todosStore = useTodosStore()
const bookmarksStore = useBookmarksStore()
const { locale, t } = useI18n()

const { mode, persistenceError: themeError } = storeToRefs(themeStore)
const {
  selectedLocation,
  favoriteCities,
  provider,
  hasCaiyunToken,
  providerMessage,
  providerPersistenceError,
  isInitialized: weatherInitialized,
} = storeToRefs(weatherStore)
const { tasks, countdowns } = storeToRefs(todosStore)
const { bookmarks } = storeToRefs(bookmarksStore)

const statusError = shallowRef<string | null>(null)
const backupError = shallowRef<string | null>(null)
const backupSuccess = shallowRef<TranslationKey | null>(null)
const portableExportError = shallowRef<TranslationKey | null>(null)
const portableExportSuccess = shallowRef<TranslationKey | null>(null)
const clearError = shallowRef<string | null>(null)
const clearSuccess = shallowRef<TranslationKey | null>(null)
const pendingBackup = shallowRef<LifeBoardBackup | null>(null)
const dialogState = shallowRef<DialogState>(null)
const isBusy = ref(false)

const taskCount = computed(() => tasks.value.length)
const countdownCount = computed(() => countdowns.value.length)
const bookmarkCount = computed(() => bookmarks.value.length)
const weatherFavoriteCount = computed(() => favoriteCities.value.length)
const weatherCity = computed(() => selectedLocation.value?.name ?? null)
const hasTodosRows = computed(() => taskCount.value + countdownCount.value > 0)
const hasBookmarkRows = computed(() => bookmarkCount.value > 0)
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
const hasAnyData = computed(
  () =>
    mode.value !== 'system' ||
    provider.value !== 'openMeteo' ||
    hasCaiyunToken.value ||
    selectedLocation.value !== null ||
    weatherFavoriteCount.value > 0 ||
    taskCount.value > 0 ||
    countdownCount.value > 0 ||
    bookmarkCount.value > 0 ||
    statusError.value !== null,
)

const importSummary = computed<BackupImportSummaryData | null>(() => {
  if (!pendingBackup.value) return null

  return {
    exportedAt: pendingBackup.value.exportedAt,
    themeMode: pendingBackup.value.preferences.themeMode,
    weatherCity: pendingBackup.value.weather.selectedLocation?.name ?? null,
    taskCount: pendingBackup.value.todos.tasks.length,
    countdownCount: pendingBackup.value.todos.countdowns.length,
    bookmarkCount: pendingBackup.value.bookmarks.bookmarks.length,
  }
})

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

  return {
    title: t('settings.dialog.allTitle'),
    description: t('settings.dialog.allDescription'),
    confirmLabel: t('settings.dialog.allConfirm'),
    acknowledgementLabel: t('settings.dialog.allAcknowledgement'),
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

function currentSnapshot(): SettingsDataSnapshot {
  return {
    themeMode: mode.value,
    weatherLocation: selectedLocation.value,
    weatherFavoriteCities: [...favoriteCities.value],
    todos: {
      version: TODOS_STORAGE_VERSION,
      tasks: [...tasks.value],
      countdowns: [...countdowns.value],
    },
    bookmarks: {
      version: BOOKMARKS_STORAGE_VERSION,
      bookmarks: [...bookmarks.value],
    },
  }
}

function changeTheme(nextMode: ThemeMode) {
  backupSuccess.value = null
  clearSuccess.value = null
  themeStore.setMode(nextMode)
}

function changeWeatherProvider(nextProvider: 'openMeteo' | 'caiyun') {
  backupSuccess.value = null
  clearSuccess.value = null
  weatherStore.setProvider(nextProvider)
}

function exportBackup() {
  backupError.value = null
  backupSuccess.value = null

  try {
    const backup = createLifeBoardBackup(currentSnapshot())
    downloadLifeBoardBackup(backup)
    backupSuccess.value = 'settings.message.backupDownloaded'
  } catch {
    backupSuccess.value = null
    backupError.value = 'settings.message.backupDownloadFailed'
  }
}

function exportPortableData(kind: PortableExportKind) {
  portableExportError.value = null
  portableExportSuccess.value = null

  try {
    const exportResult = createPortableExport(kind, {
      tasks: [...tasks.value],
      countdowns: [...countdowns.value],
      bookmarks: [...bookmarks.value],
      weatherLocation: selectedLocation.value,
      locale: locale.value,
      generatedAt: new Date(),
    })

    downloadPortableExport(exportResult)
    portableExportSuccess.value = 'settings.exports.success'
  } catch {
    portableExportSuccess.value = null
    portableExportError.value = 'settings.exports.error'
  }
}

async function selectBackupFile(file: File) {
  backupError.value = null
  backupSuccess.value = null
  clearError.value = null
  clearSuccess.value = null
  pendingBackup.value = null
  isBusy.value = true

  const result = await readBackupFile(file)
  isBusy.value = false

  if (!result.ok) {
    backupError.value = result.error
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

  const result = applyLifeBoardBackup(pendingBackup.value)

  if (!result.ok) {
    backupError.value = result.error
    closeDialog()
    return
  }

  applySnapshotToStores(
    {
      themeMode: pendingBackup.value.preferences.themeMode,
      weatherLocation: pendingBackup.value.weather.selectedLocation,
      weatherFavoriteCities:
        pendingBackup.value.version === 2
          ? pendingBackup.value.weather.favoriteCities
          : [],
      todos: pendingBackup.value.todos,
      bookmarks: pendingBackup.value.bookmarks,
    },
    true,
  )
  pendingBackup.value = null
  clearError.value = null
  clearSuccess.value = null
  backupSuccess.value = 'settings.message.backupImported'
  closeDialog()
}

function confirmClear() {
  if (dialogState.value?.kind !== 'clear') return
  const target = dialogState.value.target
  const result = clearLifeBoardData(target)

  if (!result.ok) {
    clearError.value = result.error
    closeDialog()
    return
  }

  if (target === 'weather' || target === 'all') {
    weatherStore.synchronizeLocation(null)
    weatherStore.synchronizeFavoriteCities([])
  }

  if (target === 'todos' || target === 'all') {
    todosStore.synchronizeFromSettings([], [])
  }

  if (target === 'bookmarks' || target === 'all') {
    bookmarksStore.synchronizeFromSettings([])
  }

  if (target === 'all') {
    themeStore.synchronizeMode('system')
    weatherStore.synchronizeProviderPreferences('openMeteo')
  }

  backupError.value = null
  backupSuccess.value = null
  pendingBackup.value = null
  const labels: Record<SettingsClearTarget, TranslationKey> = {
    weather: 'settings.message.weatherCleared',
    todos: 'settings.message.todosCleared',
    bookmarks: 'settings.message.bookmarksCleared',
    all: 'settings.message.allCleared',
  }
  clearSuccess.value = labels[target]
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
  <div class="space-y-10">
    <BaseSection
      :title="t('settings.section.appearance.title')"
      :description="t('settings.section.appearance.description')"
    >
      <div class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-5 sm:p-6">
        <ThemeModeControl
          :model-value="mode"
          :error="themeError"
          @update:model-value="changeTheme"
        />
      </div>
    </BaseSection>

    <BaseSection
      :title="t('settings.section.language.title')"
      :description="t('settings.section.language.description')"
    >
      <div class="space-y-5 rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-5 sm:p-6">
        <LanguageControl />
        <TranslationExportPanel />
      </div>
    </BaseSection>

    <BaseSection
      :title="t('settings.section.weatherProvider.title')"
      :description="t('settings.section.weatherProvider.description')"
    >
      <WeatherProviderPreferences
        :error="providerPersistenceError"
        :has-caiyun-token="hasCaiyunToken"
        :message="providerMessage"
        :provider="provider"
        @clear-message="weatherStore.clearProviderMessage"
        @clear-token="weatherStore.clearCaiyunToken"
        @save-token="weatherStore.saveCaiyunToken"
        @update-provider="changeWeatherProvider"
      />
    </BaseSection>

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
        :error="localizedPortableExportError"
        :success="localizedPortableExportSuccess"
        @export-requested="exportPortableData"
      />
    </BaseSection>

    <BaseSection
      :title="t('settings.section.privacy.title')"
      :description="t('settings.section.privacy.description')"
    >
      <PrivacyPanel />
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
        :has-any-data="hasAnyData"
        :error="localizedClearError"
        :success="localizedClearSuccess"
        @request-clear="openClearConfirmation"
      />
    </BaseSection>

    <SettingsConfirmationDialog
      :open="dialogState !== null"
      :title="dialogCopy.title"
      :description="dialogCopy.description"
      :confirm-label="dialogCopy.confirmLabel"
      :acknowledgement-label="dialogCopy.acknowledgementLabel"
      @confirm="confirmDialogAction"
      @cancel="closeDialog"
    >
      <BackupImportSummary
        v-if="dialogState?.kind === 'import' && importSummary"
        :summary="importSummary"
      />
    </SettingsConfirmationDialog>
  </div>
</template>
