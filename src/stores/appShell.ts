import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'

export const useAppShellStore = defineStore('app-shell', () => {
  const isMobileNavOpen = shallowRef(false)

  const mobileNavLabel = computed(() => (isMobileNavOpen.value ? 'Close navigation' : 'Open navigation'))

  function openMobileNav() {
    isMobileNavOpen.value = true
  }

  function closeMobileNav() {
    isMobileNavOpen.value = false
  }

  function toggleMobileNav() {
    isMobileNavOpen.value = !isMobileNavOpen.value
  }

  return {
    isMobileNavOpen,
    mobileNavLabel,
    openMobileNav,
    closeMobileNav,
    toggleMobileNav,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppShellStore, import.meta.hot))
}
