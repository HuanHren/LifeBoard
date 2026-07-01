import type {
  AssetReference,
  WeatherSceneLayer,
  WeatherScenePreset,
} from '@/modules/weather/scenes/weatherSceneTypes'

export interface WeatherSceneValidationIssue {
  path: string
  message: string
}

const idPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/
const externalUrlProtocols = ['http:', 'https:'] as const
const shaderDisabledMessage = 'Shader layers must remain disabled in v1.'

function isValidId(value: string) {
  return idPattern.test(value)
}

function hasExternalUrl(asset: AssetReference) {
  return [asset.desktop, asset.mobile, asset.fallback].some((source) =>
    [source?.avif, source?.webp, source?.png].some((url) =>
      Boolean(
        url &&
          externalUrlProtocols.some((protocol) =>
            url.startsWith(`${protocol}//`),
          ),
      ),
    ),
  )
}

function validateLayer(
  layer: WeatherSceneLayer,
  assetIds: Set<string>,
  issues: WeatherSceneValidationIssue[],
) {
  if (!isValidId(layer.id)) {
    issues.push({ path: `layers.${layer.id}`, message: 'Layer ID is invalid.' })
  }

  if (layer.zIndex < 0 || layer.zIndex > 20) {
    issues.push({ path: `layers.${layer.id}.zIndex`, message: 'Layer zIndex is out of range.' })
  }

  if ('opacity' in layer && (layer.opacity < 0 || layer.opacity > 1)) {
    issues.push({ path: `layers.${layer.id}.opacity`, message: 'Layer opacity is out of range.' })
  }

  if ('scale' in layer && layer.scale !== undefined && (layer.scale < 0.1 || layer.scale > 3)) {
    issues.push({ path: `layers.${layer.id}.scale`, message: 'Layer scale is out of range.' })
  }

  if ('assetId' in layer && !assetIds.has(layer.assetId)) {
    issues.push({ path: `layers.${layer.id}.assetId`, message: 'Layer references an unknown asset.' })
  }

  if (layer.kind === 'particle' && (layer.maxParticles < 0 || layer.maxParticles > 96)) {
    issues.push({ path: `layers.${layer.id}.maxParticles`, message: 'Particle count is out of range.' })
  }

  if (layer.kind === 'shader' && !Object.is(layer.enabled, false)) {
    issues.push({ path: `layers.${layer.id}.enabled`, message: shaderDisabledMessage })
  }
}

export function validateWeatherScenePreset(
  preset: WeatherScenePreset,
): WeatherSceneValidationIssue[] {
  const issues: WeatherSceneValidationIssue[] = []

  if (!isValidId(preset.id)) {
    issues.push({ path: 'id', message: 'Scene ID is invalid.' })
  }

  if (preset.layers.length > 12) {
    issues.push({ path: 'layers', message: 'Scene has too many layers.' })
  }

  const assetIds = new Set<string>()
  for (const asset of preset.assets) {
    if (!isValidId(asset.id)) {
      issues.push({ path: `assets.${asset.id}`, message: 'Asset ID is invalid.' })
    }

    if (assetIds.has(asset.id)) {
      issues.push({ path: `assets.${asset.id}`, message: 'Asset ID is duplicated.' })
    }

    if (hasExternalUrl(asset)) {
      issues.push({ path: `assets.${asset.id}`, message: 'External URLs are not allowed.' })
    }

    assetIds.add(asset.id)
  }

  if (!assetIds.has(preset.poster.assetId)) {
    issues.push({ path: 'poster.assetId', message: 'Poster references an unknown asset.' })
  }

  if (!assetIds.has(preset.fallback.posterAssetId)) {
    issues.push({ path: 'fallback.posterAssetId', message: 'Fallback poster references an unknown asset.' })
  }

  const layerIds = new Set<string>()
  for (const layer of preset.layers) {
    if (layerIds.has(layer.id)) {
      issues.push({ path: `layers.${layer.id}`, message: 'Layer ID is duplicated.' })
    }

    layerIds.add(layer.id)
    validateLayer(layer, assetIds, issues)
  }

  for (const [tier, setting] of Object.entries(preset.quality)) {
    if (setting.maxParticles > 96) {
      issues.push({ path: `quality.${tier}.maxParticles`, message: 'Quality tier particle cap is too high.' })
    }

    if (setting.maxLayers > 12) {
      issues.push({ path: `quality.${tier}.maxLayers`, message: 'Quality tier layer cap is too high.' })
    }
  }

  if (preset.transitions.durationMs < 0 || preset.transitions.durationMs > 600) {
    issues.push({ path: 'transitions.durationMs', message: 'Transition duration is out of range.' })
  }

  if (
    preset.transitions.disposeOutgoingAfterMs < 0 ||
    preset.transitions.disposeOutgoingAfterMs > 1000
  ) {
    issues.push({ path: 'transitions.disposeOutgoingAfterMs', message: 'Outgoing disposal timing is out of range.' })
  }

  return issues
}
