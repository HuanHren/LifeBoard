import { describe, expect, it } from 'vitest'
import {
  createPortableBackupExport,
  executeReplaceImport,
  preparePortableImportValue,
  type PortableBackupV1,
} from '@/shared/persistence'
import {
  emptyPortableBackupV1,
  nonPortableSentinelStorage,
  validPortableBackupV1,
  validPortableExportStorage,
} from './fixtures'
import { createFaultStorage } from './importHarness'
import { createInstrumentedStorage } from './storageHarness'

const noOpHydration = {
  hydrate: () => true,
  verify: () => true,
  restore: () => true,
  verifyRestore: () => true,
}

const runRoundTrip = (backup: PortableBackupV1) => {
  const prepared = preparePortableImportValue(backup, { currentLanguage: 'en-US', currentThemeMode: 'system' })
  expect(prepared.ok).toBe(true)
  if (!prepared.ok) throw new Error(prepared.error.code)
  const storage = createFaultStorage({ ...validPortableExportStorage, ...nonPortableSentinelStorage })
  const imported = executeReplaceImport({ storage: storage.adapter, prepared: prepared.data, hydration: noOpHydration })
  expect(imported.ok).toBe(true)
  const exported = createPortableBackupExport({
    storage: storage.adapter,
    exportedAt: backup.exportedAt,
    appVersion: backup.app.version,
  })
  expect(exported.ok).toBe(true)
  if (!exported.ok) throw new Error(exported.error.code)
  return { storage, exported: exported.data.backup }
}

describe('portable export/import round trip', () => {
  it.each([
    ['complete', validPortableBackupV1],
    ['empty', emptyPortableBackupV1],
  ] as const)('preserves %s portable data semantically', (_label, backup) => {
    const result = runRoundTrip(backup)
    expect(result.exported.data).toEqual(backup.data)
    expect(result.exported.locale).toBe(backup.locale)
  })

  it('preserves Unicode, IDs, dates, and array order', () => {
    const backup = JSON.parse(JSON.stringify(validPortableBackupV1)) as PortableBackupV1
    ;(backup.data.todos.payload.tasks[0] as { title: string }).title = '整理照片 - 東京'
    const result = runRoundTrip(backup)
    expect(result.exported.data.todos.payload.tasks).toEqual(backup.data.todos.payload.tasks)
  })

  it('keeps secrets, cache, device preferences, and debug state unchanged', () => {
    const result = runRoundTrip(validPortableBackupV1)
    for (const [key, value] of Object.entries(nonPortableSentinelStorage)) {
      expect(result.storage.values.get(key)).toBe(value)
      expect(JSON.stringify(result.exported)).not.toContain(value)
    }
  })

  it('new exporter output is accepted by the new importer', () => {
    const exported = createPortableBackupExport({
      storage: createInstrumentedStorage(validPortableExportStorage).adapter,
      exportedAt: '2026-07-12T06:30:00.000Z',
      appVersion: 'fixture',
    })
    expect(exported.ok).toBe(true)
    if (!exported.ok) return
    expect(preparePortableImportValue(JSON.parse(exported.data.download.text), {
      currentLanguage: 'en-US',
      currentThemeMode: 'system',
    }).ok).toBe(true)
  })
})
