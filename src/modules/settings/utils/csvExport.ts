const UTF8_BOM = '\uFEFF'

function shouldQuote(value: string) {
  return /[",\r\n]/.test(value)
}

function escapeCsvField(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) return ''

  const text = String(value)
  if (!shouldQuote(text)) return text

  return `"${text.replaceAll('"', '""')}"`
}

export function createCsv(headers: string[], rows: Array<Array<string | boolean | null>>) {
  const lines = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ]

  return `${UTF8_BOM}${lines.join('\r\n')}`
}

export function hasUtf8Bom(content: string) {
  return content.charCodeAt(0) === 0xfeff
}
