import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/modules/home/HomePage.vue'),
    meta: {
      title: 'Home',
    },
  },
  {
    path: '/weather',
    name: 'weather',
    component: () => import('@/modules/weather/WeatherPage.vue'),
    meta: {
      title: 'Weather',
    },
  },
  {
    path: '/todos',
    name: 'todos',
    component: () => import('@/modules/todos/TodosPage.vue'),
    meta: {
      title: 'Todos',
    },
  },
  {
    path: '/tools',
    name: 'tools',
    component: () => import('@/modules/tools/ToolsPage.vue'),
    meta: {
      title: 'Tools',
    },
  },
  {
    path: '/bookmarks',
    name: 'bookmarks',
    component: () => import('@/modules/bookmarks/BookmarksPage.vue'),
    meta: {
      title: 'Bookmarks',
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/modules/settings/SettingsPage.vue'),
    meta: {
      title: 'Settings',
    },
  },
]
