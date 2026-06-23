import type { Sprite } from 'pixi.js'

export function fitWeatherSprite({
  sprite,
  containerWidth,
  containerHeight,
  sourceWidth,
  sourceHeight,
  extraScale,
}: {
  sprite: Sprite
  containerWidth: number
  containerHeight: number
  sourceWidth: number
  sourceHeight: number
  extraScale: number
}) {
  if (
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    sourceWidth <= 0 ||
    sourceHeight <= 0
  ) {
    return
  }

  const coverScale =
    Math.max(containerWidth / sourceWidth, containerHeight / sourceHeight) *
    extraScale

  sprite.anchor.set(0.5)
  sprite.position.set(containerWidth / 2, containerHeight / 2)
  sprite.scale.set(coverScale)
}
