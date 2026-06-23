export function isSaveDataEnabled() {
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean }
  }).connection as
    | { saveData?: boolean }
    | undefined

  return connection?.saveData === true
}

export function canCreateWebGlContext() {
  const canvas = document.createElement('canvas')
  const context =
    canvas.getContext('webgl2') ??
    canvas.getContext('webgl')

  if (!context) {
    return false
  }

  const loseContext = context.getExtension('WEBGL_lose_context')
  loseContext?.loseContext()

  return true
}

export function getCappedResolution(isMobile: boolean) {
  const dpr = window.devicePixelRatio || 1
  const cap = isMobile ? 1.25 : 1.5

  return Math.max(1, Math.min(dpr, cap))
}
