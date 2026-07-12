import {
  MAX_PORTABLE_BACKUP_BYTES,
  PORTABLE_BACKUP_FILENAME_PREFIX,
  PORTABLE_BACKUP_MIME_TYPE,
} from './constants'
import {
  createPortableExportError,
  validatePortableBackupV1,
  type PortableExportResult,
} from './portableExportValidation'
import type { PortableBackupV1 } from './types'

export interface PortableBackupDownloadDescriptor {
  readonly filename: string
  readonly mimeType: typeof PORTABLE_BACKUP_MIME_TYPE
  readonly text: string
  readonly byteLength: number
}

export const serializePortableBackupV1 = (
  backup: PortableBackupV1,
): PortableExportResult<string> => {
  const validation = validatePortableBackupV1(backup)
  if (!validation.ok) return validation

  try {
    const serialized = JSON.stringify(backup, null, 2)
    if (typeof serialized !== 'string') {
      throw new TypeError('Portable backup serialization did not return text.')
    }
    return { ok: true, data: `${serialized}\n` }
  } catch {
    return {
      ok: false,
      error: createPortableExportError(
        'PORTABLE_SERIALIZATION_FAILED',
        'root',
        '/',
        'Portable backup serialization failed.',
      ),
    }
  }
}

export const createPortableBackupDownload = (
  backup: PortableBackupV1,
): PortableExportResult<PortableBackupDownloadDescriptor> => {
  const serialized = serializePortableBackupV1(backup)
  if (!serialized.ok) return serialized

  try {
    const byteLength = new TextEncoder().encode(serialized.data).byteLength
    if (byteLength > MAX_PORTABLE_BACKUP_BYTES) {
      return {
        ok: false,
        error: createPortableExportError(
          'PORTABLE_BACKUP_TOO_LARGE',
          'file',
          null,
          'Portable backup exceeds the 1 MiB export limit.',
          { details: { byteLength, maximumBytes: MAX_PORTABLE_BACKUP_BYTES } },
        ),
      }
    }

    return {
      ok: true,
      data: Object.freeze({
        filename: `${PORTABLE_BACKUP_FILENAME_PREFIX}-${backup.exportedAt.slice(0, 10)}.json`,
        mimeType: PORTABLE_BACKUP_MIME_TYPE,
        text: serialized.data,
        byteLength,
      }),
    }
  } catch {
    return {
      ok: false,
      error: createPortableExportError(
        'PORTABLE_DOWNLOAD_PREPARE_FAILED',
        'file',
        null,
        'Portable backup download metadata could not be prepared.',
      ),
    }
  }
}
