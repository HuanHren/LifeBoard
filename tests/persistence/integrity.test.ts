import { describe, expect, it } from 'vitest'
import {
  PERSISTENCE_REGISTRY,
  PRODUCT_STORAGE_KEYS,
  validatePersistenceRegistryDefinition,
  type PersistenceRegistryEntry,
} from '@/shared/persistence'

const withReplacement = (
  id: PersistenceRegistryEntry['id'],
  replacement: Partial<PersistenceRegistryEntry>,
) =>
  PERSISTENCE_REGISTRY.map((entry) =>
    entry.id === id ? ({ ...entry, ...replacement } as PersistenceRegistryEntry) : entry,
  )

const issueCodes = (entries: readonly PersistenceRegistryEntry[]) =>
  validatePersistenceRegistryDefinition(entries).issues.map((issue) => issue.code)

describe('registry integrity validation', () => {
  it('accepts the product registry', () => {
    expect(validatePersistenceRegistryDefinition(PERSISTENCE_REGISTRY)).toEqual({
      valid: true,
      issues: [],
    })
  })

  it('detects duplicate ids', () => {
    const entries = withReplacement('bookmarks', { id: 'todos' })
    expect(issueCodes(entries)).toContain('registry.duplicate-id')
  })

  it('detects duplicate storage keys', () => {
    const entries = withReplacement('bookmarks', { storageKey: 'lifeboard.todos' })
    expect(issueCodes(entries)).toContain('registry.duplicate-storage-key')
  })

  it('detects invalid categories', () => {
    const entries = withReplacement('theme-mode', {
      category: 'invalid' as PersistenceRegistryEntry['category'],
    })
    expect(issueCodes(entries)).toContain('registry.invalid-category')
  })

  it('detects invalid portable policies', () => {
    const entries = withReplacement('theme-mode', {
      portable: 'yes' as unknown as true,
    })
    expect(issueCodes(entries)).toContain('registry.invalid-portable-policy')
  })

  it.each([
    ['weather-caiyun-token', 'registry.secret-portable-conflict'],
    ['weather-forecast-cache', 'registry.cache-portable-conflict'],
  ] as const)('detects %s portability conflicts', (id, code) => {
    const entries = withReplacement(id, {
      portable: true,
      portableNamespace: 'weather',
      schemaVersion: 1,
    })
    expect(issueCodes(entries)).toContain(code)
  })

  it('detects a missing portable namespace', () => {
    const entries = withReplacement('theme-mode', {
      portableNamespace: null,
    } as unknown as Partial<PersistenceRegistryEntry>)
    expect(issueCodes(entries)).toContain('registry.missing-namespace')
  })

  it('detects a missing portable schema version', () => {
    const entries = withReplacement('theme-mode', {
      schemaVersion: null,
    } as unknown as Partial<PersistenceRegistryEntry>)
    expect(issueCodes(entries)).toContain('registry.missing-schema-version')
  })

  it('detects a missing Language contract entry', () => {
    const entries = PERSISTENCE_REGISTRY.filter((entry) => entry.id !== 'language')
    expect(issueCodes(entries)).toContain('registry.language-contract')
  })

  it('detects Weather cache accidentally made portable', () => {
    const entries = withReplacement('weather-forecast-cache', {
      portable: true,
      portableNamespace: 'weather',
      schemaVersion: 1,
    })
    expect(issueCodes(entries)).toContain('registry.weather-cache-contract')
  })

  it('detects incomplete factory reset coverage', () => {
    const entries = withReplacement('language', { factoryReset: false })
    expect(issueCodes(entries)).toContain('registry.factory-reset-coverage')
  })

  it('detects a device-local Weather preference made portable', () => {
    const entries = withReplacement('weather-provider', {
      portable: true,
      portableNamespace: 'weather',
      schemaVersion: 1,
    })
    expect(issueCodes(entries)).toContain('registry.device-local-contract')
  })

  it('detects saved Weather location data excluded from portability', () => {
    const entries = withReplacement('weather-location', {
      portable: false,
      portableNamespace: null,
      schemaVersion: null,
    })
    expect(issueCodes(entries)).toContain('registry.weather-portable-contract')
  })

  it('detects the development debug flag even with a matching expected inventory', () => {
    const debugKey = '__lifeboard_weather_runtime_debug'
    const entries = withReplacement('theme-mode', { storageKey: debugKey })
    const expectedKeys = PRODUCT_STORAGE_KEYS.map((key) =>
      key === 'lifeboard-theme' ? debugKey : key,
    )
    const result = validatePersistenceRegistryDefinition(entries, expectedKeys)
    expect(result.issues.map((issue) => issue.code)).toContain('registry.development-flag')
  })
})
