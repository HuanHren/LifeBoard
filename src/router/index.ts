import type { RouteLocationNormalized } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { translate } from '@/i18n/catalog'
import type { TranslationKey } from '@/i18n/keys'
import type { AppLocale } from '@/i18n/types'
import '@/router/meta'
import { routes } from '@/router/routes'

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      return {
        el: to.hash,
        top: 96,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      }
    }

    return { top: 0 }
  },
})

export function updateDocumentTitle(
  route: RouteLocationNormalized,
  locale: AppLocale,
) {
  const titleKey = (route.meta.documentTitleKey ?? route.meta.titleKey) as
    | TranslationKey
    | undefined
  const title = titleKey ? translate(locale, titleKey) : 'LifeBoard'
  document.title = title === 'LifeBoard' ? title : `${title} | LifeBoard`
}

router.afterEach((to) => {
  const locale = document.documentElement.lang === 'zh-CN' ? 'zh-CN' : 'en-US'
  updateDocumentTitle(to, locale)
})
