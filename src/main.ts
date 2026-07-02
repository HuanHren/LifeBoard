import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import App from '@/app/App.vue'
import { router, updateDocumentTitle } from '@/router'
import { useLanguageStore } from '@/stores/language'
import { useThemeStore } from '@/stores/theme'
import '@/assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const themeStore = useThemeStore(pinia)
themeStore.initializeTheme()
const { resolvedTheme } = storeToRefs(themeStore)

watch(
  resolvedTheme,
  (theme) => {
    document.documentElement.dataset.theme = theme
  },
  { immediate: true },
)

const languageStore = useLanguageStore(pinia)
languageStore.initializeLanguage()
const { locale } = storeToRefs(languageStore)

watch(
  locale,
  (nextLocale) => {
    updateDocumentTitle(router.currentRoute.value, nextLocale)
  },
  { immediate: true },
)

app.mount('#app')
