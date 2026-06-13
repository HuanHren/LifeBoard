import type { RouteLocationRaw } from 'vue-router'

export interface NavigationItem {
  label: string
  marker: string
  description: string
  to: RouteLocationRaw
}

export const navigationItems: NavigationItem[] = [
  {
    label: 'Home',
    marker: 'HM',
    description: 'Daily overview',
    to: { name: 'home' },
  },
  {
    label: 'Weather',
    marker: 'WE',
    description: 'Local conditions',
    to: { name: 'weather' },
  },
  {
    label: 'Todos',
    marker: 'TD',
    description: 'Task planning',
    to: { name: 'todos' },
  },
  {
    label: 'Tools',
    marker: 'TL',
    description: 'Everyday utilities',
    to: { name: 'tools' },
  },
  {
    label: 'Bookmarks',
    marker: 'BK',
    description: 'Saved references',
    to: { name: 'bookmarks' },
  },
  {
    label: 'Settings',
    marker: 'ST',
    description: 'Appearance and layout',
    to: { name: 'settings' },
  },
]
