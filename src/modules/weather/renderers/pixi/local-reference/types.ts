import type {
  WeatherEffectGroup,
  WeatherTimeline,
} from '@/modules/weather/visual/types'

export type LocalWeatherReferenceLayerRole =
  | 'air-dust'
  | 'fine-dust'
  | 'fog-bank'
  | 'frost'
  | 'haze'
  | 'heavy-rain'
  | 'heavy-snow'
  | 'high-cloud'
  | 'low-cloud'
  | 'mid-cloud'
  | 'mist'
  | 'moonlight'
  | 'rain'
  | 'rain-cloud'
  | 'sand-cloud'
  | 'sleet-rain'
  | 'sleet-snow'
  | 'snow'
  | 'snow-cloud'
  | 'snow-haze'
  | 'storm-cloud'
  | 'storm-rain'
  | 'sunlight'
  | 'thick-cloud'
  | 'thin-cloud'

export interface LocalWeatherReferenceLayer {
  type: 'image'
  url: string
  role: LocalWeatherReferenceLayerRole
  opacity: number
  speedX: number
  speedY: number
  scale: number
  fit: 'cover'
  assetType: string
}

export interface LocalWeatherReferenceScene {
  key: string
  source: 'local-reference'
  effectGroup: WeatherEffectGroup
  timeline: Extract<WeatherTimeline, 'day' | 'night'>
  layers: LocalWeatherReferenceLayer[]
}

export interface LocalWeatherReferenceManifestScene {
  layers: LocalWeatherReferenceLayer[]
}

export interface LocalWeatherReferenceManifest {
  version: 1
  source: 'local-reference'
  scenes: Record<string, LocalWeatherReferenceManifestScene>
}
