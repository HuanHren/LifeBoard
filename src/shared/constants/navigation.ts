import type { RouteLocationRaw } from 'vue-router'
import type { BaseIconName } from '@/components/base/BaseIcon.vue'
import type { TranslationKey } from '@/i18n/keys'
import type { NavigationKey } from '@/router/meta'

export interface NavigationItem {
  key: NavigationKey
  labelKey: TranslationKey
  descriptionKey: TranslationKey
  icon: BaseIconName
  to: RouteLocationRaw
}

export interface MobilePrimaryNavigationItem extends NavigationItem {
  key: 'workspace' | 'calendar' | 'weather' | 'todos'
}

export const appDesktopNavigationItems: NavigationItem[] = [
  {
    key: 'workspace',
    labelKey: 'navigation.workspace.label',
    descriptionKey: 'navigation.workspace.description',
    icon: 'home',
    to: { name: 'workspace' },
  },
  {
    key: 'calendar',
    labelKey: 'navigation.calendar.label',
    descriptionKey: 'navigation.calendar.description',
    icon: 'calendar',
    to: { name: 'calendar' },
  },
  {
    key: 'weather',
    labelKey: 'navigation.weather.label',
    descriptionKey: 'navigation.weather.description',
    icon: 'weather',
    to: { name: 'weather' },
  },
  {
    key: 'todos',
    labelKey: 'navigation.todos.label',
    descriptionKey: 'navigation.todos.description',
    icon: 'todos',
    to: { name: 'todos' },
  },
  {
    key: 'bookmarks',
    labelKey: 'navigation.bookmarks.label',
    descriptionKey: 'navigation.bookmarks.description',
    icon: 'bookmarks',
    to: { name: 'bookmarks' },
  },
  {
    key: 'tools',
    labelKey: 'navigation.tools.label',
    descriptionKey: 'navigation.tools.description',
    icon: 'tools',
    to: { name: 'tools' },
  },
]

export const landingNavigationItems = appDesktopNavigationItems

export const appMobilePrimaryNavigationItems: MobilePrimaryNavigationItem[] = [
  {
    key: 'workspace',
    labelKey: 'navigation.workspace.label',
    descriptionKey: 'navigation.workspace.description',
    icon: 'home',
    to: { name: 'workspace' },
  },
  {
    key: 'calendar',
    labelKey: 'navigation.calendar.label',
    descriptionKey: 'navigation.calendar.description',
    icon: 'calendar',
    to: { name: 'calendar' },
  },
  {
    key: 'weather',
    labelKey: 'navigation.weather.label',
    descriptionKey: 'navigation.weather.description',
    icon: 'weather',
    to: { name: 'weather' },
  },
  {
    key: 'todos',
    labelKey: 'navigation.todos.label',
    descriptionKey: 'navigation.todos.description',
    icon: 'todos',
    to: { name: 'todos' },
  },
]

export const appMobileMoreNavigationItems: NavigationItem[] = [
  appDesktopNavigationItems[4],
  appDesktopNavigationItems[5],
  {
    key: 'settings',
    labelKey: 'navigation.settings.label',
    descriptionKey: 'navigation.settings.description',
    icon: 'settings',
    to: { name: 'settings' },
  },
]

export const navigationItems = appDesktopNavigationItems

export function getNavigationKey(routeNavigationKey: unknown) {
  return typeof routeNavigationKey === 'string'
    ? (routeNavigationKey as NavigationKey)
    : undefined
}

export function isMobileMoreNavigationKey(navigationKey: NavigationKey | undefined) {
  return (
    navigationKey === 'bookmarks' ||
    navigationKey === 'tools' ||
    navigationKey === 'settings'
  )
}
