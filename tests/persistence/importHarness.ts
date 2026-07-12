import type { PersistenceStorageAdapter } from '@/shared/persistence'

export interface FaultStorageOptions {
  readonly failMutationAt?: number
  readonly quotaMutationAt?: number
  readonly mismatchReadBackAt?: number
  readonly failRollbackMutation?: boolean
  readonly mismatchRollbackReadBack?: boolean
}

export interface FaultStorageHarness {
  readonly adapter: PersistenceStorageAdapter
  readonly values: Map<string, string>
  readonly mutations: string[]
  readonly readBacks: string[]
}

export const createFaultStorage = (
  initial: Readonly<Record<string, string>>,
  options: FaultStorageOptions = {},
): FaultStorageHarness => {
  const values = new Map(Object.entries(initial))
  const mutations: string[] = []
  const readBacks: string[] = []
  let mutationCount = 0
  let readBackCount = 0
  let primaryFailure = false

  const mutate = (key: string, value: string | null) => {
    mutationCount += 1
    mutations.push(key)
    if (primaryFailure && options.failRollbackMutation) {
      return { ok: false as const, error: new Error('fixture rollback write failure') }
    }
    if (mutationCount === options.quotaMutationAt) {
      primaryFailure = true
      return { ok: false as const, error: { name: 'QuotaExceededError' } }
    }
    if (mutationCount === options.failMutationAt) {
      primaryFailure = true
      return { ok: false as const, error: new Error('fixture write failure') }
    }
    if (value === null) values.delete(key)
    else values.set(key, value)
    return { ok: true as const }
  }

  const adapter: PersistenceStorageAdapter = Object.freeze({
    read(key) {
      return { ok: true, value: values.get(key) ?? null }
    },
    write(key, value) {
      return mutate(key, value)
    },
    remove(key) {
      return mutate(key, null)
    },
    readBack(key, expectedValue) {
      readBackCount += 1
      readBacks.push(key)
      if (!primaryFailure && readBackCount === options.mismatchReadBackAt) {
        primaryFailure = true
        return { ok: false, matches: false }
      }
      if (primaryFailure && options.mismatchRollbackReadBack) {
        return { ok: false, matches: false }
      }
      return (values.get(key) ?? null) === expectedValue
        ? { ok: true, matches: true }
        : { ok: false, matches: false }
    },
  })
  return { adapter, values, mutations, readBacks }
}

export const createFixtureFile = (
  input: string | Uint8Array,
  options: { readonly name?: string; readonly type?: string; readonly size?: number } = {},
) => {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
  return Object.freeze({
    name: options.name ?? 'lifeboard-backup.json',
    type: options.type ?? 'application/json',
    size: options.size ?? bytes.byteLength,
    async arrayBuffer() {
      return bytes.slice().buffer
    },
  })
}
