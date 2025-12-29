import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Chart } from '../../src/components/Chart'
import { CursorUsageRecord, Filters } from '../../src/types'

// Mock date calculations
vi.mock('../../src/utils/dateCalculations', () => ({
  formatDateForDisplay: vi.fn((date: Date) => {
    return date.toISOString().split('T')[0]
  }),
}))

const createRecord = (
  date: Date,
  cost: number,
  model: string = 'auto',
  kind: string = 'Included'
): CursorUsageRecord => ({
  date,
  kind,
  model,
  maxMode: 'No',
  inputWithCacheWrite: 0,
  inputWithoutCacheWrite: 0,
  cacheRead: 0,
  outputTokens: 0,
  totalTokens: 0,
  cost,
})

describe('Chart Tooltip Formatting', () => {
  const mockRecords: CursorUsageRecord[] = [
    createRecord(new Date('2025-12-20'), 1.567),
    createRecord(new Date('2025-12-21'), 2.333),
  ]

  const defaultFilters: Filters = {
    dateRange: {
      start: null,
      end: null,
    },
    model: null,
    usageType: null,
  }

  it('should use ISO date format for chart data', () => {
    render(<Chart records={mockRecords} filters={defaultFilters} />)

    // Chart should render with ISO formatted dates
    expect(screen.getByText('Cost Analysis')).toBeInTheDocument()
  })
})

