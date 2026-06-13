<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { storeToRefs } from 'pinia'
import BaseSection from '@/components/base/BaseSection.vue'
import BackupImportSummary from '@/modules/settings/components/BackupImportSummary.vue'
import BackupPanel from '@/modules/settings/components/BackupPanel.vue'
import DataClearPanel from '@/modules/settings/components/DataClearPanel.vue'
import LocalDataStatus from '@/modules/settings/components/LocalDataStatus.vue'
import PrivacyPanel from '@/modules/settings/components/PrivacyPanel.vue'
import SettingsConfirmationDialog from '@/modules/settings/components/SettingsConfirmationDialog.vue'
import ThemeModeControl from '@/modules/settings/components/ThemeModeControl.vue'
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
  LifeBoardBackupV1,
  SettingsClearTarget,
  SettingsDataSnapshot,
} from '@/modules/settings/types/settings'
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

const { mode, persistenceError: themeError } = storeToRefs(themeStore)
const {
  selectedLocation,
  isInitialized: weatherInitialized,
} = storeToRefs(weatherStore)
const { tasks, countdowns } = storeToRefs(todosStore)
const { bookmarks } = storeToRefs(bookmarksStore)

const statusError = shallowRef<string | null>(null)
const backupError = shallowRef<string | null>(null)
const backupSuccess = shallowRef<string | null>(null)
const clearError = shallowRef<string | null>(null)
const clearSuccess = shallowRef<string | null>(null)
const pendingBackup = shallowRef<LifeBoardBackupV1 | null>(null)
const dialogState = shallowRef<DialogState>(null)
const isBusy = ref(false)

const taskCount = computed(() => tasks.value.length)
const countdownCount = computed(() => countdowns.value.length)
const bookmarkCount = computed(() => bookmarks.value.length)
const weatherCity = computed(() => selectedLocation.value?.name ?? null)
const hasAnyData = computed(
  () =>
    mode.value !== 'system' ||
    selectedLocation.value !== null ||
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
      title: 'Replace local LifeBoard data?',
      description:
        'This will replace the current theme preference, selected city, tasks, countdowns, and bookmarks with the reviewed backup.',
      confirmLabel: 'Import and replace',
      acknowledgementLabel: undefined,
    }
  }

  const target = dialogState.value?.kind === 'clear' ? dialogState.value.target : null

  if (target === 'weather') {
    return {
      title: 'Clear Weather data?',
      description: 'This removes the selected city and current in-memory forecast.',
      confirmLabel: 'Clear Weather',
      acknowledgementLabel: undefined,
    }
  }

  if (target === 'todos') {
    return {
      title: 'Clear Todos data?',
      description: 'This removes every saved task and countdown from this browser.',
      confirmLabel: 'Clear Todos',
      acknowledgementLabel: undefined,
    }
  }

  if (target === 'bookmarks') {
    return {
      title: 'Clear Bookmarks data?',
      description: 'This removes every saved bookmark from this browser.',
      confirmLabel: 'Clear Bookmarks',
      acknowledgementLabel: undefined,
    }
  }

  return {
    title: 'Clear all LifeBoard data?',
    description:
      'This removes the theme preference, selected city, current forecast, tasks, countdowns, and bookmarks. Tools input is not saved.',
    confirmLabel: 'Clear all data',
    acknowledgementLabel:
      'I understand that this removes all LifeBoard data stored in this browser.',
  }
})

function applySnapshotToStores(snapshot: SettingsDataSnapshot, replaceWeather = false) {
  themeStore.synchronizeMode(snapshot.themeMode)

  if (replaceWeather || !weatherInitialized.value) {
    weatherStore.synchronizeLocation(snapshot.weatherLocation)
  }

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

function exportBackup() {
  backupError.value = null
  backupSuccess.value = null

  try {
    const backup = createLifeBoardBackup(currentSnapshot())
    downloadLifeBoardBackup(backup)
    backupSuccess.value = 'Backup downloaded to this device.'
  } catch {
    backupError.value = 'The backup could not be created or downloaded.'
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
      todos: pendingBackup.value.todos,
      bookmarks: pendingBackup.value.bookmarks,
    },
    true,
  )
  pendingBackup.value = null
  clearError.value = null
  clearSuccess.value = null
  backupSuccess.value = 'Backup imported. Current local LifeBoard data was replaced.'
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
  }

  if (target === 'todos' || target === 'all') {
    todosStore.synchronizeFromSettings([], [])
  }

  if (target === 'bookmarks' || target === 'all') {
    bookmarksStore.synchronizeFromSettings([])
  }

  if (target === 'all') {
    themeStore.synchronizeMode('system')
  }

  backupError.value = null
  backupSuccess.value = null
  pendingBackup.value = null
  const labels: Record<SettingsClearTarget, string> = {
    weather: 'Weather data cleared.',
    todos: 'Todos and countdowns cleared.',
    bookmarks: 'Bookmarks cleared.',
    all: 'All LifeBoard local data cleared. Theme mode reset to System.',
  }
  clearSuccess.value = labels[target]
  closeDialog()
}

function confirmDialogAction() {
  if (dialogState.value?.kind === 'import') confirmImport()
  else confirmClear()
}

onMounted(() => {
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
      title="Appearance"
      description="A browser-local preference that follows you only on this device."
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
      title="Local data"
      description="A direct view of what LifeBoard currently keeps in this browser."
    >
      <LocalDataStatus
        :weather-city="weatherCity"
        :task-count="taskCount"
        :countdown-count="countdownCount"
        :bookmark-count="bookmarkCount"
        :error="statusError"
      />
    </BaseSection>

    <BaseSection
      title="Backup and restore"
      description="Move your local LifeBoard data with a file you control."
    >
      <BackupPanel
        :import-summary="importSummary"
        :error="backupError"
        :success="backupSuccess"
        :export-disabled="isBusy || Boolean(statusError)"
        :import-disabled="isBusy"
        @export="exportBackup"
        @file-selected="selectBackupFile"
        @confirm-import="openImportConfirmation"
        @discard-import="discardImport"
      />
    </BaseSection>

    <BaseSection
      title="Privacy"
      description="LifeBoard keeps its local boundary explicit."
    >
      <PrivacyPanel />
    </BaseSection>

    <BaseSection
      title="Clear local data"
      description="Remove only the LifeBoard data you choose. Each destructive action asks first."
    >
      <DataClearPanel
        :has-weather="selectedLocation !== null"
        :task-count="taskCount"
        :countdown-count="countdownCount"
        :bookmark-count="bookmarkCount"
        :has-any-data="hasAnyData"
        :error="clearError"
        :success="clearSuccess"
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
