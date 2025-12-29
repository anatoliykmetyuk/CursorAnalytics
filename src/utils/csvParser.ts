import { CursorUsageRecord } from '../types'

/**
 * Parses a CSV file content string into an array of CursorUsageRecord objects
 * @param csvContent - The CSV file content as a string
 * @returns Array of parsed CursorUsageRecord objects
 * @throws Error if CSV format is invalid or required fields are missing
 */
export function parseCSV(csvContent: string): CursorUsageRecord[] {
  const lines = csvContent.trim().split('\n')

  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row')
  }

  const headerLine = lines[0]
  const headers = parseCSVLine(headerLine)

  // Expected headers (case-insensitive)
  const expectedHeaders = [
    'Date', 'Kind', 'Model', 'Max Mode',
    'Input (w/ Cache Write)', 'Input (w/o Cache Write)',
    'Cache Read', 'Output Tokens', 'Total Tokens', 'Cost'
  ]

  const headerMap = new Map<string, number>()
  headers.forEach((header, index) => {
    const normalizedHeader = header.trim()
    headerMap.set(normalizedHeader, index)
  })

  // Validate required headers exist
  for (const expectedHeader of expectedHeaders) {
    const found = Array.from(headerMap.keys()).some(
      h => h.toLowerCase() === expectedHeader.toLowerCase()
    )
    if (!found) {
      throw new Error(`Missing required column: ${expectedHeader}`)
    }
  }

  const records: CursorUsageRecord[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Skip empty lines

    try {
      const values = parseCSVLine(line)
      const record = parseRecord(values, headerMap)
      records.push(record)
    } catch (error) {
      throw new Error(`Error parsing line ${i + 1}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return records
}

/**
 * Parses a CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  // Add last field
  values.push(current.trim())

  return values
}

/**
 * Parses a record from CSV values using the header map
 */
function parseRecord(values: string[], headerMap: Map<string, number>): CursorUsageRecord {
  const getValue = (headerName: string): string => {
    const index = Array.from(headerMap.entries()).find(
      ([key]) => key.toLowerCase() === headerName.toLowerCase()
    )?.[1]

    if (index === undefined || index >= values.length) {
      throw new Error(`Missing value for column: ${headerName}`)
    }

    // Remove surrounding quotes if present
    let value = values[index].trim()
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }

    return value
  }

  const dateStr = getValue('Date')
  const date = parseDate(dateStr)

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`)
  }

  return {
    date,
    kind: getValue('Kind'),
    model: getValue('Model'),
    maxMode: getValue('Max Mode'),
    inputWithCacheWrite: parseNumber(getValue('Input (w/ Cache Write)')),
    inputWithoutCacheWrite: parseNumber(getValue('Input (w/o Cache Write)')),
    cacheRead: parseNumber(getValue('Cache Read')),
    outputTokens: parseNumber(getValue('Output Tokens')),
    totalTokens: parseNumber(getValue('Total Tokens')),
    cost: parseNumber(getValue('Cost')),
  }
}

/**
 * Parses a date string (ISO 8601 format)
 */
function parseDate(dateStr: string): Date {
  // Handle ISO 8601 format: "2025-12-28T12:05:02.926Z"
  const date = new Date(dateStr)
  return date
}

/**
 * Parses a number string, handling empty strings and invalid values
 */
function parseNumber(numStr: string): number {
  const cleaned = numStr.trim().replace(/"/g, '')
  if (cleaned === '' || cleaned === 'null' || cleaned === 'undefined') {
    return 0
  }

  const num = parseFloat(cleaned)
  if (isNaN(num)) {
    return 0
  }

  return num
}

