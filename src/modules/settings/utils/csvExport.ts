const UTF8_BOM = '\uFEFF'

export type CsvFieldValue = string | number | boolean | null | undefined

export interface CsvCell {
  readonly value: CsvFieldValue
  readonly protectFormula: boolean
}

export const csvText = (value: CsvFieldValue): CsvCell => ({
  value,
  protectFormula: true,
})

export const csvValue = (value: CsvFieldValue): CsvCell => ({
  value,
  protectFormula: false,
})

function shouldQuote(value: string) {
  return /[",\r\n]/.test(value) || /^\s|\s$/.test(value)
}

export function neutralizeCsvFormula(value: string) {
  return /^[ ]*[=+\-@\t\r]/.test(value) ? `'${value}` : value
}

export function escapeCsvField(cell: CsvCell) {
  const { value } = cell
  if (value === null || value === undefined) return ''

  const raw = String(value)
  const safe = cell.protectFormula ? neutralizeCsvFormula(raw) : raw
  const text = safe.replace(/\r\n|\r|\n/g, '\r\n')
  if (!shouldQuote(text)) return text

  return `"${text.replaceAll('"', '""')}"`
}

export function createCsv(
  headers: readonly string[],
  rows: readonly (readonly CsvCell[])[],
) {
  if (rows.some((row) => row.length !== headers.length)) {
    throw new Error('CSV row does not match the fixed column contract.')
  }

  const lines = [
    headers.map((header) => escapeCsvField(csvValue(header))).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ]

  return `${UTF8_BOM}${lines.join('\r\n')}`
}

export function hasUtf8Bom(content: string) {
  return content.charCodeAt(0) === 0xfeff
}
