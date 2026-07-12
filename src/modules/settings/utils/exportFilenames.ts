function getDateStamp(date: Date) {
  if (Object.getPrototypeOf(date) !== Date.prototype || !Number.isFinite(date.getTime())) {
    throw new Error('Export date is invalid.')
  }
  return date.toISOString().slice(0, 10)
}

export function createPortableExportFilename(
  scope: 'todos' | 'bookmarks' | 'summary',
  extension: 'md' | 'csv',
  generatedAt: Date,
) {
  return `lifeboard-${scope}-${getDateStamp(generatedAt)}.${extension}`
}
