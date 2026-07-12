import { describe, expect, it } from 'vitest'
import {
  adaptLegacyBackupV1,
  adaptLegacyBackupV2,
  validatePortableBackupV1,
} from '@/shared/persistence'
import { validLegacyBackupV1, validLegacyBackupV2 } from './fixtures'

describe('explicit legacy backup adapters', () => {
  it.each([
    [adaptLegacyBackupV1, validLegacyBackupV1, 'legacy-v1'],
    [adaptLegacyBackupV2, validLegacyBackupV2, 'legacy-v2'],
  ] as const)('adapts and revalidates %s', (adapter, fixture, version) => {
    const result = adapter(fixture, { currentLanguage: 'en-US' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.app.version).toBe(version)
    expect(result.data.locale).toBe('en-US')
    expect(result.data.data.settings.payload.language).toBe('en-US')
    expect(validatePortableBackupV1(result.data).ok).toBe(true)
  })

  it('maps legacy v1 missing favorites to an empty collection', () => {
    const result = adaptLegacyBackupV1(validLegacyBackupV1, { currentLanguage: 'zh-CN' })
    expect(result.ok && result.data.data.weather.payload.favoriteCities).toEqual([])
  })

  it('preserves legacy v2 favorite cities', () => {
    const result = adaptLegacyBackupV2(validLegacyBackupV2, { currentLanguage: 'zh-CN' })
    expect(result.ok && result.data.data.weather.payload.favoriteCities).toHaveLength(1)
  })

  it('rejects unknown fields instead of guessing', () => {
    expect(adaptLegacyBackupV1({ ...validLegacyBackupV1, language: 'zh-CN' }, { currentLanguage: 'en-US' }).ok).toBe(false)
    expect(adaptLegacyBackupV2({ ...validLegacyBackupV2, token: 'fixture-secret' }, { currentLanguage: 'en-US' }).ok).toBe(false)
  })

  it('does not mutate legacy input', () => {
    const before = JSON.stringify(validLegacyBackupV2)
    adaptLegacyBackupV2(validLegacyBackupV2, { currentLanguage: 'en-US' })
    expect(JSON.stringify(validLegacyBackupV2)).toBe(before)
  })
})
