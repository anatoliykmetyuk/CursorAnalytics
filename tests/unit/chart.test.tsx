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

describe('Chart', () => {
  const mockRecords: CursorUsageRecord[] = [
    createRecord(new Date('2025-12-20'), 1.5),
    createRecord(new Date('2025-12-21'), 2.3),
    createRecord(new Date('2025-12-22'), 0.8),
  ]

  const defaultFilters: Filters = {
    dateRange: {
      start: null,
      end: null,
    },
    model: null,
    usageType: null,
  }

  it('should render chart component', () => {
    render(<Chart records={mockRecords} filters={defaultFilters} />)

    expect(screen.getByText('Cost Analysis')).toBeInTheDocument()
    expect(screen.getByText(/Total Cost:/i)).toBeInTheDocument()
  })

  it('should display total cost', () => {
    render(<Chart records={mockRecords} filters={defaultFilters} />)

    // Total should be 1.5 + 2.3 + 0.8 = 4.6
    expect(screen.getByText(/4\.60/i)).toBeInTheDocument()
  })

  it('should display On-Demand cost', () => {
    const recordsWithOnDemand: CursorUsageRecord[] = [
      createRecord(new Date('2025-12-20'), 1.5, 'auto', 'Included'),
      createRecord(new Date('2025-12-21'), 2.3, 'auto', 'On-Demand'),
      createRecord(new Date('2025-12-22'), 0.8, 'auto', 'On-Demand'),
    ]

    render(<Chart records={recordsWithOnDemand} filters={defaultFilters} />)

    // Should display On-Demand Cost
    expect(screen.getByText(/On-Demand Cost:/i)).toBeInTheDocument()
    // On-Demand cost should be 2.3 + 0.8 = 3.1
    const costElements = screen.getAllByText(/3\.10/i)
    expect(costElements.length).toBeGreaterThan(0)
  })

  it('should display 0.00 for On-Demand cost when no On-Demand entries', () => {
    const recordsWithoutOnDemand: CursorUsageRecord[] = [
      createRecord(new Date('2025-12-20'), 1.5, 'auto', 'Included'),
      createRecord(new Date('2025-12-21'), 2.3, 'auto', 'Included'),
    ]

    render(<Chart records={recordsWithoutOnDemand} filters={defaultFilters} />)

    // Should display On-Demand Cost
    expect(screen.getByText(/On-Demand Cost:/i)).toBeInTheDocument()
    // On-Demand cost should be 0.00
    const costElements = screen.getAllByText(/0\.00/i)
    expect(costElements.length).toBeGreaterThan(0)
  })

  it('should show empty message when no data', () => {
    const emptyFilters: Filters = {
      dateRange: {
        start: new Date('2026-01-01'),
        end: new Date('2026-01-02'),
      },
      model: null,
      usageType: null,
    }

    render(<Chart records={mockRecords} filters={emptyFilters} />)

    expect(screen.getByText(/No data available for the selected filters/i)).toBeInTheDocument()
  })

  it('should filter by model', () => {
    const modelFilters: Filters = {
      dateRange: {
        start: null,
        end: null,
      },
      model: 'auto',
      usageType: null,
    }

    const recordsWithModels: CursorUsageRecord[] = [
      createRecord(new Date('2025-12-20'), 1.0, 'auto'),
      createRecord(new Date('2025-12-21'), 2.0, 'claude-4.5'),
      createRecord(new Date('2025-12-22'), 3.0, 'auto'),
    ]

    render(<Chart records={recordsWithModels} filters={modelFilters} />)

    // Should only show cost for 'auto' model: 1.0 + 3.0 = 4.0
    expect(screen.getByText(/4\.00/i)).toBeInTheDocument()
  })
})

