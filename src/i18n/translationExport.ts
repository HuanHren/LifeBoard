import { catalogs } from '@/i18n/catalog'
import { translationKeys } from '@/i18n/keys'
import { getTranslationNote } from '@/i18n/translationNotes'
import type { TranslationSourceDocument } from '@/i18n/types'

export function createTranslationSource(
  generatedAt = new Date(),
): TranslationSourceDocument {
  return {
    schemaVersion: 1,
    generatedAt: generatedAt.toISOString(),
    sourceLocales: ['zh-CN', 'en-US'],
    entries: [...translationKeys]
      .sort((left, right) => left.localeCompare(right))
      .map((key) => ({
        key,
        'zh-CN': catalogs['zh-CN'][key],
        'en-US': catalogs['en-US'][key],
        note: getTranslationNote(key),
      })),
  }
}

export function downloadTranslationSource(generatedAt = new Date()) {
  const source = createTranslationSource(generatedAt)
  const blob = new Blob([JSON.stringify(source, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const filename = `lifeboard-translations-${source.generatedAt.slice(0, 10)}.json`

  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  return filename
}
