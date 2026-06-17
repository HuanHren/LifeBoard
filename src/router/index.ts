import type { RouteLocationNormalized } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { translate } from '@/i18n/catalog'
import type { TranslationKey } from '@/i18n/keys'
import type { AppLocale } from '@/i18n/types'
import { routes } from '@/router/routes'

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export function updateDocumentTitle(
  route: RouteLocationNormalized,
  locale: AppLocale,
) {
  const titleKey = route.meta.titleKey as TranslationKey | undefined
  const title = titleKey ? translate(locale, titleKey) : 'LifeBoard'
  document.title = title === 'LifeBoard' ? title : `${title} | LifeBoard`
}

router.afterEach((to) => {
  const locale = document.documentElement.lang === 'zh-CN' ? 'zh-CN' : 'en-US'
  updateDocumentTitle(to, locale)
})
