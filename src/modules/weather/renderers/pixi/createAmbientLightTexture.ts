import type { Texture, TextureSource } from 'pixi.js'
import type { PixiWeatherVisualKey } from '@/modules/weather/renderers/pixi/types'

type PixiModule = typeof import('pixi.js')

export function createAmbientLightTexture(
  pixi: PixiModule,
  visualKey: PixiWeatherVisualKey,
): { texture: Texture; source: TextureSource } {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 180

  const context = canvas.getContext('2d')

  if (context) {
    const isNight = visualKey === 'partly-cloudy-night'
    const gradient = context.createRadialGradient(230, 48, 8, 230, 48, 150)

    gradient.addColorStop(
      0,
      isNight ? 'rgba(210, 220, 232, 0.34)' : 'rgba(255, 245, 218, 0.42)',
    )
    gradient.addColorStop(
      0.52,
      isNight ? 'rgba(132, 150, 172, 0.16)' : 'rgba(255, 232, 184, 0.16)',
    )
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  const texture = pixi.Texture.from(canvas, true)

  texture.label = 'lifeboard-weather-ambient'

  return {
    texture,
    source: texture.source,
  }
}
