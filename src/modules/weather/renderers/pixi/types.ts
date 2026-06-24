import type {
  Application,
  Container,
  Sprite,
  Texture,
  TextureSource,
  Ticker,
} from 'pixi.js'
import type { LocalWeatherReferenceLayer } from './local-reference'
import type { WeatherTimeline } from '@/modules/weather/visual/types'

export type PixiWeatherRendererStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'static-fallback'
  | 'destroyed'
  | 'error'

export type PixiWeatherVisualKey = 'partly-cloudy-day' | 'partly-cloudy-night'

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
  localLayers: Array<{
    layer: LocalWeatherReferenceLayer
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
