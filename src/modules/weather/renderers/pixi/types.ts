import type {
  Application,
  Container,
  Sprite,
  Texture,
  TextureSource,
  Ticker,
  Graphics,
} from 'pixi.js'
import type {
  WeatherEffectGroup,
  WeatherIntensity,
  WeatherIntensityPreset,
  WeatherTimeline,
} from '@/modules/weather/visual/types'

export type PixiWeatherRendererStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'static-fallback'
  | 'destroyed'
  | 'error'

export type PixiWeatherVisualKey = 'partly-cloudy-day' | 'partly-cloudy-night'

export type PixiWeatherReferenceSceneSource =
  | 'authorized-vendor'
  | 'local-reference'

export interface PixiWeatherReferenceLayer {
  type: 'image'
  url: string
  role: string
  opacity: number
  speedX: number
  speedY: number
  scale: number
  fit: 'cover'
  assetType: string
  blendMode?: 'normal'
}

export interface PixiWeatherReferenceScene {
  key: string
  source: PixiWeatherReferenceSceneSource
  effectGroup: WeatherEffectGroup
  intensity: WeatherIntensity
  intensityPreset: WeatherIntensityPreset
  timeline: Extract<WeatherTimeline, 'day' | 'night'>
  isThunderstorm: boolean
  layers: PixiWeatherReferenceLayer[]
}

export interface PixiWeatherSceneOptions {
  driftX: number
  driftY: number
  scale: number
  ambientOpacity: number
  maxFps: number
}

export interface PixiWeatherSceneInput {
  visualKey: PixiWeatherVisualKey
  timeline: Extract<WeatherTimeline, 'day' | 'night'>
  imageElement: HTMLImageElement
  reducedMotion: boolean
}

export interface PixiWeatherSceneHandles {
  app: Application
  scene: Container
  baseSprite?: Sprite
  ambientSprite?: Sprite
  baseTexture?: Texture
  baseTextureSource?: TextureSource
  ambientTexture?: Texture
  ambientTextureSource?: TextureSource
  thunderOverlay?: Graphics
  localLayers: Array<{
    layer: PixiWeatherReferenceLayer
    sprite: Sprite
    phase: number
  }>
  onTick: (ticker: Ticker) => void
}

export interface PixiWeatherMetrics {
  canvasWidth: number
  canvasHeight: number
  dpr: number
  maxFps: number
  initMs: number
  readyMs: number
  rendererType: string
}
