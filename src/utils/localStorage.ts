const BILLING_PERIOD_DAY_KEY = 'cursor-analytics-billing-period-day'
const MONTHLY_COST_LIMIT_KEY = 'cursor-analytics-monthly-cost-limit'
const CSV_DATA_KEY = 'cursor-analytics-csv-data'

export function getBillingPeriodDay(): number {
  const stored = localStorage.getItem(BILLING_PERIOD_DAY_KEY)
  if (stored === null) {
    return 1 // Default value
  }
  const day = parseInt(stored, 10)
  return isNaN(day) || day < 1 || day > 31 ? 1 : day
}

export function setBillingPeriodDay(day: number): void {
  if (day >= 1 && day <= 31) {
    localStorage.setItem(BILLING_PERIOD_DAY_KEY, day.toString())
  }
}

export function getMonthlyCostLimit(): number | null {
  const stored = localStorage.getItem(MONTHLY_COST_LIMIT_KEY)
  if (stored === null || stored === '') {
    return null
  }
  const limit = parseFloat(stored)
  return isNaN(limit) || limit < 0 ? null : limit
}

export function setMonthlyCostLimit(limit: number | null): void {
  if (limit === null || limit === undefined || limit === 0) {
    localStorage.removeItem(MONTHLY_COST_LIMIT_KEY)
  } else if (limit > 0) {
    localStorage.setItem(MONTHLY_COST_LIMIT_KEY, limit.toString())
  }
}

import { CursorUsageRecord } from '../types'

export function saveCSVData(records: CursorUsageRecord[]): void {
  try {
    // Convert Date objects to ISO strings for JSON serialization
    const serializable = records.map(record => ({
      ...record,
      date: record.date.toISOString(),
    }))
    const serialized = JSON.stringify(serializable)
    localStorage.setItem(CSV_DATA_KEY, serialized)
  } catch (error) {
    console.error('Failed to save CSV data to localStorage:', error)
  }
}

export function loadCSVData(): CursorUsageRecord[] | null {
  try {
    const stored = localStorage.getItem(CSV_DATA_KEY)
    if (stored === null) {
      return null
    }
    const parsed = JSON.parse(stored) as Array<Omit<CursorUsageRecord, 'date'> & { date: string }>
    // Convert ISO strings back to Date objects
    return parsed.map((record) => ({
      ...record,
      date: new Date(record.date),
    })) as CursorUsageRecord[]
  } catch (error) {
    console.error('Failed to load CSV data from localStorage:', error)
    return null
  }
}

export function deleteCSVData(): void {
  localStorage.removeItem(CSV_DATA_KEY)
}

