import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/app/App.vue'
import { router } from '@/router'
import { useThemeStore } from '@/stores/theme'
import '@/assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const themeStore = useThemeStore(pinia)
themeStore.initializeTheme()
document.documentElement.dataset.theme = themeStore.resolvedTheme

app.mount('#app')
