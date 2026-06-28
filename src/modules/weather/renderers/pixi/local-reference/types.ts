import type {
  PixiWeatherReferenceLayer,
  PixiWeatherReferenceScene,
} from '@/modules/weather/renderers/pixi/types'

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

export interface LocalWeatherReferenceLayer extends PixiWeatherReferenceLayer {
  role: LocalWeatherReferenceLayerRole
}

export interface LocalWeatherReferenceScene extends PixiWeatherReferenceScene {
  source: 'local-reference'
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
