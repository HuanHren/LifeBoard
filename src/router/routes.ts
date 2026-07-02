import type { RouteRecordRaw } from 'vue-router'
import '@/router/meta'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/modules/landing/LandingPage.vue'),
    meta: {
      layout: 'landing',
      titleKey: 'navigation.landing.label',
      restoreScroll: true,
    },
  },
  {
    path: '/app',
    name: 'workspace',
    component: () => import('@/modules/home/HomePage.vue'),
    meta: {
      layout: 'app',
      navigationKey: 'workspace',
      titleKey: 'navigation.workspace.label',
    },
  },
  {
    path: '/weather',
    name: 'weather',
    component: () => import('@/modules/weather/WeatherPage.vue'),
    meta: {
      layout: 'app',
      navigationKey: 'weather',
      titleKey: 'navigation.weather.label',
    },
  },
  {
    path: '/weather/cities',
    name: 'weather-cities',
    component: () => import('@/modules/weather/pages/WeatherCityManagementPage.vue'),
    meta: {
      layout: 'app',
      navigationKey: 'weather',
      titleKey: 'weather.cities.title',
    },
  },
  {
    path: '/weather/15-day',
    name: 'weather-15-day',
    component: () => import('@/modules/weather/pages/LongRangeForecastPage.vue'),
    meta: {
      layout: 'app',
      navigationKey: 'weather',
      titleKey: 'weather.longRange.title',
    },
  },
  {
    path: '/todos',
    name: 'todos',
    component: () => import('@/modules/todos/TodosPage.vue'),
    meta: {
      layout: 'app',
      navigationKey: 'todos',
      titleKey: 'navigation.todos.label',
    },
  },
  {
    path: '/tools',
    name: 'tools',
    component: () => import('@/modules/tools/ToolsPage.vue'),
    meta: {
      layout: 'app',
      navigationKey: 'tools',
      titleKey: 'navigation.tools.label',
    },
  },
  {
    path: '/bookmarks',
    name: 'bookmarks',
    component: () => import('@/modules/bookmarks/BookmarksPage.vue'),
    meta: {
      layout: 'app',
      navigationKey: 'bookmarks',
      titleKey: 'navigation.bookmarks.label',
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/modules/settings/SettingsPage.vue'),
    meta: {
      layout: 'app',
      navigationKey: 'settings',
      titleKey: 'navigation.settings.label',
    },
  },
  {
    path: '/settings/data-sources',
    name: 'settings-data-sources',
    component: () => import('@/modules/settings/pages/DataSourcesPage.vue'),
    meta: {
      layout: 'app',
      navigationKey: 'settings',
      titleKey: 'settings.dataSources.pageTitle',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/modules/not-found/NotFoundPage.vue'),
    meta: {
      layout: 'minimal',
      titleKey: 'notFound.routeTitle',
    },
  },
]
