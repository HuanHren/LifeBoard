import type {
  PixiWeatherReferenceLayer,
  PixiWeatherReferenceScene,
} from '@/modules/weather/renderers/pixi/types'

export interface VendorWeatherManifestAsset {
  name: string
  type: string
  url: string
  sha256: string
  width: number
  height: number
  mode: string
  hasAlpha: boolean
  fileSize: number
}

export interface VendorWeatherCatalogAsset {
  id: string
  url: string
  category:
    | 'sky'
    | 'background'
    | 'cloud'
    | 'sun'
    | 'moon'
    | 'glow'
    | 'rain'
    | 'snow'
    | 'fog'
    | 'haze'
    | 'dust'
    | 'lightning'
    | 'droplet'
    | 'frost'
    | 'atlas'
    | 'sequence'
  role: string
  width: number
  height: number
  hasAlpha: boolean
  sourceSha256: string
  fileSha256: string
}

export interface VendorWeatherManifestLayer
  extends Omit<PixiWeatherReferenceLayer, 'speedX' | 'speedY'> {
  speed: {
    x: number
    y: number
  }
  speedX?: number
  speedY?: number
}

export interface VendorWeatherManifestScene {
  layers: VendorWeatherManifestLayer[]
}

export interface VendorWeatherManifest {
  version: 1
  assetSet: 'xiaomi-authorized-transitional'
  status: 'authorized-vendor'
  assets: VendorWeatherManifestAsset[]
  scenes: Record<string, VendorWeatherManifestScene>
}

export type VendorWeatherScene = PixiWeatherReferenceScene & {
  source: 'authorized-vendor'
}
