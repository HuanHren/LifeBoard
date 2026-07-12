import type { PersistenceStorageAdapter } from '@/shared/persistence'

export interface InstrumentedStorage {
  readonly adapter: PersistenceStorageAdapter
  readonly reads: readonly string[]
}

export const createInstrumentedStorage = (
  values: Readonly<Record<string, string>>,
  failReadKey?: string,
): InstrumentedStorage => {
  const reads: string[] = []
  const adapter: PersistenceStorageAdapter = Object.freeze({
    read(key) {
      reads.push(key)
      return key === failReadKey
        ? { ok: false, error: new Error('fixture read failure') }
        : { ok: true, value: values[key] ?? null }
    },
    write() {
      throw new Error('Portable export must not write storage.')
    },
    remove() {
      throw new Error('Portable export must not remove storage.')
    },
    readBack() {
      throw new Error('Portable export must not verify writes.')
    },
  })

  return Object.freeze({ adapter, reads })
}
