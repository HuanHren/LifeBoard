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
document.documentElement.dataset.theme = themeStore.resolvedTheme

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
