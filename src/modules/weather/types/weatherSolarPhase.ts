export type WeatherSolarPhase =
  | 'pre-dawn'
  | 'sunrise-transition'
  | 'day'
  | 'late-day'
  | 'golden-hour'
  | 'dusk'
  | 'night'

export type WeatherSolarPhaseSource =
  | 'sunrise-sunset'
  | 'provider-is-day'
  | 'location-hour'
  | 'browser-hour'
  | 'safe-fallback'

export interface WeatherSolarPhaseResult {
  phase: WeatherSolarPhase
  source: WeatherSolarPhaseSource
  nextBoundaryAt: number | null
}
