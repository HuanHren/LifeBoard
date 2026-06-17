import { acceptHMRUpdate, defineStore } from 'pinia'
import { shallowRef, watch } from 'vue'
import type { AppLocale } from '@/i18n/types'

export const LANGUAGE_STORAGE_KEY = 'lifeboard.language'

function getBrowserLocale(): AppLocale {
  if (typeof navigator === 'undefined') return 'en-US'

  return navigator.languages.some((locale) =>
    locale.toLowerCase().startsWith('zh'),
  )
    ? 'zh-CN'
    : 'en-US'
}

function isAppLocale(value: string | null): value is AppLocale {
  return value === 'zh-CN' || value === 'en-US'
}

export const useLanguageStore = defineStore('language', () => {
  const locale = shallowRef<AppLocale>(getBrowserLocale())
  const isInitialized = shallowRef(false)
  const persistenceError = shallowRef<string | null>(null)

  watch(
    locale,
    (nextLocale) => {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = nextLocale
      }
    },
    { immediate: true },
  )

  function initializeLanguage() {
    if (typeof window === 'undefined') {
      isInitialized.value = true
      return
    }

    try {
      const storedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)

      if (isAppLocale(storedLocale)) {
        locale.value = storedLocale
      }
      persistenceError.value = null
    } catch {
      persistenceError.value =
        'The saved language preference could not be read in this browser.'
    } finally {
      isInitialized.value = true
    }
  }

  function setLanguage(nextLocale: AppLocale) {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale)
      } catch {
        persistenceError.value =
          'The language preference could not be saved in this browser.'
        return false
      }
    }

    locale.value = nextLocale
    persistenceError.value = null
    return true
  }

  function synchronizeLanguage(nextLocale: AppLocale) {
    locale.value = nextLocale
    persistenceError.value = null
  }

  return {
    locale,
    isInitialized,
    persistenceError,
    initializeLanguage,
    setLanguage,
    synchronizeLanguage,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLanguageStore, import.meta.hot))
}
