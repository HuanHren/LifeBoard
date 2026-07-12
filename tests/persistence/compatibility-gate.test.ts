import { describe, expect, it } from 'vitest'
import { createLifeBoardBackup } from '@/modules/settings/services/settingsBackup'
import { validateLifeBoardBackup } from '@/modules/settings/utils/settingsBackupValidation'
import { buildPortableBackupV1 } from '@/shared/persistence'
import { portableFixtureTimestamp, validPortableExportStorage } from './fixtures'
import { createInstrumentedStorage } from './storageHarness'

describe('Stage 42 production compatibility gate', () => {
  it('confirms the current production exporter still creates legacy root v2', () => {
    const backup = createLifeBoardBackup({
      themeMode: 'system',
      weatherLocation: null,
      weatherFavoriteCities: [],
      todos: { version: 1, tasks: [], countdowns: [] },
      bookmarks: { version: 1, bookmarks: [] },
    })
    expect(backup.version).toBe(2)
    expect(backup).not.toHaveProperty('format')
    expect(validateLifeBoardBackup(backup).ok).toBe(true)
  })

  it('confirms the current importer rejects PortableBackupV1', () => {
    const portable = buildPortableBackupV1({
      storage: createInstrumentedStorage(validPortableExportStorage).adapter,
      exportedAt: portableFixtureTimestamp,
    })
    expect(portable.ok).toBe(true)
    if (!portable.ok) return
    expect(validateLifeBoardBackup(portable.data)).toEqual({
      ok: false,
      error: 'settings.error.backupIncomplete',
    })
  })

  it('therefore keeps production cutover deferred until Stage 43', () => {
    const portable = buildPortableBackupV1({
      storage: createInstrumentedStorage(validPortableExportStorage).adapter,
      exportedAt: portableFixtureTimestamp,
    })
    expect(portable.ok).toBe(true)
    if (!portable.ok) return
    const productionCutoverAllowed = validateLifeBoardBackup(portable.data).ok
    expect(productionCutoverAllowed).toBe(false)
  })
})
