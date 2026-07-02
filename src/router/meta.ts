import type { TranslationKey } from '@/i18n/keys'

export type LifeBoardLayoutKind = 'landing' | 'app' | 'minimal'

export type NavigationKey =
  | 'workspace'
  | 'weather'
  | 'todos'
  | 'bookmarks'
  | 'tools'
  | 'settings'

export interface LifeBoardRouteMeta {
  layout: LifeBoardLayoutKind
  navigationKey?: NavigationKey
  titleKey: TranslationKey
  documentTitleKey?: TranslationKey
  restoreScroll?: boolean
}

declare module 'vue-router' {
  interface RouteMeta extends LifeBoardRouteMeta {}
}
