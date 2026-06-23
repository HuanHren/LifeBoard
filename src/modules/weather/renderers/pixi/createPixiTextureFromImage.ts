import type { ImageSource, Texture } from 'pixi.js'

type PixiModule = typeof import('pixi.js')

export function createPixiTextureFromImage(
  pixi: PixiModule,
  imageElement: HTMLImageElement,
): { texture: Texture; source: ImageSource } {
  const source = new pixi.ImageSource({
    resource: imageElement,
    width: imageElement.naturalWidth,
    height: imageElement.naturalHeight,
  })
  const texture = new pixi.Texture({
    source,
    label: 'lifeboard-weather-base',
  })

  return { texture, source }
}
