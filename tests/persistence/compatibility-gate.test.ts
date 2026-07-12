import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLifeBoardBackup } from '@/modules/settings/services/settingsBackup'
import { validateLifeBoardBackup } from '@/modules/settings/utils/settingsBackupValidation'
import { preparePortableImportValue } from '@/shared/persistence'
import {
  validLegacyBackupV1,
  validLegacyBackupV2,
  validPortableExportStorage,
} from './fixtures'

const installStorage = () => {
  const values = new Map(Object.entries(validPortableExportStorage))
  const localStorage = {
    get length() { return values.size },
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  }
  vi.stubGlobal('window', { localStorage })
}

afterEach(() => vi.unstubAllGlobals())

describe('Stage 43 production compatibility gate', () => {
  it('confirms the production exporter now creates PortableBackupV1', () => {
    installStorage()
    const result = createLifeBoardBackup({ themeMode: 'system', language: 'en-US' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.backup).toMatchObject({
      format: 'lifeboard-backup',
      schemaVersion: 1,
      locale: 'zh-CN',
    })
    expect(result.data.download.filename).toMatch(/^lifeboard-backup-v1-\d{4}-\d{2}-\d{2}\.json$/)
    expect(result.data.download.mimeType).toBe('application/json;charset=utf-8')
  })

  it('accepts a new production export through the current importer', () => {
    installStorage()
    const exported = createLifeBoardBackup({ themeMode: 'system', language: 'en-US' })
    expect(exported.ok).toBe(true)
    if (!exported.ok) return
    const imported = preparePortableImportValue(JSON.parse(exported.data.download.text), {
      currentLanguage: 'en-US',
      currentThemeMode: 'system',
    })
    expect(imported).toMatchObject({ ok: true, data: { sourceFormat: 'portable-v1' } })
  })

  it.each([
    [validLegacyBackupV1, 'legacy-v1'],
    [validLegacyBackupV2, 'legacy-v2'],
  ] as const)('keeps legacy production backup compatibility for %s', (fixture, sourceFormat) => {
    expect(validateLifeBoardBackup(fixture).ok).toBe(true)
    expect(preparePortableImportValue(fixture, {
      currentLanguage: 'en-US',
      currentThemeMode: 'system',
    })).toMatchObject({ ok: true, data: { sourceFormat } })
  })
})
