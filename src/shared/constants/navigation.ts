import type { RouteLocationRaw } from 'vue-router'
import type { BaseIconName } from '@/components/base/BaseIcon.vue'
import type { TranslationKey } from '@/i18n/keys'

export interface NavigationItem {
  labelKey: TranslationKey
  icon: BaseIconName
  descriptionKey: TranslationKey
  to: RouteLocationRaw
}

export const navigationItems: NavigationItem[] = [
  {
    labelKey: 'navigation.home.label',
    icon: 'home',
    descriptionKey: 'navigation.home.description',
    to: { name: 'home' },
  },
  {
    labelKey: 'navigation.weather.label',
    icon: 'weather',
    descriptionKey: 'navigation.weather.description',
    to: { name: 'weather' },
  },
  {
    labelKey: 'navigation.todos.label',
    icon: 'todos',
    descriptionKey: 'navigation.todos.description',
    to: { name: 'todos' },
  },
  {
    labelKey: 'navigation.tools.label',
    icon: 'tools',
    descriptionKey: 'navigation.tools.description',
    to: { name: 'tools' },
  },
  {
    labelKey: 'navigation.bookmarks.label',
    icon: 'bookmarks',
    descriptionKey: 'navigation.bookmarks.description',
    to: { name: 'bookmarks' },
  },
  {
    labelKey: 'navigation.settings.label',
    icon: 'settings',
    descriptionKey: 'navigation.settings.description',
    to: { name: 'settings' },
  },
]
