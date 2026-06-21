export type WeatherLightingForegroundMode = 'light' | 'dark'

export interface WeatherLighting {
  lightLevel: number
  lightWarmth: number
  lightX: number
  lightY: number
  ambientOpacity: number
  highlightOpacity: number
  hazeOpacity: number
  cloudShadowOpacity: number
  contrastStrength: number
  nightDepth: number
  precipitationOpacity: number
  snowLightOpacity: number
  stormShadowOpacity: number
  foregroundMode: WeatherLightingForegroundMode
}
