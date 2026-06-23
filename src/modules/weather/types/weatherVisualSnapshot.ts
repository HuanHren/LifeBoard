import type { AirQualitySnapshot } from '@/modules/weather/types/airQuality'
import type { WeatherSnapshot } from '@/modules/weather/types/weather'
import type { WeatherLighting } from '@/modules/weather/types/weatherLighting'
import type { WeatherSolarPhaseResult } from '@/modules/weather/types/weatherSolarPhase'
import type { WeatherAlert } from '@/modules/weather/types/weatherAlert'
import type { WeatherAtmosphere } from '@/modules/weather/utils/weatherAtmosphere'
import type { ResolvedWeatherVisual } from '@/modules/weather/visual/types'

export interface WeatherVisualSnapshot {
  identity: string
  visualIdentity: string
  weather: WeatherSnapshot
  locationId: string
  atmosphere: WeatherAtmosphere
  visual: ResolvedWeatherVisual
  solarPhase: WeatherSolarPhaseResult
  lighting: WeatherLighting
  airQuality: AirQualitySnapshot | null
  alerts: WeatherAlert[]
}
