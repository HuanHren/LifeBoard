import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router/routes'

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : 'LifeBoard'
  document.title = title === 'LifeBoard' ? title : `${title} | LifeBoard`
})
