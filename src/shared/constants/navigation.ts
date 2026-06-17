import type { RouteLocationRaw } from 'vue-router'
import type { TranslationKey } from '@/i18n/keys'

export interface NavigationItem {
  labelKey: TranslationKey
  marker: string
  descriptionKey: TranslationKey
  to: RouteLocationRaw
}

export const navigationItems: NavigationItem[] = [
  {
    labelKey: 'navigation.home.label',
    marker: 'HM',
    descriptionKey: 'navigation.home.description',
    to: { name: 'home' },
  },
  {
    labelKey: 'navigation.weather.label',
    marker: 'WE',
    descriptionKey: 'navigation.weather.description',
    to: { name: 'weather' },
  },
  {
    labelKey: 'navigation.todos.label',
    marker: 'TD',
    descriptionKey: 'navigation.todos.description',
    to: { name: 'todos' },
  },
  {
    labelKey: 'navigation.tools.label',
    marker: 'TL',
    descriptionKey: 'navigation.tools.description',
    to: { name: 'tools' },
  },
  {
    labelKey: 'navigation.bookmarks.label',
    marker: 'BK',
    descriptionKey: 'navigation.bookmarks.description',
    to: { name: 'bookmarks' },
  },
  {
    labelKey: 'navigation.settings.label',
    marker: 'ST',
    descriptionKey: 'navigation.settings.description',
    to: { name: 'settings' },
  },
]
