import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/modules/home/HomePage.vue'),
    meta: {
      titleKey: 'navigation.home.label',
    },
  },
  {
    path: '/weather',
    name: 'weather',
    component: () => import('@/modules/weather/WeatherPage.vue'),
    meta: {
      titleKey: 'navigation.weather.label',
    },
  },
  {
    path: '/weather/cities',
    name: 'weather-cities',
    component: () => import('@/modules/weather/pages/WeatherCityManagementPage.vue'),
    meta: {
      titleKey: 'weather.cities.title',
    },
  },
  {
    path: '/weather/15-day',
    name: 'weather-15-day',
    component: () => import('@/modules/weather/pages/LongRangeForecastPage.vue'),
    meta: {
      titleKey: 'weather.longRange.title',
    },
  },
  {
    path: '/todos',
    name: 'todos',
    component: () => import('@/modules/todos/TodosPage.vue'),
    meta: {
      titleKey: 'navigation.todos.label',
    },
  },
  {
    path: '/tools',
    name: 'tools',
    component: () => import('@/modules/tools/ToolsPage.vue'),
    meta: {
      titleKey: 'navigation.tools.label',
    },
  },
  {
    path: '/bookmarks',
    name: 'bookmarks',
    component: () => import('@/modules/bookmarks/BookmarksPage.vue'),
    meta: {
      titleKey: 'navigation.bookmarks.label',
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/modules/settings/SettingsPage.vue'),
    meta: {
      titleKey: 'navigation.settings.label',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/modules/not-found/NotFoundPage.vue'),
    meta: {
      titleKey: 'notFound.routeTitle',
    },
  },
]
