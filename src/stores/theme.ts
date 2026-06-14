import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'
import type { ResolvedTheme, ThemeMode } from '@/shared/types/theme'

export const THEME_STORAGE_KEY = 'lifeboard-theme'

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const mode = shallowRef<ThemeMode>('system')
  const systemTheme = shallowRef<ResolvedTheme>(getSystemTheme())
  const persistenceError = shallowRef<string | null>(null)
  let systemThemeQuery: MediaQueryList | null = null
  let systemThemeChangeHandler: ((event: MediaQueryListEvent) => void) | null = null

  const resolvedTheme = computed<ResolvedTheme>(() => {
    if (mode.value === 'system') {
      return systemTheme.value
    }

    return mode.value
  })

  function setMode(nextMode: ThemeMode) {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextMode)
      } catch {
        persistenceError.value =
          'The theme preference could not be saved in this browser.'
        return false
      }
    }

    mode.value = nextMode
    persistenceError.value = null
    return true
  }

  function synchronizeMode(nextMode: ThemeMode) {
    mode.value = nextMode
    persistenceError.value = null
  }

  function cycleMode() {
    const nextMode: ThemeMode =
      mode.value === 'system' ? 'light' : mode.value === 'light' ? 'dark' : 'system'

    setMode(nextMode)
  }

  function initializeTheme() {
    if (typeof window === 'undefined') {
      return
    }

    let storedMode: string | null = null

    try {
      storedMode = window.localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      persistenceError.value =
        'The saved theme preference could not be read in this browser.'
    }

    if (storedMode === 'system' || storedMode === 'light' || storedMode === 'dark') {
      mode.value = storedMode
    }

    disposeThemeListener()
    systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemTheme.value = systemThemeQuery.matches ? 'dark' : 'light'

    systemThemeChangeHandler = (event) => {
      systemTheme.value = event.matches ? 'dark' : 'light'
    }
    systemThemeQuery.addEventListener('change', systemThemeChangeHandler)
  }

  function disposeThemeListener() {
    if (systemThemeQuery && systemThemeChangeHandler) {
      systemThemeQuery.removeEventListener('change', systemThemeChangeHandler)
    }

    systemThemeQuery = null
    systemThemeChangeHandler = null
  }

  return {
    mode,
    systemTheme,
    persistenceError,
    resolvedTheme,
    setMode,
    synchronizeMode,
    cycleMode,
    initializeTheme,
    disposeThemeListener,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useThemeStore, import.meta.hot))
}
