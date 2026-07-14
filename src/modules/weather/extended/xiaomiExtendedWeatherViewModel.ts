export type XiaomiRecentMetricId =
  | 'temperature'
  | 'feelsLike'
  | 'humidity'
  | 'pressure'
  | 'visibility'
  | 'windSpeed'

export type XiaomiRecentMetricUnit = 'celsius' | 'percent' | 'hectopascals' | 'kilometres' | 'kilometres-per-hour'

export type XiaomiChangeDirection = 'increase' | 'decrease' | 'unchanged'

export interface XiaomiMinutelySummaryViewModel {
  summary: string
  detail?: string
  advice?: string
  observedAt?: string
}

export interface XiaomiRecentMetricViewModel {
  id: XiaomiRecentMetricId
  unit: XiaomiRecentMetricUnit
  previousValue: number
  currentValue: number
  delta: number
  direction: XiaomiChangeDirection
}

export interface XiaomiRecentChangesViewModel {
  observedAt: string
  metrics: XiaomiRecentMetricViewModel[]
}

export interface XiaomiAttributionViewModel {
  sourceNames: string[]
  updatedAt: string
}

export interface XiaomiExtendedWeatherViewModel {
  minutely?: XiaomiMinutelySummaryViewModel
  recentChanges?: XiaomiRecentChangesViewModel
  attribution?: XiaomiAttributionViewModel
}

export type XiaomiExtendedDiagnosticCode =
  | 'invalid-minutely'
  | 'invalid-previous-hour'
  | 'invalid-attribution'
  | 'secret-field'

export interface XiaomiExtendedDiagnostic {
  path: string
  code: XiaomiExtendedDiagnosticCode
}

export interface XiaomiExtendedAdapterResult {
  viewModel?: XiaomiExtendedWeatherViewModel
  diagnostics: XiaomiExtendedDiagnostic[]
}
