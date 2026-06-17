function getDateStamp(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function createPortableExportFilename(
  scope: 'todos' | 'bookmarks' | 'summary',
  extension: 'md' | 'csv',
  generatedAt: Date,
) {
  return `lifeboard-${scope}-${getDateStamp(generatedAt)}.${extension}`
}
